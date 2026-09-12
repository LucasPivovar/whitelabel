'use client';

import { useEffect, useRef, useState } from 'react';
import type { Tenant } from '@/lib/model';

export function prototypeAuthUrl(draft: Tenant) {
  const params = new URLSearchParams();
  params.set('name', draft.name);
  params.set('color', draft.color);
  params.set('secondaryColor', draft.secondaryColor || '#ffffff');
  params.set('logo', draft.logo || '');
  params.set('favicon', draft.favicon || '');
  params.set('font', draft.font || 'Inter');
  params.set('loginTemplate', draft.loginTemplate || 'split');
  return '/prototipo/login?' + params.toString();
}

export default function LoginPreviewMockup({ draft, isMobile = false }: { draft: Tenant; isMobile?: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [source] = useState(() => prototypeAuthUrl(draft) + '&preview=1');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const viewportWidth = isMobile ? 390 : 1100;
  const scale = size.width / viewportWidth;
  const viewportHeight = scale ? size.height / scale : 780;
  function synchronize() {
    frame.current?.contentWindow?.postMessage({ type: 'WHITELABEL_BRANDING_UPDATE', branding: draft }, window.location.origin);
  }
  useEffect(() => { synchronize(); }, [draft]);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={container} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <iframe ref={frame} src={source} onLoad={synchronize} title="Login do protótipo"
        className="prototype-preview-frame"
        style={{ width: viewportWidth, height: viewportHeight, border: 0, display: 'block', transformOrigin: 'top left', transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }} />
    </div>
  );
}
