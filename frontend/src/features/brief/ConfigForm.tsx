/**
 * TRAZO · formulario de configuración (Etapa 2 · experiencia B I S C).
 *
 * Vive dentro de la pantalla de la tablet en el plano CONFIGURATION.
 * Pide lo que falta tras el tema: audiencia, formato (del catálogo
 * real), tono, objetivo y el contexto de marca opcional. El envío
 * dispara la generación real; en éxito pasa al plano RESULT.
 */
import type { GenerateRequest } from '../../types/contract';

interface ConfigFormProps {
  values: GenerateRequest;
  platformName: string;
  contentTypeOptions: string[];
  loading: boolean;
  missing: string[];
  onChange: (patch: Partial<GenerateRequest>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ConfigForm({
  values,
  platformName,
  contentTypeOptions,
  loading,
  missing,
  onChange,
  onSubmit,
  onBack,
}: ConfigFormProps) {
  return (
    <form
      className="tablet__form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <header className="tablet__head">
        <p className="tablet__kicker">{platformName}</p>
        <h2 className="tablet__title">Configura la publicación</h2>
      </header>

      <label className="work__field">
        <span className="work__label">Formato</span>
        <select
          className="work__select"
          value={values.content_type}
          disabled={loading || contentTypeOptions.length === 0}
          onChange={(e) => onChange({ content_type: e.target.value })}
        >
          {contentTypeOptions.length === 0 && <option value="">Sin formatos disponibles</option>}
          {contentTypeOptions.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </label>

      <label className="work__field">
        <span className="work__label">Audiencia</span>
        <input
          className="work__input"
          type="text"
          value={values.audience}
          placeholder="A quién va dirigido"
          disabled={loading}
          onChange={(e) => onChange({ audience: e.target.value })}
        />
      </label>

      <label className="work__field">
        <span className="work__label">Tono</span>
        <input
          className="work__input"
          type="text"
          value={values.tone}
          placeholder="Cercano, profesional, directo…"
          disabled={loading}
          onChange={(e) => onChange({ tone: e.target.value })}
        />
      </label>

      <label className="work__field">
        <span className="work__label">Objetivo</span>
        <input
          className="work__input"
          type="text"
          value={values.objective}
          placeholder="Educar, vender, informar…"
          disabled={loading}
          onChange={(e) => onChange({ objective: e.target.value })}
        />
      </label>

      <label className="work__field">
        <span className="work__label">Contexto de marca (opcional)</span>
        <textarea
          className="work__textarea"
          value={values.brand_context}
          rows={2}
          placeholder="Quiénes sois y qué os diferencia"
          disabled={loading}
          onChange={(e) => onChange({ brand_context: e.target.value })}
        />
      </label>

      <div className="tablet__actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Volver
        </button>
        <button type="submit" className="btn" disabled={loading || missing.length > 0}>
          {loading ? 'Generando…' : 'Generar'}
        </button>
      </div>

      {missing.length > 0 && <span className="work__hint">Completa: {missing.join(', ')}.</span>}
    </form>
  );
}