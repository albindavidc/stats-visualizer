import { PortraitSettings } from './types';

export interface DitherFrame {
  width: number;
  height: number;
  layers: string[];
  totalRuns: number;
  totalPixels: number;
}

export interface DitherResult {
  width: number;
  height: number;
  layers: string[]; // Array of path 'd' strings, one per layer (active frame)
  frames: DitherFrame[]; // All frames when multiple images are loaded
  totalRuns: number;
  totalPixels: number;
  emptyRowsRemoved: number;
}

/**
 * Loads an image from src and processes it on an offscreen HTMLCanvasElement
 */
export async function processPortraitImage(settings: PortraitSettings): Promise<DitherResult> {
  // Determine images to process
  const imageSources: string[] = [];
  if (settings.images && settings.images.length > 0) {
    imageSources.push(...settings.images);
  } else if (settings.imageSrc) {
    imageSources.push(settings.imageSrc);
  }

  if (imageSources.length === 0) {
    return {
      width: 200,
      height: 250,
      layers: [],
      frames: [],
      totalRuns: 0,
      totalPixels: 0,
      emptyRowsRemoved: 0
    };
  }

  // If multi-image loop is active, process all frames
  if (imageSources.length > 1 && settings.imageLoop) {
    const frameResults = await Promise.all(
      imageSources.map((src) => processSingleImageSource(src, settings))
    );

    const activeIdx = Math.max(0, Math.min(imageSources.length - 1, settings.activeImageIndex || 0));
    const activeFrame = frameResults[activeIdx] || frameResults[0];

    const totalRunsSum = frameResults.reduce((acc, f) => acc + f.totalRuns, 0);
    const totalPixelsSum = frameResults.reduce((acc, f) => acc + f.totalPixels, 0);

    return {
      width: activeFrame.width,
      height: activeFrame.height,
      layers: activeFrame.layers,
      frames: frameResults,
      totalRuns: totalRunsSum,
      totalPixels: totalPixelsSum,
      emptyRowsRemoved: activeFrame.emptyRowsRemoved
    };
  }

  // Single frame (or non-looping multi-image: active image only)
  const activeIdx = Math.max(0, Math.min(imageSources.length - 1, settings.activeImageIndex || 0));
  const targetSrc = imageSources[activeIdx] || imageSources[0];
  const single = await processSingleImageSource(targetSrc, settings);

  return {
    width: single.width,
    height: single.height,
    layers: single.layers,
    frames: [single],
    totalRuns: single.totalRuns,
    totalPixels: single.totalPixels,
    emptyRowsRemoved: single.emptyRowsRemoved
  };
}

