import { useState } from 'react';
import { VariantManager } from './VariantManager';
import { CoverLetterPanel } from './CoverLetterPanel';
import { FileText, BarChart3, Briefcase, Zap, Inbox } from 'lucide-react';

interface Variant {
  id: string;
  job_title: string;
  company_name: string;
  status: 'Draft' | 'Applied' | 'Interviewing' | 'Rejected' | 'Offer';
}

interface DashboardProps {
  resumeContent: string;
  setResumeContent: (v: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ resumeContent, setResumeContent }) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [tailoring, setTailoring] = useState(false);

  const handleStatusChange = (id: string, status: Variant['status']) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  };

  const handleTailor = async () => {
    if(!resumeContent || !jobDescription) return;
    setTailoring(true);
    try {
      const res = await fetch('http://localhost:3001/variants/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_content: resumeContent, job_description: jobDescription })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      if(data.tailored_resume) {
        setResumeContent(data.tailored_resume);
      }
    } catch(e: any) {
      console.error(e);
      alert(e.message || 'Failed to tailor resume.');
    } finally {
      setTailoring(false);
    }
  };

  const stats = {
    total: variants.length,
    active: variants.filter(v => ['Applied', 'Interviewing'].includes(v.status)).length,
    interviews: variants.filter(v => v.status === 'Interviewing').length
  };

  const statCards = [
    { label: 'Total Applications', value: stats.total, icon: <FileText size={16} />, color: 'hsl(var(--accent))' },
    { label: 'Active Pipeline', value: stats.active, icon: <BarChart3 size={16} />, color: 'hsl(217 91% 60%)' },
    { label: 'Interviews', value: stats.interviews, icon: <Briefcase size={16} />, color: 'hsl(262 80% 55%)' },
  ];

  return (
    <div className="flex flex-col gap-5 w-full pb-10">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="card flex items-center gap-4 p-5 animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'hsl(var(--text))' }}>{s.value}</p>
              <p className="text-[11px] font-medium" style={{ color: 'hsl(var(--text-muted))' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state when no variants */}
      {variants.length === 0 && (
        <div className="card p-8 flex flex-col items-center justify-center text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-float" style={{ background: 'hsl(var(--accent-soft) / 0.08)' }}>
            <Inbox size={24} style={{ color: 'hsl(var(--accent))' }} />
          </div>
          <h3 className="text-base font-bold mb-1.5" style={{ color: 'hsl(var(--text))' }}>No applications yet</h3>
          <p className="text-[13px] leading-relaxed max-w-sm mb-5" style={{ color: 'hsl(var(--text-muted))' }}>
            Start by writing your resume in the Builder, then paste a job description below to create your first tailored application.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Tracker */}
        <div className="col-span-4 flex flex-col gap-5 h-fit">
           <VariantManager variants={variants} onStatusChange={handleStatusChange} onSelect={() => {}} />
        </div>
        
        <div className="col-span-8 flex flex-col gap-5">
          {/* JD Input */}
          <div className="card flex flex-col h-[300px] overflow-hidden">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(25 95% 53% / 0.1)' }}>
                  <Zap size={14} style={{ color: 'hsl(25 95% 53%)' }} />
                </div>
                <div>
                  <span className="section-title">Job Description</span>
                  <p className="section-subtitle">Paste a JD to auto-tailor your resume</p>
                </div>
              </div>
              <button 
                 onClick={handleTailor}
                 disabled={tailoring || !resumeContent || !jobDescription}
                 className="btn-accent flex items-center gap-1.5 text-[11px] px-3 py-1.5"
              >
                 <Zap size={13}/> {tailoring ? 'Tailoring...' : 'Auto-Tailor'}
              </button>
            </div>
            <textarea 
               value={jobDescription}
               onChange={(e) => setJobDescription(e.target.value)}
               placeholder="Paste the full job description here — including requirements, responsibilities, and qualifications. Folio AI will analyze it and optimize your resume to match."
               className="flex-1 w-full bg-transparent p-5 resize-none focus:outline-none text-[13px] leading-relaxed"
               style={{ color: 'hsl(var(--text))' }}
            />
          </div>

          <div className="h-[400px]">
             <CoverLetterPanel resumeContent={resumeContent} jobDescription={jobDescription} />
          </div>
        </div>
      </div>
    </div>
  );
};
