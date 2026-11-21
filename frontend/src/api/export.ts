import { requestBlob } from './client';

export type ExportFormat = 'pdf' | 'docx';

// Needs POST /api/export on the backend (Apache POI / OpenPDF).
export function exportResume(resumeText: string, format: ExportFormat) {
    return requestBlob('/export', { method: 'POST', json: { resumeText, format } });
}