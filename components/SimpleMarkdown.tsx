import React from 'react';

const SimpleMarkdownComponent: React.FC<{ text: string }> = ({ text }) => {
    const createMarkup = (markdown: string) => {
        return markdown
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^## (.*$)/gm, '<h3 class="text-xl font-bold text-slate-800 mt-4 mb-2">$1</h3>')
            .replace(/^- (.*$)/gm, '<li class="list-disc ml-5">$1</li>')
            .replace(/(<li.*<\/li>)/gs, '<ul>$1</ul>')
            .replace(/\n/g, '<br />');
    };
    return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: createMarkup(text) }} />;
};

export const SimpleMarkdown = React.memo(SimpleMarkdownComponent);