async function processSingleImageSource(
  imageSrc: string,
  settings: PortraitSettings
): Promise<DitherFrame & { emptyRowsRemoved: number }> {
  const img = await loadImage(imageSrc);

  // Compute aspect ratio and output dimensions
  // Target width is settings.outputWidth, height maintains aspect ratio (capped to reasonable max 500)
  const targetWidth = Math.max(100, Math.min(450, Math.round(settings.outputWidth)));
  const imgAspect = img.naturalWidth / (img.naturalHeight || 1);
  const targetHeight = Math.max(100, Math.min(500, Math.round(targetWidth / imgAspect)));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Draw image with zoom and pan
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  ctx.save();
  // Translate to center for zoom
  ctx.translate(targetWidth / 2 + settings.panX, targetHeight / 2 + settings.panY);
  ctx.scale(settings.zoom, settings.zoom);
  ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
  ctx.restore();

  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const pixels = imgData.data;
  const totalCount = targetWidth * targetHeight;

  // Step 1: Grayscale buffer with contrast and brightness
  const grayBuffer = new Float32Array(totalCount);
  const contrastFactor = (259 * (settings.contrast + 255)) / (255 * (259 - settings.contrast));

  for (let i = 0; i < totalCount; i++) {
    const idx = i * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    // Luminance formula
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Apply brightness
    gray = gray + settings.brightness * 1.28;

    // Apply contrast
    gray = contrastFactor * (gray - 128) + 128;

    // Invert if set
    if (settings.invert) {
      gray = 255 - gray;
    }

    // Clamp
    grayBuffer[i] = Math.max(0, Math.min(255, gray));
  }

  // Step 2: Apply Blur if requested
  if (settings.blur > 0) {
    applyBoxBlur(grayBuffer, targetWidth, targetHeight, Math.round(settings.blur));
  }

  // Step 3: Dithering -> 1-bit array (1 = on, 0 = off)
  const binaryMap = new Uint8Array(totalCount);
  const threshold = settings.threshold;

  if (settings.algorithm === 'threshold') {
    for (let i = 0; i < totalCount; i++) {
      binaryMap[i] = grayBuffer[i] >= threshold ? 1 : 0;
    }
  } else if (settings.algorithm === 'bayer4') {
    const bayer4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const i = y * targetWidth + x;
        const matrixVal = bayer4[y % 4][x % 4];
        // Scale bayer value to [-64, 64]
        const offset = (matrixVal - 7.5) * 8.5;
        binaryMap[i] = (grayBuffer[i] + offset) >= threshold ? 1 : 0;
      }
    }
  } else if (settings.algorithm === 'atkinson') {
    const errBuffer = new Float32Array(grayBuffer);
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const idx = y * targetWidth + x;
        const oldVal = errBuffer[idx];
        const newVal = oldVal >= threshold ? 255 : 0;
        binaryMap[idx] = newVal === 255 ? 1 : 0;
        const err = (oldVal - newVal) / 8;

        if (x + 1 < targetWidth) errBuffer[idx + 1] += err;
        if (x + 2 < targetWidth) errBuffer[idx + 2] += err;
        if (y + 1 < targetHeight) {
          if (x - 1 >= 0) errBuffer[(y + 1) * targetWidth + x - 1] += err;
          errBuffer[(y + 1) * targetWidth + x] += err;
          if (x + 1 < targetWidth) errBuffer[(y + 1) * targetWidth + x + 1] += err;
        }
        if (y + 2 < targetHeight) {
          errBuffer[(y + 2) * targetWidth + x] += err;
        }
      }
    }
  } else {
    // Floyd-Steinberg
    const errBuffer = new Float32Array(grayBuffer);
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const idx = y * targetWidth + x;
        const oldVal = errBuffer[idx];
        const newVal = oldVal >= threshold ? 255 : 0;
        binaryMap[idx] = newVal === 255 ? 1 : 0;
        const err = oldVal - newVal;

        if (x + 1 < targetWidth) {
          errBuffer[idx + 1] += err * (7 / 16);
        }
        if (y + 1 < targetHeight) {
          if (x - 1 >= 0) {
            errBuffer[(y + 1) * targetWidth + (x - 1)] += err * (3 / 16);
          }
          errBuffer[(y + 1) * targetWidth + x] += err * (5 / 16);
          if (x + 1 < targetWidth) {
            errBuffer[(y + 1) * targetWidth + (x + 1)] += err * (1 / 16);
          }
        }
      }
    }
  }

  // Step 4: Emit SVG Path data merging horizontal runs
  interface Run {
    x: number;
    y: number;
    length: number;
  }

  const allRuns: Run[] = [];
  let emptyRowsCount = 0;
  let totalPixelsCount = 0;

  for (let y = 0; y < targetHeight; y++) {
    let rowHasPixels = false;
    let runStart = -1;

    for (let x = 0; x < targetWidth; x++) {
      const isPixelOn = binaryMap[y * targetWidth + x] === 1;
      if (isPixelOn) {
        totalPixelsCount++;
        rowHasPixels = true;
        if (runStart === -1) {
          runStart = x;
        }
      } else {
        if (runStart !== -1) {
          allRuns.push({ x: runStart, y, length: x - runStart });
          runStart = -1;
        }
      }
    }

    if (runStart !== -1) {
      allRuns.push({ x: runStart, y, length: targetWidth - runStart });
    }

    if (!rowHasPixels) {
      emptyRowsCount++;
    }
  }

  // Step 5: Split into N layers (10-60)
  const numLayers = Math.max(10, Math.min(60, Math.round(settings.layers)));
  const layerPathDList: string[] = Array.from({ length: numLayers }, () => '');

  for (let i = 0; i < allRuns.length; i++) {
    const run = allRuns[i];
    const hash = ((run.x * 374761393 + run.y * 668265263) ^ (run.length * 31)) >>> 0;
    const layerIndex = hash % numLayers;

    const pathCmd = `M${run.x} ${run.y}h${run.length}v1h-${run.length}z`;
    layerPathDList[layerIndex] += pathCmd;
  }

  return {
    width: targetWidth,
    height: targetHeight,
    layers: layerPathDList,
    totalRuns: allRuns.length,
    totalPixels: totalPixelsCount,
    emptyRowsRemoved: emptyRowsCount
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Failed to load image: ' + err));
    img.src = src;
  });
}

function applyBoxBlur(buffer: Float32Array, width: number, height: number, radius: number): void {
  if (radius <= 0) return;
  const temp = new Float32Array(buffer.length);

  // Horizontal blur pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let k = -radius; k <= radius; k++) {
        const nx = x + k;
        if (nx >= 0 && nx < width) {
          sum += buffer[y * width + nx];
          count++;
        }
      }
      temp[y * width + x] = sum / count;
    }
  }

  // Vertical blur pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let k = -radius; k <= radius; k++) {
        const ny = y + k;
        if (ny >= 0 && ny < height) {
          sum += temp[ny * width + x];
          count++;
        }
      }
      buffer[y * width + x] = sum / count;
    }
  }
}
