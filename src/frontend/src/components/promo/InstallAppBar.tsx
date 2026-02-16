import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

const STORAGE_KEY = 'a7j-install-bar-dismissed';

export default function InstallAppBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-soft">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
          <p className="text-foreground font-medium text-sm md:text-base">
            Get the A7J TOPUP app for faster top-ups!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="btn-purple-gradient"
          >
            Install
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
