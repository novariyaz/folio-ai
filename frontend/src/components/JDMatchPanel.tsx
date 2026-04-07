import React, { useState } from 'react';
import { Target, CheckCircle, XCircle, AlertTriangle, Plus, ArrowRight } from 'lucide-react';

interface JDMatchPanelProps {
  resumeContent: string;
}

export const JDMatchPanel: React.FC<JDMatchPanelProps> = ({ resumeContent }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [foundKeywords, setFoundKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:3001/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_content: resumeContent, job_description: jobDescription }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');
      setMatchScore(data.match_score);
      setFoundKeywords(data.keywords_found || []);
      setMissingKeywords(data.keywords_missing || []);
    } catch (error: any) {
      console.error('Failed to analyze JD:', error);
      alert(error.message || 'Failed to analyze Job Description.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddKeyword = (keyword: string) => {
    alert(`Added "${keyword}" to your focus list for the editor to include next.`);
  };

  const scoreColor = matchScore !== null
    ? matchScore >= 80 ? 'hsl(142 71% 45%)' : matchScore >= 50 ? 'hsl(38 92% 50%)' : 'hsl(0 84% 60%)'
    : 'hsl(var(--text-muted))';

  const scoreLabel = matchScore !== null
    ? matchScore >= 80 ? 'Excellent' : matchScore >= 60 ? 'Good' : matchScore >= 40 ? 'Fair' : 'Needs Work'
    : '';

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--accent-soft) / 0.1)' }}>
            <Target size={14} style={{ color: 'hsl(var(--accent))' }} />
          </div>
          <div>
            <span className="section-title">ATS Match</span>
            <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--text-faint))' }}>
              {matchScore !== null ? `${foundKeywords.length + missingKeywords.length} keywords analyzed` : 'Paste JD to check compatibility'}
            </p>
          </div>
        </div>
      </div>

      <div className="card-body space-y-4">
        <textarea
          className="input-field w-full h-24 p-3.5 text-[13px] resize-none leading-relaxed"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !jobDescription}
          className="btn-primary w-full py-2.5 text-[13px] flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <span className="inline-flex gap-0.5">
                <span className="typing-dot inline-block w-[5px] h-[5px] rounded-full bg-white"></span>
                <span className="typing-dot inline-block w-[5px] h-[5px] rounded-full bg-white"></span>
                <span className="typing-dot inline-block w-[5px] h-[5px] rounded-full bg-white"></span>
              </span>
              Analyzing
            </span>
          ) : (
            <>Analyze Match <ArrowRight size={14} /></>
          )}
        </button>

        {matchScore !== null && (
          <div className="pt-3 space-y-5 animate-fade-up" style={{ borderTop: '1px solid hsl(var(--border))' }}>
            {/* Score with progress bar */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: 'hsl(var(--text))' }}>Match Score</span>
                  <span className="badge text-[10px]" style={{ 
                    background: `${scoreColor}15`, 
                    color: scoreColor 
                  }}>
                    {scoreLabel}
                  </span>
                </div>
                <span className="text-xl font-bold" style={{ color: scoreColor, fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                  {matchScore}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="ats-score-bar">
                <div 
                  className="ats-score-bar-fill" 
                  style={{ 
                    width: `${matchScore}%`, 
                    background: scoreColor 
                  }} 
                />
              </div>
            </div>

            {/* Found Keywords — green indicators */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'hsl(142 71% 45%)' }}>
                <CheckCircle size={12} /> Found ({foundKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {foundKeywords.map((kw, i) => (
                  <span 
                    key={i} 
                    className="chip keyword-found chip-appear" 
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    {kw}
                  </span>
                ))}
                {foundKeywords.length === 0 && (
                  <span className="text-[12px] italic" style={{ color: 'hsl(var(--text-faint))' }}>None found</span>
                )}
              </div>
            </div>

            {/* Missing Keywords — red indicators with add action */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'hsl(0 84% 60%)' }}>
                <XCircle size={12} /> Missing ({missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {missingKeywords.map((kw, i) => (
                  <span 
                    key={i} 
                    className="chip keyword-missing group chip-appear" 
                    style={{ animationDelay: `${i * 0.03}s` }}
                    onClick={() => handleAddKeyword(kw)}
                  >
                    {kw}
                    <Plus size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </span>
                ))}
                {missingKeywords.length === 0 && (
                  <span className="text-[12px] flex items-center gap-1" style={{ color: 'hsl(142 71% 45%)' }}>
                    <CheckCircle size={12} /> Perfect match!
                  </span>
                )}
              </div>
            </div>

            {/* Summary tip */}
            {missingKeywords.length > 0 && (
              <div 
                className="flex items-start gap-2.5 p-3 rounded-xl text-[12px] leading-relaxed animate-fade-up"
                style={{ 
                  background: 'hsl(38 92% 50% / 0.06)',
                  border: '1px solid hsl(38 92% 50% / 0.15)',
                  color: 'hsl(38 80% 40%)',
                  animationDelay: '0.3s'
                }}
              >
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'hsl(38 92% 50%)' }} />
                <span>
                  <strong>Tip:</strong> Click missing keywords to add them to your resume. Adding {Math.min(3, missingKeywords.length)} more could boost your score by ~{Math.min(15, missingKeywords.length * 5)}%.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
