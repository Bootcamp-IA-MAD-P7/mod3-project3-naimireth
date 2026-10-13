import { Experience } from './features/app/Experience';

/**
 * TRAZO · punto de entrada del rediseño visual.
 *
 * La experiencia principal es `Experience`: cada fase de la máquina de
 * estados se muestra como una pantalla propia a pantalla completa, sin
 * la antigua escena del estudio debajo. `Studio` y la escena con cámara
 * dejan de pertenecer al recorrido principal (el código se conserva).
 */
export default function App() {
  return (
    <div className="app">
      <Experience />
    </div>
  );
}
