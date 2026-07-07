import * as XLSX from 'xlsx';
import type { SubmissionListItem } from '../api/client';

export type ExportFormat = 'csv' | 'xlsx';

interface Column {
  header: string;
  value: (s: SubmissionListItem) => string;
}

const STATUS_LABEL: Record<string, string> = {
  completed: 'Concluída',
  in_progress: 'Em andamento',
};

function formatDate(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('pt-BR');
}

const COLUMNS: Column[] = [
  { header: 'Nome', value: (s) => s.name },
  { header: 'E-mail', value: (s) => s.email },
  { header: 'CPF', value: (s) => s.cpf ?? '' },
  { header: 'Entidade', value: (s) => s.entity },
  { header: 'Cidade', value: (s) => s.city },
  { header: 'Status', value: (s) => STATUS_LABEL[s.status] ?? s.status },
  { header: 'Criado em', value: (s) => formatDate(s.created_at) },
  { header: 'Enviado em', value: (s) => formatDate(s.completed_at) },
];

function buildMatrix(rows: SubmissionListItem[]): string[][] {
  const header = COLUMNS.map((c) => c.header);
  const body = rows.map((r) => COLUMNS.map((c) => c.value(r)));
  return [header, ...body];
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportCsv(rows: SubmissionListItem[], filename: string) {
  const matrix = buildMatrix(rows);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = matrix.map((line) => line.map(escape).join(',')).join('\r\n');
  // BOM garante acentuação correta ao abrir no Excel
  triggerDownload(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}

function exportXlsx(rows: SubmissionListItem[], filename: string) {
  const matrix = buildMatrix(rows);
  const ws = XLSX.utils.aoa_to_sheet(matrix);
  ws['!cols'] = COLUMNS.map((c, i) => ({
    wch: Math.max(c.header.length, ...matrix.slice(1).map((r) => (r[i] ?? '').length)) + 2,
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Respostas');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportSubmissions(
  rows: SubmissionListItem[],
  format: ExportFormat,
  filename = 'respostas'
) {
  if (format === 'csv') exportCsv(rows, filename);
  else exportXlsx(rows, filename);
}
