import React, { useMemo } from 'react';
import { X, CheckCircle, ExternalLink, Github, FileCode, Sparkles } from 'lucide-react';
import { ProjectItem } from './types';

interface ReadmePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgString: string;
  username: string;
  projects: ProjectItem[];
}

export const ReadmePreviewModal: React.FC<ReadmePreviewModalProps> = ({
  isOpen,
  onClose,
  svgString,
  username,
  projects
}) => {
  // Convert SVG string to Blob URL so it behaves exactly like a real remote SVG file in an <img> tag!
  const svgBlobUrl = useMemo(() => {
    if (!svgString) return '';
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    return URL.createObjectURL(blob);
  }, [svgString]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#e6edf3]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
          <div className="flex items-center gap-3">
            <Github size={22} className="text-white" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">GitHub README Simulated Test Environment</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  &lt;img&gt; Mode Verified
                </span>
              </div>
              <p className="text-xs text-[#8b949e]">
                Testing SMIL SVG animations inside standard HTML <code className="text-cyan-400">&lt;img&gt;</code> tag on GitHub-dark (#0d1117).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Information Banner */}
          <div className="p-3.5 rounded-xl bg-[#161b22]/90 border border-[#30363d] flex items-start gap-3 text-xs">
            <Sparkles size={18} className="text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white">How GitHub Displays Animated SVGs:</span>
              <p className="text-[#8b949e] leading-relaxed">
                GitHub strips JavaScript from SVGs for security and renders them as static images or via <code className="text-cyan-300 font-mono">&lt;img src="..."&gt;</code>. 
                Because Profile Banner Studio outputs pure declarative <strong>SMIL animation</strong> (<code className="font-mono text-cyan-300">&lt;animate&gt;</code> & <code className="font-mono text-cyan-300">&lt;animateTransform&gt;</code>), 
                your materializing portrait reveal, dotted leaders, and glowing borders animate natively right in the GitHub README below!
              </p>
            </div>
          </div>

          {/* GitHub Markdown Box */}
          <div className="border border-[#30363d] rounded-xl bg-[#0d1117] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3 text-xs text-[#8b949e] font-mono">
              <div className="flex items-center gap-2">
                <FileCode size={14} />
                <span>{username || 'developer'} / README.md</span>
              </div>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle size={13} /> Active Preview
              </span>
            </div>

            {/* The real <img> tag */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Hi there, I&apos;m {username || 'albindavidc'} 👋
              </h1>

              <div className="w-full flex justify-center py-2">
                <img
                  src={svgBlobUrl}
                  alt="Profile Terminal Banner"
                  className="w-full h-auto rounded-xl shadow-lg border border-[#30363d]/60"
                  style={{ maxWidth: '1180px' }}
                />
              </div>

              {/* Simulated Projects Section */}
              <div className="pt-6 border-t border-[#30363d] space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  🛠️ Featured Projects & Systems
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl border border-[#30363d] bg-[#161b22] space-y-2 hover:border-[#8b949e] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#58a6ff] hover:underline flex items-center gap-1 cursor-pointer">
                          {proj.name}
                          <ExternalLink size={12} />
                        </span>
                        <span className="text-xs font-mono text-[#8b949e]">
                          ⭐ 84 &nbsp;•&nbsp; 🍴 16
                        </span>
                      </div>
                      <p className="text-xs text-[#8b949e] line-clamp-2">
                        {proj.description || 'Modern high-performance software system.'}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0d1117] text-[#58a6ff] border border-[#30363d]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#30363d] bg-[#161b22] flex justify-between items-center text-xs text-[#8b949e]">
          <span>Viewport simulated at standard 1180px container width</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-white font-medium transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
