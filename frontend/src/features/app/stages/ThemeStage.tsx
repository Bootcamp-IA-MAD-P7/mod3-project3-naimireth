/**
 * TRAZO · pantalla de Tema (Etapa 3 · rediseño conectado al backend).
 *
 * Fase THEME de la máquina. Carga el catálogo y los ejemplos del
 * backend, mantiene el brief en `briefStore` (persiste entre planos),
 * valida el tema y avanza a CONFIGURATION. Todo lo visual lo compone
 * `ThemeStageForm`.
 */
import { useEffect } from 'react';

import { getPlatform } from '../../../data/platforms';
import { themeReadyOf, useBriefStore } from '../../../store/briefStore';
import { useSceneStore } from '../../../store/sceneStore';
import { ThemeStageForm } from './brief/ThemeStageForm';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function ThemeStage() {
  const platformId = useSceneStore((s) => s.selected);
  const previous = useSceneStore((s) => s.previous);
  const next = useSceneStore((s) => s.next);
  const status = useBriefStore((s) => s.status);
  const form = useBriefStore((s) => s.form);
  const examples = useBriefStore((s) => s.examples);
  const platforms = useBriefStore((s) => s.platforms);
  const error = useBriefStore((s) => s.error);
  const load = useBriefStore((s) => s.load);
  const update = useBriefStore((s) => s.update);
  const useExample = useBriefStore((s) => s.useExample);

  useEffect(() => {
    if (platformId) {
      void load(platformId);
    }
  }, [platformId, load]);

  if (!platformId) {
    return null;
  }

  const platformName =
    platforms.find((p) => p.id === platformId)?.name ?? getPlatform(platformId).name;
  const visibleExamples = examples.filter(
    (example) => normalize(example.brief.platform) === normalize(platformName),
  );

  if (status === 'idle' || status === 'loading') {
    return <p className="brief__state">Cargando formatos y ejemplos…</p>;
  }

  if (status === 'error') {
    return (
      <div className="brief__state">
        <p className="brief__error">No se pudo cargar el catálogo: {error}.</p>
        <button type="button" className="btn btn--ghost" onClick={previous}>
          Volver
        </button>
      </div>
    );
  }

  const ready = themeReadyOf(form);

  return (
    <ThemeStageForm
      platformName={platformName}
      topic={form?.topic ?? ''}
      examples={visibleExamples}
      ready={ready}
      loading={false}
      onChangeTopic={(topic) => update({ topic })}
      onLoadExample={useExample}
      onSubmit={() => {
        if (ready) next();
      }}
      onBack={previous}
    />
  );
}