import React, { useState, useRef, useEffect } from 'react';

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState(`# Welcome to askitmore
Start typing your content here...`);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
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
    text = text.replace(/(<li.*<\/li>)/gim, '<ul style="padding-left: 20px;">$1</ul>');

    // Links
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');

    // Highlight
    text = text.replace(/==(.*)==/gim, '<mark>$1</mark>');

    // Tables
    const tableRegex = /^\|(.+)\|$/gm;
    const tables = text.match(/^\|(.+)\|$(\n^\|(.+)\|$)+/gm);
    
    if (tables) {
      tables.forEach(table => {
        const rows = table.split('\n');
        let htmlTable = '<table border="1" style="border-collapse: collapse;">';
        
        rows.forEach((row, index) => {
          const cells = row.split('|').filter(cell => cell.trim() !== '');
          const cellType = index === 1 ? 'th' : 'td';
          
          if (index !== 1 || !cells.every(cell => /^---+$/.test(cell.trim()))) {
            htmlTable += `<tr>${cells.map(cell => `<${cellType}>${cell.trim()}</${cellType}>`).join('')}</tr>`;
          }
        });
        
        htmlTable += '</table>';
        text = text.replace(table, htmlTable);
      });
    }

    // Paragraphs
    text = text.replace(/^\s*(\n?[^\n]+\n?)\s*$/gim, '<p>$1</p>');

    return text;
  };

  const handleInput = (e) => {
    setMarkdown(e.target.value);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const lines = pastedText.split('\n');
    
    if (lines.length > 1 && lines[0].includes('\t')) {
      // This looks like a table, convert to markdown
      const markdownTable = lines.map(line => `| ${line.split('\t').join(' | ')} |`).join('\n');
      const newMarkdown = markdown.slice(0, e.target.selectionStart) + markdownTable + markdown.slice(e.target.selectionEnd);
      setMarkdown(newMarkdown);
    } else {
      // Not a table, insert as plain text
      const newMarkdown = markdown.slice(0, e.target.selectionStart) + pastedText + markdown.slice(e.target.selectionEnd);
      setMarkdown(newMarkdown);
    }
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

  const clearContent = () => {
    setMarkdown('');
    if (previewRef.current) {
      previewRef.current.innerHTML = '';
    }
    setToastMessage('rm -rf');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const saveToPDF = () => {
    if (previewRef.current) {
      html2canvas(previewRef.current).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save("markdown_content.pdf");
      });
    }
    setToastMessage('Saved to PDF');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  useEffect(() => {
    if (previewRef.current && markdown) {
      const renderedHTML = parseMarkdown(markdown);
      previewRef.current.innerHTML = renderedHTML;
    }
  }, [markdown]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      setToastMessage('Copied!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="markdown-container">
      <div className="editor-header">
        <button onClick={clearContent} className="clear-button">Clear</button>
        <button onClick={saveToPDF} className="save-button">Save</button>
      </div>
      <textarea
        ref={textareaRef}
        className="markdown-editor"
        value={markdown}
        onChange={handleInput}
        onPaste={handlePaste}
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
        {toastMessage}
      </div>
    </div>
  );
};

export default MarkdownEditor;