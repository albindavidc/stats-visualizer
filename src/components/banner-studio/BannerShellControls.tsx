import React from 'react';
import { BannerFont, BannerShellSettings, FontWeightOption, InfoRow, ThemePreset } from './types';
import { THEME_PRESETS } from './themePresets';
import { Palette, Plus, Trash2, ArrowUp, ArrowDown, Activity, PlayCircle, Terminal, Split, Type, Sparkles, SlidersHorizontal, Maximize2, Mail, Minus, Link2 } from 'lucide-react';

interface BannerShellControlsProps {
  settings: BannerShellSettings;
  onChangeSettings: (updated: Partial<BannerShellSettings>) => void;
  infoRows: InfoRow[];
  onChangeInfoRows: (rows: InfoRow[]) => void;
}

const FONT_WEIGHT_OPTIONS: { id: FontWeightOption; label: string; name: string }[] = [
  { id: '100', label: '100', name: 'Thin' },
  { id: '200', label: '200', name: 'Extra Light' },
  { id: '300', label: '300', name: 'Light' },
  { id: '400', label: '400', name: 'Normal' },
  { id: '500', label: '500', name: 'Medium' },
  { id: '600', label: '600', name: 'Semi Bold' },
  { id: '700', label: '700', name: 'Bold' },
  { id: '800', label: '800', name: 'Extra Bold' },
];

const FONT_OPTIONS: { id: BannerFont; name: string; category: string; previewFont: string; sample: string }[] = [
  { id: 'monospace', name: 'SF / Consolas', category: 'Monospace', previewFont: 'ui-monospace, monospace', sample: '>_ profile.sh --live' },
  { id: 'jetbrains', name: 'JetBrains Mono', category: 'Code Mono', previewFont: '"JetBrains Mono", monospace', sample: 'const stack = ["AI"]' },
  { id: 'fira-code', name: 'Fira Code', category: 'Ligature Mono', previewFont: '"Fira Code", monospace', sample: 'fn => result === true' },
  { id: 'source-code', name: 'Source Code Pro', category: 'Adobe Mono', previewFont: '"Source Code Pro", monospace', sample: 'export default Dev' },
  { id: 'space-mono', name: 'Space Mono', category: 'Retro Tech', previewFont: '"Space Mono", monospace', sample: 'SYSTEM.READY [OK]' },
  { id: 'inter', name: 'Inter Display', category: 'Clean Sans', previewFont: '"Inter", sans-serif', sample: 'Full-Stack Software' },
  { id: 'roboto', name: 'Roboto', category: 'Modern Sans', previewFont: '"Roboto", sans-serif', sample: 'High Performance UI' },
];

