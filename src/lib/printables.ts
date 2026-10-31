import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { printables, type Printable } from '../data/printables';

export interface PrintableState extends Printable {
  href: string; // public URL of the PDF
  ready: boolean; // the PDF file exists
  sizeLabel?: string; // e.g. "240 KB"
}

function sizeLabel(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Every printable, with whether its PDF has been added to public/printables/ yet. */
export function getPrintables(): PrintableState[] {
  return printables.map((p) => {
    const file = join(process.cwd(), 'public', 'printables', `${p.id}.pdf`);
    const ready = existsSync(file);
    return { ...p, href: `/printables/${p.id}.pdf`, ready, sizeLabel: ready ? sizeLabel(statSync(file).size) : undefined };
  });
}
