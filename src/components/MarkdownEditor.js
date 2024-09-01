import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState('# Welcome to askitmore\nStart typing your content here...');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < window.outerHeight) {
        setKeyboardHeight(window.outerHeight - window.innerHeight);
      } else {
        setKeyboardHeight(0);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

    // Lists
    text = text.replace(/^(\s*)-\s(.*$)/gim, (match, space, content) => {
      const indent = space.length;
      return `<li style="margin-left: ${indent * 20}px;">${content}</li>`;
    });
    text = text.replace(/(<li.*<\/li>)/gim, '<ul>$1</ul>');

    // Links
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');

    // Highlight
    text = text.replace(/==(.*)==/gim, '<mark>$1</mark>');

    // Images with toggle
    text = text.replace(/!\[([^\]]*)\]\(data:image\/[^;]+;base64,([^\)]+)\)/gim, (match, alt, base64) => {
      const shortBase64 = base64.substring(0, 20) + '...';
      return `
        <div class="image-toggle">
          <button class="toggle-btn" onclick="this.nextElementSibling.classList.toggle('hidden'); this.textContent = this.textContent === 'Show Image' ? 'Hide Image' : 'Show Image';">Show Image</button>
          <div class="image-container hidden">
            <img src="data:image/png;base64,${base64}" alt="${alt}" style="max-width: 100%;">
          </div>
        </div>
      `;
    });

    // Tables
    const tableRegex = /^\|(.+)\|$/gm;
    const tables = text.match(/^\|(.+)\|$(\n^\|(.+)\|$)+/gm);
    
    if (tables) {
      tables.forEach(table => {
        const rows = table.split('\n');
        let htmlTable = '<table>';
        
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
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text');

    if (clipboardData.types.includes('Files')) {
      const file = clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const base64Data = event.target.result;
          const imageMarkdown = `![](${base64Data})`;
          insertText(imageMarkdown);
        };
        reader.readAsDataURL(file);
      }
    } else {
      insertText(pastedData);
    }
  };

  const insertText = (text) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
    setMarkdown(newValue);
    textarea.focus();
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
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
      const content = previewRef.current;
      
      html2canvas(content, {
        scale: 1,
        useCORS: true,
        logging: true
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
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

      // Add event listeners to toggle buttons
      const toggleButtons = previewRef.current.querySelectorAll('.toggle-btn');
      toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
          this.nextElementSibling.classList.toggle('hidden');
          this.textContent = this.textContent === 'Show Image' ? 'Hide Image' : 'Show Image';
        });
      });
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
        style={{ bottom: `${30 + keyboardHeight}px` }}
      />
      <div className={`toast ${showToast ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
};

export default MarkdownEditor;