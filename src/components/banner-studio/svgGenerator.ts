import { BannerShellSettings, DitherResult, InfoRow, PortraitSettings } from './types';

const BANNER_FONTS: Record<string, string> = {
  monospace: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  jetbrains: "'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, Monaco, Consolas, monospace",
  'fira-code': "'Fira Code', 'JetBrains Mono', ui-monospace, Consolas, monospace",
  inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  'source-code': "'Source Code Pro', ui-monospace, monospace",
  'space-mono': "'Space Mono', monospace",
  roboto: "'Roboto', -apple-system, sans-serif",
};

export function generateBannerSvg(
  portraitSettings: PortraitSettings,
  ditherResult: DitherResult,
  shellSettings: BannerShellSettings,
  infoRows: InfoRow[]
): string {
  const { colors } = shellSettings;
  const selectedFont = shellSettings.font || 'monospace';
  const fontFamily = BANNER_FONTS[selectedFont] || BANNER_FONTS.monospace;
  const fontAttr = fontFamily.replace(/['"]/g, '');
  const labelWeight = shellSettings.labelFontWeight || '500';
  const valueWeight = shellSettings.valueFontWeight || '700';

  // Frame coordinates
  const frameX = 45;
  const frameY = 85;
  const frameW = 370;
  const frameH = 465;

  // Calculate scaling and centering for portrait inside portrait frame
  const padding = 16;
  const availW = frameW - padding * 2;
  const availH = frameH - padding * 2;

  const scale = ditherResult.width > 0 && ditherResult.height > 0
    ? Math.min(availW / ditherResult.width, availH / ditherResult.height)
    : 1;

  const renderedW = ditherResult.width * scale;
  const renderedH = ditherResult.height * scale;
  const portraitOffsetX = frameX + (frameW - renderedW) / 2;
  const portraitOffsetY = frameY + (frameH - renderedH) / 2;

  // Generate Portrait Layers SVG (Single or Multi-Frame Loop)
  const numLayers = ditherResult.layers.length;
  const maxReveal = portraitSettings.maxRevealTime || 2.2;
  const loopBeginTime = (maxReveal + 0.4).toFixed(2);
  const isMultiFrameLoop = ditherResult.frames && ditherResult.frames.length > 1 && portraitSettings.imageLoop;

  let portraitLayersSvg = '';
  if (isMultiFrameLoop) {
    const totalFrames = ditherResult.frames.length;
    const intervalSec = Math.max(1, portraitSettings.imageLoopDuration || 3);
    const totalCycleDur = (totalFrames * intervalSec).toFixed(1);

    portraitLayersSvg = ditherResult.frames.map((frame, frameIdx) => {
      const frameLayersHtml = frame.layers.map((layerD, idx) => {
        if (!layerD) return '';
        const dx = (((idx % 5) - 2) * 1.5).toFixed(1);
        const dy = ((((idx * 3) % 5) - 2) * 1.5).toFixed(1);
        let driftTag = '';
        if (portraitSettings.particleLoop) {
          driftTag = `<animateTransform attributeName="transform" type="translate" values="0 0; ${dx} ${dy}; 0 0" keyTimes="0; 0.5; 1" dur="14s" repeatCount="indefinite" />`;
        }
        return `
        <g fill="${portraitSettings.fillColor}">
          ${driftTag}
          <path d="${layerD}" />
        </g>`;
      }).join('');

      const k0 = (frameIdx / totalFrames).toFixed(3);
      const k1 = ((frameIdx + 0.04) / totalFrames).toFixed(3);
      const k2 = ((frameIdx + 0.96) / totalFrames).toFixed(3);
      const k3 = ((frameIdx + 1) / totalFrames).toFixed(3);

      let animTag = '';
      if (frameIdx === 0) {
        const tFadeStart = (0.96 / totalFrames).toFixed(3);
        const tFadeEnd = (1 / totalFrames).toFixed(3);
        const tReturnStart = ((totalFrames - 0.04) / totalFrames).toFixed(3);
        animTag = `<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;${tFadeStart};${tFadeEnd};${tReturnStart};1" dur="${totalCycleDur}s" repeatCount="indefinite" />`;
      } else {
        animTag = `<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${k0};${k1};${k2};${k3};1" dur="${totalCycleDur}s" repeatCount="indefinite" />`;
      }

      return `
      <g id="portrait_frame_${frameIdx}" opacity="${frameIdx === 0 ? '1' : '0'}">
        ${animTag}
        ${frameLayersHtml}
      </g>`;
    }).join('');
  } else if (ditherResult.layers.length > 0) {
    portraitLayersSvg = ditherResult.layers.map((layerD, idx) => {
      if (!layerD) return '';
      const staggerTime = (0.2 + (idx / Math.max(1, numLayers - 1)) * (maxReveal - 0.2)).toFixed(3);

      // Subtle particle drift for loop mode
      const dx = (((idx % 5) - 2) * 1.5).toFixed(1);
      const dy = ((((idx * 3) % 5) - 2) * 1.5).toFixed(1);

      let animTags = '';
      let initialOpacity = '1';

      if (shellSettings.animatePortrait) {
        initialOpacity = '0';
        animTags += `
          <animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="${staggerTime}s" fill="freeze" />`;

        if (portraitSettings.particleLoop) {
          animTags += `
          <animateTransform attributeName="transform" type="translate" values="0 0; ${dx} ${dy}; 0 0" keyTimes="0; 0.5; 1" dur="14s" repeatCount="indefinite" begin="${loopBeginTime}s" />`;
        }
      }

      return `
      <g opacity="${initialOpacity}" fill="${portraitSettings.fillColor}">
        ${animTags}
        <path d="${layerD}" />
      </g>`;
    }).join('');
  }

  // Generate Info Rows SVG with dynamic spacing to fit row counts cleanly
  const rightColumnX = 460;
  const rightColumnWidth = 655;
  const totalRows = infoRows.length;
  const availHeight = 346;
  const stepY = totalRows > 0 ? Math.min(36, Math.max(19, Math.floor(availHeight / totalRows))) : 34;

  const defaultFontSize = totalRows > 13 ? (totalRows > 16 ? 11 : 12) : 13.5;
  const labelFontSize = Number(shellSettings.labelFontSize) || defaultFontSize;
  const valueFontSize = Number(shellSettings.valueFontSize) || defaultFontSize;
  const avgFontSize = (labelFontSize + valueFontSize) / 2;
  const dividerFontSize = Math.max(9.5, Math.min(13, labelFontSize - 1.5));

  const isProportional = selectedFont === 'inter' || selectedFont === 'roboto';
  const charWidthEst = isProportional ? (avgFontSize * 0.58) : (avgFontSize * 0.62);
  const targetChars = Math.max(20, Math.floor(rightColumnWidth / Math.max(1, charWidthEst)));
  let currentY = 188 + Math.max(0, Math.floor((availHeight - totalRows * stepY) / 4));

  const infoRowsSvg = infoRows.map((row, index) => {
    const delay = (0.25 + index * 0.08).toFixed(2);
    const rowY = currentY;
    currentY += stepY;

    if (row.type === 'divider') {
      let dividerAnim = '';
      let initialOpacity = '1';
      let initialTransform = '';

      if (shellSettings.animateRows) {
        initialOpacity = '0';
        initialTransform = 'transform="translate(-8, 0)"';
        dividerAnim = `
          <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${delay}s" fill="freeze" />
          <animateTransform attributeName="transform" type="translate" from="-8 0" to="0 0" dur="0.4s" begin="${delay}s" fill="freeze" />`;
      }

      return `
      <g opacity="${initialOpacity}" ${initialTransform}>
        ${dividerAnim}
        <text x="${rightColumnX}" y="${rowY}" font-family="${fontAttr}" font-size="${dividerFontSize}" font-weight="700" fill="${colors.secondaryAccent}" letter-spacing="1.5">
          ${escapeXml(row.label.toUpperCase())}
        </text>
        <line x1="${rightColumnX + Math.max(80, row.label.length * 8.5)}" y1="${rowY - 4}" x2="${rightColumnX + rightColumnWidth}" y2="${rowY - 4}" stroke="${colors.leaderColor}" stroke-width="1" stroke-dasharray="4 4" opacity="0.6"/>
      </g>`;
    }

    // Normal info row
    // Dotted leader computed automatically from label/value length
    const labelLen = row.label.length;
    const valLen = row.value.length;
    const dotsCount = Math.max(3, targetChars - labelLen - valLen - 2);
    const dottedLeader = ' ' + '.'.repeat(dotsCount) + ' ';

    let rowAnim = '';
    let initialOpacity = '1';
    let initialTransform = '';

    if (shellSettings.animateRows) {
      initialOpacity = '0';
      initialTransform = 'transform="translate(-8, 0)"';
      rowAnim = `
        <animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="${delay}s" fill="freeze" />
        <animateTransform attributeName="transform" type="translate" from="-8 0" to="0 0" dur="0.4s" begin="${delay}s" fill="freeze" />`;
    }

    return `
      <g opacity="${initialOpacity}" ${initialTransform}>
        ${rowAnim}
        <text x="${rightColumnX}" y="${rowY}" font-family="${fontAttr}" font-size="${avgFontSize}" textLength="${rightColumnWidth}" lengthAdjust="spacing">
          <tspan fill="${colors.accent}" font-size="${labelFontSize}" font-weight="${labelWeight}">${escapeXml(row.label)}</tspan>
          <tspan fill="${colors.leaderColor}" font-size="${Math.min(labelFontSize, valueFontSize)}" font-weight="400">${dottedLeader}</tspan>
          <tspan fill="${colors.valueColor}" font-size="${valueFontSize}" font-weight="${valueWeight}">${escapeXml(row.value)}</tspan>
        </text>
      </g>`;
  }).join('');

  // Live badge SVG (Right-aligned to match the right edge of the header and info column)
  const liveBadgeSvg = shellSettings.showLiveBadge ? `
    <g transform="translate(${rightColumnX + rightColumnWidth}, 104)">
      <circle cx="-42" cy="0" r="4.5" fill="#EF4444">
        <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="r" values="4.5;5.5;4.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <text x="0" y="4" text-anchor="end" font-family="${fontAttr}" font-size="11" font-weight="bold" fill="#EF4444" letter-spacing="1">LIVE</text>
    </g>` : '';

  // Corner bracket paths for left portrait frame
  const bracketLen = 18;
  const bracketPaths = `
    <!-- Top-Left -->
    <path d="M ${frameX} ${frameY + bracketLen} V ${frameY} H ${frameX + bracketLen}" fill="none" stroke="${colors.accent}" stroke-width="2.5" />
    <!-- Top-Right -->
    <path d="M ${frameX + frameW - bracketLen} ${frameY} H ${frameX + frameW} V ${frameY + bracketLen}" fill="none" stroke="${colors.accent}" stroke-width="2.5" />
    <!-- Bottom-Left -->
    <path d="M ${frameX} ${frameY + frameH - bracketLen} V ${frameY + frameH} H ${frameX + bracketLen}" fill="none" stroke="${colors.accent}" stroke-width="2.5" />
    <!-- Bottom-Right -->
    <path d="M ${frameX + frameW - bracketLen} ${frameY + frameH} H ${frameX + frameW} V ${frameY + frameH - bracketLen}" fill="none" stroke="${colors.accent}" stroke-width="2.5" />
  `;

  // Animated gradient border definition
  const borderGradientDef = shellSettings.animateBorder ? `
    <linearGradient id="animatedBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.borderColor1}">
        <animate attributeName="stop-color" values="${colors.borderColor1}; ${colors.borderColor2}; ${colors.borderColor3}; ${colors.borderColor1}" dur="10s" repeatCount="indefinite" />
      </stop>
      <stop offset="50%" stop-color="${colors.borderColor2}">
        <animate attributeName="stop-color" values="${colors.borderColor2}; ${colors.borderColor3}; ${colors.borderColor1}; ${colors.borderColor2}" dur="10s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color="${colors.borderColor3}">
        <animate attributeName="stop-color" values="${colors.borderColor3}; ${colors.borderColor1}; ${colors.borderColor2}; ${colors.borderColor3}" dur="10s" repeatCount="indefinite" />
      </stop>
    </linearGradient>` : `
    <linearGradient id="animatedBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.borderColor1}" />
      <stop offset="50%" stop-color="${colors.borderColor2}" />
      <stop offset="100%" stop-color="${colors.borderColor3}" />
    </linearGradient>`;

  // Title string
  const windowTitle = shellSettings.title || `${shellSettings.email || 'developer'} - % ./profile.sh --live`;

  // Cursor position calculated from footer command length
  const footerText = shellSettings.footerCommand || `> More about me & projects below in README ↓`;
  const cursorX = rightColumnX + Math.min(630, footerText.length * 8.2 + 8);

  // Highlighted Gmail / User Pill with Dynamic Width
  // Resolves email from shellSettings or contact.gmail row in infoRows
  const gmailRow = infoRows.find(
    (r) => r.label.toLowerCase().includes('gmail') || r.label.toLowerCase().includes('email')
  );
  const emailText = (shellSettings.email?.trim()) || (gmailRow?.value?.trim()) || 'developer@github.com';
  const emailCharWidth = isProportional ? 6.95 : 7.25;
  const emailTextWidth = Math.ceil(emailText.length * emailCharWidth);
  // Left padding & icon: 34px, text width: emailTextWidth, right padding with pulsing dot: 20px
  const gmailBadgeWidth = Math.min(rightColumnWidth, Math.max(90, 34 + emailTextWidth + 20));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="610" viewBox="0 0 1180 610">
  <defs>
    <!-- Glow filter -->
    <filter id="borderGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="portraitGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    ${borderGradientDef}
  </defs>

  <style><![CDATA[
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&family=Source+Code+Pro:wght@200;300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

    text, tspan {
      font-family: ${fontFamily};
      -webkit-font-smoothing: antialiased;
    }
  ]]></style>

  <!-- Window Container with Rounded Rect -->
  <rect x="2" y="2" width="1176" height="606" rx="16" fill="${colors.cardBg}" />

  <!-- Animated Gradient Border (Glow Copy + Sharp Copy) -->
  <rect x="2" y="2" width="1176" height="606" rx="16" fill="none" stroke="url(#animatedBorderGrad)" stroke-width="3" filter="url(#borderGlow)" opacity="0.75" />
  <rect x="2" y="2" width="1176" height="606" rx="16" fill="none" stroke="url(#animatedBorderGrad)" stroke-width="1.5" />

  <!-- Title Bar -->
  <rect x="2" y="2" width="1176" height="42" rx="16" fill="${colors.bg}" opacity="0.8" />
  <path d="M 2 44 H 1178" stroke="${colors.leaderColor}" stroke-width="1" opacity="0.3" />

  <!-- macOS Window Dots -->
  <circle cx="28" cy="24" r="5.5" fill="#FF5F56" />
  <circle cx="48" cy="24" r="5.5" fill="#FFBD2E" />
  <circle cx="68" cy="24" r="5.5" fill="#27C93F" />

  <!-- Centered Title -->
  <text x="590" y="28" font-family="${fontAttr}" font-size="12" fill="#94A3B8" font-weight="600" text-anchor="middle" letter-spacing="0.5">
    ${escapeXml(windowTitle)}
  </text>

  <!-- Left: Portrait Frame -->
  <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="8" fill="${colors.bg}" stroke="${colors.accent}" stroke-width="1" stroke-opacity="0.3" />
  
  <!-- Subtle Grid Lines inside Portrait Frame -->
  <pattern id="frameGrid" width="20" height="20" patternUnits="userSpaceOnUse">
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${colors.leaderColor}" stroke-width="0.5" stroke-opacity="0.25" />
  </pattern>
  <rect x="${frameX + 1}" y="${frameY + 1}" width="${frameW - 2}" height="${frameH - 2}" rx="7" fill="url(#frameGrid)" />

  <!-- Corner Brackets -->
  ${bracketPaths}

  <!-- Rendered Pixel Art Portrait -->
  <g transform="translate(${portraitOffsetX.toFixed(1)}, ${portraitOffsetY.toFixed(1)}) scale(${scale.toFixed(4)})" shape-rendering="crispEdges">
    ${portraitLayersSvg}
  </g>

  <!-- Right: SYSTEM.INFO Header -->
  <text x="${rightColumnX}" y="108" font-family="${fontAttr}" font-size="16" font-weight="800" fill="${colors.accent}" letter-spacing="2.5">
    ${escapeXml(shellSettings.headerText || 'SYSTEM.INFO')}
  </text>
  ${liveBadgeSvg}

  <!-- Header Divider Line -->
  <line x1="${rightColumnX}" y1="120" x2="${rightColumnX + rightColumnWidth}" y2="120" stroke="${colors.accent}" stroke-width="1.5" stroke-opacity="0.4" />

  <!-- Highlighted Gmail / User Pill (Dynamic Width) -->
  <g transform="translate(${rightColumnX}, 136)">
    <!-- Dynamic width background pill -->
    <rect x="0" y="0" width="${gmailBadgeWidth}" height="28" rx="14" fill="${colors.bg}" stroke="${colors.accent}" stroke-width="1.2" stroke-opacity="0.6"/>
    <rect x="1" y="1" width="${Math.max(0, gmailBadgeWidth - 2)}" height="26" rx="13" fill="${colors.cardBg}" opacity="0.4"/>
    <!-- Google Red Gmail Mail Envelope Icon -->
    <g transform="translate(11, 7.5)">
      <rect x="0" y="0" width="15" height="12" rx="2" fill="none" stroke="#EA4335" stroke-width="1.3" />
      <path d="M 0 1.5 L 7.5 7 L 15 1.5" fill="none" stroke="#EA4335" stroke-width="1.3" stroke-linejoin="round" />
      <path d="M 0 10.5 L 5 6" fill="none" stroke="#EA4335" stroke-width="1" opacity="0.65"/>
      <path d="M 15 10.5 L 10 6" fill="none" stroke="#EA4335" stroke-width="1" opacity="0.65"/>
    </g>
    <!-- Dynamic email text with selected font and proportional sizing -->
    <text x="34" y="18" font-family="${fontAttr}" font-size="11.5" font-weight="600" fill="${colors.text}">
      ${escapeXml(emailText)}
    </text>
    <!-- Live status pulsing dot dynamically anchored to the right side of the pill -->
    <circle cx="${gmailBadgeWidth - 14}" cy="14" r="3.5" fill="${colors.accent}">
      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      <animate attributeName="r" values="3.5;4.2;3.5" dur="2s" repeatCount="indefinite" />
    </circle>
  </g>

  <!-- Right: Info Rows -->
  ${infoRowsSvg}

  <!-- Footer Line with Terminal Status and Blinking Cursor -->
  <g transform="translate(0, 0)">
    <line x1="${rightColumnX}" y1="535" x2="${rightColumnX + rightColumnWidth}" y2="535" stroke="${colors.leaderColor}" stroke-width="1" stroke-opacity="0.3" />
    <text x="${rightColumnX}" y="562" font-family="${fontAttr}" font-size="12.5" fill="${colors.leaderColor}" font-weight="500">
      ${escapeXml(footerText)}
    </text>
    <rect x="${cursorX.toFixed(1)}" y="550" width="8.5" height="14" fill="${colors.accent}">
      <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
    </rect>
  </g>
</svg>`;
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
