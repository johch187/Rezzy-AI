import React from 'react';

const BriefDisplay: React.FC<{ content: string }> = ({ content }) => {
    const createMarkup = (markdown: string) => {
      // 1. Normalize mixed HTML/Markdown from AI, e.g., <strong> to **
      let processedText = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');

      // 2. Process block-level elements
      processedText = processedText
        .replace(/^#### (.*$)/gm, '<h5>$1</h5>') // Handle #### as h5
        .replace(/^### (.*$)/gm, '<h4>$1</h4>') // Use h4 for ###
        .replace(/^## (.*$)/gm, '<h3>$1</h3>')   // Use h3 for ##
        .replace(/^-{3,}/gm, '<hr class="my-6" />');

      // 3. Process lists
      // First, convert markdown list items to <li> with custom styling
      processedText = processedText.replace(
        /^\*\s+(.*)$/gm, 
        '<li class="flex items-start mb-2"><svg class="flex-shrink-0 h-5 w-5 text-primary mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><span>$1</span></li>'
      );
      // Then, wrap consecutive <li> blocks in a <ul>, removing default list styling
      processedText = processedText.replace(/(?:<li.*?<\/li>\s*)+/gs, (match) => `<ul class="list-none p-0">${match}</ul>`);

      // 4. Process paragraphs
      const html = processedText
        .split(/\n\s*\n/) // Split by one or more blank lines
        .map(block => {
          const trimmed = block.trim();
          if (!trimmed) return '';
          
          // If it's already a block-level HTML element, pass it through
          if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<hr')) {
            return trimmed;
          }
          // Otherwise, wrap it in a <p> tag. Convert single newlines to <br> for intra-paragraph breaks.
          return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
        })
        .join('');

      // 5. Process inline elements like bold for the whole HTML string
      return html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    return (
      <div
        className="prose prose-lg max-w-none text-left"
        dangerouslySetInnerHTML={{ __html: createMarkup(content) }}
      />
    );
};

export default BriefDisplay;
