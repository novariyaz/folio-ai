import { useState } from 'react';
import { ChatAssistant } from './components/ChatAssistant';
import { ResumeEditor } from './components/ResumeEditor';
import { MetricsNudge } from './components/MetricsNudge';
import { DarkModeToggle } from './components/DarkModeToggle';
import { Dashboard } from './components/Dashboard';
import { JDMatchPanel } from './components/JDMatchPanel';
import { PDFExport } from './components/PDFExport';

/* ── Folio AI Logo Mark ── */
const FolioMark = () => (
  <div className="folio-mark">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4h6v16H4V4z" fill="white" fillOpacity="0.9" rx="1" />
      <path d="M12 4h8v10H12V4z" fill="white" fillOpacity="0.55" rx="1" />
      <circle cx="18" cy="18" r="3" fill="white" fillOpacity="0.9" />
      <circle cx="18" cy="18" r="1.2" fill="hsl(262, 83%, 58%)" />
    </svg>
  </div>
);

function App() {
  const [stage, setStage] = useState(1);
  const [resumeContent, setResumeContent] = useState('');
  const [view, setView] = useState<'builder' | 'dashboard'>('builder');

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="flex items-center gap-3.5">
            <FolioMark />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight leading-tight" style={{ color: 'hsl(var(--text))', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                Folio <span className="gradient-text">AI</span>
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'hsl(var(--text-faint))' }}>AI-Powered Career Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex p-0.5 rounded-xl" style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}>
              <button 
                onClick={() => setView('builder')} 
                className={`text-[12px] font-semibold px-5 py-1.5 rounded-[10px] transition-all duration-300 ${
                  view === 'builder' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm' 
                    : ''
                }`}
                style={view !== 'builder' ? { color: 'hsl(var(--text-muted))' } : {}}
              >
                Builder
              </button>
              <button 
                onClick={() => setView('dashboard')} 
                className={`text-[12px] font-semibold px-5 py-1.5 rounded-[10px] transition-all duration-300 ${
                  view === 'dashboard' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm' 
                    : ''
                }`}
                style={view !== 'dashboard' ? { color: 'hsl(var(--text-muted))' } : {}}
              >
                Dashboard
              </button>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-[1380px] mx-auto w-full px-4 py-5 sm:px-6 lg:px-8">
        {view === 'builder' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column — scrollable */}
            <div className="lg:col-span-4 flex flex-col gap-4 lg:h-[calc(100vh-120px)] overflow-y-auto pr-1 pb-8 [&>*]:shrink-0" style={{ scrollbarGutter: 'stable' }}>
              <ChatAssistant stage={stage} onStageComplete={setStage} />
              <MetricsNudge resumeContent={resumeContent} />
              <JDMatchPanel resumeContent={resumeContent} />
              <PDFExport resumeContent={resumeContent} />
            </div>

            {/* Right Column — scrollable */}
            <div className="lg:col-span-8 lg:h-[calc(100vh-120px)] overflow-y-auto pb-8">
              <ResumeEditor content={resumeContent} setContent={setResumeContent} />
            </div>
          </div>
        ) : (
          <Dashboard resumeContent={resumeContent} setResumeContent={setResumeContent} />
        )}
      </main>
    </div>
  );
}

export default App;
