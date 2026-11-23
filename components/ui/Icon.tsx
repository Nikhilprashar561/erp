'use client';
import React from 'react';

interface IconProps {
  name: string;
  color?: string;
  size?: number;
}

export default function Icon({ name, color = '#8A9099', size = 17 }: IconProps) {
  const p = { width: size, height: size, viewBox: '0 0 18 18', fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  const icons: Record<string, React.ReactNode> = {
    grid: <><rect x="2.5" y="2.5" width="5.5" height="5.5" rx="1" /><rect x="10" y="2.5" width="5.5" height="5.5" rx="1" /><rect x="2.5" y="10" width="5.5" height="5.5" rx="1" /><rect x="10" y="10" width="5.5" height="5.5" rx="1" /></>,
    orders: <><rect x="3" y="2.5" width="12" height="13" rx="1.5" /><line x1="6" y1="6" x2="12" y2="6" /><line x1="6" y1="9" x2="12" y2="9" /><line x1="6" y1="12" x2="10" y2="12" /></>,
    production: <><circle cx="4" cy="9" r="1.9" /><circle cx="9" cy="9" r="1.9" /><circle cx="14" cy="9" r="1.9" /></>,
    outsourcing: <><circle cx="5" cy="5" r="2.1" /><circle cx="13" cy="13" r="2.1" /><line x1="6.5" y1="6.5" x2="11.5" y2="11.5" /></>,
    clients: <><circle cx="9" cy="6" r="2.6" /><path d="M3.6 15c0-3 2.4-4.6 5.4-4.6s5.4 1.6 5.4 4.6" /></>,
    people: <><circle cx="6.5" cy="6" r="2.1" /><circle cx="12.5" cy="7" r="1.7" /><path d="M2.5 15c0-2.4 1.8-3.8 4-3.8s4 1.4 4 3.8" /><path d="M11 15c0-1.8 1-2.9 2.5-2.9" /></>,
    billing: <><rect x="4" y="2.5" width="10" height="13" rx="1" /><line x1="6.5" y1="6" x2="11.5" y2="6" /><line x1="6.5" y1="9" x2="11.5" y2="9" /><line x1="6.5" y1="12" x2="9.5" y2="12" /></>,
    ledger: <><rect x="3" y="3" width="12" height="12" rx="1" /><line x1="9" y1="3" x2="9" y2="15" /><line x1="3" y1="7.5" x2="15" y2="7.5" /></>,
    finance: <><path d="M9 2.5v13" /><path d="M12 5.5c0-1.2-1.3-2-3-2s-3 .8-3 2 1.3 1.8 3 2.1 3 .9 3 2.1-1.3 2-3 2-3-.8-3-2" /></>,
    diamond: <><path d="M9 2.4 15.6 8 9 15.6 2.4 8Z" /><line x1="2.6" y1="8" x2="15.4" y2="8" /></>,
    inventory: <><rect x="3" y="9" width="5" height="5" rx=".5" /><rect x="10" y="9" width="5" height="5" rx=".5" /><rect x="6.5" y="3.5" width="5" height="5" rx=".5" /></>,
    movement: <><path d="M3 6.5h9" /><path d="M9.5 3.5 12.5 6.5l-3 3" /><path d="M15 11.5H6" /><path d="M8.5 8.5 5.5 11.5l3 3" /></>,
    reports: <><line x1="3" y1="15" x2="15" y2="15" /><rect x="4" y="9" width="2.4" height="5" /><rect x="8" y="6" width="2.4" height="8" /><rect x="12" y="3.5" width="2.4" height="10.5" /></>,
    analytics: <><polyline points="3,13 7,8 10,10 15,4" /><line x1="3" y1="15.5" x2="15" y2="15.5" /></>,
    settings: <><circle cx="9" cy="9" r="2.3" /><path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2" /><path d="M4.4 4.4l1.4 1.4M12.2 12.2l1.4 1.4M13.6 4.4l-1.4 1.4M5.8 12.2l-1.4 1.4" /></>,
    master: <><path d="M9 2.5 15.5 6v6L9 15.5 2.5 12V6Z" /><path d="M2.5 6 9 9.5 15.5 6M9 9.5v6" /></>,
    payment: <><rect x="2.5" y="4.5" width="13" height="9" rx="1.4" /><line x1="2.5" y1="7.5" x2="15.5" y2="7.5" /></>,
    note: <><rect x="3.5" y="2.5" width="11" height="13" rx="1" /><line x1="6" y1="6" x2="12" y2="6" /><line x1="6" y1="9" x2="12" y2="9" /></>,
    collapse: <><path d="M11 5 7 9l4 4" /><line x1="4" y1="4" x2="4" y2="14" /></>,
    expand: <><path d="M7 5l4 4-4 4" /><line x1="14" y1="4" x2="14" y2="14" /></>,
    search: <><circle cx="7" cy="7" r="4.5" /><line x1="10.5" y1="10.5" x2="14" y2="14" /></>,
    bell: <><path d="M8 2a3.5 3.5 0 0 0-3.5 3.5c0 3-1.2 4-1.2 4h9.4s-1.2-1-1.2-4A3.5 3.5 0 0 0 8 2Z" /><path d="M6.7 13a1.4 1.4 0 0 0 2.6 0" /></>,
    plus: <><line x1="9" y1="3" x2="9" y2="15" /><line x1="3" y1="9" x2="15" y2="9" /></>,
    arrow_left: <><path d="M11 4L5 9l6 5" /></>,
    check: <><polyline points="3,9 7,13 15,5" /></>,
    x: <><line x1="4" y1="4" x2="14" y2="14" /><line x1="14" y1="4" x2="4" y2="14" /></>,
    menu: <><line x1="2.5" y1="5.5" x2="15.5" y2="5.5" /><line x1="2.5" y1="9" x2="15.5" y2="9" /><line x1="2.5" y1="12.5" x2="15.5" y2="12.5" /></>,
  };

  return <svg {...p}>{icons[name] ?? icons.grid}</svg>;
}
