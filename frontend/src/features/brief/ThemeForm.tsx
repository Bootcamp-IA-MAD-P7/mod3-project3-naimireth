/**
 * TRAZO · formulario de tema (Etapa 2 · experiencia B I S C).
 *
 * Vive dentro de la pantalla de la tablet en el plano THEME. Solo pide
 * el tema (las plataformas ya se eligió en la estantería), con la
 * ayuda de los ejemplos del backend. El resto de campos los pide el
 * plano de configuración.
 */
import type { Example, GenerateRequest } from '../../types/contract';

interface ThemeFormProps {
  values: GenerateRequest;
  platformName: string;
  examples: Example[];
  ready: boolean;
  loading: boolean;
  onChange: (patch: Partial<GenerateRequest>) => void;
  onLoadExample: (example: Example) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function ThemeForm({
  values,
  platformName,
  examples,
  ready,
  loading,
  onChange,
  onLoadExample,
  onSubmit,
  onBack,
}: ThemeFormProps) {
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
        <h2 className="tablet__title">¿Qué quieres crear?</h2>
      </header>

      {examples.length > 0 && (
        <div className="tablet__examples">
          <span className="work__hint">Prueba con un ejemplo:</span>
          <div className="work__chips">
            {examples.map((example) => (
              <button
                key={example.id}
                type="button"
                className="work__chip"
                disabled={loading}
                onClick={() => onLoadExample(example)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="work__field">
        <span className="work__label">Tema</span>
        <input
          className="work__input"
          type="text"
          value={values.topic}
          placeholder="De qué trata el contenido"
          disabled={loading}
          onChange={(e) => onChange({ topic: e.target.value })}
        />
      </label>

      <div className="tablet__actions">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Atrás
        </button>
        <button type="submit" className="btn" disabled={!ready || loading}>
          Continuar
        </button>
      </div>
    </form>
  );
}