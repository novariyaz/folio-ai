import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ImproveButtonProps {
  currentText: string;
  onApply: (newText: string) => void;
}

export const ImproveButton: React.FC<ImproveButtonProps> = ({ currentText, onApply }) => {
  const [loading, setLoading] = useState(false);

  const handleImprove = async () => {
    if (!currentText.trim() || loading) return;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: currentText,
          context: 'Full Resume Rewrite'
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');
      if (data.improved_text) {
        onApply(data.improved_text);
      }
    } catch (error: any) {
      console.error("Failed to improve:", error);
      alert(error.message || 'Failed to improve text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleImprove}
      disabled={loading || !currentText.trim()}
      className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
    >
      <Sparkles size={13} className={loading ? 'animate-spin' : ''} />
      {loading ? 'Polishing...' : 'Polish'}
    </button>
  );
};
