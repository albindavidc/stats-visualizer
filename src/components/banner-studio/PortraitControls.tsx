import React, { useRef } from 'react';
import { PortraitSettings, DitherAlgorithm } from './types';
import { Upload, Sparkles, Sliders, Image as ImageIcon, ZoomIn, Layers, Zap, AlertTriangle, Plus, Trash2, Repeat, Images } from 'lucide-react';
import { getSamplePortraitDataUri, getSamplePortrait2DataUri } from './samplePortraits';

interface PortraitControlsProps {
  settings: PortraitSettings;
  onChange: (updated: Partial<PortraitSettings>) => void;
  svgSizeBytes: number;
  onOptimize: () => void;
}

export const PortraitControls: React.FC<PortraitControlsProps> = ({
  settings,
  onChange,
  svgSizeBytes,
  onOptimize
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImages: string[] = settings.images && settings.images.length > 0
    ? settings.images
    : settings.imageSrc ? [settings.imageSrc] : [];

  const activeIndex = Math.max(0, Math.min(currentImages.length - 1, settings.activeImageIndex || 0));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const readers: Promise<string>[] = fileList.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (typeof evt.target?.result === 'string') {
            resolve(evt.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newResults) => {
      const updatedImages = [...currentImages, ...newResults];
      onChange({
        images: updatedImages,
        activeImageIndex: updatedImages.length - 1,
        imageSrc: updatedImages[updatedImages.length - 1],
        imageLoop: updatedImages.length > 1 ? true : settings.imageLoop
      });
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const readers: Promise<string>[] = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (typeof evt.target?.result === 'string') {
            resolve(evt.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newResults) => {
      const updatedImages = [...currentImages, ...newResults];
      onChange({
        images: updatedImages,
        activeImageIndex: updatedImages.length - 1,
        imageSrc: updatedImages[updatedImages.length - 1],
        imageLoop: updatedImages.length > 1 ? true : settings.imageLoop
      });
    });
  };

  const handleAddSample = (presetNum: 1 | 2) => {
    const uri = presetNum === 1 ? getSamplePortraitDataUri() : getSamplePortrait2DataUri();
    const updatedImages = [...currentImages, uri];
    onChange({
      images: updatedImages,
      activeImageIndex: updatedImages.length - 1,
      imageSrc: uri,
      imageLoop: updatedImages.length > 1 ? true : settings.imageLoop
    });
  };

  const handleSelectImage = (index: number) => {
    onChange({
      activeImageIndex: index,
      imageSrc: currentImages[index]
    });
  };

  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImages.length <= 1) return;
    const updated = currentImages.filter((_, i) => i !== index);
    const nextActive = Math.max(0, Math.min(updated.length - 1, activeIndex >= index ? activeIndex - 1 : activeIndex));
    onChange({
      images: updated,
      activeImageIndex: nextActive,
      imageSrc: updated[nextActive]
    });
  };

  const sizeKb = svgSizeBytes / 1024;
  const isAmber = sizeKb > 500 && sizeKb <= 1000;
  const isRed = sizeKb > 1000;

  const isLoopActive = currentImages.length > 1 ? (settings.imageLoop ?? true) : settings.particleLoop;

  const colorPresets = [
    '#A78BFA', // Violet (Default)
    '#00F0FF', // Cyan
    '#00FF66', // Matrix green
    '#F43F5E', // Neon rose
    '#FBBF24', // Amber
    '#FFFFFF', // White
  ];

  return (
    <div className="space-y-6 text-sm text-gray-300">
      {/* File Size Meter & Optimize Button */}
      <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
        isRed 
          ? 'bg-red-950/40 border-red-700/60 text-red-200'
          : isAmber
          ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
          : 'bg-gray-800/60 border-gray-700 text-gray-300'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            {(isRed || isAmber) && <AlertTriangle size={16} className={isRed ? 'text-red-400' : 'text-amber-400'} />}
            <span>SVG File Size:</span>
            <span className={`font-mono text-base ${isRed ? 'text-red-400 font-bold' : isAmber ? 'text-amber-400 font-bold' : 'text-emerald-400'}`}>
              {sizeKb < 1024 ? `${sizeKb.toFixed(1)} KB` : `${(sizeKb / 1024).toFixed(2)} MB`}
            </span>
          </div>
          <p className="text-xs opacity-80">
            {isRed 
              ? 'Warning: > 1 MB may load slower on GitHub profile page.'
              : isAmber
              ? 'Moderate: 500 KB - 1 MB. Still within good GitHub limits.'
              : 'Optimal: Fast load times on GitHub profile READMEs.'}
          </p>
        </div>

        {(isRed || isAmber || sizeKb > 350) && (
          <button
            onClick={onOptimize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-md transition-all active:scale-95"
            title="Automatically adjusts resolution and layers to keep file under 350 KB"
          >
            <Zap size={14} className="fill-current" />
            Optimize
          </button>
        )}
      </div>

      {/* Upload & Multiple Images Source */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Images size={14} />
            Source Portrait & Frames
          </label>
          <span className="text-[11px] font-mono text-cyan-400">
            {currentImages.length} {currentImages.length === 1 ? 'image' : 'images'}
          </span>
        </div>

        {/* Upload Box (supports multiple files selection) */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-700 hover:border-cyan-500/70 bg-gray-900/60 rounded-xl p-4 text-center transition-colors cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={true}
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Upload size={18} />
            </div>
            <div>
              <p className="font-medium text-white text-xs">
                Upload single or multiple images
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Click or Drag & Drop multiple photos (PNG, JPG, SVG)</p>
            </div>
          </div>
        </div>

        {/* Multiple Images Gallery Bar */}
        {currentImages.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
              {currentImages.map((imgSrc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectImage(idx)}
                  className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all group ${
                    idx === activeIndex
                      ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-md scale-105'
                      : 'border-gray-800 opacity-60 hover:opacity-100 hover:border-gray-600'
                  }`}
                >
                  <img src={imgSrc} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 left-0.5 bg-black/80 text-[9px] font-mono font-bold px-1 rounded text-cyan-300">
                    #{idx + 1}
                  </span>
                  {currentImages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveImage(idx, e)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600/90 hover:bg-red-500 rounded text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <Trash2 size={9} />
                    </button>
                  )}
                </div>
              ))}

              {/* Add image button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-gray-700 hover:border-cyan-500/80 bg-gray-900/50 flex flex-col items-center justify-center text-gray-400 hover:text-cyan-300 transition-colors"
                title="Add another photo"
              >
                <Plus size={16} />
                <span className="text-[10px] mt-0.5">Add</span>
              </button>
            </div>
          </div>
        )}

        {/* Preset Sample Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleAddSample(1)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-cyan-300 transition-colors"
          >
            <Sparkles size={13} />
            + Cyber Avatar 1
          </button>
          <button
            type="button"
            onClick={() => handleAddSample(2)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-purple-300 transition-colors"
          >
            <Sparkles size={13} />
            + Cyborg Avatar 2
          </button>
        </div>

        {/* LOOP SWITCH (Positioned directly below the upload button/section) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-gray-900 to-gray-900 border border-cyan-500/40 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isLoopActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-800 text-gray-500'
              }`}>
                <Repeat size={16} className={isLoopActive ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span>Loop Switch</span>
                  {currentImages.length > 1 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      {currentImages.length} Frames
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400">
                  {currentImages.length > 1
                    ? 'Continuously cycle through frames in an infinite SMIL loop'
                    : 'Infinite 14s SMIL particle drift loop in banner'}
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => {
                const nextState = !isLoopActive;
                onChange({
                  imageLoop: nextState,
                  particleLoop: nextState
                });
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                isLoopActive ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isLoopActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Cycle Interval Speed Slider when multiple images are active */}
          {currentImages.length > 1 && isLoopActive && (
            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
              <span>Frame Cycle Duration:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={settings.imageLoopDuration || 3}
                  onChange={(e) => onChange({ imageLoopDuration: Number(e.target.value) })}
                  className="w-24 accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-cyan-300 font-semibold w-10 text-right">
                  {(settings.imageLoopDuration || 3).toFixed(1)}s
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dither Algorithm */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
          Dither Algorithm
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'floyd-steinberg', name: 'Floyd-Steinberg', desc: 'Smooth error diffusion' },
            { id: 'atkinson', name: 'Atkinson', desc: 'Punchy retro Mac style' },
            { id: 'bayer4', name: 'Bayer 4x4', desc: 'Ordered cross-hatch' },
            { id: 'threshold', name: 'Threshold', desc: 'High-contrast 1-bit' },
          ].map((algo) => (
            <button
              key={algo.id}
              type="button"
              onClick={() => onChange({ algorithm: algo.id as DitherAlgorithm })}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                settings.algorithm === algo.id
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-sm'
                  : 'bg-gray-800/40 border-gray-700/80 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <div className="font-medium text-xs text-white">{algo.name}</div>
              <div className="text-[11px] text-gray-400 mt-0.5 truncate">{algo.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution & Invert */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Sliders size={14} />
            Output Width
          </label>
          <span className="font-mono text-cyan-400 text-xs font-semibold">{settings.outputWidth}px</span>
        </div>
        <input
          type="range"
          min="150"
          max="400"
          step="5"
          value={settings.outputWidth}
          onChange={(e) => onChange({ outputWidth: Number(e.target.value) })}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-gray-500 font-mono">
          <span>150px (Smallest SVG)</span>
          <span>240px (Default)</span>
          <span>400px (Max Detail)</span>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-gray-800">
          <span className="text-xs font-medium text-gray-300">Invert Colors (Dark/Light)</span>
          <button
            type="button"
            onClick={() => onChange({ invert: !settings.invert })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.invert ? 'bg-cyan-500' : 'bg-gray-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.invert ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Crop / Zoom / Pan */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400">
          <span className="flex items-center gap-1.5"><ZoomIn size={14} /> Framing & Zoom</span>
          <span className="font-mono text-cyan-400">{settings.zoom.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="1.0"
          max="3.0"
          step="0.1"
          value={settings.zoom}
          onChange={(e) => onChange({ zoom: Number(e.target.value) })}
          className="w-full accent-cyan-400 cursor-pointer"
        />

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Pan X</span>
              <span className="font-mono">{settings.panX}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.panX}
              onChange={(e) => onChange({ panX: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Pan Y</span>
              <span className="font-mono">{settings.panY}px</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.panY}
              onChange={(e) => onChange({ panY: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Image Processing Sliders */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <ImageIcon size={14} />
          Image Fine-Tuning
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Contrast</span>
            <span className="font-mono text-cyan-400">{settings.contrast}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.contrast}
            onChange={(e) => onChange({ contrast: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Brightness */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Brightness</span>
            <span className="font-mono text-cyan-400">{settings.brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.brightness}
            onChange={(e) => onChange({ brightness: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Threshold */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Threshold</span>
            <span className="font-mono text-cyan-400">{settings.threshold}</span>
          </div>
          <input
            type="range"
            min="10"
            max="245"
            value={settings.threshold}
            onChange={(e) => onChange({ threshold: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Blur */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Softening Blur</span>
            <span className="font-mono text-cyan-400">{settings.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={settings.blur}
            onChange={(e) => onChange({ blur: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Animation & Layering */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Layers size={14} />
          Reveal Layers & Particle Loop
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Staggered Reveal Layers</span>
            <span className="font-mono text-cyan-400 font-semibold">{settings.layers} Layers</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={settings.layers}
            onChange={(e) => onChange({ layers: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-gray-500 font-mono mt-0.5">
            <span>10 (Lighter)</span>
            <span>24 (Standard)</span>
            <span>60 (Smooth)</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Max Reveal Time</span>
            <span className="font-mono text-cyan-400">{settings.maxRevealTime.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="4.0"
            step="0.2"
            value={settings.maxRevealTime}
            onChange={(e) => onChange({ maxRevealTime: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Secondary Particle Drift Loop Sync */}
        <div className="pt-2 flex items-center justify-between border-t border-gray-800">
          <div>
            <div className="text-xs font-medium text-gray-200">Particle Drift Loop</div>
            <div className="text-[11px] text-gray-400">Subtle 14s infinite SMIL float animation</div>
          </div>
          <button
            type="button"
            onClick={() => {
              const nextVal = !settings.particleLoop;
              onChange({ particleLoop: nextVal, imageLoop: nextVal });
            }}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.particleLoop ? 'bg-cyan-500' : 'bg-gray-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.particleLoop ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Fill Color */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
          Portrait Pixel Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.fillColor}
            onChange={(e) => onChange({ fillColor: e.target.value })}
            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-700 p-0.5"
          />
          <div className="flex-1 flex gap-2">
            {colorPresets.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => onChange({ fillColor: hex })}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  settings.fillColor.toLowerCase() === hex.toLowerCase()
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

