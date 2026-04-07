import React, { useState } from 'react';
import { Search, GitBranch, Star, Code, PlusCircle, Activity } from 'lucide-react';

interface GitHubImportPanelProps {
  onAppendToResume: (text: string) => void;
}

interface Repo {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
  updated_at: string;
}

export const GitHubImportPanel: React.FC<GitHubImportPanelProps> = ({ onAppendToResume }) => {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzingRepo, setAnalyzingRepo] = useState<string | null>(null);

  const fetchRepos = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      setRepos(data.repos || []);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to fetch github repos');
    } finally {
      setLoading(false);
    }
  };

  const analyzeRepo = async (repoName: string) => {
    setAnalyzingRepo(repoName);
    try {
      const res = await fetch('http://localhost:3001/analyze-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, repo: repoName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      onAppendToResume(`\n\nProject: ${repoName}\n${data.summary}`);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to analyze repo');
    } finally {
      setAnalyzingRepo(null);
    }
  };

  const langCounts = repos.reduce((acc, r) => {
    if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sortedLangs = Object.entries(langCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const totalLangs = sortedLangs.reduce((sum, [_, count]) => sum + count, 0);

  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);

  return (
    <div className="card-body space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="input-field w-full pl-9 pr-3 py-2 text-[13px]"
            placeholder="GitHub Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRepos()}
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--text-faint))' }} />
        </div>
        <button
          onClick={fetchRepos}
          disabled={loading || !username}
          className="btn-primary px-4 py-2 text-[12px]"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {repos.length > 0 && (
        <div className="space-y-4 animate-fade-up">
          {/* Charts */}
          <div className="grid grid-cols-2 gap-3">
            {/* Languages */}
            <div className="p-3 rounded-lg" style={{ background: 'hsl(var(--surface-alt))', border: '1px solid hsl(var(--border-subtle))' }}>
              <h3 className="text-[11px] font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: 'hsl(var(--text-muted))' }}>
                <Code size={12} /> Languages
              </h3>
              <div className="space-y-2">
                {sortedLangs.map(([lang, count]) => {
                  const percentage = totalLangs > 0 ? (count / totalLangs) * 100 : 0;
                  return (
                    <div key={lang}>
                      <div className="flex justify-between text-[10px] mb-1" style={{ color: 'hsl(var(--text-muted))' }}>
                        <span className="font-medium">{lang}</span>
                        <span>{Math.round(percentage)}%</span>
                      </div>
                      <div className="w-full rounded-full h-1" style={{ background: 'hsl(var(--border))' }}>
                        <div
                          className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Engagement */}
            <div className="p-3 rounded-lg" style={{ background: 'hsl(var(--surface-alt))', border: '1px solid hsl(var(--border-subtle))' }}>
              <h3 className="text-[11px] font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: 'hsl(var(--text-muted))' }}>
                <Activity size={12} /> Engagement
              </h3>
              <div className="flex justify-around items-center pt-1">
                <div className="text-center">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ background: 'hsl(38 92% 50% / 0.1)' }}>
                    <Star size={14} style={{ color: 'hsl(38 92% 50%)' }} />
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'hsl(var(--text))' }}>{totalStars}</div>
                  <div className="text-[9px] font-medium" style={{ color: 'hsl(var(--text-faint))' }}>Stars</div>
                </div>
                <div className="text-center">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-1" style={{ background: 'hsl(217 91% 60% / 0.1)' }}>
                    <GitBranch size={14} style={{ color: 'hsl(217 91% 60%)' }} />
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'hsl(var(--text))' }}>{totalForks}</div>
                  <div className="text-[9px] font-medium" style={{ color: 'hsl(var(--text-faint))' }}>Forks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Repo List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {repos.map(repo => (
              <div 
                key={repo.name} 
                className="p-3 rounded-lg transition-all duration-200"
                style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--surface))' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(234 89% 58% / 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(var(--border))'}
              >
                <div className="flex justify-between items-start mb-1">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[13px] hover:underline" style={{ color: 'hsl(var(--accent))' }}>
                    {repo.name}
                  </a>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'hsl(var(--text-muted))' }}>
                    {repo.language && <span className="flex items-center gap-1"><Code size={10} /> {repo.language}</span>}
                    <span className="flex items-center gap-1"><Star size={10} /> {repo.stars}</span>
                  </div>
                </div>
                <p className="text-[12px] mb-2 truncate" style={{ color: 'hsl(var(--text-muted))' }} title={repo.description}>
                  {repo.description || 'No description available.'}
                </p>
                <button
                  onClick={() => analyzeRepo(repo.name)}
                  disabled={analyzingRepo !== null}
                  className="btn-ghost text-[11px] flex items-center gap-1 px-0 py-0 font-semibold disabled:opacity-50"
                  style={{ color: 'hsl(var(--accent))' }}
                >
                  {analyzingRepo === repo.name ? (
                    'Analyzing...'
                  ) : (
                    <>
                      <PlusCircle size={12} /> Analyze & Generate
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
