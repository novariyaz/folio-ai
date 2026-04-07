import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

interface MetricsNudgeProps {
  resumeContent: string;
}

interface Scores {
  ats_score?: number;
  grammar_score?: number;
  impact_score?: number;
  brevity_score?: number;
  overall_score?: number;
}

/* ── Animated SVG Progress Ring ── */
const ProgressRing = ({ value, label, animated }: { value: number | undefined; label: string; animated: boolean }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const val = value ?? 0;
  const hasValue = value !== undefined;
  const defaultPlaceholder = label === 'Overall' ? 72 : label === 'ATS' ? 68 : label === 'Impact' ? 65 : 70;
  const showVal = hasValue ? val : defaultPlaceholder;

  const color = showVal > 80 
    ? 'hsl(142 71% 45%)' 
    : showVal > 60 
      ? 'hsl(38 92% 50%)' 
      : 'hsl(0 84% 60%)';

  const trackColor = hasValue ? color : 'hsl(var(--text-faint))';
  const offset = circumference - (showVal / 100) * circumference;

  useEffect(() => {
    if (!animated) return;
    let start = 0;
    const end = showVal;
    const duration = 800;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      start = Math.round(eased * end);
      setDisplayValue(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [showVal, animated]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="metric-ring-wrapper">
        <svg width="54" height="54" viewBox="0 0 54 54">
          {/* Track */}
          <circle
            cx="27"
            cy="27"
            r={radius}
            fill="none"
            stroke={hasValue ? `${color}22` : 'hsl(var(--border))'}
            strokeWidth="3.5"
          />
          {/* Progress */}
          <circle
            cx="27"
            cy="27"
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="progress-ring-circle"
            opacity={hasValue ? 1 : 0.25}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>
        <span 
          className="metric-value" 
          style={{ 
            color: hasValue ? color : 'hsl(var(--text-faint))',
            opacity: hasValue ? 1 : 0.45,
            animation: hasValue && animated ? 'scoreCountUp 0.5s ease-out both' : 'none',
          }}
        >
          {hasValue ? (animated ? displayValue : val) : '—'}
        </span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--text-muted))' }}>{label}</span>
    </div>
  );
};

export const MetricsNudge: React.FC<MetricsNudgeProps> = ({ resumeContent }) => {
  const [scores, setScores] = useState<Scores | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const calculateMetrics = async () => {
    if (!resumeContent.trim()) return;
    setLoading(true);
    setHasAnimated(false);
    try {
      const response = await fetch('http://localhost:3001/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_content: resumeContent })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');
      setScores(data);
      setHasAnimated(true);
    } catch (e: any) {
      console.error("Failed to fetch metrics", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(142 71% 45% / 0.1)' }}>
            <Activity size={14} style={{ color: 'hsl(142 71% 45%)' }} />
          </div>
          <div>
            <span className="section-title">Scorecard</span>
            <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--text-faint))' }}>
              {scores ? 'AI-analyzed metrics' : 'Scan to analyze resume'}
            </p>
          </div>
        </div>
        <button 
          onClick={calculateMetrics}
          disabled={loading || !resumeContent.trim()}
          className="btn-soft text-[11px] px-3 py-1.5"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-flex gap-0.5">
                <span className="typing-dot inline-block w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--accent))' }}></span>
                <span className="typing-dot inline-block w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--accent))' }}></span>
                <span className="typing-dot inline-block w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--accent))' }}></span>
              </span>
              Scanning
            </span>
          ) : 'Scan'}
        </button>
      </div>
      <div className="card-body">
        <div className="flex justify-between items-center px-1">
          <ProgressRing value={scores?.overall_score} label="Overall" animated={hasAnimated} />
          <ProgressRing value={scores?.ats_score} label="ATS" animated={hasAnimated} />
          <ProgressRing value={scores?.impact_score} label="Impact" animated={hasAnimated} />
          <ProgressRing value={scores?.grammar_score} label="Grammar" animated={hasAnimated} />
        </div>
      </div>
    </div>
  );
};
