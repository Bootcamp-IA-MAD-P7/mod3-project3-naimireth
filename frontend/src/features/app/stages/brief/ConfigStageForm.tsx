/**
 * TRAZO · formulario de configuración (Etapa 3 · rediseño conectado al
 * backend).
 *
 * Pantalla propia de la fase CONFIGURATION: pide lo que falta tras el
 * tema (formato del catálogo real, audiencia, tono, objetivo y contexto
 * de marca opcional). El envío de «Generar» dispara `POST /api/generate`;
 * en éxito la máquina avanza a RESULT. Presentacional.
 */
import type { GenerateRequest } from '../../../../types/contract';

interface ConfigStageFormProps {
  values: GenerateRequest | null;
  platformName: string;
  contentTypeOptions: string[];
  loading: boolean;
  missing: string[];
  onChange: (patch: Partial<GenerateRequest>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ConfigStageForm({
  values,
  platformName,
  contentTypeOptions,
  loading,
  missing,
  onChange,
  onSubmit,
  onBack,
}: ConfigStageFormProps) {
  const v = values;

  return (
    <form
      className="brief brief__form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="brief__kicker">{platformName}</p>
      <h2 className="brief__title">Configura la publicación</h2>

      <label className="brief__field">
        <span className="brief__label">Formato</span>
        <select
          className="brief__select"
          value={v?.content_type ?? ''}
          disabled={loading || contentTypeOptions.length === 0}
          onChange={(event) => onChange({ content_type: event.target.value })}
        >
          {contentTypeOptions.length === 0 && (
            <option value="">Sin formatos disponibles</option>
          )}
          {contentTypeOptions.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </label>

      <label className="brief__field">
        <span className="brief__label">Audiencia</span>
        <input
          className="brief__input"
          type="text"
          value={v?.audience ?? ''}
          placeholder="A quién va dirigido"
          disabled={loading}
          onChange={(event) => onChange({ audience: event.target.value })}
        />
      </label>

      <label className="brief__field">
        <span className="brief__label">Tono</span>
        <input
          className="brief__input"
          type="text"
          value={v?.tone ?? ''}
          placeholder="Cercano, profesional, directo…"
          disabled={loading}
          onChange={(event) => onChange({ tone: event.target.value })}
        />
      </label>

      <label className="brief__field">
        <span className="brief__label">Objetivo</span>
        <input
          className="brief__input"
          type="text"
          value={v?.objective ?? ''}
          placeholder="Educar, vender, informar…"
          disabled={loading}
          onChange={(event) => onChange({ objective: event.target.value })}
        />
      </label>

      <label className="brief__field">
        <span className="brief__label">Contexto de marca (opcional)</span>
        <textarea
          className="brief__textarea"
          value={v?.brand_context ?? ''}
          rows={2}
          placeholder="Quiénes sois y qué os diferencia"
          disabled={loading}
          onChange={(event) => onChange({ brand_context: event.target.value })}
        />
      </label>

      <div className="brief__actions">
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={loading}>
          Volver
        </button>
        <button type="submit" className="btn btn--start" disabled={loading || missing.length > 0}>
          {loading ? 'Generando…' : 'Generar'}
          {!loading && (
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          )}
        </button>
      </div>

      {missing.length > 0 && (
        <span className="brief__missing">Completa: {missing.join(', ')}.</span>
      )}
    </form>
  );
}