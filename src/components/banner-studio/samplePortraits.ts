/**
 * Generates an SVG data URI of a futuristic cyberpunk developer silhouette avatar
 * with headphones, visor, hoodie, and facial features.
 * This provides an immediate, punchy high-contrast test portrait.
 */
export function getSamplePortraitDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" viewBox="0 0 400 480">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1e2f"/>
      <stop offset="100%" stop-color="#0a0a14"/>
    </linearGradient>
    <radialGradient id="faceLight" cx="45%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#b0b5c5"/>
      <stop offset="100%" stop-color="#2d3748"/>
    </radialGradient>
    <linearGradient id="visor" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#718096"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="480" fill="url(#bg)"/>

  <!-- Headphone Band -->
  <path d="M 120 180 A 90 90 0 0 1 280 180" fill="none" stroke="#e2e8f0" stroke-width="16" stroke-linecap="round"/>

  <!-- Hoodie / Shoulders -->
  <path d="M 60 480 C 70 380 110 330 160 300 C 180 320 220 320 240 300 C 290 330 330 380 340 480 Z" fill="#1a202c"/>
  <path d="M 160 300 Q 200 340 240 300 Q 200 440 160 300 Z" fill="#2d3748"/>

  <!-- Hair Base -->
  <path d="M 130 180 C 120 110 170 80 200 75 C 235 80 285 110 270 180 C 265 170 245 130 200 130 C 155 130 135 170 130 180 Z" fill="#0f172a"/>

  <!-- Head / Face -->
  <path d="M 145 150 C 145 120 255 120 255 150 C 255 200 245 270 200 280 C 155 270 145 200 145 150 Z" fill="url(#faceLight)"/>

  <!-- Stylish Cyber Hair strands -->
  <path d="M 130 130 Q 150 170 170 140 Q 200 90 220 135 Q 260 120 270 150 Q 250 95 200 90 Q 150 95 130 130 Z" fill="#ffffff"/>

  <!-- Cyber Visor / Glasses -->
  <path d="M 140 165 C 170 160 230 160 260 165 L 255 195 C 225 205 175 205 145 195 Z" fill="url(#visor)"/>
  <rect x="155" y="175" width="90" height="6" rx="3" fill="#0f172a" opacity="0.8"/>

  <!-- Nose shadow -->
  <polygon points="198,205 203,225 194,225" fill="#4a5568"/>

  <!-- Mouth -->
  <path d="M 185 245 Q 200 252 215 245" stroke="#2d3748" stroke-width="4" stroke-linecap="round" fill="none"/>

  <!-- Earphones -->
  <rect x="112" y="160" width="24" height="50" rx="10" fill="#cbd5e1"/>
  <rect x="264" y="160" width="24" height="50" rx="10" fill="#cbd5e1"/>

  <!-- Collar details -->
  <line x1="175" y1="340" x2="175" y2="440" stroke="#718096" stroke-width="3" stroke-dasharray="6 4"/>
  <line x1="225" y1="340" x2="225" y2="440" stroke="#718096" stroke-width="3" stroke-dasharray="6 4"/>
</svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/**
 * Generates an alternative futuristic robot/cyborg avatar for multi-image testing
 */
export function getSamplePortrait2DataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="480" viewBox="0 0 400 480">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09182a"/>
      <stop offset="100%" stop-color="#020813"/>
    </linearGradient>
    <radialGradient id="cyborgGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
  </defs>

  <rect width="400" height="480" fill="url(#bg2)"/>

  <!-- Cyborg Chassis / Shoulders -->
  <path d="M 50 480 L 110 320 L 160 310 L 200 350 L 240 310 L 290 320 L 350 480 Z" fill="#1e293b"/>
  <polygon points="170,330 200,370 230,330 200,310" fill="#00f0ff" opacity="0.8"/>

  <!-- Cybernetic Neck -->
  <rect x="180" y="270" width="40" height="50" rx="4" fill="#334155"/>
  <line x1="185" y1="285" x2="215" y2="285" stroke="#00f0ff" stroke-width="2"/>
  <line x1="185" y1="300" x2="215" y2="300" stroke="#00f0ff" stroke-width="2"/>

  <!-- Helmet / Mask Outer -->
  <polygon points="120,180 140,110 200,80 260,110 280,180 250,270 200,290 150,270" fill="#0f172a" stroke="#00f0ff" stroke-width="4"/>

  <!-- Visor Neon Hexagon -->
  <polygon points="150,160 200,140 250,160 240,210 200,230 160,210" fill="url(#cyborgGlow)"/>
  <line x1="155" y1="185" x2="245" y2="185" stroke="#ffffff" stroke-width="6"/>

  <!-- HUD Reticle Elements -->
  <circle cx="200" cy="185" r="28" fill="none" stroke="#000000" stroke-width="3" stroke-dasharray="8 6"/>
  <line x1="200" y1="145" x2="200" y2="160" stroke="#000000" stroke-width="3"/>
  <line x1="200" y1="210" x2="200" y2="225" stroke="#000000" stroke-width="3"/>

  <!-- Side Antennas / Sensors -->
  <rect x="105" y="160" width="12" height="40" rx="3" fill="#64748b"/>
  <rect x="283" y="160" width="12" height="40" rx="3" fill="#64748b"/>
</svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
