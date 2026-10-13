/**
 * TRAZO · BlurText — tipografía animada.
 *
 * Equivalente del componente gratuito `BlurText` de React Bits
 * (licencia MIT + Commons Clause: los glifos se revelan con recuento
 * y desenfoque). Aquí se implementa con `motion/react`, que ya es
 * dependencia del proyecto: no hace falta instalar `react-bits`.
 *
 * Reglas del ticket: nada de SVG; `prefers-reduced-motion` muestra el
 * texto estático sin recorrido.
 */
import { motion, useReducedMotion } from 'motion/react';

type BlurTextProps = {
  text: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
  className?: string;
  /** Revelar por palabras o por caracteres. */
  animateBy?: 'words' | 'chars';
  /** Retardo inicial, en segundos. */
  delay?: number;
  /** Retardo entre unidades, en segundos. */
  speed?: number;
};

export function BlurText({
  text,
  as = 'h1',
  className,
  animateBy = 'words',
  delay = 0,
  speed = 0.06,
}: BlurTextProps) {
  const reduced = useReducedMotion() === true;
  const Tag = as;
  const unidades = animateBy === 'words' ? text.split(' ') : Array.from(text);

  return (
    <Tag className={className}>
      {unidades.map((unidad, i) => (
        <motion.span
          key={`${unidad}-${i}`}
          className="blurtext__unit"
          initial={reduced ? false : { opacity: 0, y: 22, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: reduced ? 0 : 0.6,
            delay: reduced ? 0 : delay + i * speed,
            ease: 'easeOut',
          }}
        >
          {unidad}
          {animateBy === 'words' && i < unidades.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}