import { Studio } from './scene/Studio';
import { Ui } from './components/Ui';

/**
 * TRAZO · F01A.
 *
 * El estudio y la interfaz son dos capas hermanas dentro de `.app`:
 * la escena se encuadra y se mueve, la interfaz se queda quieta. Si la
 * UI viviera dentro del mundo escalado, sus textos se deformarían con
 * el zoom de cámara.
 */
export default function App() {
  return (
    <div className="app">
      <Studio />
      <Ui />
    </div>
  );
}
