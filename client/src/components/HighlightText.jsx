import React from 'react';

const HighlightText = ({ text, highlight, isHtml = false }) => {
    if (!highlight.trim()) {
        return isHtml ? (
            <span dangerouslySetInnerHTML={{ __html: text }} />
        ) : (
            <span>{text}</span>
        );
    }

    const regex = new RegExp(`(${highlight})`, 'gi');
    
    if (isHtml) {
        // If it's HTML, we need to be careful not to highlight things inside tags
        // This is a simplistic approach for basic formatting (<b><i> etc.)
        // For complex HTML, a specialized parser is better.
        const highlightedHtml = text.replace(regex, '<span class="text-highlight">$1</span>');
        return <span dangerouslySetInnerHTML={{ __html: highlightedHtml }} />;
    }

    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) => 
                regex.test(part) ? (
                    <span key={i} className="text-highlight">{part}</span>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export default HighlightText;
