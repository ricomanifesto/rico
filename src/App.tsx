import Home from "./Home";
import ErrorBoundary from "./components/ErrorBoundary";
import type { WritingSummary } from "./lib/writing";

interface AppProps {
  readonly latestWriting: readonly WritingSummary[];
}

function App({ latestWriting }: AppProps) {
  return (
    <ErrorBoundary>
      <Home latestWriting={latestWriting} />
    </ErrorBoundary>
  );
}

export default App;
