import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  className = '',
}) => {
  const iconColorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    navy: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800 mt-1.5">{value}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600">
              <span>{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${iconColorStyles[color] || iconColorStyles.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
