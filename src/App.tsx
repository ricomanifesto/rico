import Home from "./Home";
import ErrorBoundary from "./components/ErrorBoundary";
import { MotionConfig } from "framer-motion";

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    </MotionConfig>
  );
}

export default App;
