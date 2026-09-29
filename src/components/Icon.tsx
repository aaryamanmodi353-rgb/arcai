import React from 'react';

export const Icon = ({ name, size = 18, className }: { name: string; size?: number, className?: string }) => {
  const paths: Record<string, React.ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>, search: <circle cx="11" cy="11" r="6"/>, phone: <path d="M6 3h3l2 5-2 1.5c1.2 2.4 3.1 4.3 5.5 5.5L16 13l5 2v3c0 1.7-1.3 3-3 3C9.7 21 3 14.3 3 6c0-1.7 1.3-3 3-3Z"/>, sparkle: <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Zm7 13 .6 1.4L21 18l-1.4.6L19 20l-.6-1.4L17 18l1.4-.6L19 16Z"/>, chevron: <path d="m9 18 6-6-6-6"/>, send: <path d="m21 3-7.5 18-3.5-7-7-3.5L21 3Zm-7.5 10.5L21 3"/>, copy: <><rect x="9" y="9" width="11" height="11" rx="1"/><path d="M15 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h4"/></>, arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>, bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>, close: <path d="m6 6 12 12M18 6 6 18"/>, menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>, filter: <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z"/>, user: <><circle cx="12" cy="8" r="3"/><path d="M5 20c.6-3.2 2.9-5 7-5s6.4 1.8 7 5"/></>
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>{paths[name]}</svg>
}
