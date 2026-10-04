import { generateSvg } from '../src/utils/svgGenerator.js';
import { generateBannerSvg } from '../src/components/banner-studio/svgGenerator.js';
import { THEME_PRESETS } from '../src/components/banner-studio/themePresets.js';
import { BannerFont, FontWeightOption } from '../src/components/banner-studio/types.js';

async function runSmokeTest() {
  console.log("Running SVG smoke test...");
  const weeks = Array(52).fill({
    days: Array(7).fill({ date: '2023-01-01', level: 2, weekday: 0 })
  });
  const svg = generateSvg('smoke-test-user', 1000, weeks, 'github', undefined, 'inter', false, false);
  if (!svg || !svg.startsWith('<svg')) throw new Error("Invalid output format");
  console.log("✅ Stats SVG Smoke test passed!");

  const fonts: BannerFont[] = ['monospace', 'jetbrains', 'fira-code', 'inter', 'source-code', 'space-mono', 'roboto'];
  const weights: FontWeightOption[] = ['100', '200', '300', '400', '500', '600', '700', '800'];

  for (const font of fonts) {
    for (const w of weights) {
      const bannerSvg = generateBannerSvg(
        {
          imageSrc: null,
          images: [],
          activeImageIndex: 0,
          imageLoop: false,
          imageLoopDuration: 3,
          outputWidth: 200,
          contrast: 15,
          brightness: 0,
          threshold: 128,
          blur: 0,
          invert: false,
          algorithm: 'floyd-steinberg',
          zoom: 1,
          panX: 0,
          panY: 0,
          layers: 24,
          maxRevealTime: 2.2,
          particleLoop: true,
          fillColor: '#A78BFA'
        },
        {
          width: 200,
          height: 250,
          layers: Array(24).fill('M 10 10 H 20 V 20 H 10 Z'),
          totalRuns: 10,
          totalPixels: 20,
          emptyRowsRemoved: 0
        },
        {
          title: 'test@example.com - % ./profile.sh --live',
          headerText: 'SYSTEM.INFO',
          showLiveBadge: true,
          email: 'test@example.com',
          username: 'testdev',
          footerCommand: '> More about me in README',
          theme: 'github-dark',
          colors: { ...THEME_PRESETS['github-dark'] },
          font: font,
          labelFontWeight: w,
          valueFontWeight: '700',
          animatePortrait: true,
          animateRows: true,
          animateBorder: true
        },
        [
          { id: '1', type: 'row', label: 'user.handle', value: '@testdev' },
          { id: '2', type: 'divider', label: '- TECHNICAL STACK', value: '' },
          { id: '3', type: 'row', label: 'core.languages', value: 'TypeScript, Python, Go' },
        ]
      );

      if (!bannerSvg || !bannerSvg.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<svg')) {
        throw new Error(`Banner SVG did not start with standard xml declaration for font ${font}`);
      }

      // Check for any unescaped double quotes inside attribute values
      const lines = bannerSvg.split('\n');
      lines.forEach((line, idx) => {
        // Match attribute values: attr="value"
        const attrMatches = line.matchAll(/\s([a-zA-Z:-]+)="([^"]*)"/g);
        for (const match of attrMatches) {
          const val = match[2];
          if (val.includes('"')) {
            throw new Error(`Unescaped quote in attribute ${match[1]} at line ${idx + 1}`);
          }
        }
      });
    }
  }
  console.log("✅ All banner SVG fonts and weights passed with clean XML syntax!");
}
runSmokeTest();
