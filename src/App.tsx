import React, { useState, useRef, useEffect } from 'react';
import { SpaceShooter } from './components/SpaceShooter';
import { ContributionGraph } from './components/ContributionGraph';
import { LeetCodeGraph } from './components/LeetCodeGraph';
import { ProfileBannerStudio } from './components/banner-studio/ProfileBannerStudio';
import { Github, Code2, Play, Loader2, LayoutGrid, Gamepad2, Check, Code, Link, Sparkles, Terminal } from 'lucide-react';
import { THEMES } from './themes';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'stats' | 'banner-studio'>('stats');
  const [platform, setPlatform] = useState<'github' | 'leetcode'>('github');
  const [username, setUsername] = useState('');
  const [strategy, setStrategy] = useState('random');
  const [theme, setTheme] = useState('github');
  const [font, setFont] = useState('inter');
  const [hideBorder, setHideBorder] = useState(false);
  const [hideLanguages, setHideLanguages] = useState(false);
  const [leetcodeSite, setLeetcodeSite] = useState('us');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubData, setGithubData] = useState<any>(null);
  const [leetcodeData, setLeetcodeData] = useState<any>(null);
  const [leetcodeDataReady, setLeetcodeDataReady] = useState(false);
  const [viewMode, setViewMode] = useState<'shooter' | 'classic'>('classic');
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page') || params.get('tab');
    if (pageParam === 'banner-studio' || pageParam === 'banner') {
      setCurrentPage('banner-studio');
    }
    const plat = params.get('platform') as 'github' | 'leetcode';
    if (plat === 'github' || plat === 'leetcode') setPlatform(plat);
    const user = params.get('username') || (plat === 'leetcode' ? 'albindavidc' : 'albindavidc');
    setUsername(user);
    const mode = params.get('mode');
    if (mode === 'shooter' || mode === 'classic') {
      setViewMode(mode);
    }
    const urlFont = params.get('font');
    if (urlFont) setFont(urlFont);
    const urlHideBorder = params.get('hide_border') === 'true';
    if (urlHideBorder) setHideBorder(true);
    const urlHideLanguages = params.get('hide_languages') === 'true';
    if (urlHideLanguages) setHideLanguages(true);
    const urlTheme = params.get('theme');
    if (urlTheme) setTheme(urlTheme);
    const urlSite = params.get('site');
    if (urlSite) setLeetcodeSite(urlSite);
  }, []);

  const handlePageChange = (page: 'stats' | 'banner-studio') => {
    setCurrentPage(page);
    const url = new URL(window.location.href);
    if (page === 'banner-studio') {
      url.searchParams.set('page', 'banner-studio');
    } else {
      url.searchParams.delete('page');
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGithubData(null);
    setLeetcodeData(null);
    setLeetcodeDataReady(false);
    
    // Update URL for sharing
    window.history.pushState({}, '', `?platform=${platform}&username=${encodeURIComponent(username)}&mode=${viewMode}&theme=${theme}&font=${font}&hide_border=${hideBorder}&hide_languages=${hideLanguages}&site=${leetcodeSite}`);

    if (platform === 'github') {
      try {
        const res = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
        
        let data;
        const textResponse = await res.text();
        let isJson = false;
        try {
          data = JSON.parse(textResponse);
          isJson = true;
        } catch (e) {
        }

        if (!res.ok) {
          if (isJson && data?.error) {
            throw new Error(data.error);
          } else {
            throw new Error(`Server Error (${res.status}): ${textResponse.slice(0, 150)}...`);
          }
        } else if (!isJson) {
          throw new Error(`Invalid server response: Expected JSON but received ${res.headers.get('content-type') || 'unknown format'}`);
        }

        setGithubData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await fetch(`/api/leetcode-data?username=${encodeURIComponent(username)}`);
        
        let data;
        const textResponse = await res.text();
        let isJson = false;
        try {
          data = JSON.parse(textResponse);
          isJson = true;
        } catch (e) {
        }

        if (!res.ok) {
          if (isJson && data?.error) {
            throw new Error(data.error);
          } else {
            throw new Error(`Server Error (${res.status}): ${textResponse.slice(0, 150)}...`);
          }
        } else if (!isJson) {
          throw new Error(`Invalid server response: Expected JSON but received ${res.headers.get('content-type') || 'unknown format'}`);
        }

        setLeetcodeData(data);
        setLeetcodeDataReady(true);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getEmbedUrl = () => {
    const baseUrl = window.location.origin;
    if (platform === 'github') {
      return `${baseUrl}/api/graph?username=${encodeURIComponent(username)}&theme=${theme}&font=${font}&hide_border=${hideBorder}&hide_languages=${hideLanguages}`;
    } else {
      return `${baseUrl}/api/leetcode?username=${encodeURIComponent(username)}&theme=${theme}&font=${font}&hide_border=${hideBorder}&site=${leetcodeSite}`;
    }
  };

  const handleCopyEmbed = async () => {
    if (!username || (!githubData && !leetcodeDataReady)) return;
    
    const embedUrl = getEmbedUrl();
    const linkUrl = `${window.location.origin}/?platform=${platform}&username=${encodeURIComponent(username)}&theme=${theme}&font=${font}`;
    const markdown = `[![Stats](${embedUrl})](${linkUrl})`;
    
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch (err) {
      console.error('Failed to copy embed link', err);
    }
  };

  const handleCopyUrl = async () => {
    if (!username || (!githubData && !leetcodeDataReady)) return;
    
    const embedUrl = getEmbedUrl();
    
    try {
      await navigator.clipboard.writeText(embedUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy direct URL', err);
    }
  };

  if (currentPage === 'banner-studio') {
    return <ProfileBannerStudio onBackToStats={() => handlePageChange('stats')} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Application Switcher Bar */}
      <div className="max-w-4xl w-full flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-sm text-gray-200">Developer Profile Suite</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange('stats')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-white border border-gray-700"
          >
            Stats & Shooter
          </button>
          <button
            onClick={() => handlePageChange('banner-studio')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-md shadow-cyan-600/20 transition-all hover:scale-105"
          >
            <Sparkles size={13} />
            <span>Profile Banner Studio</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/20 font-bold">NEW</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl w-full space-y-8">
        {/* Banner Studio Callout Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-violet-950/30 to-gray-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Terminal size={20} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Create an animated README profile banner</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Pixel-Art + SMIL
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Generate a terminal-style card with dithered portrait, live info rows, and ready-to-commit bundle in Profile Banner Studio.
              </p>
            </div>
          </div>
          <button
            onClick={() => handlePageChange('banner-studio')}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 transition-all"
          >
            <span>Open Banner Studio</span>
            <span>→</span>
          </button>
        </div>

        <div className="text-center">
          <div className="flex justify-center items-center gap-3 text-emerald-400 mb-4">
            {platform === 'github' ? <Github size={48} /> : (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22,14.355c0-0.742-0.564-1.346-1.26-1.346H10.676c-0.696,0-1.26,0.604-1.26,1.346s0.563,1.346,1.26,1.346H20.74C21.436,15.702,22,15.098,22,14.355z" />
                <path d="M3.482,18.187l4.313,4.361C8.768,23.527,10.113,24,11.598,24c1.485,0,2.83-0.512,3.805-1.494l2.588-2.637c0.51-0.514,0.492-1.365-0.039-1.9c-0.531-0.535-1.375-0.553-1.884-0.039l-2.676,2.607c-0.462,0.467-1.102,0.662-1.809,0.662s-1.346-0.195-1.81-0.662l-4.298-4.363c-0.463-0.467-0.696-1.15-0.696-1.863c0-0.713,0.233-1.357,0.696-1.824l4.285-4.38c0.463-0.467,1.116-0.645,1.822-0.645s1.346,0.195,1.809,0.662l2.676,2.606c0.51,0.515,1.354,0.497,1.885-0.038c0.531-0.536,0.549-1.387,0.039-1.901l-2.588-2.636c-0.649-0.646-1.471-1.116-2.392-1.33l-0.034-0.007l2.447-2.503c0.512-0.514,0.494-1.366-0.037-1.901c-0.531-0.535-1.376-0.552-1.887-0.038L3.482,10.476C2.509,11.458,2,12.813,2,14.311C2,15.809,2.509,17.207,3.482,18.187z" />
              </svg>
            )}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Stats Visualizer
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            {platform === 'github' 
              ? 'View your GitHub contribution graph or transform it into a retro arcade shooter.' 
              : 'Showcase your dynamically generated LeetCode stats.'}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
              <button
                onClick={() => {
                  setPlatform('github');
                  setUsername('albindavidc');
                  setTheme('github');
                  setGithubData(null);
                  setLeetcodeDataReady(false);
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  platform === 'github' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                <Github size={18} />
                GitHub
              </button>
              <button
                onClick={() => {
                  setPlatform('leetcode');
                  setUsername('albindavidc');
                  setTheme('github');
                  setViewMode('classic');
                  setGithubData(null);
                  setLeetcodeData(null);
                  setLeetcodeDataReady(false);
                }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  platform === 'leetcode' 
                    ? 'bg-yellow-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22,14.355c0-0.742-0.564-1.346-1.26-1.346H10.676c-0.696,0-1.26,0.604-1.26,1.346s0.563,1.346,1.26,1.346H20.74C21.436,15.702,22,15.098,22,14.355z" />
                  <path d="M3.482,18.187l4.313,4.361C8.768,23.527,10.113,24,11.598,24c1.485,0,2.83-0.512,3.805-1.494l2.588-2.637c0.51-0.514,0.492-1.365-0.039-1.9c-0.531-0.535-1.375-0.553-1.884-0.039l-2.676,2.607c-0.462,0.467-1.102,0.662-1.809,0.662s-1.346-0.195-1.81-0.662l-4.298-4.363c-0.463-0.467-0.696-1.15-0.696-1.863c0-0.713,0.233-1.357,0.696-1.824l4.285-4.38c0.463-0.467,1.116-0.645,1.822-0.645s1.346,0.195,1.809,0.662l2.676,2.606c0.51,0.515,1.354,0.497,1.885-0.038c0.531-0.536,0.549-1.387,0.039-1.901l-2.588-2.636c-0.649-0.646-1.471-1.116-2.392-1.33l-0.034-0.007l2.447-2.503c0.512-0.514,0.494-1.366-0.037-1.901c-0.531-0.535-1.376-0.552-1.887-0.038L3.482,10.476C2.509,11.458,2,12.813,2,14.311C2,15.809,2.509,17.207,3.482,18.187z" />
                </svg>
                LeetCode
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  {platform === 'github' ? 'GitHub Username' : 'LeetCode Username'}
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">@</span>
                  </div>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    required
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-8 sm:text-sm border-gray-700 rounded-md bg-gray-800 text-white py-3"
                    placeholder={platform === 'github' ? 'albindavidc' : 'albindavidc'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-300">
                  Color Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  className="mt-2 block w-full pl-3 pr-10 py-3 text-base border-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-800 text-white capitalize"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  {Object.keys(THEMES).map((t) => (
                    <option key={t} value={t}>{t === 'github-dark' ? 'GitHub Dark' : t}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="font" className="block text-sm font-medium text-gray-300">
                  Font Family
                </label>
                <select
                  id="font"
                  name="font"
                  className="mt-2 block w-full pl-3 pr-10 py-3 text-base border-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-800 text-white capitalize"
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                >
                  <option value="baloo_2">Baloo 2</option>
                  <option value="inter">Inter</option>
                  <option value="roboto">Roboto</option>
                  <option value="Noto Sans Coptic">Noto Sans Coptic</option>
                  <option value="milonga">Milonga</option>
                  <option value="mali">Mali</option>
                  <option value="patrick_hand">Patrick Hand</option>
                  <option value="ruthie">Ruthie</option>
                  <option value="source_code_pro">Source Code Pro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-transparent select-none hidden md:block" aria-hidden="true">
                  Spacer
                </label>
                <div className="flex items-center justify-between md:mt-2 md:py-3 mt-4">
                  <label htmlFor="hideBorder" className="text-sm font-medium text-gray-300">
                    Hide Outer Border
                  </label>
                  <button
                    id="hideBorder"
                    type="button"
                    role="switch"
                    aria-checked={hideBorder}
                    onClick={() => setHideBorder(!hideBorder)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${hideBorder ? 'bg-emerald-500' : 'bg-gray-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${hideBorder ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {platform === 'github' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-transparent select-none hidden md:block" aria-hidden="true">
                      Spacer
                    </label>
                    <div className="flex items-center justify-between md:mt-2 md:py-3 mt-4">
                      <label htmlFor="hideLanguages" className="text-sm font-medium text-gray-300">
                        Hide Languages
                      </label>
                      <button
                        id="hideLanguages"
                        type="button"
                        role="switch"
                        aria-checked={hideLanguages}
                        onClick={() => setHideLanguages(!hideLanguages)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${hideLanguages ? 'bg-emerald-500' : 'bg-gray-700'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${hideLanguages ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="strategy" className="block text-sm font-medium text-gray-300">
                      Attack Strategy
                    </label>
                    <select
                      id="strategy"
                      name="strategy"
                      className="mt-2 block w-full pl-3 pr-10 py-3 text-base border-gray-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-800 text-white"
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                    >
                      <option value="random">Random Attack</option>
                      <option value="row">Row by Row</option>
                      <option value="column">Column by Column</option>
                    </select>
                  </div>
                </>
              )}


            </div>

            <div className="flex justify-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-8 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#3b82f6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : null}
                {loading ? 'Previewing...' : 'Preview'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-500/50 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">Mission Failed</h3>
                  <div className="mt-2 text-sm text-red-200">
                    <p>{error}</p>
                    {error.includes('401') && (
                      <p className="mt-2 text-red-300 font-semibold">
                        Hint: If you just updated your token, make sure you also update the GH_TOKEN environment variable in your Vercel Dashboard and redeploy!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {((platform === 'github' && githubData) || (platform === 'leetcode' && leetcodeDataReady)) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-end sm:items-start sm:items-center gap-4 mb-6">
              
              <div className="flex flex-wrap items-center gap-2">
                {platform === 'github' && (
                  <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
                    <button
                      onClick={() => setViewMode('classic')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'classic' 
                          ? 'bg-gray-700 text-white shadow-sm' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                      }`}
                    >
                      <LayoutGrid size={16} />
                      Classic Graph
                    </button>
                    <button
                      onClick={() => setViewMode('shooter')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        viewMode === 'shooter' 
                          ? 'bg-gray-700 text-white shadow-sm' 
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                      }`}
                    >
                      <Gamepad2 size={16} />
                      Space Shooter
                    </button>
                  </div>
                )}

                <button
                  onClick={handleCopyUrl}
                  disabled={true}
                  title={'Copy direct image URL'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    copiedUrl
                      ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                      : true
                      ? 'bg-gray-800/50 text-gray-600 border-gray-800 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border-gray-700'
                  }`}
                >
                  {copiedUrl ? <Check size={16} /> : <Link size={16} />}
                  {copiedUrl ? 'Copied URL!' : 'Copy URL'}
                </button>
                <button
                  onClick={handleCopyEmbed}
                  disabled={true}
                  title={'Copy markdown embed link'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    copiedEmbed
                      ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                      : true
                      ? 'bg-gray-800/50 text-gray-600 border-gray-800 cursor-not-allowed'
                      : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 border-gray-700'
                  }`}
                >
                  {copiedEmbed ? <Check size={16} /> : <Code size={16} />}
                  {copiedEmbed ? 'Copied Markdown!' : 'Copy Embed'}
                </button>
              </div>
            </div>
            
            <div 
              ref={graphRef}
              className={`w-full bg-black rounded-lg border border-gray-800 relative shadow-inner flex items-center justify-center ${
                platform === 'github' && viewMode === 'shooter' ? 'aspect-[86/23] overflow-hidden' : 'p-4 min-h-[650px]'
              }`}
            >
              {platform === 'github' ? (
                viewMode === 'shooter' ? (
                  <SpaceShooter data={githubData} strategy={strategy} theme={theme} />
                ) : (
                  <ContributionGraph data={githubData} theme={theme} font={font} hideBorder={hideBorder} hideLanguages={hideLanguages} />
                )
              ) : (
                <LeetCodeGraph data={leetcodeData} theme={theme} font={font} hideBorder={hideBorder} />
              )}
            </div>
            
            <p className="mt-4 text-sm text-gray-500 text-center">
              {platform === 'github'
                ? (viewMode === 'shooter' 
                  ? 'Simulation running natively in your browser using HTML5 Canvas.' 
                  : 'A clean, modern view of your GitHub contributions.')
                : 'A structured, native React visualization of your LeetCode stats.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

