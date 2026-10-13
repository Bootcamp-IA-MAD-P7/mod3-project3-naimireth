/**
 * TRAZO · resultado estructurado (Etapa 3 · rediseño).
 *
 * El `content` del backend NO es una cadena: se pinta por partes
 * (título, secciones con sus encabezados, hashtags, CTA) y, debajo, de
 * forma discreta, las advertencias y los metadatos. Pantalla propia de
 * la fase RESULT. Presentacional.
 */
import type { GenerateResponse } from '../../../../types/contract';

interface ResultStageViewProps {
  result: GenerateResponse;
  platformName: string;
  onBack: () => void;
}

export function ResultStageView({ result, platformName, onBack }: ResultStageViewProps) {
  const { content, metadata, warnings } = result;

  return (
    <article className="brief brief__result">
      <div className="brief__result-head">
        <span className="brief__kicker">
          {platformName} · {result.content_type}
        </span>
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Volver
        </button>
      </div>

      {content.title && <h2 className="brief__result-title">{content.title}</h2>}

      <div className="brief__sections">
        {content.sections.map((section, index) => (
          <section className="brief__section" key={index}>
            {section.heading && <h3 className="brief__heading">{section.heading}</h3>}
            <p className="brief__text">{section.text}</p>
          </section>
        ))}
      </div>

      {content.hashtags.length > 0 && (
        <ul className="brief__hashtags">
          {content.hashtags.map((tag) => (
            <li key={tag} className="brief__hashtag">
              {tag}
            </li>
          ))}
        </ul>
      )}

      {content.cta && <p className="brief__cta">{content.cta}</p>}

      {warnings.length > 0 && (
        <ul className="brief__warnings">
          {warnings.map((warning, index) => (
            <li key={index} className="brief__warning">
              {warning}
            </li>
          ))}
        </ul>
      )}

      <footer className="brief__meta">
        <span>{metadata.model}</span>
        <span>prompt {metadata.prompt_version}</span>
        <span>{metadata.latency_ms} ms</span>
      </footer>
    </article>
  );
}