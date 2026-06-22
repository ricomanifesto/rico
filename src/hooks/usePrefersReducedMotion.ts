import { useEffect, useState } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function getReducedMotionPreference() {
  return window.matchMedia(reducedMotionQuery).matches;
}

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getReducedMotionPreference);

  useEffect(() => {
    const motionQuery = window.matchMedia(reducedMotionQuery);
    const handleMotionPreferenceChange = () => {
      setPrefersReducedMotion(motionQuery.matches);
    };

    handleMotionPreferenceChange();
    motionQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, []);

  return prefersReducedMotion;
}
