import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { createWorker } from 'tesseract.js';

// Set up the PDF.js worker with a version-matched URL to avoid API/worker mismatch.
const pdfjsVersion = (pdfjsLib as any).version || '5.4.296';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

function isTextItem(item: any): item is TextItem {
    return 'str' in item && typeof (item as TextItem).str === 'string';
}

interface EnhancedTextItem {
    str: string;
    dir: string;
    width: number;
    height: number;
    transform: number[];
    fontName: string;
    hasEOL: boolean;
    x: number;
    y: number;
}

export async function extractTextFromPdfPage(page: PDFPageProxy): Promise<string> {
    const textContent = await page.getTextContent();
    
    const items: EnhancedTextItem[] = textContent.items
        .filter(isTextItem)
        .map((item: any) => ({
            ...item,
            x: item.transform[4],
            y: item.transform[5],
        }));

    if (items.length === 0) {
        return '';
    }

    // 1. Gather Statistics
    const fontStats: { [fontName: string]: { heights: number[], count: number } } = {};
    let totalHeight = 0;
    let totalCharWidth = 0;
    let totalChars = 0;

    items.forEach(item => {
        if (!fontStats[item.fontName]) {
            fontStats[item.fontName] = { heights: [], count: 0 };
        }
        fontStats[item.fontName].heights.push(item.height);
        fontStats[item.fontName].count++;
        
        totalHeight += item.height;
        if (item.str.length > 0) {
            totalCharWidth += item.width;
            totalChars += item.str.length;
        }
    });

    let bodyFont = { name: '', height: 10, count: 0 };
    for (const fontName in fontStats) {
        if (fontStats[fontName].count > bodyFont.count) {
            const heights = fontStats[fontName].heights.sort((a, b) => a - b);
            const medianHeight = heights.length > 0 ? heights[Math.floor(heights.length / 2)] : 10;
            bodyFont = { name: fontName, height: medianHeight, count: fontStats[fontName].count };
        }
    }
    
    const avgLineHeight = items.length > 0 ? totalHeight / items.length : 12;
    const avgCharWidth = totalChars > 0 ? totalCharWidth / totalChars : 8;

    // 2. Group items into logical lines
    const Y_TOLERANCE = avgLineHeight * 0.4;
    items.sort((a, b) => b.y - a.y);

    const lines: { y: number; items: EnhancedTextItem[] }[] = [];
    for (const item of items) {
        const foundLine = lines.find(line => Math.abs(item.y - line.y) < Y_TOLERANCE);
        if (foundLine) {
            foundLine.items.push(item);
        } else {
            lines.push({ y: item.y, items: [item] });
        }
    }
    lines.sort((a, b) => b.y - a.y);

    // 3. Calculate gaps
    const verticalGaps: number[] = [];
    if (lines.length > 1) {
        for (let i = 0; i < lines.length - 1; i++) {
            const currentLineAvgY = lines[i].items.reduce((sum, item) => sum + item.y, 0) / lines[i].items.length;
            const nextLineAvgY = lines[i+1].items.reduce((sum, item) => sum + item.y, 0) / lines[i+1].items.length;
            const gap = currentLineAvgY - nextLineAvgY;
            if (gap > 0 && gap < avgLineHeight * 3) {
                verticalGaps.push(gap);
            }
        }
    }

    let medianLineGap = avgLineHeight * 1.2;
    if (verticalGaps.length > 0) {
        verticalGaps.sort((a, b) => a - b);
        medianLineGap = verticalGaps[Math.floor(verticalGaps.length / 2)];
    }

    // 4. Reconstruct content
    const COLUMN_BREAK_THRESHOLD = avgCharWidth * 5;
    const PARAGRAPH_BREAK_THRESHOLD = medianLineGap * 1.5;
    const pageTextSegments: string[] = [];

    lines.forEach((line, lineIndex) => {
        if (line.items.length === 0) return;
        
        line.items.sort((a, b) => a.x - b.x);

        const averageLineHeight = line.items.reduce((sum, i) => sum + i.height, 0) / line.items.length;
        const isHeader = averageLineHeight > bodyFont.height * 1.15 && line.items.length < 6;

        let lineText = '';
        
        line.items.forEach((item, itemIndex) => {
            const isBold = /bold|demi|heavy|black|book|medium|semibold|extrabold|ultrabold|extra-bold|semi-bold/i.test(item.fontName);
            let itemText = item.str;

            if (itemIndex > 0) {
                const prevItem = line.items[itemIndex - 1];
                const gap = item.x - (prevItem.x + prevItem.width);
                if (gap > COLUMN_BREAK_THRESHOLD) {
                    lineText += '\t';
                } else if (gap > avgCharWidth * 0.5) {
                    lineText += ' ';
                }
            }
            
            if (isBold && itemText.trim().length > 0) {
                const trimmedItemText = itemText.trim();
                itemText = `**${trimmedItemText}**`;
                 if (/^\s/.test(item.str)) itemText = ' ' + itemText;
                 if (/\s$/.test(item.str)) itemText = itemText + ' ';
            }

            lineText += itemText;
        });
        
        let processedLineText = lineText.trim();
        if (processedLineText.length > 0) {
            if (isHeader) {
                pageTextSegments.push(`## ${processedLineText}`);
            } else {
                pageTextSegments.push(processedLineText);
            }
        }

        if (lineIndex < lines.length - 1) {
            const nextLine = lines[lineIndex + 1];
            const currentLineAvgY = line.items.reduce((sum, i) => sum + i.y, 0) / line.items.length;
            const nextLineAvgY = nextLine.items.reduce((sum, i) => sum + i.y, 0) / nextLine.items.length;
            const verticalGap = currentLineAvgY - nextLineAvgY;
            
            if (verticalGap > PARAGRAPH_BREAK_THRESHOLD) {
                pageTextSegments.push('');
            }
        }
    });

    return pageTextSegments.join('\n').replace(/\n{3,}/g, '\n\n');
}

