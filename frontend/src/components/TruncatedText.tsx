import React, { useState } from 'react';
import '../css/TruncatedText.css';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength = 50 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If text is empty or shorter than maxLength, just return it
  if (!text || text.length <= maxLength) {
    return <span>{text}</span>;
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="truncated-text">
      {isExpanded ? (
        <>
          <span>{text}</span>
          <button 
            className="toggle-button" 
            onClick={toggleExpand} 
            aria-label="Show less"
            title="Show less"
          >
            Show less
          </button>
        </>
      ) : (
        <>
          <span>{text.substring(0, maxLength)}...</span>
          <button 
            className="toggle-button" 
            onClick={toggleExpand} 
            aria-label="Show more"
            title="Show full text"
          >
            Show more
          </button>
        </>
      )}
    </div>
  );
};

export default TruncatedText;