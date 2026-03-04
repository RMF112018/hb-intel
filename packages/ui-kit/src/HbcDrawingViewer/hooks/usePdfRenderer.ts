/**
 * usePdfRenderer — Lazy-loads pdfjs-dist and renders PDF pages to canvas
 * PH4.13 §13.6 | Blueprint §1d
 *
 * Uses dynamic import() to defer ~500KB pdfjs bundle.
 * The worker is loaded from CDN to avoid bundler config issues.
 */
import * as React from 'react';

interface PdfRendererReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  error: string | null;
  pageCount: number;
  currentPage: number;
  renderPage: (pageNum: number) => Promise<void>;
}

export function usePdfRenderer(pdfUrl: string): PdfRendererReturn {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = React.useRef<any>(null);

  const renderPage = React.useCallback(async (pageNum: number) => {
    const pdfDoc = pdfDocRef.current;
    const canvas = canvasRef.current;
    if (!pdfDoc || !canvas) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      setCurrentPage(pageNum);
    } catch (err) {
      setError(`Failed to render page ${pageNum}`);
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      setIsLoading(true);
      setError(null);

      try {
        // Dynamic import of pdfjs-dist (peer dependency, lazy-loaded)
        // Module specifier constructed at runtime to avoid TS resolution when types are not installed
        const pdfModuleId = 'pdfjs-dist';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfjsLib: any = await import(/* webpackIgnore: true */ pdfModuleId);

        // Set worker source to CDN matching the installed version
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        }

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDoc = await loadingTask.promise;

        if (cancelled) return;

        pdfDocRef.current = pdfDoc;
        setPageCount(pdfDoc.numPages);

        // Render first page
        const canvas = canvasRef.current;
        if (canvas && pdfDoc.numPages > 0) {
          const page = await pdfDoc.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport }).promise;
            setCurrentPage(1);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load PDF. Ensure pdfjs-dist is installed.',
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (pdfUrl) {
      loadPdf();
    } else {
      setIsLoading(false);
      setError('No PDF URL provided');
    }

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  return { canvasRef, isLoading, error, pageCount, currentPage, renderPage };
}
