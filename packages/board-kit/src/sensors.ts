import { PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export interface UseBoardSensorsOptions {
  /**
   * Whether to also register a TouchSensor for mobile/tablet drag support.
   * Defaults to true (formulario's current behavior). formulario2 is
   * desktop-only and passes `{ touch: false }` to stay pointer-only.
   */
  touch?: boolean;
}

export function useBoardSensors({ touch = true }: UseBoardSensorsOptions = {}) {
  // Both sensors are created unconditionally (hooks must run in the same
  // order every render) — `touch` only controls which ones are handed to
  // useSensors, so an unused TouchSensor never attaches listeners.
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 6 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } });
  return useSensors(...(touch ? [pointerSensor, touchSensor] : [pointerSensor]));
}
