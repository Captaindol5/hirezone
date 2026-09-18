import * as pdfjsLib from 'pdfjs-dist';

// Use the bundled worker from CDN to avoid Vite worker config issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts all text content from a PDF File object.
 * Processes all pages and joins them with newlines.
 *
 * @param {File} file - The PDF file selected by the user
 * @returns {Promise<string>} - The full extracted text
 */
export const extractTextFromPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageTexts = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n').trim();
};
