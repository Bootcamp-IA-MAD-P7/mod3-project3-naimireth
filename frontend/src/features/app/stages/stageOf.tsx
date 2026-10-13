/**
 * TRAZO · correspondencia pura de fase → pantalla (rediseño visual).
 *
 * Cada fase de la máquina se muestra como una pantalla propia del
 * rediseño, conectada al backend (Tema, Configuración, Resultado). La
 * correspondencia es pura para que las pruebas lean el HTML de cada
 * pantalla sin depender del estado en vivo del store (el snapshot del
 * servidor de Zustand es el estado inicial).
 */
import type { Scene } from '../../../store/stateMachine';
import type { ReactNode } from 'react';
import { ConfigStage } from './ConfigStage';
import { ResultStage } from './ResultStage';
import { ShelfStage } from './ShelfStage';
import { ThemeStage } from './ThemeStage';
import { WelcomeStage } from './WelcomeStage';

/** La pantalla que corresponde a cada fase, sin efectos ni store. */
export function stageOf(scene: Scene): ReactNode {
  switch (scene) {
    case 'ARRIVAL':
      return <WelcomeStage />;
    case 'SHELF_SELECTION':
      return <ShelfStage />;
    case 'THEME':
      return <ThemeStage />;
    case 'CONFIGURATION':
      return <ConfigStage />;
    case 'RESULT':
      return <ResultStage />;
    default:
      return null;
  }
}