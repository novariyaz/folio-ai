import { useState, useRef, useEffect } from 'react';
import { Send, User, ChevronRight, Sparkles, MessageSquare, Wand2, BarChart3, Pen } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatAssistantProps {
  stage: number;
  onStageComplete: (nextStage: number) => void;
}

const SUGGESTIONS = [
  { label: 'Review my summary', icon: <MessageSquare size={12} /> },
  { label: 'Add metrics to bullets', icon: <BarChart3 size={12} /> },
  { label: 'Rewrite for impact', icon: <Wand2 size={12} /> },
  { label: 'Fix formatting', icon: <Pen size={12} /> },
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ stage, onStageComplete }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Welcome to Folio AI! 👋 I'm your personal career coach. Let's build a resume that gets interviews. What role are you targeting?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { role: 'user', content: messageText, timestamp: now };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          stage,
          history: messages
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: replyTime }]);
    } catch (error: any) {
      console.error(error);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'assistant', content: `Oops! I encountered an error: ${error.message || 'Unable to connect to server.'}`, timestamp: replyTime }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const stageLabels = ['Intake', 'Organize', 'Draft', 'Review', 'Finalize'];

  return (
    <div className="card flex flex-col overflow-hidden" style={{ minHeight: '480px', maxHeight: '560px' }}>
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="ai-avatar animate-sparkle">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 online-dot border-2" style={{ borderColor: 'hsl(var(--surface))' }}></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="section-title">Folio Coach</span>
              <span className="badge" style={{ background: 'hsl(var(--accent-soft) / 0.1)', color: 'hsl(var(--accent))' }}>
                {stageLabels[stage - 1] || `Stage ${stage}`}
              </span>
            </div>
            <p className="text-[10px] mt-0.5 transition-all duration-300" style={{ color: loading ? 'hsl(var(--accent))' : 'hsl(var(--text-faint))' }}>
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex gap-0.5">
                    <span className="typing-dot inline-block w-[4px] h-[4px] rounded-full" style={{ background: 'hsl(var(--accent))' }}></span>
                    <span className="typing-dot inline-block w-[4px] h-[4px] rounded-full" style={{ background: 'hsl(var(--accent))' }}></span>
                    <span className="typing-dot inline-block w-[4px] h-[4px] rounded-full" style={{ background: 'hsl(var(--accent))' }}></span>
                  </span>
                  Thinking
                </span>
              ) : '● Online'}
            </p>
          </div>
        </div>
        {stage < 5 && (
          <button 
            onClick={() => onStageComplete(stage + 1)}
            className="btn-primary flex items-center gap-0.5 text-[11px] px-3 py-1.5"
          >
            Next <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Stage Progress */}
      <div className="flex items-center justify-center gap-2 py-3 px-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        {stageLabels.map((_label, idx) => {
          const s = idx + 1;
          const isActive = s === stage;
          const isComplete = s < stage;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`rounded-full transition-all duration-500 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 h-2 w-8 shadow-sm'
                      : isComplete
                        ? 'bg-gradient-to-r from-indigo-400 to-purple-400 h-1.5 w-5'
                        : 'h-1.5 w-1.5'
                  }`}
                  style={!isActive && !isComplete ? { background: 'hsl(var(--border))' } : {}}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Thinking bar */}
      {loading && <div className="thinking-bar" />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}
            style={{ animationDelay: `${Math.min(idx * 0.05, 0.3)}s` }}
          >
            <div className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              {msg.role === 'assistant' ? (
                <div className="ai-avatar" style={{ width: '1.75rem', height: '1.75rem' }}>
                  <Sparkles size={11} className="text-white" />
                </div>
              ) : (
                <div className="user-avatar" style={{ width: '1.75rem', height: '1.75rem' }}>
                  <User size={12} style={{ color: 'hsl(var(--text-muted))' }} />
                </div>
              )}

              {/* Bubble */}
              <div className="flex flex-col gap-1">
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {msg.content}
                </div>
                {msg.timestamp && (
                  <span 
                    className={`text-[9px] font-medium ${msg.role === 'user' ? 'text-right' : 'text-left'} px-1 animate-fade-in`}
                    style={{ color: 'hsl(var(--text-faint))' }}
                  >
                    {msg.timestamp}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator — animated dots */}
        {loading && (
          <div className="flex items-end gap-2.5 animate-message">
            <div className="ai-avatar" style={{ width: '1.75rem', height: '1.75rem' }}>
              <Sparkles size={11} className="text-white" />
            </div>
            <div className="chat-bubble-ai flex items-center gap-1.5 py-4 px-5">
              <span className="typing-dot w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--accent))' }}></span>
              <span className="typing-dot w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--accent))' }}></span>
              <span className="typing-dot w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--accent))' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips — pill style */}
      <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto" style={{ borderTop: '1px solid hsl(var(--border-subtle))' }}>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="suggestion-chip chip-appear"
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => handleSend(s.label)}
            disabled={loading}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <div className="chat-input-container">
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your Folio coach anything..."
            className="flex-1 py-2 text-[13px] bg-transparent border-none outline-none"
            style={{ color: 'hsl(var(--text))' }}
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="chat-send-btn"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
