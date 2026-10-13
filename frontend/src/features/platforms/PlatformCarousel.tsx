/**
 * TRAZO · carrusel de plataformas (Etapa 2 · rediseño del selector).
 *
 * Reemplaza a los tokens clicables de la balda como forma de elegir:
 * la tarjeta del centro es la selección, las laterales asoman con
 * profundidad (escala, giro y opacidad) y se acercan con el arrastre.
 * Vive en la capa `Ui` —no dentro del mundo escalado— y solo se monta
 * cuando la cámara ya llegó a `SHELF_SELECTION`.
 *
 * La interacción es la descrita en la propuesta aprobada:
 *   · el centro se elige con un toque (o Enter),
 *   · las laterales se traen al centro arrastrando, con flechas, con
 *     las teclas ←/→ o pulsando su punto,
 *   · «Continuar» confirma sobre la tarjeta central.
 *
 * Reglas del ticket: sin temporizadores, sin dependencias nuevas y con
 * `prefers-reduced-motion`: en modo reducido las tarjetas cambian sin
 * muelle ni recorrido.
 */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

import { ORDEN_EN_ESTANTERIA } from '../../scene/geometry';
import { getPlatform, type PlatformId } from '../../data/platforms';
import { useSceneStore } from '../../store/sceneStore';
import { TIMINGS } from '../../store/timings';
import { PlatformCard } from './PlatformCard';

/** Paso entre tarjetas: ancho de tarjeta más la separación. */
const GAP = 18;
/** Muelle de las tarjetas al cambiar de centro. */
const SPRING = { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 } as const;
/** Arrastre mínimo en píxeles para contar como gesto y no como toque. */
const DRAG_THRESHOLD = 6;

