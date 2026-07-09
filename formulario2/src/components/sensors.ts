import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

// Desktop-only: só precisamos do ponteiro (mouse/trackpad).
export function useBoardSensors() {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  });
  return useSensors(pointerSensor);
}
