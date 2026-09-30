# Tablero Kanban — GitHub Projects

> Configuración y contenido listos para crear a mano. OpenCode no modifica el repositorio remoto.

---

## Por qué GitHub Projects

El tablero deja de ser un artefacto externo y pasa a ser **una vista más del propio
repositorio**. Con fecha de entrega corta eso vale por tres cosas:

1. **No hay una segunda herramienta que mantener.** Nada que sincronizar a mano.
2. **El estado del proyecto es consultable desde la URL del repo**, sin pedir permisos.
3. **Cada commit cuenta la misma historia que cada tarjeta.**

---

## Configuración inicial (~45 min, Día 1)

### Creación

1. Pestaña **Projects** en el repositorio
2. **New project** → **Start from your repository**

### Columnas

`Backlog` · `In progress` · `Review` · `Blocked` · `Done`

### Vistas

| Vista | Para qué |
|---|---|
| **Board** *(principal, la que se presenta)* | El tablero Kanban del briefing |
| **Table** | Detalle de cada tarjeta: rama, dependencias, checkbox |
| **Roadmap** | Agrupada por `Fase`. Muestra el plan contra el calendario real |

### Campos personalizados

| Campo | Tipo | Valores |
|---|---|---|
| `Fase` | Single select | `F0` `1A` `1B` `1C` `1D` `F2` `F3` `F4` `F5` `F6` `F9` |
| `Rama` | Texto | Se rellena al crear la tarjeta, p. ej. `feature/F01a-studio` |

### Etiquetas

`studio` · `backend` · `prompts` · `providers` · `docs` · `chore`

---

## La regla que ata tablero y código

> **El identificador de fase es el mismo en los tres sitios.**

```
Rama:        feature/F01a-studio
Etiqueta:    studio
Campo Fase:  1A
Tarjeta:     "1A · Studio"
```

Consecuencia práctica: `git branch -a` y el tablero dicen exactamente lo mismo.
Si una tarjeta está en `In progress`, existe una rama con ese prefijo.

---

## Cierre automático

Las tarjetas son **issues**, no ítems de borrador. Cada PR cierra la suya:

```
Closes #12
```

Al hacer merge, el issue se cierra y la tarjeta salta a `Done` **sin intervención manual**.

Un tablero que se mantiene solo es la diferencia entre un Kanban vivo y uno abandonado el día 5.

---

## Las 14 tarjetas iniciales

> Crear solo estas 14, **no las ~60 tareas**. Cada tarjeta lleva: fase, objetivo en una línea,
> resultado esperado, dependencia, rama asociada y casilla de verificación.

| # | Título | `Fase` | Rama | Objetivo |
|---|---|---|---|---|
| 1 | F0 · Fundamentos | `F0` | `feature/F01a-studio` | Repo listo: `.gitignore`, README, plan, 3 ADRs, este tablero |
| 2 | 1A · Studio | `1A` | `feature/F01a-studio` | La escena se ve y respira; el botón Iniciar mueve la cámara |
| 3 | 1B · Platform selection | `1B` | `feature/F01b-platforms` | Las 5 plataformas se eligen con ratón y con teclado |
| 4 | 1C · Personaje, cámara y workspace | `1C` | `feature/F01c-character-workspace` | El personaje recoge y coloca; morph; brief; Generate activo |
| 5 | 1D · Mock generation y resultado | `1D` | `feature/F01d-mock-result` | **Producto completo con mocks + GIF grabado** |
| 6 | F2 · Backend foundation | `F2` | `feature/F02-backend-foundation` | FastAPI con las 6 responsabilidades y las 5 plataformas |
| 7 | F3 · Prompt engineering | `F3` | `feature/F03-prompt-engineering` | Composición en 9 capas, testeada sin LLM |
| 8 | F4 · LLM integration | `F4` | `feature/F04-llm-integration` | Groq real detrás de un contrato intercambiable |
| 9 | F5 · React + FastAPI | `F5` | `feature/F05-integration` | Los mocks se borran; la app genera contenido real |
| 10 | F6 · Testing | `F6` | `feature/F06-testing` | Cobertura, QA manual, rendimiento, teclado |
| 11 | F8 · Documentación y entrega | `F8` | `feature/F08-docs-delivery` | README, docs técnicas, Medium, presentación |
| 12 | F9 · Despliegue | `F9` | *(sin fecha)* | Dockerfile, compose, vídeo. **Fuera de la entrega** |
| 13 | Auditoría de secretos → repo público | `F6` | `feature/F06-testing` | Historial limpio antes de hacer el repo público |
| 14 | Demo ensayada + plan de contingencia | `F8` | `feature/F08-docs-delivery` | 3 ensayos; plan A Groq / B FakeProvider / C vídeo |

---

## Hitos que se marcan en el tablero

| Día | Fecha | Tarjeta | Tag |
|---|---|---|---|
| 1 | mié 30 sep | #1 F0 a `Done` | `v0.1.0-scaffold` |
| 3 | vie 2 oct | #2 1A a `Done` | `v0.2.0-studio` · `v0.2.1-platforms` |
| 5 | dom 4 oct | #4 1C a `Done` | `v0.2.3-workspace` |
| **6** | **lun 5 oct** | **#5 1D a `Done`** 🎯 | **`v0.2.4-experience`** |
| 7 | mar 6 oct | #6 F2 a `Done` | `v0.3.0-backend` |
| 8 | mié 7 oct | #7 F3 a `Done` | `v0.4.0-prompts` |
| 9 | jue 8 oct | #8 F4 a `Done` | `v0.5.0-llm` |
| 10 | vie 9 oct | #9 F5 a `Done` | `v0.6.0-integration` |
| 11 | sáb 10 oct | #10 y #13 a `Done` | `v0.7.0-quality` |
| **14** | **mar 13 oct** | **#11 a `Done`** | **`v1.0.0-trazo`** |

> **`v0.2.4-experience` (día 6) es el hito de seguridad.** Es el punto de control duro:
> si el día 6 no hay GIF, se aplica la caja de seguridad del plan y se reprioriza el resto.
> No se sigue añadiendo pulido.

---

## Etiquetas en el tablero

- 🚧 `In progress` — trabajo en curso
- 🔍 `Review` — esperando revisión y merge
- ⛔ `Blocked` — no puede avanzar; anota el motivo en la descripción
- ✅ `Done` — mergeada, con su tag
- 🔴 Sin tag y en `Done` → **algo se ha saltado la regla**. Chécksalo.