function clamp(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

const RETRATO = 287 / 497;

/** Ancho de tarjeta según el viewport, limitado por el retrato más alto. */
function cardWidthFor(vw: number, vh: number): number {
  const porAltura = vh * 0.5 * RETRATO;
  const porAncho = vw * 0.26;
  return Math.round(clamp(Math.min(porAltura, porAncho), 148, 340));
}

/**
 * Tarjeta inicial del carrusel. Si el store ya trae una plataforma
 * elegida (por volver atrás desde Tema), el carrusel arranca ahí;
 * si no, en el centro (Instagram).
 */
export function initialActiveFor(
  selected: PlatformId | null,
  orden: readonly PlatformId[] = ORDEN_EN_ESTANTERIA,
): number {
  const i = selected ? orden.indexOf(selected) : -1;
  return i >= 0 ? i : 0;
}

export function PlatformCarousel() {
  const select = useSceneStore((s) => s.select);
  const selected = useSceneStore((s) => s.selected);
  const reduced = useReducedMotion() === true;

  const [cardW, setCardW] = useState(() =>
    typeof window === 'undefined' ? 260 : cardWidthFor(window.innerWidth, window.innerHeight),
  );
  const [active, setActive] = useState(() => initialActiveFor(selected));
  const [drag, setDrag] = useState<number | null>(null);
  const [entered, setEntered] = useState(false);

  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const gesture = useRef<{ x: number; active: number } | null>(null);
  const suppressClick = useRef(false);

  const n = ORDEN_EN_ESTANTERIA.length;
  const step = cardW + GAP;

  /* El arrastre escucha en `window`: si el dedo sale del escenario, el
     gesto sigue vivo hasta soltar. Mientras arrastra no hay muelle. */
  useEffect(() => {
    if (drag === null) return;
    const onMove = (e: PointerEvent) => {
      const g = gesture.current;
      if (!g) return;
      setDrag(e.clientX - g.x);
    };
    const onUp = (e: PointerEvent) => {
      const g = gesture.current;
      gesture.current = null;
      setDrag(null);
      if (!g) return;
      const delta = e.clientX - g.x;
      suppressClick.current = Math.abs(delta) >= DRAG_THRESHOLD;
      const destino = clamp(Math.round(g.active - delta / step), 0, n - 1);
      setActive((prev) => (destino === prev ? prev : destino));
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [drag, step, n]);

  useEffect(() => {
    const onResize = () => setCardW(cardWidthFor(window.innerWidth, window.innerHeight));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Retardo de entrada encadenado solo al montar; después, 0. */
  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 40);
    return () => window.clearTimeout(t);
  }, []);

  const p = drag === null ? active : active - drag / step;
  const confirmar = () => select(ORDEN_EN_ESTANTERIA[active]!);

  const onStageClick = (e: ReactMouseEvent<HTMLElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const centro = rect.left + rect.width / 2;
    const i = clamp(Math.round(active + (e.clientX - centro) / step), 0, n - 1);
    if (i === active) {
      select(ORDEN_EN_ESTANTERIA[i]!);
    } else {
      setActive(i);
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    gesture.current = { x: e.clientX, active: activeRef.current };
    setDrag(0);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActive((prev) => Math.min(n - 1, prev + 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      confirmar();
    }
  };

  return (
    <motion.div
      key="platform-carousel"
      className="platform-carousel"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0, scale: 1.03, y: -14 }}
      transition={{ duration: reduced ? 0 : TIMINGS.panel, ease: 'easeOut' }}
    >
        <div
          className="platform-carousel__stage"
          tabIndex={0}
          onPointerDown={onPointerDown}
          onClick={onStageClick}
          onKeyDown={onKeyDown}
        >
          <div className="platform-carousel__belt">
            {ORDEN_EN_ESTANTERIA.map((id, i) => {
              const plataforma = getPlatform(id);
              const d = i - p;
              const dist = Math.abs(d);
              const escala = 1 - 0.14 * Math.min(dist, 1) - 0.1 * Math.max(0, dist - 1);
              const giro = Math.max(-1, Math.min(1, d)) * 14;
              const opacidad = 1 - 0.28 * Math.min(dist, 1) - 0.18 * Math.max(0, dist - 1);
              const transicion = reduced || drag !== null
                ? { duration: 0 }
                : { ...SPRING, delay: entered ? 0 : Math.min(dist, 3) * 0.07 };

              return (
                <motion.div
                  key={id}
                  className="platform-carousel__card"
                  role="group"
                  aria-label={plataforma.name}
                  aria-current={Math.abs(i - active) < 0.5 ? 'true' : undefined}
                  style={
                    {
                      zIndex: 100 - Math.round(dist) * 4,
                      width: cardW,
                      '--pc-w': `${cardW}px`,
                      '--pc-aspect': String(plataforma.card.aspect),
                    } as CSSProperties
                  }
                  initial={
                    reduced
                      ? false
                      : {
                          opacity: 0,
                          x: (i - p) * step + Math.sign(i - active) * 90,
                          scale: 0.62,
                          y: 70,
                        }
                  }
                  animate={{ opacity: opacidad, x: d * step, scale: escala, rotateY: giro, y: dist * 10 }}
                  transition={transicion}
                >
                  <div className="platform-carousel__center">
                    <PlatformCard platform={plataforma} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="platform-carousel__kicker">Elige una plataforma</p>

        <button
          type="button"
          className="platform-carousel__arrow platform-carousel__arrow--prev"
          aria-label="Plataforma anterior"
          onClick={() => setActive((prev) => Math.max(0, prev - 1))}
          disabled={active <= 0}
        >
          ‹
        </button>
        <button
          type="button"
          className="platform-carousel__arrow platform-carousel__arrow--next"
          aria-label="Plataforma siguiente"
          onClick={() => setActive((prev) => Math.min(n - 1, prev + 1))}
          disabled={active >= n - 1}
        >
          ›
        </button>

        <div className="platform-carousel__foot">
          <p className="platform-carousel__hint">El centro se elige con un toque · ← → o arrastra</p>
          <div className="platform-carousel__tools">
            <div className="platform-carousel__dots" role="tablist" aria-label="Posiciones del carrusel">
              {ORDEN_EN_ESTANTERIA.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  className="platform-carousel__dot"
                  aria-label={`Ir a ${getPlatform(id).name}`}
                  aria-current={i === active ? 'true' : undefined}
                  style={{ '--dot': getPlatform(id).color } as CSSProperties}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>

            <motion.button
              type="button"
              className="btn"
              onClick={confirmar}
              whileHover={reduced ? undefined : { scale: 1.04 }}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              Continuar con {getPlatform(ORDEN_EN_ESTANTERIA[active]!).name}
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </motion.button>
          </div>
        </div>
    </motion.div>
  );
}