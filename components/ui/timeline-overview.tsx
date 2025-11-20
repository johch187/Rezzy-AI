import React from 'react';

interface TimelineOverviewProps {
  milestones: { title: string }[];
}

export const TimelineOverview: React.FC<TimelineOverviewProps> = ({ milestones }) => {
  const handleStepClick = (index: number) => {
    const element = document.getElementById(`milestone-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <h3 className="text-xl font-bold text-slate-800 mb-8 text-center">Career Path Overview</h3>
      <div className="flex items-start">
        {milestones.map((milestone, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center text-center cursor-pointer group w-28 flex-shrink-0" onClick={() => handleStepClick(index)}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 border-4 border-slate-50 group-hover:bg-primary group-hover:border-white group-hover:shadow-lg transition-all duration-300">
                <span className="text-slate-700 group-hover:text-white font-bold transition-colors duration-300">{index + 1}</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-600 group-hover:text-primary transition-colors duration-300">{milestone.title}</p>
            </div>
            {index < milestones.length - 1 && (
              <div className="flex-auto border-t-2 border-dashed border-slate-300 mt-5"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimelineOverview;
