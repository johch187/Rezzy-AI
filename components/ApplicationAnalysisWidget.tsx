import React from 'react';
import { ApplicationAnalysisResult } from '../types';
import ContentAccordion from './ContentAccordion';
import { SimpleMarkdown } from './SimpleMarkdown';

const ApplicationAnalysisWidget: React.FC<{ analysis: ApplicationAnalysisResult }> = ({ analysis }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 space-y-4">
            <h2 className="text-xl font-bold text-neutral border-b border-gray-200 pb-3">Application Fit Analysis</h2>
            
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center">Fit Score</h3>
                <div className="text-center my-2">
                    <p className="text-6xl font-extrabold text-primary">{analysis.fitScore}%</p>
                    <p className="text-md text-slate-600 font-semibold">Match</p>
                </div>
            </div>

            <div className="space-y-1">
                <ContentAccordion title="Gap Analysis" initiallyOpen={true}>
                    <SimpleMarkdown text={analysis.gapAnalysis} />
                </ContentAccordion>
                <ContentAccordion title="Keyword Optimization" initiallyOpen={true}>
                    <SimpleMarkdown text={analysis.keywordOptimization} />
                </ContentAccordion>
                <ContentAccordion title="Impact Enhancer" initiallyOpen={true}>
                    <SimpleMarkdown text={analysis.impactEnhancer} />
                </ContentAccordion>
            </div>
        </div>
    );
};

export default ApplicationAnalysisWidget;