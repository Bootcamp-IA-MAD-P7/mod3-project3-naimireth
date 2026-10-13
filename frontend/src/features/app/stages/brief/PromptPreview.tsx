/**
 * TRAZO · vista previa del prompt (Fase 2 · verificación de Prompt
 * Engineering).
 *
 * Apartado colapsado por defecto, dentro del formulario de
 * Configuración. Al abrirlo consulta `GET /api/prompt-preview` con los
 * parámetros actuales del brief y muestra el prompt REAL que usa el
 * backend (`build_prompt()`): sistema y humano, tal cual llegarían al
 * modelo. No genera contenido y no llama al LLM.
 *
 * Se vuelve a consultar cuando cambian los parámetros (con un pequeño
 * envío diferido y cancelación del anterior), de modo que la vista
 * previa siempre refleja el formulario.
 */
import { useEffect, useState } from 'react';

import { ApiError } from '../../../../api/client';
import { getPromptPreview } from '../../../../api/endpoints';
import type { GenerateRequest, PromptPreviewResponse } from '../../../../types/contract';
import { errorTextFor } from './messages';

type PreviewStatus = 'idle' | 'loading' | 'ready' | 'error';

interface PromptPreviewProps {
  brief: GenerateRequest;
  disabled?: boolean;
}

/** Resumen de los siete campos, para detectar cambios reales del brief. */
function keyOf(brief: GenerateRequest): string {
  return new URLSearchParams({
    platform: brief.platform,
    topic: brief.topic,
    audience: brief.audience,
    content_type: brief.content_type,
    tone: brief.tone,
    objective: brief.objective,
    brand_context: brief.brand_context,
  }).toString();
}

function previewErrorText(cause: unknown): string {
  if (cause instanceof ApiError) {
    return errorTextFor({ kind: cause.kind, status: cause.status, message: cause.message });
  }
  return cause instanceof Error ? cause.message : 'No se pudo obtener la vista previa.';
}

export function PromptPreview({ brief, disabled }: PromptPreviewProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<PreviewStatus>('idle');
  const [data, setData] = useState<PromptPreviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = keyOf(brief);

  useEffect(() => {
    if (!open) {
      return;
    }
    let ignore = false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus('loading');
      getPromptPreview(brief, controller.signal)
        .then((response) => {
          if (!ignore) {
            setData(response);
            setError(null);
            setStatus('ready');
          }
        })
        .catch((cause: unknown) => {
          if (!ignore) {
            setError(previewErrorText(cause));
            setStatus('error');
          }
        });
    }, 400);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, key, brief]);

  function toggle() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && status === 'idle') {
      setStatus('loading');
    }
  }

  return (
    <div className="brief__preview">
      <button
        type="button"
        className="brief__preview-toggle"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggle}
      >
        <span>{open ? 'Ocultar vista previa del prompt' : 'Ver vista previa del prompt'}</span>
        <span className="brief__preview-caret" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div className="brief__preview-body">
          {status === 'loading' && <p className="brief__state">Preparando la vista previa…</p>}
          {status === 'error' && (
            <p className="brief__error" role="alert">
              {error}
            </p>
          )}
          {status === 'ready' &&
            data && (
              <>
                <p className="brief__preview-meta">
                  {data.model} · prompt {data.prompt_version}
                </p>
                {data.messages.map((message, index) => (
                  <div className="brief__preview-block" key={index}>
                    <span className="brief__preview-role">{message.role}</span>
                    <pre className="brief__preview-pre">{message.content}</pre>
                  </div>
                ))}
              </>
            )}
        </div>
      )}
    </div>
  );
}