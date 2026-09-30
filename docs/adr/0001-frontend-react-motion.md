# ADR-0001 · Frontend con React + Motion

> **Estado**: Aceptada · **Fecha**: 2026-09-30 · **Fase**: F0

---

## Contexto

El requisito nuclear del proyecto es una **interacción visual animada**: el personaje
recoge un icono de una estantería, camina a la mesa, lo deja y la cámara se acerca.
No es un CRUD con estilos.

Necesitamos, por tanto:

1. **Control fino del estado.** La escena es una máquina de estados con ~12 estados
   (`intro`, `platforms`, `fetching`, `placing`, `camera-zoom`, `content-type`,
   `brief`, `generating`, `result`, …) y transiciones que deben ser deterministas
   y sincronizadas con animaciones en curso.
2. **Orquestación de animaciones.** Secuencias encadenadas, springs, crossfades,
   un `layoutId` para morph y respeto a `prefers-reduced-motion`.
3. **Un contrato de tipos exacto con el backend.** El esquema OpenAPI genera los
   tipos TypeScript; cualquier divergencia entre ambos lados es un bug en producción.
4. **Presupuesto de dependencias pequeño.** El tiempo es el recurso escaso: hay
   que llegar a la Fase 1D (producto funcionando con mocks) en el día 6.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| **React + Motion** (elegida) | Estado declarativo con un store mínimo; Motion resuelve el 90 % de los requisitos de animación; ecosistema enorme; `layoutId` resuelve el morph con una línea | Dos dependencias extra; hay que aprender su API de transiciones |
| React sin librería de animación | Cero dependencias; control absoluto | Hay que implementar transiciones, springs y orquestación a mano. Suma días al presupuesto más tenso del proyecto |
| Vanilla JS + CSS | Sin build step | Un `setTimeout` por animación y sin forma de testear el store. Descartado |
| Vue / Svelte | `motion` y `stores` muy buenos; `layoutId` nativo en ambos | Nadie del equipo tiene experiencia; React es lo que seKZэ身在─ 器presenta y se defiende en la revisión |
| Next.js | SSR y routing integrado | El servidor de producción es Python. Next añadiría una segunda capa de despliegue sin beneficio |
| Godot / Unity | Animación real, física | No web, ni responsive, ni desplegable; y el 2.5D es suficiente |

## Decisión

**React 19 + Vite 7 + TypeScript `strict` + Motion 12 + Zustand 5**, con la escena
construida en **SVG y CSS** (ver [ADR-0002](0002-escena-2.5d-sin-webgl.md)).

**Cuatro dependencias de producción al arrancar**: `react`, `react-dom`, `zustand`, `motion`.
`react-router-dom`, MSW y `openapi-typescript` llegan en la Fase 5, no antes.

**El store es la única fuente de verdad.** Los componentes de la escena leen del store
y no guardan estado propio de la secuencia. La animación **nunca** muta el estado:
el store solo avanza al recibir el evento de fin de animación. Así la UI es determinista
y la secuencia completa se puede testear con las animaciones desactivadas.

## Consecuencias

**A favor**
- La máquina de estados es testeable sin navegador
- `layoutId` hace el morph del icono al workspace del producto
- Los tipos generados de OpenAPI convierten el contrato en algo verificable en el build
- Motion gestiona `prefers-reduced-motion` de forma declarativa

**En contra**
- Dos dependencias más que mantener
- El estado de una animación no vive en el store → hay que discipline la sincronización (R-08)
- `bundle size` mayor que con vanilla, irrelevante para una app local de una sola página

**Implicaciones de la fecha**
- Se descartó `react-router-dom` en la Fase 1D → **Fase 5** (D-02 revisada)
- Playwright E2E se eliminó del alcance. Se sustituye por QA manual con checklist
