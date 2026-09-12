import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    __TP_RENDER_AUTH__: (runtime: typeof jsx, react: typeof React, options: unknown) => React.ReactNode;
  }
}
function Preview() {
  return window.__TP_RENDER_AUTH__(jsx, React, { mode: 'login', login: async () => {}, navigate: () => {} });
}
createRoot(document.getElementById('root')!).render(<Preview />);
