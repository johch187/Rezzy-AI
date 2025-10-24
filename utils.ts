import * as pdfjsLib from 'pdfjs-dist';
// Import TextItem and PDFPageProxy types directly from pdfjs-dist/types/src/display/api
import type { TextItem, PDFPageProxy } from 'dist/types/src/display/api';

// Set up the PDF.js worker. This is crucial for PDF parsing to work in a web environment.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

/**
 * Type guard to check if an item from PDF's text content is a TextItem (has 'str' property).
 */
function isTextItem(item: any): item is TextItem {
    return 'str' in item && typeof (item as TextItem).str === 'string';
}

/**
 * Extends TextItem with pre-calculated x and y coordinates for easier sorting.
 * FIX: The imported `TextItem` from `pdfjs-dist` appears to have an incomplete type definition.
 * This redefines `EnhancedTextItem` to be a self-contained interface with all necessary properties,
 * resolving compile-time errors about missing members.
 */
interface EnhancedTextItem {
    str: string;
    dir: string;
    width: number;
    height: number;
    transform: number[];
    fontName: string;
    hasEOL: boolean;
    x: number; // transform[4] - x-coordinate of the bottom-left corner of the text
    y: number; // transform[5] - y-coordinate of the bottom-left corner of the text
}

/**
 * Extracts text content from a PDF page, attempting to preserve layout, formatting (bold),
 * and structure (headers, paragraphs) by analyzing coordinates and font information.
 *
 * The algorithm works as follows:
 * 1.  Collects all text items and gathers statistics on font names and sizes (heights) to
 *     identify the most common "body" font style.
 * 2.  Calculates average character dimensions and line height to set adaptive thresholds.
 * 3.  Groups text items into "logical lines" based on vertical (y-coordinate) proximity.
 * 4.  Sorts these logical lines top-to-bottom.
 * 5.  Iterates through each logical line to reconstruct its text content:
 *     a. Sorts items within the line left-to-right (by x-coordinate).
 *     b. Detects bold text by checking for keywords like "Bold" in the font name and wraps it in markdown (`**`).
 *     c. Detects headings based on font size being significantly larger than the body font.
 *     d. Detects columns by identifying large horizontal gaps between text items, separating them with tabs (`\t`).
 * 6.  Detects paragraph breaks by identifying large vertical gaps between logical lines, inserting double newlines.
 * 7.  Combines all processed lines into a single, structured string.
 *
 * @param page PDFPageProxy object from pdfjs-dist.
 * @returns A promise that resolves to the extracted text string with structural markdown hints.
 */
