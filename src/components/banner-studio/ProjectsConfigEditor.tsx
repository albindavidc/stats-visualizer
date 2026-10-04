import React from 'react';
import { ProjectItem } from './types';
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, FolderGit2, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { downloadFile } from './exportBundle';

interface ProjectsConfigEditorProps {
  projects: ProjectItem[];
  onChangeProjects: (projects: ProjectItem[]) => void;
}

export const ProjectsConfigEditor: React.FC<ProjectsConfigEditorProps> = ({
  projects,
  onChangeProjects
}) => {
  const isRepoValid = (repo: string) => {
    return /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo.trim());
  };

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: 'proj_' + Date.now(),
      name: 'New Project',
      repo: 'username/my-repo',
      logo: 'logos/project.png',
      description: 'A cutting-edge open-source software project.',
      tags: ['TypeScript', 'React', 'Node.js']
    };
    onChangeProjects([...projects, newProj]);
  };

  const handleUpdate = (id: string, updates: Partial<ProjectItem>) => {
    onChangeProjects(
      projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleDelete = (id: string) => {
    onChangeProjects(projects.filter((p) => p.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= projects.length) return;
    const copy = [...projects];
    const item = copy[index];
    copy[index] = copy[target];
    copy[target] = item;
    onChangeProjects(copy);
  };

  const handleDownloadJson = () => {
    const cleanProjects = projects.map(({ name, repo, logo, description, tags }) => ({
      name,
      repo,
      logo,
      description,
      tags
    }));
    downloadFile(JSON.stringify(cleanProjects, null, 2), 'projects.json', 'application/json');
  };

  return (
    <div className="space-y-6 text-sm text-gray-300">
      {/* Header and Download Button */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div>
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <FolderGit2 size={18} className="text-cyan-400" />
            Featured Projects Configuration
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Produces <code className="text-cyan-300 font-mono">projects.json</code> for automated GitHub README showcases.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-medium text-gray-200"
          >
            <Download size={13} />
            projects.json
          </button>
          <button
            type="button"
            onClick={handleAddProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-sm"
          >
            <Plus size={14} />
            Add Project
          </button>
        </div>
      </div>

      {/* Projects List / Form */}
      <div className="space-y-4">
        {projects.map((proj, idx) => {
          const valid = isRepoValid(proj.repo);

          return (
            <div
              key={proj.id}
              className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3.5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center border border-cyan-800">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-white text-sm">{proj.name || 'Untitled Project'}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === projects.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(proj.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="Delete Project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => handleUpdate(proj.id, { name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="HyperFlux"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-400">GitHub Repo (owner/repo)</label>
                    <span className="text-[11px] flex items-center gap-1">
                      {valid ? (
                        <span className="text-emerald-400 flex items-center gap-0.5"><CheckCircle2 size={11} /> Valid</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-0.5"><AlertCircle size={11} /> Must be owner/repo</span>
                      )}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={proj.repo}
                    onChange={(e) => handleUpdate(proj.id, { repo: e.target.value })}
                    className={`w-full bg-gray-800 border rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none ${
                      valid ? 'border-gray-700 focus:border-cyan-500' : 'border-amber-500/80'
                    }`}
                    placeholder="albindavidc/stats-visualizer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Logo Asset Path</label>
                  <input
                    type="text"
                    value={proj.logo}
                    onChange={(e) => handleUpdate(proj.id, { logo: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="logos/flux.png"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={proj.tags.join(', ')}
                    onChange={(e) =>
                      handleUpdate(proj.id, {
                        tags: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean)
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="TypeScript, Rust, Canvas"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => handleUpdate(proj.id, { description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="High-throughput distributed event streaming engine with sub-millisecond latencies."
                />
              </div>

              {/* Card Preview */}
              <div className="pt-2 border-t border-gray-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                  Card Preview
                </div>
                <div className="p-3 rounded-lg bg-gray-950/70 border border-gray-800/80">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs hover:text-cyan-400 flex items-center gap-1">
                      {proj.name}
                      <ExternalLink size={11} className="opacity-60" />
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      ⭐ 128 &nbsp;•&nbsp; 🍴 24
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
