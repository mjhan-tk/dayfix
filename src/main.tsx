import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@thakicloud/shared/core.css';
import './index.css';
import './i18n';

import {
  createOverlayStore,
  Overlay,
  OverlayProvider,
} from '@thakicloud/shared';
import { App } from './App';

const overlayStore = createOverlayStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OverlayProvider overlayStore={overlayStore}>
      <App />
      <Overlay.Container overlayStore={overlayStore} />
    </OverlayProvider>
  </StrictMode>,
);
