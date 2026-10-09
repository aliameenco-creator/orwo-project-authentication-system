"use client";

/**
 * Converts a PDF into one image per page, in the browser, using pdf.js.
 *
 * Prototype stand-in for the production pipeline: there the server rasterises pages (Poppler / MuPDF),
 * burns in the viewer watermark and serves them via short-lived signed URLs, so the original PDF
 * never reaches the viewer's browser.
 */
export interface ConvertedPdf {
  pages: string[]; // JPEG data URLs
  aspect: number; // width / height of page 1
}

const TARGET_WIDTH = 1400;

export async function convertPdf(file: File, onProgress?: (done: number, total: number) => void): Promise<ConvertedPdf> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const doc = await task.promise;
  const pages: string[] = [];
  let aspect = 16 / 9;

  try {
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      if (n === 1) aspect = base.width / base.height;
      const viewport = page.getViewport({ scale: TARGET_WIDTH / base.width });

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      pages.push(canvas.toDataURL("image/jpeg", 0.82));
      page.cleanup();
      onProgress?.(n, doc.numPages);
    }
  } finally {
    await task.destroy();
  }

  return { pages, aspect };
}
