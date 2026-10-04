import { BannerShellSettings, DitherResult, InfoRow, PortraitSettings } from './types';

export function generateBannerSvg(
  portraitSettings: PortraitSettings,
  ditherResult: DitherResult,
  shellSettings: BannerShellSettings,
  infoRows: InfoRow[]
): string {
  const { colors } = shellSettings;

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
  const fontSize = totalRows > 13 ? (totalRows > 16 ? 11 : 12) : 13.5;
  const dividerFontSize = totalRows > 13 ? 10.5 : 12;
  const targetChars = totalRows > 13 ? 82 : 75;
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
        <text x="${rightColumnX}" y="${rowY}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="${dividerFontSize}" font-weight="700" fill="${colors.secondaryAccent}" letter-spacing="1.5">
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
        <text x="${rightColumnX}" y="${rowY}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="${fontSize}" textLength="${rightColumnWidth}" lengthAdjust="spacingAndGlyphs">
          <tspan fill="${colors.accent}">${escapeXml(row.label)}</tspan>
          <tspan fill="${colors.leaderColor}">${dottedLeader}</tspan>
          <tspan fill="${colors.valueColor}" font-weight="bold">${escapeXml(row.value)}</tspan>
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
      <text x="0" y="4" text-anchor="end" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11" font-weight="bold" fill="#EF4444" letter-spacing="1">LIVE</text>
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

  <style>
    text {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      -webkit-font-smoothing: antialiased;
    }
  </style>

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
  <text x="590" y="28" font-size="12" fill="#94A3B8" font-weight="600" text-anchor="middle" letter-spacing="0.5">
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
  <text x="${rightColumnX}" y="108" font-size="16" font-weight="800" fill="${colors.accent}" letter-spacing="2.5">
    ${escapeXml(shellSettings.headerText || 'SYSTEM.INFO')}
  </text>
  ${liveBadgeSvg}

  <!-- Header Divider Line -->
  <line x1="${rightColumnX}" y1="120" x2="${rightColumnX + rightColumnWidth}" y2="120" stroke="${colors.accent}" stroke-width="1.5" stroke-opacity="0.4" />

  <!-- Highlighted Email / User Pill -->
  <g transform="translate(${rightColumnX}, 136)">
    <rect x="0" y="0" width="${Math.max(180, (shellSettings.email?.length || 10) * 8.8 + 50)}" height="28" rx="14" fill="${colors.bg}" stroke="${colors.accent}" stroke-width="1" stroke-opacity="0.5"/>
    <circle cx="16" cy="14" r="5" fill="${colors.accent}" />
    <text x="32" y="18.5" font-size="12" font-weight="600" fill="${colors.text}">
      ${escapeXml(shellSettings.email || 'developer@github.com')}
    </text>
  </g>

  <!-- Right: Info Rows -->
  ${infoRowsSvg}

  <!-- Footer Line with Terminal Status and Blinking Cursor -->
  <g transform="translate(0, 0)">
    <line x1="${rightColumnX}" y1="535" x2="${rightColumnX + rightColumnWidth}" y2="535" stroke="${colors.leaderColor}" stroke-width="1" stroke-opacity="0.3" />
    <text x="${rightColumnX}" y="562" font-size="12.5" fill="${colors.leaderColor}" font-weight="500">
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
