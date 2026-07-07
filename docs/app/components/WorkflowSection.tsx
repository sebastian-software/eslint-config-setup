const workflowSteps = [
  {
    label: "AI agent writes code",
    title: "Generation starts fast",
    description:
      "Agents can create React, Node.js, or shared TypeScript code without each project hand-wiring the same plugin stack.",
  },
  {
    label: "Editor lint feedback",
    title: "Guardrails show up locally",
    description:
      "AI mode tightens explicit types, naming, magic values, and complexity while pre-generated configs keep the editor path deterministic.",
  },
  {
    label: "CI enforcement",
    title: "The same rules ship",
    description:
      "CI consumes the same resolved config, and OxLint can take the fast path for supported rules without duplicate ESLint diagnostics.",
  },
]

export function WorkflowSection() {
  return (
    <section className="hp-section hp-workflow-section">
      <div className="hp-container">
        <h2 className="hp-section-title hp-animate">
          From generated code to enforced quality
        </h2>
        <p className="hp-section-subtitle hp-animate">
          The config is designed for the loop teams actually run: agent output,
          editor feedback, and the CI gate all reading the same decisions.
        </p>
        <div className="hp-workflow hp-stagger">
          {workflowSteps.map((step, index) => (
            <div className="hp-workflow-step hp-animate" key={step.label}>
              <div className="hp-workflow-index">{index + 1}</div>
              <div>
                <div className="hp-workflow-label">{step.label}</div>
                <h3 className="hp-workflow-title">{step.title}</h3>
                <p className="hp-workflow-copy">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
