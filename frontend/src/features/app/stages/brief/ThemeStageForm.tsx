/**
 * TRAZO · formulario de tema (Etapa 3 · rediseño conectado al backend).
 *
 * Pantalla propia de la fase THEME: la plataforma ya se eligió en la
 * estantería; aquí solo se pide el tema, ayudado por los ejemplos que
 * sirve el backend. Presentacional: el estado y las acciones viven en
 * «BriefStage».
 */
import type { Example } from '../../../../types/contract';

interface ThemeStageFormProps {
  platformName: string;
  topic: string;
  examples: Example[];
  ready: boolean;
  loading: boolean;
  onChangeTopic: (topic: string) => void;
  onLoadExample: (example: Example) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ThemeStageForm({
  platformName,
  topic,
  examples,
  ready,
  loading,
  onChangeTopic,
  onLoadExample,
  onSubmit,
  onBack,
}: ThemeStageFormProps) {
  return (
    <form
      className="brief brief__form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="brief__kicker">{platformName}</p>
      <h2 className="brief__title">¿Qué quieres crear?</h2>

      {examples.length > 0 && (
        <div className="brief__examples">
          <span className="brief__hint">Prueba con un ejemplo:</span>
          <div className="brief__chips">
            {examples.map((example) => (
              <button
                key={example.id}
                type="button"
                className="brief__chip"
                disabled={loading}
                onClick={() => onLoadExample(example)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="brief__field">
        <span className="brief__label">Tema</span>
        <input
          className="brief__input"
          type="text"
          value={topic}
          placeholder="De qué trata el contenido"
          disabled={loading}
          autoFocus={!loading}
          onChange={(event) => onChangeTopic(event.target.value)}
        />
      </label>

      <div className="brief__actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Atrás
        </button>
        <button type="submit" className="btn btn--start" disabled={!ready || loading}>
          Continuar
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </form>
  );
}