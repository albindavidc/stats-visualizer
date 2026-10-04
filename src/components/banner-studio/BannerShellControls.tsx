import React from 'react';
import { BannerFont, BannerShellSettings, InfoRow, ThemePreset } from './types';
import { THEME_PRESETS } from './themePresets';
import { Palette, Plus, Trash2, ArrowUp, ArrowDown, Activity, PlayCircle, Terminal, Split, Type, Sparkles } from 'lucide-react';

interface BannerShellControlsProps {
  settings: BannerShellSettings;
  onChangeSettings: (updated: Partial<BannerShellSettings>) => void;
  infoRows: InfoRow[];
  onChangeInfoRows: (rows: InfoRow[]) => void;
}

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
    onChangeInfoRows(
      infoRows.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
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
          <label className="block text-xs text-gray-400 mb-1">Email Pill Label</label>
          <input
            type="text"
            value={settings.email}
            onChange={(e) => onChangeSettings({ email: e.target.value })}
            placeholder="albindavidc.contact@gmail.com"
            className="w-full bg-gray-800/90 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
          />
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
