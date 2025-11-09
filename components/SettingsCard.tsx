import React from 'react';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">{title}</h2>
    {children}
  </div>
);

export default SettingsCard;
