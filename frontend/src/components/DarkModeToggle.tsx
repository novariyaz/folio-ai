import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const DarkModeToggle: React.FC = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <button 
      onClick={() => setDark(!dark)}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
      style={{ 
        background: 'hsl(var(--surface))', 
        border: '1px solid hsl(var(--border))',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      aria-label="Toggle Dark Mode"
    >
      {dark 
        ? <Sun size={15} style={{ color: 'hsl(38 92% 50%)' }} /> 
        : <Moon size={15} style={{ color: 'hsl(var(--text-muted))' }} />
      }
    </button>
  );
};
