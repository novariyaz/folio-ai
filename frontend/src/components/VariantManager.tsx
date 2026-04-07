import { Briefcase, Building, Inbox } from 'lucide-react';

interface Variant {
  id: string;
  job_title: string;
  company_name: string;
  status: 'Draft' | 'Applied' | 'Interviewing' | 'Rejected' | 'Offer';
}

interface VariantManagerProps {
  variants: Variant[];
  onStatusChange: (id: string, newStatus: Variant['status']) => void;
  onSelect: (id: string) => void;
}

const statusConfig: Record<Variant['status'], { bg: string; text: string; dot: string }> = {
  'Draft':        { bg: 'hsl(var(--surface-alt))',     text: 'hsl(var(--text-muted))',  dot: 'hsl(var(--text-faint))' },
  'Applied':      { bg: 'hsl(217 91% 60% / 0.1)',     text: 'hsl(217 91% 55%)',        dot: 'hsl(217 91% 60%)' },
  'Interviewing': { bg: 'hsl(262 80% 55% / 0.1)',     text: 'hsl(262 80% 50%)',        dot: 'hsl(262 80% 55%)' },
  'Rejected':     { bg: 'hsl(0 84% 60% / 0.1)',       text: 'hsl(0 84% 55%)',          dot: 'hsl(0 84% 60%)' },
  'Offer':        { bg: 'hsl(142 71% 45% / 0.1)',     text: 'hsl(142 71% 40%)',        dot: 'hsl(142 71% 45%)' }
};

export const VariantManager: React.FC<VariantManagerProps> = ({ variants, onStatusChange, onSelect }) => {
  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div>
          <span className="section-title">Applications</span>
          <p className="section-subtitle mt-0.5">Track tailored variants</p>
        </div>
        <span className="badge" style={{ background: 'hsl(var(--accent-soft) / 0.1)', color: 'hsl(var(--accent))' }}>
          {variants.length}
        </span>
      </div>
      <ul>
        {variants.length === 0 ? (
          <li className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'hsl(var(--surface-alt))' }}>
              <Inbox size={18} style={{ color: 'hsl(var(--text-faint))' }} />
            </div>
            <p className="text-[12px] leading-relaxed max-w-[200px]" style={{ color: 'hsl(var(--text-faint))' }}>
              Your tailored resume variants will appear here once you start applying.
            </p>
          </li>
        ) : (
          variants.map((v, idx) => {
            const cfg = statusConfig[v.status];
            return (
              <li 
                key={v.id} 
                className="px-4 py-3.5 flex justify-between items-center transition-all duration-200 cursor-pointer animate-fade-up"
                style={{ 
                  borderBottom: idx < variants.length - 1 ? '1px solid hsl(var(--border-subtle))' : 'none',
                  animationDelay: `${idx * 0.05}s`
                }}
                onClick={() => onSelect(v.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--surface-alt))';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px] flex items-center gap-2 truncate" style={{ color: 'hsl(var(--text))' }}>
                    <Briefcase size={13} style={{ color: 'hsl(var(--accent))', flexShrink: 0 }} /> 
                    <span className="truncate">{v.job_title}</span>
                  </div>
                  <div className="text-[11px] flex items-center gap-1.5 mt-1" style={{ color: 'hsl(var(--text-muted))' }}>
                    <Building size={11} /> {v.company_name}
                  </div>
                </div>
                <div>
                  <select
                    value={v.status}
                    onChange={(e) => { e.stopPropagation(); onStatusChange(v.id, e.target.value as Variant['status']); }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] pl-2 pr-1 py-1 rounded-md outline-none font-semibold appearance-none cursor-pointer border-none transition-all duration-200"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offer">Offer!</option>
                  </select>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};