export async function extractTextFromPdfPage(page: PDFPageProxy): Promise<string> {
    const textContent = await page.getTextContent();
    // FIX: The `item` is typed as the imported `TextItem` after filtering, which is likely incomplete.
    // Casting to `any` allows access to all properties present on the runtime object from the PDF.js API,
    // enabling the correct creation of our self-contained `EnhancedTextItem`.
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

    // --- 1. Gather Statistics for adaptive thresholds and style detection ---
    const fontStats: { [fontName: string]: { heights: number[], count: number } } = {};
    let totalHeight = 0;
    let totalCharWidth = 0;
    let totalChars = 0;

    items.forEach(item => {
        // Font stats for body/header detection
        if (!fontStats[item.fontName]) {
            fontStats[item.fontName] = { heights: [], count: 0 };
        }
        fontStats[item.fontName].heights.push(item.height);
        fontStats[item.fontName].count++;
        
        // Dimension stats for layout detection
        totalHeight += item.height;
        if (item.str.length > 0) {
            totalCharWidth += item.width;
            totalChars += item.str.length;
        }
    });

    // Find the most common font style, which is assumed to be the body text.
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

    // --- 2. Group items into logical lines based on vertical proximity ---
    const Y_TOLERANCE = avgLineHeight * 0.4; // A bit more tolerance for varied line heights
    items.sort((a, b) => b.y - a.y); // Sort all items top-to-bottom

    const lines: { y: number; items: EnhancedTextItem[] }[] = [];
    for (const item of items) {
        // Find a line where the item's y-coordinate is within tolerance
        const foundLine = lines.find(line => Math.abs(item.y - line.y) < Y_TOLERANCE);
        if (foundLine) {
            foundLine.items.push(item);
        } else {
            // No suitable line found, start a new one
            lines.push({ y: item.y, items: [item] });
        }
    }
    // Re-sort lines based on their representative y-coordinate to ensure strict top-to-bottom order
    lines.sort((a, b) => b.y - a.y);

    // --- 3. Calculate median line gap for adaptive paragraph detection ---
    const verticalGaps: number[] = [];
    if (lines.length > 1) {
        for (let i = 0; i < lines.length - 1; i++) {
            const currentLineAvgY = lines[i].items.reduce((sum, item) => sum + item.y, 0) / lines[i].items.length;
            const nextLineAvgY = lines[i+1].items.reduce((sum, item) => sum + item.y, 0) / lines[i+1].items.length;
            const gap = currentLineAvgY - nextLineAvgY;
            // Only consider reasonable gaps, not huge section breaks, for calculating the typical spacing
            if (gap > 0 && gap < avgLineHeight * 3) {
                verticalGaps.push(gap);
            }
        }
    }

    let medianLineGap = avgLineHeight * 1.2; // A sensible default
    if (verticalGaps.length > 0) {
        verticalGaps.sort((a, b) => a - b);
        medianLineGap = verticalGaps[Math.floor(verticalGaps.length / 2)];
    }

    // --- 4. Reconstruct content with formatting and structure ---
    const COLUMN_BREAK_THRESHOLD = avgCharWidth * 5; // Gap of ~5 chars indicates a new column
    const PARAGRAPH_BREAK_THRESHOLD = medianLineGap * 1.5; // Threshold is purely adaptive based on the measured median gap (line density).
    const pageTextSegments: string[] = [];

    lines.forEach((line, lineIndex) => {
        if (line.items.length === 0) return;
        
        line.items.sort((a, b) => a.x - b.x); // Sort items within the line left-to-right

        // Determine if the line is likely a header
        const averageLineHeight = line.items.reduce((sum, i) => sum + i.height, 0) / line.items.length;
        const isHeader = averageLineHeight > bodyFont.height * 1.15 && line.items.length < 6;

        let lineText = '';
        
        line.items.forEach((item, itemIndex) => {
            // Check for bold styling in font name
            const isBold = /bold|demi|heavy|black|book|medium|semibold|extrabold|ultrabold|extra-bold|semi-bold/i.test(item.fontName);
            let itemText = item.str;

            // Add spaces for columns or word gaps
            if (itemIndex > 0) {
                const prevItem = line.items[itemIndex - 1];
                const gap = item.x - (prevItem.x + prevItem.width);
                if (gap > COLUMN_BREAK_THRESHOLD) {
                    lineText += '\t'; // Insert a tab for a column break
                } else if (gap > avgCharWidth * 0.5) {
                    lineText += ' '; // Insert a space for a word break
                }
                // If gap is small, concatenate directly (handles kerning)
            }
            
            // Apply markdown for bold text, ensuring not to bold whitespace
            if (isBold && itemText.trim().length > 0) {
                const trimmedItemText = itemText.trim();
                itemText = `**${trimmedItemText}**`;
                 // If original string had spaces, add them back outside the markdown
                 if (/^\s/.test(item.str)) itemText = ' ' + itemText;
                 if (/\s$/.test(item.str)) itemText = itemText + ' ';
            }

            lineText += itemText;
        });
        
        let processedLineText = lineText.trim();
        if (processedLineText.length > 0) {
            if (isHeader) {
                // Add markdown for a header
                pageTextSegments.push(`## ${processedLineText}`);
            } else {
                pageTextSegments.push(processedLineText);
            }
        }

        // Add a paragraph break (blank line) if there's a large vertical gap to the next line
        if (lineIndex < lines.length - 1) {
            const nextLine = lines[lineIndex + 1];
            // Use the average y of each line for a more stable gap calculation
            const currentLineAvgY = line.items.reduce((sum, i) => sum + i.y, 0) / line.items.length;
            const nextLineAvgY = nextLine.items.reduce((sum, i) => sum + i.y, 0) / nextLine.items.length;
            const verticalGap = currentLineAvgY - nextLineAvgY;
            
            if (verticalGap > PARAGRAPH_BREAK_THRESHOLD) {
                pageTextSegments.push(''); // This will be rendered as a newline, creating a blank line
            }
        }
    });

    // Join all segments and clean up excessive newlines
    return pageTextSegments.join('\n').replace(/\n{3,}/g, '\n\n');
}

export const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    if (!event.target?.result) throw new Error("File could not be read or is empty. Please try uploading a different PDF or paste the content manually.");
                    const pdf = await pdfjsLib.getDocument({ data: event.target.result as ArrayBuffer }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const pageText = await extractTextFromPdfPage(page);
                        fullText += pageText + '\n\n';
                    }
                    resolve(fullText.trim());
                } catch (pdfError: any) {
                    console.error("Error parsing PDF:", pdfError);
                    const errorMessage = (pdfError?.message || '').toLowerCase();
                    if (errorMessage.includes("password protected")) {
                        reject(new Error("Password Protected PDF: The PDF file is password-protected. Please upload an unprotected PDF."));
                    } else if (errorMessage.includes("invalid pdf") || errorMessage.includes("malformed") || errorMessage.includes("truncated")) {
                        reject(new Error("Corrupted PDF: The PDF file appears corrupted or malformed. Please try converting it to text or re-exporting it."));
                    } else {
                        reject(new Error("PDF Error: Could not read the PDF file. It might be corrupted or an unsupported PDF format. Please try another file."));
                    }
                }
            };
            reader.onerror = () => reject(new Error("File Read Error: Failed to read the file. It might be corrupted, locked, or there was a system error. Please try again or use a different file."));
            reader.readAsArrayBuffer(file);
        } else { // Handle .txt and .md
            const reader = new FileReader();
            reader.onload = (readEvent) => {
                if (readEvent.target?.result) {
                    resolve(readEvent.target.result as string);
                } else {
                    reject(new Error("File could not be read or is empty. Please try again or paste the content manually."));
                }
            };
            reader.onerror = () => reject(new Error("File Read Error: Failed to read the file. It might be corrupted, locked, or there was a system error. Please try again or use a different file."));
            reader.readAsText(file);
        }
    });
};