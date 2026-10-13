/**
 * TRAZO · pruebas de las pantallas del brief (Etapa 3 · rediseño).
 *
 * Los componentes presentacionales (Tema, Configuración, Resultado) se
 * prueban con sus props fijadas, sin tienda: se lee el HTML inicial y
 * se verifica la composición por partes del resultado estructurado.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import type { Example, GenerateRequest, GenerateResponse } from '../../../types/contract';
import { ConfigStageForm } from './brief/ConfigStageForm';
import { ResultStageView } from './brief/ResultStageView';
import { ThemeStageForm } from './brief/ThemeStageForm';

function html(nodo: ReactNode): string {
  return renderToStaticMarkup(nodo);
}

const ejemplo = (): Example => ({
  id: 'ej-1',
  label: 'Arranque de temporada',
  brief: {
    topic: 'Lanzamiento colección otoño',
    platform: 'Instagram',
    audience: 'Seguidores de moda urbana',
    content_type: 'reel',
    tone: 'fresco',
    objective: 'informar',
    brand_context: 'Marca emergente de diseño',
  },
});

const vacio = (): GenerateRequest => ({
  topic: '',
  platform: 'instagram',
  audience: '',
  content_type: '',
  tone: '',
  objective: '',
  brand_context: '',
});

describe('el formulario de Tema (ThemeStageForm)', () => {
  it('compone kicker de la plataforma, título, campo de tema y acción', () => {
    const marcado = html(
      <ThemeStageForm
        platformName="Instagram"
        topic="Lanzamiento colección otoño"
        examples={[ejemplo()]}
        ready
        loading={false}
        onChangeTopic={() => undefined}
        onLoadExample={() => undefined}
        onSubmit={() => undefined}
        onBack={() => undefined}
      />,
    );
    expect(marcado).toContain('brief__form');
    expect(marcado).toContain('Instagram');
    expect(marcado).toContain('¿Qué quieres crear?');
    expect(marcado).toContain('class="brief__chip"');
    expect(marcado).toContain('type="text"');
  });

  it('desactiva Continuar sin tema', () => {
    const marcado = html(
      <ThemeStageForm
        platformName="Instagram"
        topic=""
        examples={[]}
        ready={false}
        loading={false}
        onChangeTopic={() => undefined}
        onLoadExample={() => undefined}
        onSubmit={() => undefined}
        onBack={() => undefined}
      />,
    );
    expect(marcado).toContain('disabled=""');
  });
});

describe('el formulario de Configuración (ConfigStageForm)', () => {
  it('compone las opciones del catálogo y los campos del brief', () => {
    const marcado = html(
      <ConfigStageForm
        values={{ ...vacio(), content_type: 'reel', audience: 'Seguidores' }}
        platformName="Instagram"
        contentTypeOptions={['reel', 'caption']}
        loading={false}
        missing={['tono', 'objetivo']}
        onChange={() => undefined}
        onSubmit={() => undefined}
        onBack={() => undefined}
      />,
    );
    expect(marcado).toContain('Configura la publicación');
    expect(marcado).toContain('<option value="reel"');
    expect(marcado).toContain('<option value="caption"');
    expect(marcado).toContain('Completa: tono, objetivo.');
  });

  it('muestra «Generando…» y bloquea mientras carga', () => {
    const marcado = html(
      <ConfigStageForm
        values={vacio()}
        platformName="Instagram"
        contentTypeOptions={['caption']}
        loading
        missing={[]}
        onChange={() => undefined}
        onSubmit={() => undefined}
        onBack={() => undefined}
      />,
    );
    expect(marcado).toContain('Generando…');
  });
});

describe('el resultado estructurado (ResultStageView)', () => {
  it('compone por partes: título, secciones, hashtags, CTA, advertencias y metadatos', () => {
    const resultado: GenerateResponse = {
      platform: 'instagram',
      content_type: 'reel',
      content: {
        title: 'Otoño neón',
        sections: [
          { heading: 'Arranque', text: 'Saca el abrigo del armario.' },
          { heading: '', text: 'Segundo bloque.' },
        ],
        hashtags: ['#modaUrbana', '#Otoño2026'],
        cta: 'Síguenos para más.',
      },
      metadata: { model: 'gpt-4o-mini', prompt_version: 'v1', latency_ms: 832 },
      warnings: ['Formato reel sin guion de video: solo se entrega el anuncio.'],
    };
    const marcado = html(
      <ResultStageView result={resultado} platformName="Instagram" onBack={() => undefined} />,
    );
    expect(marcado).toContain('Instagram · reel');
    expect(marcado).toContain('Otoño neón');
    expect(marcado).toContain('Saca el abrigo del armario.');
    expect(marcado).toContain('#modaUrbana');
    expect(marcado).toContain('Síguenos para más.');
    expect(marcado).toContain('prompt v1');
    expect(marcado).toContain('832 ms');
  });
});