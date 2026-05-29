import { useEffect, useState } from "react";
import { useStore } from "../store/useStore.js";
import { ArrowRight, Check, Loader2, ExternalLink } from "lucide-react";

const api = window.api;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [testState, setTestState] = useState("idle"); // idle | testing | ok | error
  const [testMsg, setTestMsg] = useState("");
  const [goal, setGoal] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);

  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const addGoal = useStore((s) => s.addGoal);
  const checkApiKey = useStore((s) => s.checkApiKey);

  // Prefill the API key field if one is already on disk (config.json or DB).
  // Lets users recover from a stuck post-onboarding state without retyping.
  useEffect(() => {
    (async () => {
      const existing = await api.configGet("ANTHROPIC_API_KEY");
      if (existing) setApiKey(existing);
    })();
  }, []);

  async function testConnection() {
    setTestState("testing");
    await api.configSet("ANTHROPIC_API_KEY", apiKey.trim());
    const res = await api.claudeTest();
    if (res.ok) {
      setTestState("ok");
      setTestMsg("Connection successful.");
    } else {
      setTestState("error");
      setTestMsg(res.error || "Connection failed.");
    }
  }

  async function finish() {
    setSaving(true);
    if (apiKey.trim()) await api.configSet("ANTHROPIC_API_KEY", apiKey.trim());
    if (goal.trim()) await addGoal(goal.trim(), targetDate);
    await checkApiKey();
    await completeOnboarding(name.trim() || "Learner");
  }

  return (
    <div className="flex h-full items-center justify-center p-8" style={{ background: "var(--bg-base)" }}>
      <div className="np-card w-full max-w-xl p-8">
        {/* Progress dots */}
        <div className="mb-6 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded"
              style={{ background: i <= step ? "var(--accent)" : "var(--border)" }}
            />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h1 className="mb-2 font-display text-2xl font-bold">Welcome to NeuralPath</h1>
            <p className="mb-6" style={{ color: "var(--text-muted)" }}>
              Your PhD-level AI/ML training system. 21 weeks, 105 lessons, adaptive quizzes, and weekly projects —
              from linear algebra to research-frontier topics.
            </p>
            <label className="mb-2 block font-display text-sm">What should we call you?</label>
            <input
              className="np-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="mt-6 flex justify-end">
              <button className="np-btn np-btn-primary" onClick={() => setStep(1)}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="mb-2 font-display text-2xl font-bold">Connect Claude</h1>
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>
              NeuralPath uses the Anthropic Claude API to generate personalized quizzes, grade your answers, and
              review your projects. Your key is stored locally and never leaves your machine except to call the API.
            </p>
            <a
              className="mb-4 inline-flex items-center gap-1 text-sm"
              style={{ color: "var(--accent)" }}
              onClick={() => api.openExternal("https://console.anthropic.com/settings/keys")}
            >
              Get an API key at console.anthropic.com <ExternalLink size={13} />
            </a>
            <input
              className="np-input mt-2 font-code"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestState("idle");
              }}
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                className="np-btn np-btn-secondary"
                disabled={!apiKey.trim() || testState === "testing"}
                onClick={testConnection}
              >
                {testState === "testing" ? <Loader2 size={16} className="animate-spin" /> : null}
                Test Connection
              </button>
              {testState === "ok" && (
                <span className="flex items-center gap-1 text-sm" style={{ color: "var(--accent-green)" }}>
                  <Check size={15} /> {testMsg}
                </span>
              )}
              {testState === "error" && (
                <span className="text-sm" style={{ color: "var(--accent-red)" }}>
                  {testMsg}
                </span>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <button className="np-btn np-btn-secondary" onClick={() => setStep(0)}>
                Back
              </button>
              <button className="np-btn np-btn-primary" onClick={() => setStep(2)}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="mb-2 font-display text-2xl font-bold">Set your goal</h1>
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>
              What do you want to achieve? This anchors your portfolio and progress tracking.
            </p>
            <textarea
              className="np-input min-h-[100px] resize-y"
              placeholder="e.g. Become research-ready in computer vision and land an ML engineering role"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <label className="mb-1 mt-4 block font-display text-sm">Target completion date</label>
            <input
              type="date"
              className="np-input"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
            <div className="mt-6 flex justify-between">
              <button className="np-btn np-btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="np-btn np-btn-primary" onClick={finish} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Start Learning <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
