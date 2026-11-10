import React from 'react';
import { createRoot } from 'react-dom/client';
import ElectricBorder from './ElectricBorder';
import './chat-electric-border.css';

// Keep the existing form and its event handlers owned by the site's vanilla JS.
// React owns only this decorative layer and is disposed when the sheet changes.
let mounted = null;
function syncChatBorder() {
  const form = document.querySelector('#studySheet .assistant-composer');
  if (mounted?.form === form) return;
  if (mounted) {
    mounted.root.unmount();
    mounted.host.remove();
    mounted = null;
  }
  if (!form) return;
  const host = document.createElement('div');
  host.className = 'ornek-chat-electric-layer';
  host.setAttribute('aria-hidden', 'true');
  form.append(host);
  const root = createRoot(host);
  mounted = { form, host, root };
  root.render(
    <ElectricBorder
      color="#7df9ff"
      speed={1}
      chaos={0.5}
      spread={0.6}
      strands={3}
      thickness={1.5}
      borderRadius={24}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
const observer = new MutationObserver(syncChatBorder);
observer.observe(document.body, { childList: true, subtree: true });
syncChatBorder();
window.addEventListener('pagehide', () => {
  observer.disconnect();
  if (mounted) {
    mounted.root.unmount();
    mounted.host.remove();
    mounted = null;
  }
});
window.addEventListener('pageshow', () => {
  observer.observe(document.body, { childList: true, subtree: true });
  syncChatBorder();
});
