import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-200 bg-white',
    error: 'border-rose-200 bg-white',
    info: 'border-blue-200 bg-white',
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-lg max-w-md animate-slide-up ${borderStyles[type] || borderStyles.info}`}
    >
      {icons[type] || icons.info}
      <p className="text-sm font-medium text-slate-800 flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 rounded p-1 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
