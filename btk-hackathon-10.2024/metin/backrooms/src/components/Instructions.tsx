import React, { useState, useEffect } from 'react';

export function Instructions() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className="bg-black/80 text-yellow-500 p-6 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-4">Controls</h2>
        <ul className="space-y-2">
          <li>WASD - Move</li>
          <li>Mouse - Look around</li>
          <li>Shift - Sprint</li>
          <li>Click to start</li>
        </ul>
      </div>
    </div>
  );
}