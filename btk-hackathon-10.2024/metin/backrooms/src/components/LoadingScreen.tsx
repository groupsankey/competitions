import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto mb-4" />
        <p className="text-yellow-500 text-lg">Entering the Backrooms...</p>
      </div>
    </div>
  );
}