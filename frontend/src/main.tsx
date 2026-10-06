import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/tokens.css';
import './styles/scene.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('TRAZO · no se encuentra el nodo raíz #root en index.html');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
