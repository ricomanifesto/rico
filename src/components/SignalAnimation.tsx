import type { CSSProperties } from "react";
import { signalAnimationBehavior } from "../content/hero";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type SignalParticleStyle = CSSProperties & {
  "--signal-delay": string;
  "--signal-resolve-x": string;
  "--signal-resolve-y": string;
};

export default function SignalAnimation() {
  const shouldReduceMotion = usePrefersReducedMotion();

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 520 360"
      className="signal-graphic"
      data-testid="signal-graphic"
      data-motion={shouldReduceMotion ? "reduced" : "animated"}
      style={{ "--signal-cycle": `${signalAnimationBehavior.cycleDurationSeconds}s` } as CSSProperties}
    >
      <path
        className="signal-guide"
        d="M 38 180 C 96 180, 112 180, 150 180"
      />
      <line
        className="signal-line"
        data-testid="signal-line"
        x1="150"
        y1="180"
        x2="470"
        y2="180"
      />
      <circle className="signal-terminal" cx="470" cy="180" r="5" />

      {signalAnimationBehavior.points.map((point, index) => {
        const style: SignalParticleStyle = {
          "--signal-delay": `${point.delaySeconds}s`,
          "--signal-resolve-x": `${point.signalX - point.noiseX}px`,
          "--signal-resolve-y": `${point.signalY - point.noiseY}px`,
        };

        return (
          <g
            key={`${point.noiseX}-${point.noiseY}`}
            className="signal-particle"
            data-testid="signal-particle"
            style={style}
          >
            <circle
              cx={point.noiseX}
              cy={point.noiseY}
              r={index % 4 === 0 ? 5 : 3.5}
            />
          </g>
        );
      })}
    </svg>
  );
}
