import { useEffect, useRef, useState } from "react";

// Long-press hook — fires onLongPress after `ms` of pressing.
export function useLongPress(onLongPress: () => void, ms = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);

  const start = () => {
    setPressing(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
      setPressing(false);
    }, ms);
  };

  const cancel = () => {
    setPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => cancel(), []);

  return {
    pressing,
    handlers: {
      onPointerDown: start,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
    },
  };
}
