import React from 'react';

const MessageDisplay: React.FC<{ content: string }> = ({ content }) => {
    return (
        <div className="text-gray-800 whitespace-pre-wrap font-sans leading-relaxed text-base" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
            {content}
        </div>
    );
};

export default MessageDisplay;
