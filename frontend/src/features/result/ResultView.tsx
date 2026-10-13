/**
 * TRAZO · resultado estructurado (F08).
 *
 * El `content` del backend NO es una cadena: se pinta por partes
 * (título, secciones con sus encabezados, hashtags, CTA), y debajo, de
 * forma discreta, las advertencias y los metadatos. Nunca como un
 * bloque de texto indiferenciado.
 */
import type { GenerateResponse } from '../../types/contract';

interface ResultViewProps {
  result: GenerateResponse;
  onReset: () => void;
}

export function ResultView({ result, onReset }: ResultViewProps) {
  const { content, metadata, warnings } = result;

  return (
    <article className="result">
      <div className="work__head">
        <span className="ui__work-tag">
          <span className="ui__dot" style={{ background: 'var(--c-accent)' }} />
          {result.platform} · {result.content_type}
        </span>
        <button type="button" className="btn btn--ghost work__back" onClick={onReset}>
          Volver
        </button>
      </div>

      {content.title && <h2 className="result__title">{content.title}</h2>}

      <div className="result__sections">
        {content.sections.map((section, index) => (
          <section className="result__section" key={index}>
            {section.heading && <h3 className="result__heading">{section.heading}</h3>}
            <p className="result__text">{section.text}</p>
          </section>
        ))}
      </div>

      {content.hashtags.length > 0 && (
        <ul className="result__hashtags">
          {content.hashtags.map((tag) => (
            <li key={tag} className="result__hashtag">
              {tag}
            </li>
          ))}
        </ul>
      )}

      {content.cta && <p className="result__cta">{content.cta}</p>}

      {warnings.length > 0 && (
        <ul className="result__warnings">
          {warnings.map((warning, index) => (
            <li key={index} className="result__warning">
              {warning}
            </li>
          ))}
        </ul>
      )}

      <footer className="result__meta">
        <span>{metadata.model}</span>
        <span>prompt {metadata.prompt_version}</span>
        <span>{metadata.latency_ms} ms</span>
      </footer>
    </article>
  );
}
