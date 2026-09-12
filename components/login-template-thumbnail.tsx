'use client';
import { useEffect, useRef, useState } from 'react';
import type { LoginTemplate } from '@/lib/model';

export default function LoginTemplateThumbnail({ template, color }: { template: LoginTemplate; color: string }) {
  const container = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);
  const [source] = useState(() => `/prototipo/auth-preview.html?preview=1&skeleton=1&loginTemplate=${template}&color=${encodeURIComponent(color)}`);
  function synchronize() {
    frame.current?.contentWindow?.postMessage({ type: 'WHITELABEL_BRANDING_UPDATE', branding: { color, loginTemplate: template } }, window.location.origin);
  }
  useEffect(() => { synchronize(); }, [color, template]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 1100));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={container} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
    <iframe ref={frame} src={source} title={`Template ${template}`} aria-hidden="true" tabIndex={-1} onLoad={synchronize}
      style={{ position: 'absolute', top: 0, left: 0, width: 1100, height: 707, border: 0, pointerEvents: 'none', transformOrigin: 'top left', transform: `scale(${scale})`, visibility: scale ? 'visible' : 'hidden' }} />
  </div>;
}
