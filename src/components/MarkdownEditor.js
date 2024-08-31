import React, { useState, useRef, useEffect } from 'react';

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState('# Welcome to Askitmore\n\nStart typing your content here...\n\n- List item 1\n - Nested item 1\n - Nested item 2\n- List item 2');
  const [showToast, setShowToast] = useState(false);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  const parseMarkdown = (text) => {
    if (typeof text !== 'string') return '';

    // Headers
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    text = text.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    text = text.replace(/^###### (.*$)/gim, '<h6>$1</h6>');

    // Bold
    text = text.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');

    // Italic
    text = text.replace(/\*(.*)\*/gim, '<em>$1</em>');

    // Nested Lists
    text = text.replace(/^(\s*)-\s(.*$)/gim, (match, space, content) => {
      const indent = space.length;
      return `<li style="margin-left: ${indent * 20}px;">${content}</li>`;
    });
    text = text.replace(/(<li.*<\/li>)/gim, '<ul>$1</ul>');

    // Links
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');

    // Highlight
    text = text.replace(/==(.*)==/gim, '<mark>$1</mark>');

    // Paragraphs
    text = text.replace(/^\s*(\n?[^\n]+\n?)\s*$/gim, '<p>$1</p>');

    return text;
  };

  const handleInput = (e) => {
    setMarkdown(e.target.value);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    
    if (previewRef.current) {
      const previewScrollHeight = previewRef.current.scrollHeight;
      const previewClientHeight = previewRef.current.clientHeight;
      previewRef.current.scrollTop = scrollPercentage * (previewScrollHeight - previewClientHeight);
    }
  };

  useEffect(() => {
    if (previewRef.current && markdown) {
      const renderedHTML = parseMarkdown(markdown);
      previewRef.current.innerHTML = renderedHTML;
    }
  }, [markdown]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="markdown-container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap');

          body {
            background-color: #ffffff;
            color: #000000;
            font-family: 'IBM Plex Mono', monospace;
            letter-spacing: -0.05em;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          .markdown-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            max-width: 100%;
            margin: 0 auto;
          }

          .markdown-editor, .markdown-preview {
            flex: 1;
            font-size: 16px;
            line-height: 1.5;
            padding: 20px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .markdown-editor {
            resize: none;
            outline: none;
            border: none;
            background-color: #ffffff;
          }

          .markdown-preview {
            border-top: 1px solid #000000;
          }

          @media (min-width: 768px) {
            .markdown-container {
              flex-direction: row;
            }
            
            .markdown-preview {
              border-top: none;
              border-left: 1px solid #000000;
            }
          }

          .markdown-preview h1, .markdown-preview h2, .markdown-preview h3,
          .markdown-preview h4, .markdown-preview h5, .markdown-preview h6 {
            font-weight: 600;
            margin-bottom: 0.5em;
          }

          .markdown-preview h1 { font-size: 2em; }
          .markdown-preview h2 { font-size: 1.5em; }
          .markdown-preview h3 { font-size: 1.3em; }
          .markdown-preview h4 { font-size: 1.2em; }
          .markdown-preview h5 { font-size: 1.1em; }
          .markdown-preview h6 { font-size: 1em; }

          .markdown-preview p { margin-bottom: 1em; }
          .markdown-preview strong { font-weight: 600; }
          .markdown-preview em { font-style: italic; }
          .markdown-preview ul { list-style-type: disc; padding-left: 0; margin-bottom: 1em; }
          .markdown-preview li { margin-bottom: 0.5em; }
          .markdown-preview a { color: #000000; text-decoration: underline; }
          .markdown-preview mark { background-color: #e0e0e0; padding: 0.2em 0; }

          .fab {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background-color: #000000;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .fab:hover {
            transform: scale(1.1);
          }

          .toast {
            position: fixed;
            bottom: 100px;
            right: 30px;
            background-color: #000000;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 4px;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .toast.show {
            opacity: 1;
          }
        `}
      </style>
      <textarea
        ref={textareaRef}
        className="markdown-editor"
        value={markdown}
        onChange={handleInput}
        onScroll={handleScroll}
        placeholder="Type your markdown here..."
      />
      <div
        ref={previewRef}
        className="markdown-preview"
      />
      <div 
        className="fab"
        onClick={copyToClipboard} 
        title="Copy to Clipboard"
      />
      <div className={`toast ${showToast ? 'show' : ''}`}>
        Copied!
      </div>
    </div>
  );
};

export default MarkdownEditor;