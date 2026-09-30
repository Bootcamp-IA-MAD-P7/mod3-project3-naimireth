# ADR-0002 · Escena 2.5D en SVG y CSS, sin WebGL

> **Estado**: Aceptada · **Fecha**: 2026-09-30 · **Fase**: F0

---

## Contexto

El briefing pide un personaje de estilo **ilustrado / cartoon** que recoja un icono de
una plataforma y lo lleve a la mesa, con **transiciones de cámara** entre escenas.

Restricciones que importan:

1. **Nada de personas realistas.** Es un personaje ilustrado, no un avatar.
2. El personaje es un **asset propio**, diseñado por el equipo. No hay subdivided mesh,
   ni musculatura, ni materiales PBR.
3. El zoom de cámara es **perceptual**, no un travelling real por un espacio 3D.
4. El presupuesto es de **5 días** para toda la Fase 1.
5. La demo se da desde un portátil, probablemente sin GPU dedicada.

## Opciones consideradas

| Opción | A favor | En contra |
|---|---|---|
| **SVG + CSS 2.5D** (elegida) | SVG es perfecto para un personaje plano ilustrado: se skeletoniza, se deforma y se anima con `transform`; escala sin pérdida; funciona en cualquier portátil; versionable en Git y revisable en un diff | Ninguna cámara 3D real; el parallax y el blur se simulan |
| Three.js / React Three Fiber | Cámara 3D real, iluminación, sombras blandas, transiciones de travelling auténticas | Contradice la restricción explícita de evitar WebGL; necesita modelos y assets; |

❌ **descartado explícitamente**

| | |
|---|---|
| Three.js / R3F | El briefing pide evitar WebGL · el presupuesto no da para modelar, texturizar y optimizar · demo frágil sin GPU |
| Personajes 3D realistic | El briefing dice explícitamente que **no** |
| Vídeo pregrabado de la animación | No es una aplicación, es un vídeo. El usuario no puede interactuar |

## Decisión

**La escena se construye en SVG y CSS. Sin Three.js, sin WebGL, sin R3F, sin modelos 3D.**

La profundidad se simula con capas apiladas en `z`, una `perspective` sutil en el contenedor,
`filter: blur` en los planos del fondo y sombras proyectadas.

**Presupuesto de dibujo del personaje:** un único `character.svg` con grupos anidados
`head`, `torso`, `arm-left`, `arm-right`, `leg-left`, `leg-right` — **máximo 8 SVG
propios** en total. Monogramas geométricos para los iconos de plataforma, **nunca
logotipos oficiales** (D-01).

**El zoom de cámara es una transición de `transform: scale` + `translate` con
desenfoque del fondo**, no un travelling en un espacio 3D.

**Rendimiento:** solo `transform` y `opacity` en las animaciones, **≤ 3 animaciones
simultáneas** y **≤ 60 nodos SVG por componente**. Verificar con CPU throttling antes
de la demo.

## Consecuencias

**A favor**
- El personaje es un archivo de texto: se versiona, se revisa en un diff y se edita sin
  herramientas de modelado
- Rendimiento previsible en cualquier portátil
- Cero dependencias de peso
- Se ve ilustrado, que es lo que pide el briefing

**En contra**
- **No hay cámara 3D real.** El zoom es una aproximación 2D. Nadie lo notará, pero es
  una limitación real
- El parallax y el grano se recortaron del alcance para节省 tiempo (§7 del PLAN)
- El ciclo de caminar se simplificó a **traslación + balanceo**, sin piernas articuladas.
  A tamaño de escena se lee igual. Es el primer candidato a pulir si sobra tiempo

**Deuda técnica asumida**
Si en el futuro se quiere un espacio 3D navegable, esta decisión es la que lo bloquea.
Revertirla afectaría a `scene/` en su totalidad, no a `store/` ni a `features/`.