export async function performOCR(pdf: any): Promise<string> {
    const worker = await createWorker('eng');
    let fullText = '';
    console.log("Starting OCR on scanned PDF...");

    try {
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const { data: { text } } = await worker.recognize(canvas);
            fullText += text + '\n\n';
            console.log(`OCR Processed page ${i}/${pdf.numPages}`);
        }
    } catch (err) {
        console.error("OCR Error:", err);
        fullText += "\n[Error during OCR processing. Text may be incomplete.]\n";
    } finally {
        await worker.terminate();
    }
    
    return fullText;
}

export const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    if (!event.target?.result) throw new Error("File could not be read or is empty.");
                    const pdf = await pdfjsLib.getDocument({ data: event.target.result as ArrayBuffer }).promise;
                    let fullText = '';
                    let totalChars = 0;

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const pageText = await extractTextFromPdfPage(page);
                        fullText += pageText + '\n\n';
                        totalChars += pageText.length;
                    }
                    
                    const avgCharsPerPage = totalChars / pdf.numPages;
                    if (avgCharsPerPage < 50) {
                        console.warn("Low text density detected (" + avgCharsPerPage.toFixed(0) + " chars/page). Attempting OCR...");
                        const ocrText = await performOCR(pdf);
                        if (ocrText.length > fullText.length) {
                            fullText = ocrText;
                        } else if (fullText.length < 100 && ocrText.length > 10) {
                             fullText = ocrText;
                        }
                    }

                    if (fullText.trim().length < 20) {
                         throw new Error("Could not extract sufficient text from the PDF. It might be an image without OCR data.");
                    }

                    resolve(fullText.trim());
                } catch (pdfError: any) {
                    console.error("Error parsing PDF:", pdfError);
                    const errorMessage = (pdfError?.message || '').toLowerCase();
                    if (errorMessage.includes("password protected")) {
                        reject(new Error("Password Protected PDF: The PDF file is password-protected. Please upload an unprotected PDF."));
                    } else if (errorMessage.includes("invalid pdf") || errorMessage.includes("malformed") || errorMessage.includes("truncated")) {
                        reject(new Error("Corrupted PDF: The PDF file appears to be corrupted. Please try another file."));
                    } else {
                        reject(new Error(pdfError.message || "PDF Error: Could not read the PDF file."));
                    }
                }
            };
            reader.onerror = () => reject(new Error("File Read Error: Failed to read the file."));
            reader.readAsArrayBuffer(file);
        } else { 
            const reader = new FileReader();
            reader.onload = (readEvent) => {
                if (readEvent.target?.result) {
                    resolve(readEvent.target.result as string);
                } else {
                    reject(new Error("File could not be read or is empty."));
                }
            };
            reader.onerror = () => reject(new Error("File Read Error: Failed to read the file."));
            reader.readAsText(file);
        }
    });
};
