import { Box, Text, render, useApp, useInput } from "ink"
import React, { useState } from "react"

import type { InitOutcome, InitPreview } from "./init"
import type { InitWizardState, WizardStepId } from "./init-wizard-state"

import { previewInit, runInit } from "./init"
import {
  createDefaultWizardState,
  getStepAnswerSummary,
  toInitOptions,
  WIZARD_STEPS,
} from "./init-wizard-state"

const HIGHLIGHT = "cyan"
const MUTED = "gray"
const SUCCESS = "green"
const WARNING = "yellow"

export async function runInitWizard(
  cwd: string,
  options: { force?: boolean } = {},
): Promise<InitOutcome | null> {
  return await new Promise((resolve, reject) => {
    const app = render(
      <InitWizard
        cwd={cwd}
        force={options.force ?? false}
        onCancel={() => {
          app.unmount()
          resolve(null)
        }}
        onError={(error) => {
          app.unmount()
          reject(error)
        }}
        onSubmit={(outcome) => {
          app.unmount()
          resolve(outcome)
        }}
      />,
    )
  })
}

function InitWizard({
  cwd,
  force: initialForce,
  onCancel,
  onError,
  onSubmit,
}: {
  cwd: string
  force: boolean
  onCancel: () => void
  onError: (error: Error) => void
  onSubmit: (outcome: InitOutcome) => void
}) {
  const { exit } = useApp()
  const [cursorIndex, setCursorIndex] = useState(0)
  const [force, setForce] = useState(initialForce)
  const [stepIndex, setStepIndex] = useState(0)
  const [state, setState] = useState<InitWizardState>(createDefaultWizardState)
  const currentStep = WIZARD_STEPS[stepIndex]
  const preview = getPreview(cwd, state, force)
  const canForceConflicts = Boolean(
    preview
    && preview.conflicts.length > 0
    && preview.conflicts.every((conflict) => conflict.canForce),
  )
  const canSubmit = currentStep.id !== "review"
    || Boolean(
      preview
      && (
        preview.conflicts.length === 0
        || (force && canForceConflicts)
      ),
    )

  useInput((input, key) => {
    if (key.escape || input === "q") {
      onCancel()
      exit()
      return
    }

    if (input === "b" && stepIndex > 0) {
      setStepIndex(stepIndex - 1)
      setCursorIndex(0)
      return
    }

    if (currentStep.id === "review") {
      if (input === "f" && canForceConflicts) {
        setForce((current) => !current)
        return
      }

      if (key.return) {
        if (!canSubmit) {
          return
        }

        try {
          const outcome = runInit({ ...toInitOptions(cwd, state), force })
          onSubmit(outcome)
          exit()
        } catch (error) {
          onError(error instanceof Error ? error : new Error(String(error)))
          exit()
        }
      }
      return
    }

    const optionCount = getOptionCount(currentStep.id)

    if (key.upArrow) {
      setCursorIndex((current) => Math.max(0, current - 1))
      return
    }

    if (key.downArrow) {
      setCursorIndex((current) => Math.min(optionCount - 1, current + 1))
      return
    }

    if (input === " ") {
      setState((current) => toggleOption(currentStep.id, cursorIndex, current))
      return
    }

    if (key.return) {
      setState((current) => confirmOption(currentStep.id, cursorIndex, current))
      setStepIndex((current) => Math.min(WIZARD_STEPS.length - 1, current + 1))
      setCursorIndex(0)
    }
  })

  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Text color={HIGHLIGHT}>eslint-config-setup init</Text>
      <Text color={MUTED}>Guided setup for lint, OxLint, editor, agent, and hook companions.</Text>
      <StepProgress stepIndex={stepIndex} totalSteps={WIZARD_STEPS.length} />
      <Box marginTop={1}>
        <Box flexDirection="column" marginRight={4} width={44}>
          {WIZARD_STEPS.map((step, index) => (
            <TimelineStep
              isActive={index === stepIndex}
              isCompleted={index < stepIndex}
              key={step.id}
              question={step.question}
              summary={index < stepIndex ? getStepAnswerSummary(step.id, state) : undefined}
            />
          ))}
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Text color={HIGHLIGHT}>{currentStep.question}</Text>
          {currentStep.id !== "review" && (
            <Text color={MUTED}>
              Current selection: {getStepAnswerSummary(currentStep.id, state)}
            </Text>
          )}
          <Box marginTop={1} flexDirection="column">
            {currentStep.id === "profile" && (
              <MultiSelectStep
                cursorIndex={cursorIndex}
                options={[
                  { enabled: state.react, label: "React" },
                  { enabled: state.node, label: "Node.js" },
                  { enabled: state.ai, label: "AI mode" },
                  { enabled: state.oxlint, label: "OxLint" },
                ]}
              />
            )}
            {currentStep.id === "formatter" && (
              <SingleSelectStep
                cursorIndex={cursorIndex}
                options={[
                  { active: state.formatter === "none", label: "No formatter companion" },
                  { active: state.formatter === "oxfmt", label: "oxfmt" },
                ]}
              />
            )}
            {currentStep.id === "editor" && (
              <MultiSelectStep
                cursorIndex={cursorIndex}
                options={[
                  { enabled: state.vscode, label: "VS Code settings" },
                ]}
              />
            )}
            {currentStep.id === "agents" && (
              <MultiSelectStep
                cursorIndex={cursorIndex}
                options={[
                  { enabled: state.agents, label: "AGENTS.md quality gate file" },
                ]}
              />
            )}
            {currentStep.id === "hooks" && (
              <MultiSelectStep
                cursorIndex={cursorIndex}
                options={[
                  { enabled: state.hooks, label: "Pre-commit hook scaffold" },
                ]}
              />
            )}
            {currentStep.id === "install" && (
              <SingleSelectStep
                cursorIndex={cursorIndex}
                options={[
                  { active: !state.install, label: "Print install command only" },
                  { active: state.install, label: "Install dependencies now" },
                ]}
              />
            )}
            {currentStep.id === "review" && (
              <ReviewStep
                canForceConflicts={canForceConflicts}
                force={force}
                preview={preview}
                state={state}
              />
            )}
          </Box>
        </Box>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color={MUTED}>
          {getFooterHint(currentStep.id, {
            canForceConflicts,
            canSubmit,
            force,
          })}
        </Text>
      </Box>
    </Box>
  )
}

