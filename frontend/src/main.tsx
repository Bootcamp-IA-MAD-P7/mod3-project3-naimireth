import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/tokens.css';
import './styles/scene.css';
import './styles/workspace.css';
import './styles/carousel.css';
import './styles/experience.css';
import './styles/brief.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('TRAZO · no se encuentra el nodo raíz #root en index.html');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
