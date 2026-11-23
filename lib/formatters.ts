import type { StatusMeta } from './types';

export const statusMeta: Record<string, StatusMeta> = {
  production: { label: 'In Production', bg: 'rgba(37,99,235,.22)', fg: '#60A5FA', pulse: false },
  overdue: { label: 'Overdue', bg: 'rgba(138,32,32,.24)', fg: '#F87171', pulse: true },
  qc: { label: 'Pending QC', bg: 'rgba(138,98,0,.22)', fg: '#FFC840', pulse: false },
  dispatched: { label: 'Dispatched', bg: 'rgba(45,125,82,.22)', fg: '#4ADE80', pulse: false },
  hold: { label: 'On Hold', bg: 'rgba(90,63,138,.24)', fg: '#C084FC', pulse: false },
  completed: { label: 'Completed', bg: 'rgba(138,144,153,.16)', fg: '#C8D0D8', pulse: false },
  returned: { label: 'Returned', bg: 'rgba(45,125,82,.22)', fg: '#4ADE80', pulse: false },
  partial: { label: 'Partial', bg: 'rgba(138,98,0,.22)', fg: '#FFC840', pulse: false },
};

export function fmtG(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' g';
}

export function fmtGn(n: number | null | undefined): string {
  if (n === null || n === undefined || n === 0) return '—';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

export function fmtINR(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return '₹ ' + Math.round(n).toLocaleString('en-IN');
}

export function fmtINRn(n: number | null | undefined): string {
  if (!n) return '—';
  return '₹ ' + Math.round(n).toLocaleString('en-IN');
}

export function chipStyle(meta: StatusMeta): Record<string, string | number> {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    height: '19px',
    padding: '0 7px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    background: meta.bg,
    color: meta.fg,
    whiteSpace: 'nowrap',
  };
}
