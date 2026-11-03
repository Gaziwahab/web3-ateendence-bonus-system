import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  showLabel = false,
  colorScheme = 'auto', // 'auto', 'emerald', 'blue', 'amber', 'rose'
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let barColor = 'bg-blue-600';
  if (colorScheme === 'auto') {
    if (percentage >= 90) barColor = 'bg-emerald-500';
    else if (percentage >= 75) barColor = 'bg-amber-500';
    else barColor = 'bg-rose-500';
  } else if (colorScheme === 'emerald') {
    barColor = 'bg-emerald-500';
  } else if (colorScheme === 'purple') {
    barColor = 'bg-purple-600';
  } else if (colorScheme === 'amber') {
    barColor = 'bg-amber-500';
  } else if (colorScheme === 'rose') {
    barColor = 'bg-rose-500';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-600">
          <span>Attendance</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${barColor} ${heightClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
