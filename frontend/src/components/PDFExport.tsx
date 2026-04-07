import React, { useState } from 'react';
import { FileDown, Download, CheckCircle } from 'lucide-react';

interface PDFExportProps {
  resumeContent: string;
}

export const PDFExport: React.FC<PDFExportProps> = ({ resumeContent }) => {
  const [template, setTemplate] = useState('modern');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('http://localhost:3001/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_content: resumeContent, template }),
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-${template}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const templates = [
    { id: 'modern', label: 'Modern' },
    { id: 'classic', label: 'Classic' },
    { id: 'simple', label: 'Simple' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(217 91% 60% / 0.1)' }}>
            <FileDown size={14} style={{ color: 'hsl(217 91% 60%)' }} />
          </div>
          <div>
            <span className="section-title">Export</span>
            <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--text-faint))' }}>Download as PDF</p>
          </div>
        </div>
      </div>

      <div className="card-body space-y-3.5">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl" style={{ background: 'hsl(var(--surface-alt))' }}>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`px-3 py-2 text-[12px] font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                template === t.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                  : ''
              }`}
              style={template !== t.id ? { color: 'hsl(var(--text-muted))' } : {}}
            >
              {template === t.id && <CheckCircle size={11} />}
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || !resumeContent.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-[13px]"
        >
          <Download size={14} />
          {isExporting ? (
            <span className="flex items-center gap-2">
              <span className="inline-flex gap-0.5">
                <span className="typing-dot inline-block w-[4px] h-[4px] rounded-full bg-white"></span>
                <span className="typing-dot inline-block w-[4px] h-[4px] rounded-full bg-white"></span>
                <span className="typing-dot inline-block w-[4px] h-[4px] rounded-full bg-white"></span>
              </span>
              Generating
            </span>
          ) : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};
