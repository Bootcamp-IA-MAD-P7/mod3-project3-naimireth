/**
 * TRAZO · pantalla de Configuración (Etapa 3 · rediseño conectado al
 * backend).
 *
 * Fase CONFIGURATION de la máquina. Pide lo que falta del brief
 * (formato del catálogo real, audiencia, tono, objetivo, contexto de
 * marca) y en «Generar» dispara la generación real (`generationStore`):
 * en éxito avanza a RESULT; en error se queda y lo muestra.
 */
import { useEffect } from 'react';

import { getPlatform } from '../../../data/platforms';
import {
  configMissingOf,
  emptyForm,
  useBriefStore,
} from '../../../store/briefStore';
import { useGenerationStore } from '../../../store/generationStore';
import { useSceneStore } from '../../../store/sceneStore';
import type { GenerateRequest } from '../../../types/contract';
import { ConfigStageForm } from './brief/ConfigStageForm';
import { errorTextFor } from './brief/messages';

export function ConfigStage() {
  const platformId = useSceneStore((s) => s.selected);
  const previous = useSceneStore((s) => s.previous);
  const next = useSceneStore((s) => s.next);
  const status = useBriefStore((s) => s.status);
  const form = useBriefStore((s) => s.form);
  const platforms = useBriefStore((s) => s.platforms);
  const error = useBriefStore((s) => s.error);
  const load = useBriefStore((s) => s.load);
  const update = useBriefStore((s) => s.update);
  const contentTypesOf = useBriefStore((s) => s.contentTypesOf);

  const genStatus = useGenerationStore((s) => s.status);
  const genError = useGenerationStore((s) => s.error);
  const generate = useGenerationStore((s) => s.generate);
  const resetGeneration = useGenerationStore((s) => s.reset);

  useEffect(() => {
    if (platformId) {
      void load(platformId);
    }
  }, [platformId, load]);

  if (!platformId) {
    return null;
  }

  const loading = genStatus === 'loading';
  const missing = configMissingOf(form);
  const platformName =
    platforms.find((p) => p.id === platformId)?.name ?? getPlatform(platformId).name;
  const contentTypeOptions = (() => {
    const types = contentTypesOf(platformId);
    if (form?.content_type && !types.includes(form.content_type)) {
      return [form.content_type, ...types];
    }
    return types;
  })();

  if (status === 'idle' || status === 'loading') {
    return <p className="brief__state">Cargando formatos…</p>;
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

  async function onSubmit() {
    if (loading || missing.length > 0 || form === null) {
      return;
    }
    const ok = await generate(form as GenerateRequest);
    if (ok) {
      next();
    }
  }

  function onBack() {
    resetGeneration();
    previous();
  }

  return (
    <>
      <ConfigStageForm
        values={form ?? emptyForm(platformId)}
        platformName={platformName}
        contentTypeOptions={contentTypeOptions}
        loading={loading}
        missing={missing}
        onChange={update}
        onSubmit={onSubmit}
        onBack={onBack}
      />

      {genStatus === 'error' && genError && (
        <div className="brief__error" role="alert">
          {errorTextFor(genError)}
        </div>
      )}
    </>
  );
}