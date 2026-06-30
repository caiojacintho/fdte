import { PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export function useBoardSensors() {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 6 },
  });
  return useSensors(pointerSensor, touchSensor);
}