export const BannerShellControls: React.FC<BannerShellControlsProps> = ({
  settings,
  onChangeSettings,
  infoRows,
  onChangeInfoRows
}) => {
  const [linkSizes, setLinkSizes] = React.useState(false);

  const handleSelectPreset = (preset: ThemePreset) => {
    if (preset === 'custom') {
      onChangeSettings({ theme: 'custom' });
    } else {
      onChangeSettings({
        theme: preset,
        colors: { ...THEME_PRESETS[preset] }
      });
    }
  };

  const handleAddRow = () => {
    const newRow: InfoRow = {
      id: 'row_' + Date.now(),
      type: 'row',
      label: 'New Metric',
      value: 'Value'
    };
    onChangeInfoRows([...infoRows, newRow]);
  };

  const handleAddDivider = () => {
    const newDiv: InfoRow = {
      id: 'div_' + Date.now(),
      type: 'divider',
      label: '- Section',
      value: ''
    };
    onChangeInfoRows([...infoRows, newDiv]);
  };

  const handleUpdateRow = (id: string, updates: Partial<InfoRow>) => {
    const updated = infoRows.map((r) => (r.id === id ? { ...r, ...updates } : r));
    onChangeInfoRows(updated);

    // Keep settings.email in sync if the edited row is the Gmail / contact row
    const targetRow = infoRows.find((r) => r.id === id);
    if (
      targetRow &&
      updates.value !== undefined &&
      (targetRow.label.toLowerCase().includes('gmail') || targetRow.label.toLowerCase().includes('email'))
    ) {
      onChangeSettings({ email: updates.value });
    }
  };

  const handleEmailChange = (newEmail: string) => {
    onChangeSettings({ email: newEmail });
    // Also sync to contact.gmail row in infoRows if present
    const hasMatchingRow = infoRows.some(
      (r) => r.label.toLowerCase().includes('gmail') || r.label.toLowerCase().includes('email')
    );
    if (hasMatchingRow) {
      onChangeInfoRows(
        infoRows.map((r) =>
          r.label.toLowerCase().includes('gmail') || r.label.toLowerCase().includes('email')
            ? { ...r, value: newEmail }
            : r
        )
      );
    }
  };

  const handleLabelSizeChange = (val: number) => {
    const clamped = Math.max(9, Math.min(20, Math.round(val * 2) / 2));
    if (linkSizes) {
      onChangeSettings({ labelFontSize: clamped, valueFontSize: clamped });
    } else {
      onChangeSettings({ labelFontSize: clamped });
    }
  };

  const handleValueSizeChange = (val: number) => {
    const clamped = Math.max(9, Math.min(20, Math.round(val * 2) / 2));
    if (linkSizes) {
      onChangeSettings({ labelFontSize: clamped, valueFontSize: clamped });
    } else {
      onChangeSettings({ valueFontSize: clamped });
    }
  };

  const handleDeleteRow = (id: string) => {
    onChangeInfoRows(infoRows.filter((r) => r.id !== id));
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= infoRows.length) return;
    const updated = [...infoRows];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChangeInfoRows(updated);
  };

  return (
    <div className="space-y-6 text-sm text-gray-300">
      {/* Theme Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Palette size={14} className="text-cyan-400" />
            Theme Preset
          </label>
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            {settings.theme}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { id: 'github-dark', name: 'GitHub Dark', accent: '#58A6FF', bg: '#0D1117', cardBg: '#161B22', isNew: true },
            { id: 'cyber-cyan', name: 'Cyber Cyan', accent: '#00F0FF', bg: '#0D1527', cardBg: '#070B14' },
            { id: 'matrix-green', name: 'Matrix Green', accent: '#00FF66', bg: '#071A0D', cardBg: '#030D06' },
            { id: 'sunset', name: 'Sunset', accent: '#FF5E62', bg: '#210F25', cardBg: '#140816' },
            { id: 'mono', name: 'Mono', accent: '#F8FAFC', bg: '#141414', cardBg: '#0A0A0A' },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset.id as ThemePreset)}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between relative overflow-hidden group ${
                settings.theme === preset.id
                  ? 'border-cyan-400 bg-gray-800 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                  : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-white">{preset.name}</span>
                  {preset.isNew && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                      OFFICIAL
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5">{preset.accent}</div>
              </div>
              <div className="flex gap-1.5 items-center">
                <span
                  className="w-4 h-4 rounded-full border border-gray-700 shadow-inner"
                  style={{ backgroundColor: preset.bg }}
                  title="Background"
                />
                <span
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: preset.accent }}
                  title="Accent Color"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font Family Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Type size={14} className="text-violet-400" />
            Design Font Family
          </label>
          <span className="text-[11px] font-mono text-violet-400 uppercase tracking-wider font-semibold">
            {settings.font || 'monospace'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => {
            const isSelected = (settings.font || 'monospace') === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChangeSettings({ font: f.id })}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-violet-400 bg-violet-950/20 shadow-md ring-1 ring-violet-400/50'
                    : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800/80 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-xs text-white">{f.name}</span>
                  <span className="text-[10px] font-mono text-gray-400 px-1.5 py-0.5 rounded bg-gray-800">
                    {f.category}
                  </span>
                </div>
                <div
                  className="text-xs text-cyan-300/90 mt-1.5 font-medium truncate"
                  style={{ fontFamily: f.previewFont }}
                >
                  {f.sample}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Weight Selection (Labels & Values) */}
      <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <SlidersHorizontal size={14} className="text-cyan-400" />
            System Info Font Weights
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            L:{settings.labelFontWeight || '500'} • V:{settings.valueFontWeight || '700'}
          </span>
        </div>

        {/* Label Font Weight Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.colors.accent }} />
              Label Font Weight
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              {FONT_WEIGHT_OPTIONS.find(w => w.id === (settings.labelFontWeight || '500'))?.name} ({settings.labelFontWeight || '500'})
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {FONT_WEIGHT_OPTIONS.map((weight) => {
              const isSelected = (settings.labelFontWeight || '500') === weight.id;
              return (
                <button
                  key={`label-weight-${weight.id}`}
                  type="button"
                  onClick={() => onChangeSettings({ labelFontWeight: weight.id })}
                  className={`py-2 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-400/50'
                      : 'border-gray-800 bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                  title={`${weight.name} (${weight.id})`}
                >
                  <span className="text-[11px] font-mono font-semibold">{weight.label}</span>
                  <span className="text-[9px] truncate w-full mt-0.5 opacity-80">{weight.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Value Font Weight Selection */}
        <div className="space-y-2 pt-2 border-t border-gray-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.colors.valueColor }} />
              Value Font Weight
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              {FONT_WEIGHT_OPTIONS.find(w => w.id === (settings.valueFontWeight || '700'))?.name} ({settings.valueFontWeight || '700'})
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {FONT_WEIGHT_OPTIONS.map((weight) => {
              const isSelected = (settings.valueFontWeight || '700') === weight.id;
              return (
                <button
                  key={`value-weight-${weight.id}`}
                  type="button"
                  onClick={() => onChangeSettings({ valueFontWeight: weight.id })}
                  className={`py-2 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/50 text-emerald-300 font-bold shadow-sm ring-1 ring-emerald-400/50'
                      : 'border-gray-800 bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                  title={`${weight.name} (${weight.id})`}
                >
                  <span className="text-[11px] font-mono font-semibold">{weight.label}</span>
                  <span className="text-[9px] truncate w-full mt-0.5 opacity-80">{weight.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Style Presets & Specimen Preview */}
        <div className="pt-2 border-t border-gray-800/60 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-[11px] text-gray-400 font-medium">Quick Weight Pairing Presets:</span>
            <div className="flex flex-wrap gap-1">
              {[
                { name: 'Balanced', labelW: '500', valW: '700' },
                { name: 'High Contrast', labelW: '300', valW: '800' },
                { name: 'Uniform Clean', labelW: '400', valW: '600' },
                { name: 'Minimal Light', labelW: '200', valW: '500' },
              ].map((pairing) => (
                <button
                  key={pairing.name}
                  type="button"
                  onClick={() => onChangeSettings({
                    labelFontWeight: pairing.labelW as FontWeightOption,
                    valueFontWeight: pairing.valW as FontWeightOption
                  })}
                  className="px-2 py-0.5 rounded text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 font-mono transition-colors active:scale-95"
                >
                  {pairing.name}
                </button>
              ))}
            </div>
          </div>

          {/* Live Typography Specimen Box */}
          <div className="p-3 bg-gray-950 rounded-lg border border-gray-800/80 font-mono text-xs flex items-center justify-between overflow-x-auto">
            <div className="flex items-center gap-2">
              <span
                style={{
                  color: settings.colors.accent,
                  fontWeight: Number(settings.labelFontWeight || '500')
                }}
              >
                user.roles
              </span>
              <span className="text-gray-600 font-normal">..........</span>
              <span
                style={{
                  color: settings.colors.valueColor,
                  fontWeight: Number(settings.valueFontWeight || '700')
                }}
              >
                AI Full-Stack Developer &amp; Software Engineer
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono shrink-0 pl-2">
              Live Sample
            </span>
          </div>
        </div>
      </div>

      {/* Font Size Selection (Labels & Values) */}
      <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Maximize2 size={14} className="text-cyan-400" />
            System Info Font Sizes
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLinkSizes(!linkSizes)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                linkSizes
                  ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300 shadow-sm'
                  : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:text-gray-200'
              }`}
              title={linkSizes ? 'Linked (both scale together)' : 'Independent sizing'}
            >
              <Link2 size={11} className={linkSizes ? 'text-cyan-400' : 'text-gray-500'} />
              <span>{linkSizes ? 'Locked' : 'Unlinked'}</span>
            </button>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              L:{settings.labelFontSize || 13}px • V:{settings.valueFontSize || 13}px
            </span>
          </div>
        </div>

        {/* Label Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.colors.accent }} />
              Label Font Size
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-cyan-300 font-mono font-semibold">
                {settings.labelFontSize || 13}px
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                ({settings.colors.accent})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLabelSizeChange((settings.labelFontSize || 13) - 0.5)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors active:scale-95"
              title="Decrease size by 0.5px"
            >
              <Minus size={12} />
            </button>
            <input
              type="range"
              min="9.5"
              max="18"
              step="0.5"
              value={settings.labelFontSize || 13}
              onChange={(e) => handleLabelSizeChange(parseFloat(e.target.value))}
              className="flex-1 accent-cyan-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => handleLabelSizeChange((settings.labelFontSize || 13) + 0.5)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors active:scale-95"
              title="Increase size by 0.5px"
            >
              <Plus size={12} />
            </button>
            <div className="flex items-center bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 w-16 justify-between">
              <input
                type="number"
                min="9"
                max="20"
                step="0.5"
                value={settings.labelFontSize || 13}
                onChange={(e) => handleLabelSizeChange(parseFloat(e.target.value) || 13)}
                className="w-8 bg-transparent text-xs text-cyan-300 font-mono focus:outline-none text-right"
              />
              <span className="text-[10px] text-gray-500 font-mono">px</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-0.5">
            {[10, 11, 12, 13, 14, 15, 16].map((sz) => (
              <button
                key={`label-size-${sz}`}
                type="button"
                onClick={() => handleLabelSizeChange(sz)}
                className={`py-1 rounded text-[10px] font-mono font-medium transition-all ${
                  (settings.labelFontSize || 13) === sz
                    ? 'bg-cyan-500 text-gray-950 font-bold shadow-sm'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700/60'
                }`}
              >
                {sz}px
              </button>
            ))}
          </div>
        </div>

        {/* Value Font Size */}
        <div className="space-y-2 pt-2 border-t border-gray-800/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.colors.valueColor }} />
              Value Font Size
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-emerald-300 font-mono font-semibold">
                {settings.valueFontSize || 13}px
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                ({settings.colors.valueColor})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleValueSizeChange((settings.valueFontSize || 13) - 0.5)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors active:scale-95"
              title="Decrease size by 0.5px"
            >
              <Minus size={12} />
            </button>
            <input
              type="range"
              min="9.5"
              max="18"
              step="0.5"
              value={settings.valueFontSize || 13}
              onChange={(e) => handleValueSizeChange(parseFloat(e.target.value))}
              className="flex-1 accent-emerald-500 h-1.5 bg-gray-800 rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => handleValueSizeChange((settings.valueFontSize || 13) + 0.5)}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors active:scale-95"
              title="Increase size by 0.5px"
            >
              <Plus size={12} />
            </button>
            <div className="flex items-center bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 w-16 justify-between">
              <input
                type="number"
                min="9"
                max="20"
                step="0.5"
                value={settings.valueFontSize || 13}
                onChange={(e) => handleValueSizeChange(parseFloat(e.target.value) || 13)}
                className="w-8 bg-transparent text-xs text-emerald-300 font-mono focus:outline-none text-right"
              />
              <span className="text-[10px] text-gray-500 font-mono">px</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-0.5">
            {[10, 11, 12, 13, 14, 15, 16].map((sz) => (
              <button
                key={`val-size-${sz}`}
                type="button"
                onClick={() => handleValueSizeChange(sz)}
                className={`py-1 rounded text-[10px] font-mono font-medium transition-all ${
                  (settings.valueFontSize || 13) === sz
                    ? 'bg-emerald-500 text-gray-950 font-bold shadow-sm'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700/60'
                }`}
              >
                {sz}px
              </button>
            ))}
          </div>
        </div>

        {/* Quick Size Pairings */}
        <div className="pt-2 border-t border-gray-800/60 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-gray-400 font-medium">Quick Size Presets:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { name: 'Standard (13/13)', labelS: 13, valS: 13 },
              { name: 'Emphasis (12/14)', labelS: 12, valS: 14 },
              { name: 'Compact (11/11)', labelS: 11, valS: 11 },
              { name: 'Prominent (13.5/15)', labelS: 13.5, valS: 15 },
              { name: 'Large (14/16)', labelS: 14, valS: 16 },
            ].map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => onChangeSettings({ labelFontSize: p.labelS, valueFontSize: p.valS })}
                className="px-2 py-0.5 rounded text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 font-mono transition-colors active:scale-95"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Typography Specimen Box */}
        <div className="p-3 bg-gray-950 rounded-lg border border-gray-800 font-mono text-xs flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2">
            <span
              style={{
                color: settings.colors.accent,
                fontWeight: Number(settings.labelFontWeight || '500'),
                fontSize: `${settings.labelFontSize || 13}px`
              }}
            >
              user.roles
            </span>
            <span className="text-gray-600 font-normal">..........</span>
            <span
              style={{
                color: settings.colors.valueColor,
                fontWeight: Number(settings.valueFontWeight || '700'),
                fontSize: `${settings.valueFontSize || 13}px`
              }}
            >
              AI Full-Stack Developer &amp; Software Engineer
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono shrink-0 pl-2">
            Live Specimen
          </span>
        </div>
      </div>

      {/* SYSTEM.INFO Gmail Badge (Dynamic Width) Section */}
      <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-3.5">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Mail size={14} className="text-red-400" />
            Gmail Badge (Under SYSTEM.INFO)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/60 font-semibold">
              Pill Width: ~{Math.min(655, Math.max(90, Math.ceil(34 + (settings.email?.trim() || 'developer@github.com').length * (settings.font === 'inter' || settings.font === 'roboto' ? 6.95 : 7.25) + 20)))}px
            </span>
          </div>
        </div>

        {/* Visual Dynamic Width Meter Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span className="flex items-center gap-1 text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Dynamic Badge Width Bar
            </span>
            <span className="text-cyan-400 font-semibold">
              {Math.min(655, Math.max(90, Math.ceil(34 + (settings.email?.trim() || 'developer@github.com').length * (settings.font === 'inter' || settings.font === 'roboto' ? 6.95 : 7.25) + 20)))} / 655 px
            </span>
          </div>
          <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800/80">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-violet-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(14, (Math.min(655, Math.max(90, Math.ceil(34 + (settings.email?.trim() || 'developer@github.com').length * (settings.font === 'inter' || settings.font === 'roboto' ? 6.95 : 7.25) + 20))) / 655) * 100))}%`
              }}
            />
          </div>
        </div>

        {/* Dynamic Email Input with Instant Two-Way Sync */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-300 font-medium">Badge Email / Contact Handle</label>
            <span className="text-[10px] text-gray-500 font-mono">
              {(settings.email?.trim() || 'developer@github.com').length} characters
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-red-400" />
            </div>
            <input
              type="text"
              value={settings.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="albindavidc.contact@gmail.com"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none shadow-inner"
            />
          </div>
        </div>

        {/* Quick Email Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-gray-400 font-medium">Quick Presets:</span>
          {[
            { label: 'Resume', val: 'albindavidc.contact@gmail.com' },
            { label: 'Short', val: 'albindavidc@gmail.com' },
            { label: 'Handle', val: '@albindavidc' },
            { label: 'Portfolio', val: 'contact@albindavidc.com' },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleEmailChange(preset.val)}
              className="px-2 py-0.5 rounded text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 font-mono transition-colors active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed bg-gray-950/40 p-2.5 rounded-lg border border-gray-800/60">
          The Gmail badge directly below <span className="text-cyan-400 font-mono font-semibold">SYSTEM.INFO</span> measures font metrics in real-time, dynamically scaling its rounded pill container, Google Red mail envelope, and right-anchored pulsing indicator.
        </p>
      </div>

      {/* Animation Toggles */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <PlayCircle size={14} />
          SMIL Animation Toggles
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-gray-200">Portrait Materialize Animation</div>
              <div className="text-[11px] text-gray-500">Staggered layer reveal</div>
            </div>
            <button
              type="button"
              onClick={() => onChangeSettings({ animatePortrait: !settings.animatePortrait })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.animatePortrait ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.animatePortrait ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-800/80 pt-2.5">
            <div>
              <div className="text-xs font-medium text-gray-200">Info Rows Staggered Slide-In</div>
              <div className="text-[11px] text-gray-500">Smooth 0.12s translate slide</div>
            </div>
            <button
              type="button"
              onClick={() => onChangeSettings({ animateRows: !settings.animateRows })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.animateRows ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.animateRows ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-800/80 pt-2.5">
            <div>
              <div className="text-xs font-medium text-gray-200">Animated Gradient Border Glow</div>
              <div className="text-[11px] text-gray-500">10s continuous glowing loop</div>
            </div>
            <button
              type="button"
              onClick={() => onChangeSettings({ animateBorder: !settings.animateBorder })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.animateBorder ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.animateBorder ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-800/80 pt-2.5">
            <div>
              <div className="text-xs font-medium text-gray-200">Pulsing Red LIVE Badge</div>
              <div className="text-[11px] text-gray-500">Heartbeat indicator beside header</div>
            </div>
            <button
              type="button"
              onClick={() => onChangeSettings({ showLiveBadge: !settings.showLiveBadge })}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.showLiveBadge ? 'bg-red-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.showLiveBadge ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Shell Strings */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-3.5">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <Terminal size={14} />
          Terminal Shell Content
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">macOS Window Title Bar</label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => onChangeSettings({ title: e.target.value })}
            placeholder="you@email.com - % ./profile.sh --live"
            className="w-full bg-gray-800/90 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Header Label</label>
            <input
              type="text"
              value={settings.headerText}
              onChange={(e) => onChangeSettings({ headerText: e.target.value })}
              placeholder="SYSTEM.INFO"
              className="w-full bg-gray-800/90 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">GitHub Username</label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => onChangeSettings({ username: e.target.value })}
              placeholder="albindavidc"
              className="w-full bg-gray-800/90 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
              <Mail size={13} className="text-cyan-400" />
              Gmail / Contact Badge (Under SYSTEM.INFO)
            </label>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
              Dynamic Width: ~{Math.min(655, Math.max(72, 48 + Math.ceil((settings.email?.trim() || 'developer@github.com').length * (settings.font === 'inter' || settings.font === 'roboto' ? 7.1 : 7.35))))}px
            </span>
          </div>
          <input
            type="text"
            value={settings.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="albindavidc.contact@gmail.com"
            className="w-full bg-gray-800/90 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Badge automatically adapts its width to fit your email or contact text dynamically.
          </p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Footer Status Command</label>
          <input
            type="text"
            value={settings.footerCommand}
            onChange={(e) => onChangeSettings({ footerCommand: e.target.value })}
            placeholder="> More about me &amp; projects below in README ↓"
            className="w-full bg-gray-800/90 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Info Rows Editor */}
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Activity size={14} />
            Info Rows & Dotted Leaders
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleAddDivider}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 border border-gray-700"
            >
              <Split size={12} />
              + Divider
            </button>
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600/80 hover:bg-cyan-500 text-xs font-semibold text-white shadow-sm"
            >
              <Plus size={12} />
              + Row
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {infoRows.map((row, idx) => (
            <div
              key={row.id}
              className="p-2.5 rounded-lg bg-gray-800/80 border border-gray-700/80 flex items-center gap-2 text-xs"
            >
              {row.type === 'divider' ? (
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[11px] font-mono text-purple-400 font-bold uppercase">DIV</span>
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => handleUpdateRow(row.id, { label: e.target.value })}
                    placeholder="- Section Divider"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => handleUpdateRow(row.id, { label: e.target.value })}
                    placeholder="Label"
                    className="col-span-2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => handleUpdateRow(row.id, { value: e.target.value })}
                    placeholder="Value"
                    className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-1 text-gray-400">
                <button
                  type="button"
                  onClick={() => handleMoveRow(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveRow(idx, 'down')}
                  disabled={idx === infoRows.length - 1}
                  className="p-1 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRow(row.id)}
                  className="p-1 hover:text-red-400"
                  title="Delete Row"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
