import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// A simple component to render the markdown-like response from the AI
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

// NEW: A dedicated component for displaying the outreach message.
// It uses `whitespace-pre-wrap` to correctly render paragraphs and line breaks
// from the AI's plain text response, giving it a proper email/message format.
const MessageDisplay: React.FC<{ content: string }> = ({ content }) => {
    return (
        <div className="text-gray-800 whitespace-pre-wrap font-sans leading-relaxed text-base" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
            {content}
        </div>
    );
};


const CoffeeChatResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { content, generationMode, counterpartInfo } = (location.state as { 
        content: string; 
        generationMode: 'prep' | 'reach_out';
        counterpartInfo: string;
    }) || {};

    if (!content) {
        return (
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 animate-fade-in text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-lg mx-auto">
                    <h1 className="text-2xl font-bold text-neutral">Oops! Something went wrong.</h1>
                    <p className="mt-4 text-gray-600">
                        The generated content was not found. This can happen if you refresh the page or navigate here directly.
                        Please start a new generation from the prepper page.
                    </p>
                    <button
                        onClick={() => navigate('/coffee-chats')}
                        className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Prepare Another
                    </button>
                </div>
            </div>
        );
    }
    
    const handleModeChange = (newMode: 'prep' | 'reach_out') => {
        // This function is for the top selector to switch modes
        if (newMode !== generationMode) {
            navigate('/coffee-chats', {
                state: {
                    initialMode: newMode,
                    initialCounterpartInfo: counterpartInfo,
                }
            });
        }
    };
    
    const handleStartOver = () => {
        // This function is for the bottom button to start over in the same mode
        navigate('/coffee-chats', {
            state: {
                initialMode: generationMode,
                initialCounterpartInfo: counterpartInfo,
            }
        });
    };

    const isPrepMode = generationMode === 'prep';
    const title = isPrepMode ? 'Your Generated Brief' : 'Your Generated Message';
    const description = isPrepMode
        ? "Here is the personalized brief to help you prepare for your conversation. Good luck!"
        : "Here is the personalized message to help you land your next coffee chat. Copy and paste it into LinkedIn or an email.";
    const buttonText = isPrepMode ? 'Prepare Another Brief' : 'Create Another Message';

    return (
        <div className="bg-base-200 py-16 sm:py-24 animate-fade-in">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                 <div className="text-center mb-12 animate-slide-in-up">
                    <h1 className="text-4xl font-extrabold text-neutral tracking-tight sm:text-5xl">{title}</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600">
                        {description}
                    </p>
                </div>

                <div className="mb-8 max-w-md mx-auto">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200" role="radiogroup">
                        <button
                            onClick={() => handleModeChange('prep')}
                            className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${generationMode === 'prep' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
                            aria-pressed={generationMode === 'prep'}
                            role="radio"
                            aria-checked={generationMode === 'prep'}
                        >
                            Coffee Chat Prep
                        </button>
                        <button
                            onClick={() => handleModeChange('reach_out')}
                            className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${generationMode === 'reach_out' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
                            aria-pressed={generationMode === 'reach_out'}
                            role="radio"
                            aria-checked={generationMode === 'reach_out'}
                        >
                            Reach Out Message
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-200 animate-fade-in">
                    {isPrepMode ? (
                        <BriefDisplay content={content} />
                    ) : (
                        <MessageDisplay content={content} />
                    )}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={handleStartOver}
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-secondary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoffeeChatResultPage;
