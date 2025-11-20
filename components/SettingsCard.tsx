import React from 'react';
import Card from './Card';

const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card>
    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4 mb-6">{title}</h2>
    {children}
  </Card>
);

export default SettingsCard;
