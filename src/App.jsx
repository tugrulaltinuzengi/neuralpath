import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useStore } from "./store/useStore.js";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Lesson from "./pages/Lesson.jsx";
import Quiz from "./pages/Quiz.jsx";
import Project from "./pages/Project.jsx";
import Progress from "./pages/Progress.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import ColabGuide from "./pages/ColabGuide.jsx";
import Curriculum from "./pages/Curriculum.jsx";
import Onboarding from "./pages/Onboarding.jsx";

export default function App() {
  const ready = useStore((s) => s.ready);
  const onboarded = useStore((s) => s.onboarded);
  const init = useStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center" style={{ color: "var(--text-muted)" }}>
        <span className="font-display animate-pulse">Loading NeuralPath…</span>
      </div>
    );
  }

  if (!onboarded) {
    return <Onboarding />;
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <RoutedContent />
      </main>
    </div>
  );
}

// Keyed by pathname so navigating to a new route clears a previous error state.
function RoutedContent() {
  const location = useLocation();
  return (
    <ErrorBoundary key={location.pathname}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/curriculum" element={<Curriculum />} />
        <Route path="/lesson/:topicId" element={<Lesson />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz/:topicId" element={<Quiz />} />
        <Route path="/projects" element={<Project />} />
        <Route path="/projects/:phase/:week" element={<Project />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/colab" element={<ColabGuide />} />
      </Routes>
    </ErrorBoundary>
  );
}
