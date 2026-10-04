import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  PortraitSettings,
  BannerShellSettings,
  InfoRow,
  ProjectItem,
  DitherResult
} from './types';
import { THEME_PRESETS } from './themePresets';
import { getSamplePortraitDataUri } from './samplePortraits';
import { processPortraitImage } from './ditherEngine';
import { generateBannerSvg } from './svgGenerator';
import { downloadFile, downloadStarterBundle, createReadmeContent, WORKFLOW_YML, FETCH_DATA_PY, GENERATE_PROJECTS_PY } from './exportBundle';
import { PortraitControls } from './PortraitControls';
import { BannerShellControls } from './BannerShellControls';
import { ProjectsConfigEditor } from './ProjectsConfigEditor';
import { ReadmePreviewModal } from './ReadmePreviewModal';
import {
  Download,
  Copy,
  Check,
  Eye,
  RefreshCw,
  FolderArchive,
  Code,
  Zap,
  Sparkles,
  Terminal,
  Layers,
  FileCode,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface ProfileBannerStudioProps {
  onBackToStats?: () => void;
}

export const ProfileBannerStudio: React.FC<ProfileBannerStudioProps> = ({ onBackToStats }) => {
  // Navigation tab in the left pane
  const [activeTab, setActiveTab] = useState<'portrait' | 'shell' | 'projects' | 'export'>('portrait');

  // Portrait settings
  const [portraitSettings, setPortraitSettings] = useState<PortraitSettings>({
    imageSrc: null,
    images: [],
    activeImageIndex: 0,
    imageLoop: true,
    imageLoopDuration: 3.0,
    outputWidth: 220,
    contrast: 15,
    brightness: 0,
    threshold: 128,
    blur: 0,
    invert: false,
    algorithm: 'floyd-steinberg',
    zoom: 1.0,
    panX: 0,
    panY: 0,
    layers: 24,
    maxRevealTime: 2.2,
    particleLoop: true,
    fillColor: '#A78BFA'
  });

  // Banner shell settings
  const [shellSettings, setShellSettings] = useState<BannerShellSettings>({
    title: 'albindavidc@dev - % ./profile.sh --live',
    headerText: 'SYSTEM.INFO',
    showLiveBadge: true,
    email: 'albindavidc007@gmail.com',
    username: 'albindavidc',
    footerCommand: '> system status: ready -- listening on port 8080',
    theme: 'cyber-cyan',
    colors: { ...THEME_PRESETS['cyber-cyan'] },
    animatePortrait: true,
    animateRows: true,
    animateBorder: true
  });

  // Info rows
  const [infoRows, setInfoRows] = useState<InfoRow[]>([
    { id: '1', type: 'row', label: 'USER.HANDLE', value: '@albindavidc' },
    { id: '2', type: 'row', label: 'PRIMARY.ROLE', value: 'Full-Stack Systems Engineer' },
    { id: '3', type: 'row', label: 'LOCATION.ZONE', value: 'San Francisco, CA [PST]' },
    { id: '4', type: 'divider', label: '- TECHNICAL ARSENAL', value: '' },
    { id: '5', type: 'row', label: 'CORE.LANGUAGES', value: 'TypeScript, Rust, Go, Python' },
    { id: '6', type: 'row', label: 'FRONTEND.STACK', value: 'React, Tailwind, WebGL, Next.js' },
    { id: '7', type: 'row', label: 'INFRA.SYSTEMS', value: 'Docker, Kubernetes, Vercel, GCP' },
    { id: '8', type: 'divider', label: '- METRICS & ACTIVITY', value: '' },
    { id: '9', type: 'row', label: 'TOTAL.COMMITS', value: '1,420+ Contributions' },
    { id: '10', type: 'row', label: 'REPOS.SHIPPED', value: '38 Open-Source Repositories' },
  ]);

  // Projects config
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: 'p1',
      name: 'Stats Visualizer',
      repo: 'albindavidc/stats-visualizer',
      logo: 'logos/stats.png',
      description: 'Transform your GitHub contribution graph into an animated retro arcade shooter.',
      tags: ['TypeScript', 'React', 'Canvas']
    },
    {
      id: 'p2',
      name: 'Profile Banner Studio',
      repo: 'albindavidc/profile-banner-studio',
      logo: 'logos/banner.png',
      description: 'Client-side terminal-card SVG banner generator with dithered pixel-art portraits.',
      tags: ['SVG', 'SMIL', 'Dithering']
    },
    {
      id: 'p3',
      name: 'HyperFlux Cache',
      repo: 'albindavidc/hyperflux-cache',
      logo: 'logos/flux.png',
      description: 'Globally replicated read-optimized edge cache layer with sub-millisecond lookups.',
      tags: ['Go', 'EdgeConfig', 'Redis']
    }
  ]);

  // Image processing results
  const [ditherResult, setDitherResult] = useState<DitherResult>({
    width: 220,
    height: 275,
    layers: [],
    totalRuns: 0,
    totalPixels: 0,
    emptyRowsRemoved: 0
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0); // For re-triggering animations

  // Initialize with sample portrait if none selected
  useEffect(() => {
    if (!portraitSettings.imageSrc && (!portraitSettings.images || portraitSettings.images.length === 0)) {
      const sample = getSamplePortraitDataUri();
      setPortraitSettings((prev) => ({
        ...prev,
        imageSrc: sample,
        images: [sample],
        activeImageIndex: 0
      }));
    }
  }, []);

  // Run dither processing on canvas whenever portrait settings change (debounced)
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      const hasImage = portraitSettings.imageSrc || (portraitSettings.images && portraitSettings.images.length > 0);
      if (!hasImage) return;
      setIsProcessing(true);
      try {
        const res = await processPortraitImage(portraitSettings);
        if (!isCancelled) {
          setDitherResult(res);
        }
      } catch (err) {
        console.error('Failed to process portrait image:', err);
      } finally {
        if (!isCancelled) {
          setIsProcessing(false);
        }
      }
    }, 80);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    portraitSettings.imageSrc,
    portraitSettings.images,
    portraitSettings.activeImageIndex,
    portraitSettings.imageLoop,
    portraitSettings.imageLoopDuration,
    portraitSettings.outputWidth,
    portraitSettings.contrast,
    portraitSettings.brightness,
    portraitSettings.threshold,
    portraitSettings.blur,
    portraitSettings.invert,
    portraitSettings.algorithm,
    portraitSettings.zoom,
    portraitSettings.panX,
    portraitSettings.panY,
    portraitSettings.layers,
    portraitSettings.fillColor
  ]);

  // Generate the live SVG string
  const svgString = useMemo(() => {
    return generateBannerSvg(portraitSettings, ditherResult, shellSettings, infoRows);
  }, [portraitSettings, ditherResult, shellSettings, infoRows]);

  // SVG file size in bytes
  const svgSizeBytes = useMemo(() => {
    return new TextEncoder().encode(svgString).length;
  }, [svgString]);

  const sizeKb = svgSizeBytes / 1024;

  // Optimize handler: sets resolution to 200px and layers to 18 for < 350 KB
  const handleOptimize = useCallback(() => {
    setPortraitSettings((prev) => ({
      ...prev,
      outputWidth: Math.min(prev.outputWidth, 200),
      layers: Math.min(prev.layers, 18),
      blur: Math.max(prev.blur, 1)
    }));
  }, []);

  // Re-trigger animation
  const handleReplayAnimation = () => {
    setPreviewKey((k) => k + 1);
  };

  // Copy SVG to clipboard
  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgString);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch (err) {
      console.error('Failed to copy SVG', err);
    }
  };

  // Download SVG file
  const handleDownloadSvg = () => {
    downloadFile(svgString, `${shellSettings.username || 'profile'}.svg`, 'image/svg+xml');
  };

  // Download Starter Bundle (.zip)
  const handleDownloadBundle = async () => {
    await downloadStarterBundle(svgString, projects, shellSettings.username || 'developer');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Studio Header Bar */}
      <header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToStats && (
            <button
              onClick={onBackToStats}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
            >
              ← Back to Stats
            </button>
          )}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-mono font-bold text-sm">
            &gt;_
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                Profile Banner Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                SVG & SMIL 100% Client-Side
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Generate animated terminal-style GitHub profile banners with dithered pixel-art portraits.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* File Size Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs font-mono">
            <span className="text-gray-400">Size:</span>
            <span className={sizeKb > 1000 ? 'text-red-400 font-bold' : sizeKb > 500 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {sizeKb < 1024 ? `${sizeKb.toFixed(1)} KB` : `${(sizeKb / 1024).toFixed(2)} MB`}
            </span>
          </div>

          <button
            onClick={handleCopySvg}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200 transition-all active:scale-95"
            title="Copy raw SVG markup to clipboard"
          >
            {copiedSvg ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedSvg ? 'Copied!' : 'Copy SVG'}</span>
          </button>

          <button
            onClick={() => setShowReadmeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-500 border border-violet-500 text-xs font-semibold text-white shadow-sm transition-all active:scale-95"
            title="Test SVG rendering inside <img> tag on GitHub Dark background"
          >
            <Eye size={14} />
            <span>Test in README</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 transition-all active:scale-95"
          >
            <Download size={14} />
            <span>profile.svg</span>
          </button>

          <button
            onClick={handleDownloadBundle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <FolderArchive size={14} />
            <span>Starter Bundle (.zip)</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace: 2-Pane Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* Left Pane: Controls & Editors (5 Cols) */}
        <aside className="lg:col-span-5 border-r border-gray-800 bg-gray-950 flex flex-col min-h-0">
          {/* Studio Tab Switcher */}
          <div className="flex border-b border-gray-800 bg-gray-900/60 p-1.5 gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('portrait')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'portrait'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Sparkles size={14} />
              Pixel-Art Portrait
            </button>
            <button
              onClick={() => setActiveTab('shell')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'shell'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Terminal size={14} />
              Banner Shell & Rows
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'projects'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Layers size={14} />
              Projects Config
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'export'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              <Download size={14} />
              Export & Bundle
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === 'portrait' && (
              <PortraitControls
                settings={portraitSettings}
                onChange={(updated) => setPortraitSettings((prev) => ({ ...prev, ...updated }))}
                svgSizeBytes={svgSizeBytes}
                onOptimize={handleOptimize}
              />
            )}

            {activeTab === 'shell' && (
              <BannerShellControls
                settings={shellSettings}
                onChangeSettings={(updated) => setShellSettings((prev) => ({ ...prev, ...updated }))}
                infoRows={infoRows}
                onChangeInfoRows={setInfoRows}
              />
            )}

            {activeTab === 'projects' && (
              <ProjectsConfigEditor
                projects={projects}
                onChangeProjects={setProjects}
              />
            )}

            {activeTab === 'export' && (
              <div className="space-y-6 text-sm text-gray-300">
                <div className="space-y-2">
                  <h3 className="font-semibold text-white text-base">Export Ready-to-Commit Files</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Download the standalone <code className="text-cyan-300 font-mono">profile.svg</code> or the complete starter bundle with GitHub Actions workflows and scripts.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm">Download profile.svg</div>
                      <div className="text-xs text-gray-400 mt-0.5">Standalone 1180x610 animated SVG with all SMIL loops included.</div>
                    </div>
                    <button
                      onClick={handleDownloadSvg}
                      className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
                    >
                      Download SVG
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm">Download projects.json</div>
                      <div className="text-xs text-gray-400 mt-0.5">Structured JSON project catalog ready for the workflow.</div>
                    </div>
                    <button
                      onClick={() => downloadFile(JSON.stringify(projects, null, 2), 'projects.json', 'application/json')}
                      className="px-3.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold text-xs transition-colors"
                    >
                      Download JSON
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-emerald-200 text-sm">Full Starter Bundle (.zip)</div>
                      <div className="text-xs text-emerald-300/80 mt-0.5">Includes SVG, JSON, README.md, and GitHub Actions scripts!</div>
                    </div>
                    <button
                      onClick={handleDownloadBundle}
                      className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors shadow-md"
                    >
                      Download .zip
                    </button>
                  </div>
                </div>

                {/* Bundle Structure Inspection */}
                <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
                    Bundle Contents:
                  </div>
                  <pre className="p-3 bg-gray-950 rounded-lg text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto border border-gray-800">
{`📦 ${shellSettings.username || 'profile'}-banner-starter.zip
 ├── profile.svg                      (1180x610 animated banner)
 ├── projects.json                    (Curated projects list)
 ├── logos/
 │    └── .gitkeep                    (Assets folder for custom logos)
 ├── README.md                        (Pre-configured with embed code)
 └── .github/
      ├── workflows/
      │    └── projects.yml           (Daily midnight auto-sync)
      └── scripts/
           ├── fetch_data.py          (GitHub REST API metadata fetcher)
           └── generate_projects.py   (Automatic README card generator)`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Pane: Live SVG Preview (7 Cols) */}
        <main className="lg:col-span-7 bg-gray-950/80 p-5 sm:p-7 flex flex-col justify-start space-y-5 overflow-y-auto">
          {/* Preview Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/70 border border-gray-800 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-white">Live SVG Canvas</span>
              <span className="text-xs font-mono text-gray-400">1180 × 610</span>
              {isProcessing && (
                <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                  <RefreshCw size={11} className="animate-spin" /> Rendering 1-bit...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReplayAnimation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 transition-colors"
                title="Re-run reveal animations from begin=0"
              >
                <RefreshCw size={13} />
                Replay Animation
              </button>

              <button
                type="button"
                onClick={() => setShowReadmeModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/50 text-xs font-medium text-violet-200 transition-colors"
              >
                <Eye size={13} />
                GitHub README View
              </button>
            </div>
          </div>

          {/* SVG Preview Frame with mac-style shadow */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800/80 bg-gray-900 group">
            {/* Direct Inline SVG container */}
            <div
              key={previewKey}
              className="w-full h-auto flex items-center justify-center p-2 sm:p-4"
              dangerouslySetInnerHTML={{ __html: svgString }}
            />
          </div>

          {/* Technical Diagnostics & Leader Alignment Readout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
              <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-semibold">
                Dither Strategy
              </span>
              <span className="font-mono text-cyan-300 font-bold capitalize">
                {portraitSettings.algorithm}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
              <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-semibold">
                Pixel Runs / Rows
              </span>
              <span className="font-mono text-purple-300 font-bold">
                {ditherResult.totalRuns.toLocaleString()} runs
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
              <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-semibold">
                Reveal Layers
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                {ditherResult.layers.length} Layers ({portraitSettings.maxRevealTime}s)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1">
              <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-semibold">
                Leader Alignment
              </span>
              <span className="font-mono text-amber-300 font-bold">
                textLength=&quot;655&quot; Locked
              </span>
            </div>
          </div>

          {/* Embed Snippet Quick Copy */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5 font-mono">
                <FileCode size={14} className="text-cyan-400" />
                README.md Embed Markdown
              </span>
              <span className="text-[11px] text-gray-500 font-mono">Ready to paste into profile README</span>
            </div>
            <div className="p-3 rounded-lg bg-gray-950 font-mono text-xs text-gray-300 overflow-x-auto border border-gray-800/80">
              <code>{`<div align="center">\n  <img src="profile.svg" alt="Profile Banner" width="100%" />\n</div>`}</code>
            </div>
          </div>
        </main>
      </div>

      {/* GitHub README Preview Modal */}
      <ReadmePreviewModal
        isOpen={showReadmeModal}
        onClose={() => setShowReadmeModal(false)}
        svgString={svgString}
        username={shellSettings.username}
        projects={projects}
      />
    </div>
  );
};