function getPreview(
  cwd: string,
  state: InitWizardState,
  force: boolean,
): InitPreview | null {
  try {
    return previewInit({ ...toInitOptions(cwd, state), dryRun: true, force })
  } catch {
    return null
  }
}

function TimelineStep({
  isActive,
  isCompleted,
  question,
  summary,
}: {
  isActive: boolean
  isCompleted: boolean
  question: string
  summary?: string
}) {
  const marker = isActive ? "◆" : "◇"
  const color = isActive || isCompleted ? HIGHLIGHT : MUTED

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={color}>{marker} {question}</Text>
      {summary ? (
        <Text color={MUTED}>│ {summary}</Text>
      ) : (
        <Text color={MUTED}>│</Text>
      )}
    </Box>
  )
}

function StepProgress({
  stepIndex,
  totalSteps,
}: {
  stepIndex: number
  totalSteps: number
}) {
  const currentStep = stepIndex + 1
  const filled = Math.max(1, Math.round((currentStep / totalSteps) * 16))

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={MUTED}>Step {currentStep}/{totalSteps}</Text>
      <Text color={HIGHLIGHT}>
        {"█".repeat(filled)}
        <Text color={MUTED}>{"░".repeat(Math.max(0, 16 - filled))}</Text>
      </Text>
    </Box>
  )
}

function MultiSelectStep({
  cursorIndex,
  options,
}: {
  cursorIndex: number
  options: Array<{ enabled: boolean; label: string }>
}) {
  return (
    <Box flexDirection="column">
      {options.map((option, index) => (
        <OptionRow
          isActive={cursorIndex === index}
          key={option.label}
          marker={option.enabled ? "[x]" : "[ ]"}
          text={option.label}
        />
      ))}
    </Box>
  )
}

function OptionRow({
  isActive,
  marker,
  text,
}: {
  isActive: boolean
  marker: string
  text: string
}) {
  return (
    <Text color={isActive ? HIGHLIGHT : undefined}>
      {isActive ? ">" : " "} {marker} {text}
    </Text>
  )
}

