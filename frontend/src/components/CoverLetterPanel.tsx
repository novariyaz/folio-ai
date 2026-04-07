import { useState } from 'react';
import { PenTool, FileText } from 'lucide-react';

interface CoverLetterPanelProps {
  resumeContent: string;
  jobDescription: string;
}

export const CoverLetterPanel: React.FC<CoverLetterPanelProps> = ({ resumeContent, jobDescription }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!resumeContent || !jobDescription) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_content: resumeContent, job_description: jobDescription })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      if (data.cover_letter) {
        setCoverLetter(data.cover_letter);
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to generate cover letter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex flex-col h-full overflow-hidden">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'hsl(var(--accent-soft) / 0.1)' }}>
            <FileText size={13} style={{ color: 'hsl(var(--accent))' }} />
          </div>
          <span className="section-title">Cover Letter</span>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading || !resumeContent || !jobDescription}
          className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
        >
          <PenTool size={12} />
          {loading ? 'Writing...' : 'Generate'}
        </button>
      </div>
      <div className="flex-1 flex flex-col p-0 min-h-0">
        {!coverLetter ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 px-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--surface-alt))' }}>
              <FileText size={18} style={{ color: 'hsl(var(--text-faint))' }} />
            </div>
            <p className="text-[12px] text-center leading-relaxed max-w-[200px]" style={{ color: 'hsl(var(--text-faint))' }}>
              Paste a job description above, then click Generate to create a tailored cover letter.
            </p>
          </div>
        ) : (
          <textarea 
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="flex-1 w-full h-full resize-none focus:outline-none bg-transparent p-5 text-[13px] leading-[1.75]"
            style={{ color: 'hsl(var(--text))', fontFamily: 'Georgia, serif' }}
          />
        )}
      </div>
    </div>
  );
};
