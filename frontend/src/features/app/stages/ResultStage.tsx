/**
 * TRAZO · pantalla de Resultado (Etapa 3 · rediseño conectado al
 * backend).
 *
 * Fase RESULT de la máquina. Muestra la generación real de
 * `generationStore` en partes (título, secciones, hashtags, CTA) y, de
 * forma discreta, advertencias y metadatos. «Volver» limpia el estado
 * de generación y regresa a CONFIGURATION.
 */
import { getPlatform } from '../../../data/platforms';
import { useGenerationStore } from '../../../store/generationStore';
import { useSceneStore } from '../../../store/sceneStore';
import { ResultStageView } from './brief/ResultStageView';
import { errorTextFor } from './brief/messages';

export function ResultStage() {
  const platformId = useSceneStore((s) => s.selected);
  const previous = useSceneStore((s) => s.previous);
  const result = useGenerationStore((s) => s.result);
  const status = useGenerationStore((s) => s.status);
  const error = useGenerationStore((s) => s.error);
  const resetGeneration = useGenerationStore((s) => s.reset);

  const platformName = platformId ? getPlatform(platformId).name : '';

  function onBack() {
    resetGeneration();
    previous();
  }

  if (result) {
    return <ResultStageView result={result} platformName={platformName} onBack={onBack} />;
  }

  if (status === 'loading') {
    return <p className="brief__state">Generando contenido…</p>;
  }

  return (
    <div className="brief__state">
      <p className="brief__error">{error ? errorTextFor(error) : 'No hay resultado.'}</p>
      <button type="button" className="btn btn--ghost" onClick={onBack}>
        Volver
      </button>
    </div>
  );
}