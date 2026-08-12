import Home from "./Home";
import ErrorBoundary from "./components/ErrorBoundary";
import { MotionConfig } from "framer-motion";
import type { WritingSummary } from "./lib/writing";

interface AppProps {
  readonly latestWriting: readonly WritingSummary[];
}

function App({ latestWriting }: AppProps) {
  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <Home latestWriting={latestWriting} />
      </ErrorBoundary>
    </MotionConfig>
  );
}

export default App;
