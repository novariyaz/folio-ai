import React, { useState } from 'react';
import { ImproveButton } from './ImproveButton';
import { GitHubImportPanel } from './GitHubImportPanel';
import { GitBranch, FileCode2, AlignLeft, FileText } from 'lucide-react';

interface ResumeEditorProps {
  content: string;
  setContent: (content: string) => void;
}

// Placeholder is rendered as styled JSX in the editor body


export const ResumeEditor: React.FC<ResumeEditorProps> = ({ content, setContent }) => {
  const [showGithub, setShowGithub] = useState(false);

  const displayText = content || '';
  const wordCount = displayText.trim() ? displayText.trim().split(/\s+/).length : 0;
  const lineCount = displayText ? displayText.split('\n').length : 0;

  return (
    <div className="card flex flex-col h-full overflow-hidden" style={{ minHeight: '600px' }}>
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--accent-soft) / 0.1)' }}>
            <FileCode2 size={14} style={{ color: 'hsl(var(--accent))' }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="section-title">Resume Editor</span>
            <span className="badge" style={{ background: 'hsl(142 71% 45% / 0.1)', color: 'hsl(142 71% 45%)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: 'hsl(142 71% 45%)' }}></span>
              Live
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowGithub(!showGithub)}
            className={`btn-secondary flex items-center gap-1.5 text-[11px] px-3 py-1.5 ${showGithub ? 'border-indigo-300 dark:border-indigo-700' : ''}`}
          >
            <GitBranch size={13} />
            {showGithub ? 'Close' : 'GitHub'}
          </button>
          <ImproveButton currentText={content} onApply={(newText) => setContent(newText)} />
        </div>
      </div>
      
      {showGithub && (
        <div style={{ borderBottom: '1px solid hsl(var(--border))' }} className="animate-fade-up">
          <GitHubImportPanel 
            onAppendToResume={(text) => setContent(content + text)} 
          />
        </div>
      )}

      {/* Editor Body — styled like a document */}
      <div className="flex-1 relative flex flex-col min-h-0" style={{ background: 'hsl(var(--surface-alt) / 0.3)' }}>
        {/* Paper container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="resume-paper p-8 sm:p-10 min-h-full">
            {content ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="editor-textarea w-full h-full resize-none focus:outline-none bg-transparent"
                style={{ 
                  color: 'hsl(var(--text))',
                  minHeight: '500px',
                }}
                spellCheck={false}
              />
            ) : (
              /* Placeholder template — styled like a real resume */
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="editor-textarea w-full h-full resize-none focus:outline-none bg-transparent absolute inset-0 z-10"
                  style={{ 
                    color: 'hsl(var(--text))',
                    minHeight: '600px',
                    caretColor: 'hsl(234 89% 58%)',
                  }}
                  placeholder=" "
                  spellCheck={false}
                />
                <div className="resume-placeholder whitespace-pre-wrap select-none pointer-events-none">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold tracking-tight mb-1" style={{ opacity: 0.5, color: 'hsl(var(--text))' }}>
                      YOUR FULL NAME
                    </div>
                    <div className="text-sm" style={{ opacity: 0.35, color: 'hsl(var(--text))' }}>
                      Target Role | City, State
                    </div>
                    <div className="text-xs mt-1" style={{ opacity: 0.3, color: 'hsl(var(--text))' }}>
                      email@example.com · linkedin.com/in/you · github.com/you
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3" style={{ opacity: 0.25 }}>
                    <div className="flex-1 h-px" style={{ background: 'hsl(var(--text))' }}></div>
                    <FileText size={12} style={{ color: 'hsl(var(--text))' }} />
                    <div className="flex-1 h-px" style={{ background: 'hsl(var(--text))' }}></div>
                  </div>

                  <p className="text-sm leading-relaxed text-center mb-6" style={{ opacity: 0.3, color: 'hsl(var(--text))' }}>
                    Start typing your resume here, or use the Folio Coach on the left to generate one with AI guidance.
                    Your content will appear styled like a professional document.
                  </p>

                  <div className="space-y-4" style={{ opacity: 0.2 }}>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--text))' }}>EXPERIENCE</div>
                      <div className="h-3 rounded w-3/4 mb-1.5" style={{ background: 'hsl(var(--text) / 0.15)' }}></div>
                      <div className="h-3 rounded w-1/2 mb-1.5" style={{ background: 'hsl(var(--text) / 0.1)' }}></div>
                      <div className="h-3 rounded w-2/3" style={{ background: 'hsl(var(--text) / 0.08)' }}></div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--text))' }}>SKILLS</div>
                      <div className="h-3 rounded w-4/5" style={{ background: 'hsl(var(--text) / 0.12)' }}></div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--text))' }}>EDUCATION</div>
                      <div className="h-3 rounded w-3/5" style={{ background: 'hsl(var(--text) / 0.1)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-5 py-2.5" style={{ borderTop: '1px solid hsl(var(--border-subtle))', background: 'hsl(var(--surface) / 0.8)' }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: 'hsl(var(--text-faint))' }}>
              <AlignLeft size={10} />
              {wordCount} words
            </span>
            <span className="text-[10px]" style={{ color: 'hsl(var(--border))' }}>•</span>
            <span className="text-[10px] font-medium" style={{ color: 'hsl(var(--text-faint))' }}>
              {content.length} chars
            </span>
            <span className="text-[10px]" style={{ color: 'hsl(var(--border))' }}>•</span>
            <span className="text-[10px] font-medium" style={{ color: 'hsl(var(--text-faint))' }}>
              {lineCount} lines
            </span>
          </div>
          <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-md" style={{ color: 'hsl(var(--text-faint))', background: 'hsl(var(--surface-alt))' }}>
            Markdown
          </span>
        </div>
      </div>
    </div>
  );
};
