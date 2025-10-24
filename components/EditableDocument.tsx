import React, { useState, useEffect } from 'react';
import { convertToLatex, compileLatexToPdf } from '../services/geminiService';

// A more robust markdown to HTML converter that supports tables and code blocks.
const formatContent = (text: string) => {
  const blocks = text.split('\n\n');

  const htmlBlocks = blocks.map(block => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return '';

    // Code blocks ```...```
    if (trimmedBlock.startsWith('```') && trimmedBlock.endsWith('```')) {
      const lines = trimmedBlock.split('\n');
      const lang = lines[0].substring(3).trim();
      const code = lines.slice(1, -1).join('\n');
      // Basic escaping for HTML
      const escapedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre class="bg-gray-900 text-white p-4 my-4 rounded-md overflow-x-auto text-sm font-mono"><code class="language-${lang}">${escapedCode}</code></pre>`;
    }

    // Tables
    const lines = trimmedBlock.split('\n');
    if (lines.length > 1 && lines[0].includes('|') && lines[1].match(/^[| :\-~]+$/)) {
      let tableHtml = '<table class="w-full my-4 border-collapse border border-gray-300">';

      // Header
      const headerCells = lines[0].split('|').map(s => s.trim()).filter(Boolean);
      tableHtml += '<thead><tr class="bg-gray-100">';
      headerCells.forEach(cell => {
        tableHtml += `<th class="border border-gray-300 p-2 text-left font-semibold text-gray-700">${cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</th>`;
      });
      tableHtml += '</tr></thead>';

      // Body
      tableHtml += '<tbody>';
      const bodyRows = lines.slice(2);
      bodyRows.forEach(rowLine => {
        if (!rowLine.includes('|')) return;
        const rowCells = rowLine.split('|').map(s => s.trim()).filter(Boolean);
        tableHtml += '<tr class="even:bg-gray-50">';
        rowCells.forEach(cell => {
          const cellContent = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          tableHtml += `<td class="border border-gray-300 p-2">${cellContent}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table>';
      return tableHtml;
    }

    // Headings
    if (trimmedBlock.startsWith('# ')) return `<h1 class="text-3xl font-bold mb-4">${trimmedBlock.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h1>`;
    if (trimmedBlock.startsWith('## ')) return `<h2 class="text-2xl font-semibold mt-6 mb-2">${trimmedBlock.substring(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h2>`;
    if (trimmedBlock.startsWith('### ')) return `<h3 class="text-xl font-semibold mt-4 mb-2">${trimmedBlock.substring(4).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h3>`;

    // Unordered lists
    const isList = lines.every(line => line.trim() === '' || line.trim().startsWith('* '));
    if (isList && trimmedBlock.includes('* ')) {
        let listHtml = '<ul class="list-disc pl-6 my-4">';
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('* ')) {
                listHtml += `<li class="mb-1">${trimmedLine.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
            }
        });
        listHtml += '</ul>';
        return listHtml;
    }

    // Paragraphs
    return `<p class="mb-4">${trimmedBlock.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</p>`;
  });

  return htmlBlocks.join('');
};

interface EditableDocumentProps {
  title: string;
  initialContent: string;
  onSave: (newContent: string) => void;
}

const EditableDocument: React.FC<EditableDocumentProps> = ({ title, initialContent, onSave }) => {
  const [editedContent, setEditedContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    setEditedContent(initialContent);
  }, [initialContent]);
  
  useEffect(() => {
    if (downloadError) {
        const timer = setTimeout(() => setDownloadError(null), 15000);
        return () => clearTimeout(timer);
    }
  }, [downloadError]);


  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(initialContent);
    setIsEditing(false);
  };

  const handleDownloadPdf = async () => {
      setIsDownloadingPdf(true);
      setDownloadError(null);
      try {
          // Step 1: Convert Markdown to LaTeX using Gemini
          const latexCode = await convertToLatex(initialContent);

          // Step 2: Compile the LaTeX code into a PDF blob
          const pdfBlob = await compileLatexToPdf(latexCode);

          // Step 3: Trigger the browser download
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'resume.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
      } catch (err: any) {
          setDownloadError(err.message || "An unexpected error occurred during PDF generation.");
      } finally {
          setIsDownloadingPdf(false);
      }
  };


  const isDirty = editedContent !== initialContent;
  const isResume = title === 'Generated Resume';

  return (
    <>
      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg animate-slide-in-up">
        <h2 className="text-2xl font-bold text-neutral border-b pb-4 mb-6">{title}</h2>
        {isEditing ? (
          <>
            <textarea
              className="w-full h-96 p-4 border border-gray-300 rounded-md focus:ring-primary focus:border-primary font-mono text-sm resize-y"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              aria-label={`Edit ${title} content`}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              className="prose max-w-none prose-h1:text-gray-800 prose-h2:text-gray-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: formatContent(initialContent) }}
            />
            <div className="mt-6">
                <div className="flex justify-end items-center space-x-3">
                    {isResume && (
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isDownloadingPdf}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-200 disabled:cursor-not-allowed"
                            aria-label="Download resume as PDF"
                        >
                             {isDownloadingPdf ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Download PDF
                                </>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        aria-label={`Edit ${title}`}
                    >
                        Edit
                    </button>
                </div>

                {downloadError && (
                    <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-3 text-red-700 text-xs">
                        <p className="font-bold">PDF Generation Failed</p>
                        <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{downloadError}</pre>
                    </div>
                )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default EditableDocument;