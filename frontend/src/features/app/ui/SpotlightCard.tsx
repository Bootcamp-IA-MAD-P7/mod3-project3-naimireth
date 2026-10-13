/**
 * TRAZO · SpotlightCard — interacción de luz al pasar el puntero.
 *
 * Equivalente del componente gratuito `SpotlightCard` de React Bits
 * (una luz radial sigue al cursor por la tarjeta). Se implementa sin
 * dependencias: un brillo radial CSS que Motion posiciona. Con
 * `prefers-reduced-motion` la luz no se mueve.
 */
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
};

export function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const reduced = useReducedMotion() === true;
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      className={`spotlight ${className}`.trim()}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setPos(null)}
    >
      <motion.div
        className="spotlight__glow"
        aria-hidden="true"
        animate={{
          opacity: pos ? 1 : 0,
          background: pos
            ? `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, rgb(255 143 107 / 24%), transparent 64%)`
            : 'transparent',
        }}
        transition={{ duration: reduced ? 0 : 0.25, ease: 'easeOut' }}
      />
      <div className="spotlight__body">{children}</div>
    </div>
  );
}