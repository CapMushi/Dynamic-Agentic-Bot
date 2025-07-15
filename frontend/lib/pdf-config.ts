// PDF.js configuration for Next.js
import { pdfjs } from 'react-pdf'

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
}

export { pdfjs } 