function ReviewStep({
  canForceConflicts,
  preview,
  force,
  state,
}: {
  canForceConflicts: boolean
  force: boolean
  preview: InitPreview | null
  state: InitWizardState
}) {
  const replaceableConflicts = preview?.conflicts.filter((conflict) => conflict.canForce) ?? []
  const blockingConflicts = preview?.conflicts.filter((conflict) => !conflict.canForce) ?? []

  return (
    <Box flexDirection="column">
      <Text>Profile: {getStepAnswerSummary("profile", state)}</Text>
      <Text>Formatter: {getStepAnswerSummary("formatter", state)}</Text>
      <Text>Editor: {getStepAnswerSummary("editor", state)}</Text>
      <Text>Agents: {getStepAnswerSummary("agents", state)}</Text>
      <Text>Hooks: {getStepAnswerSummary("hooks", state)}</Text>
      <Text>Install: {getStepAnswerSummary("install", state)}</Text>
      {preview ? (
        <>
          <Text color={HIGHLIGHT}>Review summary</Text>
          <Text color={MUTED}>Write targets: {preview.fileChanges.length}</Text>
          <Text color={MUTED}>Script changes: {preview.scriptChanges.length}</Text>
          <Text color={MUTED}>
            Dependencies to install: {preview.dependencyChanges.filter((dependency) => dependency.action === "install").length}
          </Text>
          <Text color={force ? "yellow" : MUTED}>
            Overwrite mode: {force ? "enabled" : "disabled"}
            {canForceConflicts ? " (press f to toggle)" : ""}
          </Text>
          {replaceableConflicts.length > 0 && (
            <>
              <Text color={force ? "yellow" : "red"}>
                Replaceable targets ({replaceableConflicts.length})
              </Text>
              {replaceableConflicts.map((conflict) => (
                <Text key={conflict.message} color={MUTED}>- {conflict.message}</Text>
              ))}
            </>
          )}
          {blockingConflicts.length > 0 && (
            <>
              <Text color="red">Blocking conflicts ({blockingConflicts.length})</Text>
              {blockingConflicts.map((conflict) => (
                <Text key={conflict.message} color={MUTED}>- {conflict.message}</Text>
              ))}
            </>
          )}
          <Text color={HIGHLIGHT}>File plan</Text>
          {preview.fileChanges.length > 0 ? (
            preview.fileChanges.map((file) => (
              <Text key={file.filepath} color={MUTED}>
                {formatFileChange(file.action)} {file.filepath}
              </Text>
            ))
          ) : (
            <Text color={MUTED}>No file writes are needed for the selected setup.</Text>
          )}
          <Text color={HIGHLIGHT}>Script plan</Text>
          {preview.scriptChanges.length > 0 ? (
            preview.scriptChanges.map((script) => (
              <Text key={script.name} color={MUTED}>
                {script.action === "add" ? "add" : "update"} script {script.name}
              </Text>
            ))
          ) : (
            <Text color={MUTED}>Generated scripts already match the current package.json.</Text>
          )}
          <Text color={HIGHLIGHT}>Dependency plan</Text>
          {preview.dependencyChanges.map((dependency) => (
            <Text
              color={dependency.action === "install" ? SUCCESS : MUTED}
              key={dependency.name}
            >
              {dependency.action === "install" ? "install" : "reuse"} {dependency.name}
            </Text>
          ))}
          {preview.installNeeded && !state.install && (
            <>
              <Text color={HIGHLIGHT}>Next step</Text>
              <Text color={MUTED}>{preview.installCommand}</Text>
            </>
          )}
          {!preview.installNeeded && (
            <>
              <Text color={HIGHLIGHT}>Dependencies</Text>
              <Text color={MUTED}>All required dependencies are already present.</Text>
            </>
          )}
        </>
      ) : (
        <Text color="red">Unable to preview the generated setup. Make sure package.json exists.</Text>
      )}
    </Box>
  )
}

function SingleSelectStep({
  cursorIndex,
  options,
}: {
  cursorIndex: number
  options: Array<{ active: boolean; label: string }>
}) {
  return (
    <Box flexDirection="column">
      {options.map((option, index) => (
        <OptionRow
          isActive={cursorIndex === index}
          key={option.label}
          marker={option.active ? "(*)" : "( )"}
          text={option.label}
        />
      ))}
    </Box>
  )
}

function confirmOption(
  stepId: WizardStepId,
  cursorIndex: number,
  state: InitWizardState,
): InitWizardState {
  switch (stepId) {
    case "formatter":
      return { ...state, formatter: cursorIndex === 1 ? "oxfmt" : "none" }
    case "install":
      return { ...state, install: cursorIndex === 1 }
    default:
      return state
  }
}

function getOptionCount(stepId: WizardStepId): number {
  switch (stepId) {
    case "profile":
      return 4
    case "formatter":
      return 2
    case "editor":
    case "agents":
    case "hooks":
      return 1
    case "install":
      return 2
    case "review":
      return 0
  }
}

function toggleOption(
  stepId: WizardStepId,
  cursorIndex: number,
  state: InitWizardState,
): InitWizardState {
  switch (stepId) {
    case "profile":
      if (cursorIndex === 0) return { ...state, react: !state.react }
      if (cursorIndex === 1) return { ...state, node: !state.node }
      if (cursorIndex === 2) return { ...state, ai: !state.ai }
      return { ...state, oxlint: !state.oxlint }
    case "editor":
      return { ...state, vscode: !state.vscode }
    case "agents":
      return { ...state, agents: !state.agents }
    case "hooks":
      return { ...state, hooks: !state.hooks }
    default:
      return state
  }
}

function getFooterHint(
  stepId: WizardStepId,
  options: {
    canForceConflicts: boolean
    canSubmit: boolean
    force: boolean
  },
): string {
  if (stepId !== "review") {
    return "Up/Down to move. Space toggles multi-select. Enter confirms. Press b to go back."
  }

  if (options.canSubmit) {
    if (options.canForceConflicts) {
      return "Enter to write files. Press f to toggle overwrite mode. Press b to go back. Press q or Esc to cancel."
    }

    return "Enter to write files. Press b to go back. Press q or Esc to cancel."
  }

  if (options.canForceConflicts && !options.force) {
    return "Press f to enable overwrite mode, or press b to go back."
  }

  return "Resolve the listed conflicts before writing files. Press b to go back."
}

function formatFileChange(action: "create" | "merge" | "update"): string {
  switch (action) {
    case "create":
      return "create"
    case "merge":
      return "merge "
    case "update":
      return "update"
  }
}
