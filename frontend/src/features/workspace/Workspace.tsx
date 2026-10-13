/**
 * TRAZO · workspace dentro de la tablet (Etapa 2 · experiencia B I S C).
 *
 * Se monta en el plano de tablet (THEME, CONFIGURATION, RESULT), dentro
 * del rectángulo de la pantalla. Reúne el catálogo (`GET /api/platforms`)
 * para el selector de formatos, los ejemplos (`GET /api/examples`), el
 * formulario del brief dividido en dos planos y el resultado de
 * `POST /api/generate`.
 *
 * Es consciente de la escena: cada plano monta su contenido y las
 * acciones «Continuar», «Generar» y «Volver» avanzan o retroceden en la
 * máquina de estados. El ajuste de formato viene del catálogo real; la
 * plataforma ya se eligió en la estantería y vive de `data/platforms.ts`.
 */
import { useEffect, useState } from 'react';

import { getExamples, getPlatforms } from '../../api/endpoints';
import { getPlatform, type PlatformId } from '../../data/platforms';
import { useGenerationStore, type GenerationError } from '../../store/generationStore';
import { useSceneStore } from '../../store/sceneStore';
import type { Example, GenerateRequest, PlatformInfo } from '../../types/contract';
import { ThemeForm } from '../brief/ThemeForm';
import { ConfigForm } from '../brief/ConfigForm';
import { ResultView } from '../result/ResultView';

type CatalogState =
  | { status: 'loading' }
  | { status: 'ready'; platforms: PlatformInfo[] }
  | { status: 'error'; message: string };

/** Campos que pide el plano CONFIGURATION antes de generar. */
const CONFIG_REQUIRED: ReadonlyArray<readonly [keyof GenerateRequest, string]> = [
  ['audience', 'audiencia'],
  ['content_type', 'formato'],
  ['tone', 'tono'],
  ['objective', 'objetivo'],
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function messageOf(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Error desconocido.';
}

function errorText(error: GenerationError): string {
  switch (error.kind) {
    case 'network':
      return 'No se pudo conectar con el backend. Comprueba que FastAPI está en marcha en http://localhost:8000.';
    case 'validation':
      return `El brief no superó la validación del servidor. ${error.message}`;
    case 'provider':
      return `El proveedor de IA (Groq) falló. ${error.message}`;
    case 'parse':
      return error.message;
    default:
      return `El backend respondió con un error (HTTP ${error.status}). ${error.message}`;
  }
}

export function Workspace({ platformId }: { platformId: PlatformId }) {
  const scene = useSceneStore((s) => s.scene);
  const next = useSceneStore((s) => s.next);
  const previous = useSceneStore((s) => s.previous);
  const status = useGenerationStore((s) => s.status);
  const result = useGenerationStore((s) => s.result);
  const error = useGenerationStore((s) => s.error);
  const generate = useGenerationStore((s) => s.generate);
  const resetGeneration = useGenerationStore((s) => s.reset);

  const [catalog, setCatalog] = useState<CatalogState>({ status: 'loading' });
  const [examples, setExamples] = useState<Example[]>([]);
  const [form, setForm] = useState<GenerateRequest>(() => ({
    topic: '',
    platform: platformId,
    audience: '',
    content_type: '',
    tone: '',
    objective: '',
    brand_context: '',
  }));

  useEffect(() => {
    const controller = new AbortController();
    getPlatforms(controller.signal)
      .then((response) => {
        setCatalog({ status: 'ready', platforms: response.platforms });
        // Se propone el primer formato válido de la plataforma elegida.
        const first = response.platforms
          .find((platform) => platform.id === platformId)?.content_types[0];
        if (first) {
          setForm((current) =>
            current.content_type === '' ? { ...current, content_type: first } : current,
          );
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setCatalog({ status: 'error', message: messageOf(cause) });
        }
      });
    // Los ejemplos son una ayuda, no un requisito: si fallan, se ocultan.
    getExamples(controller.signal)
      .then((response) => setExamples(response.examples))
      .catch(() => setExamples([]));
    return () => controller.abort();
  }, [platformId]);

  const platformInfo =
    catalog.status === 'ready' ? catalog.platforms.find((p) => p.id === platformId) : undefined;
  const platformName = platformInfo?.name ?? getPlatform(platformId).name;

  const loading = status === 'loading';
  const themeReady = form.topic.trim().length > 0;
  const configMissing = CONFIG_REQUIRED.filter(([key]) => !form[key].trim()).map(
    ([, label]) => label,
  );

  const contentTypeOptions = (() => {
    const tipos = platformInfo?.content_types ?? [];
    if (form.content_type && !tipos.includes(form.content_type)) {
      return [form.content_type, ...tipos];
    }
    return tipos;
  })();

  const visibleExamples = examples.filter(
    (example) => normalize(example.brief.platform) === normalize(platformName),
  );

  function onChange(patch: Partial<GenerateRequest>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function onLoadExample(example: Example) {
    // La plataforma la fija la estantería; el resto de campos vienen del ejemplo.
    setForm({ ...example.brief, platform: platformId });
  }

  function onThemeSubmit() {
    if (!themeReady || loading) return;
    next();
  }

  async function onConfigSubmit() {
    if (loading || configMissing.length > 0) return;
    const ok = await generate(form);
    if (ok) {
      next();
    }
  }

  function onThemeBack() {
    previous();
  }

  function onConfigBack() {
    resetGeneration();
    previous();
  }

  function onResultBack() {
    resetGeneration();
    previous();
  }

  if (catalog.status === 'loading') {
    return (
      <div className="tablet__screen">
        <p className="tablet__state">Cargando plataformas y formatos…</p>
      </div>
    );
  }

  if (catalog.status === 'error') {
    return (
      <div className="tablet__screen">
        <p className="tablet__error">No se pudo cargar el catálogo: {catalog.message}</p>
        <button type="button" className="btn btn--ghost" onClick={onThemeBack}>
          Volver
        </button>
      </div>
    );
  }

  if (scene === 'THEME') {
    return (
      <div className="tablet__screen">
        <ThemeForm
          values={form}
          platformName={platformName}
          examples={visibleExamples}
          ready={themeReady}
          loading={loading}
          onChange={onChange}
          onLoadExample={onLoadExample}
          onSubmit={onThemeSubmit}
          onBack={onThemeBack}
        />
      </div>
    );
  }

  if (scene === 'RESULT') {
    return (
      <div className="tablet__screen">
        {result ? (
          <ResultView result={result} onReset={onResultBack} />
        ) : loading ? (
          <p className="tablet__state">Generando contenido…</p>
        ) : (
          <>
            <p className="tablet__error">{error ? errorText(error) : 'No hay resultado.'}</p>
            <button type="button" className="btn btn--ghost" onClick={onResultBack}>
              Volver
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="tablet__screen">
      <ConfigForm
        values={form}
        platformName={platformName}
        contentTypeOptions={contentTypeOptions}
        loading={loading}
        missing={configMissing}
        onChange={onChange}
        onSubmit={onConfigSubmit}
        onBack={onConfigBack}
      />

      {status === 'error' && error && (
        <div className="tablet__error" role="alert">
          {errorText(error)}
        </div>
      )}
    </div>
  );
}