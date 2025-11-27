import React from 'react';
import { Link } from 'react-router-dom';

const MessageDisplay: React.FC<{ content: string }> = ({ content }) => {
    // Parse content and render markdown links as clickable elements
    const renderContent = (text: string) => {
        // Regex to match markdown links: [text](url)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts: (string | React.ReactElement)[] = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            // Add text before the link
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }

            const linkText = match[1];
            const linkUrl = match[2];

            // Check if it's an internal link (starts with /)
            if (linkUrl.startsWith('/')) {
                parts.push(
                    <Link
                        key={match.index}
                        to={linkUrl}
                        className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 font-medium transition-colors"
                    >
                        {linkText}
                    </Link>
                );
            } else {
                // External link
                parts.push(
                    <a
                        key={match.index}
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 font-medium transition-colors"
                    >
                        {linkText}
                    </a>
                );
            }

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text after the last link
        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts.length > 0 ? parts : text;
    };

    return (
        <div className="text-gray-800 whitespace-pre-wrap font-sans leading-relaxed text-base" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
            {renderContent(content)}
        </div>
    );
};

export default MessageDisplay;
