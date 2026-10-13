/**
 * TRAZO · pruebas del estado del brief (Etapa 3 · rediseño).
 *
 * Las validaciones (tema listo, configuración incompleta) son
 * funciones puras y se comprueban directamente. El `load` consulta el
 * backend real con `fetch`, por eso se sustituye con un stub, igual que
 * en `api/client.test.ts`.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Example } from '../types/contract';
import {
  configMissingOf,
  emptyForm,
  themeReadyOf,
  useBriefStore,
} from './briefStore';

const plataforma = { id: 'instagram', name: 'Instagram' };
const catalogo = {
  platforms: [
    { ...plataforma, content_types: ['caption', 'carrusel', 'reel'], max_sections: 3, title_expected: false },
  ],
};

const ejemplo = (): Example => ({
  id: 'ej-instagram',
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

function stubFetch(ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.includes('/examples') ? { examples: [ejemplo()] } : catalogo;
      return new Response(ok ? JSON.stringify(body) : JSON.stringify({ detail: 'boom' }), {
        status: ok ? 200 : 500,
        headers: { 'content-type': 'application/json' },
      });
    }),
  );
}

beforeEach(() => {
  vi.unstubAllGlobals();
  useBriefStore.setState({ status: 'idle', platforms: [], examples: [], form: null, error: null });
});

describe('validadores puros del brief', () => {
  it('tema listo solo con topico no vacío', () => {
    expect(themeReadyOf(emptyForm('instagram'))).toBe(false);
    const conTema = { ...emptyForm('instagram'), topic: 'Café de especialidad' };
    expect(themeReadyOf(conTema)).toBe(true);
    expect(themeReadyOf(null)).toBe(false);
  });

  it('configuración incompleta marca audiencia, formato, tono y objetivo', () => {
    expect(configMissingOf(null)).toEqual(['audiencia', 'formato', 'tono', 'objetivo']);
    expect(configMissingOf(emptyForm('instagram'))).toEqual(['audiencia', 'formato', 'tono', 'objetivo']);
    const completa = {
      ...emptyForm('instagram'),
      audience: 'Jóvenes creativos',
      content_type: 'caption',
      tone: 'directo',
      objective: 'informar',
    };
    expect(configMissingOf(completa)).toEqual([]);
  });
});

describe('carga del catálogo y los ejemplos', () => {
  it('carga plataformas y ejemplos y propone el primer formato', async () => {
    stubFetch();
    await useBriefStore.getState().load('instagram');
    const estado = useBriefStore.getState();
    expect(estado.status).toBe('ready');
    expect(estado.form).toMatchObject({ platform: 'instagram', content_type: 'caption' });
    expect(estado.examples).toHaveLength(1);
  });

  it('vuelve a cargar sin duplicar trabajo si ya está listo', async () => {
    stubFetch();
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify(catalogo), { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    await useBriefStore.getState().load('instagram');
    await useBriefStore.getState().load('instagram');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(useBriefStore.getState().status).toBe('ready');
  });
});

describe('el brief entre planos', () => {
  it('marca el error cuando el backend no responde', async () => {
    stubFetch(false);
    await useBriefStore.getState().load('instagram');
    expect(useBriefStore.getState().status).toBe('error');
    expect(useBriefStore.getState().error).toBe('boom');
  });
});

describe('acciones sobre el brief', () => {
  it('update combina parches sin tocar el resto', () => {
    stubFetch();
    void useBriefStore.getState().load('instagram');
    useBriefStore.getState().update({ topic: 'Desayunos' });
    expect(useBriefStore.getState().form).toMatchObject({ topic: 'Desayunos', platform: 'instagram' });
  });

  it('useExample rellena el brief y conserva la plataforma elegida en la estantería', async () => {
    stubFetch();
    await useBriefStore.getState().load('instagram');
    useBriefStore.getState().useExample(ejemplo());
    expect(useBriefStore.getState().form).toMatchObject({
      topic: 'Lanzamiento colección otoño',
      platform: 'instagram',
      content_type: 'reel',
    });
  });

  it('contentTypesOf devuelve el catálogo real de la plataforma', async () => {
    stubFetch();
    await useBriefStore.getState().load('instagram');
    expect(useBriefStore.getState().contentTypesOf('instagram')).toEqual(['caption', 'carrusel', 'reel']);
    expect(useBriefStore.getState().contentTypesOf('linkedin')).toEqual([]);
  });
});