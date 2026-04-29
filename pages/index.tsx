import Head from "next/head";
import * as React from "react";
import { DrinkTile } from "../components/DrinkTile";
import { EditFlow } from "../components/EditFlow";
import { OrderPlayback } from "../components/OrderPlayback";
import { QuestionStep } from "../components/QuestionStep";
import {
  baseDrinkQuestion,
  formatQuestion,
  milkQuestion,
  paymentQuestion,
  strengthQuestion,
  sugarQuestion,
  temperatureQuestion,
  vesselQuestion,
} from "../lib/questions";
import type {
  AppPhase,
  BaseDrink,
  DrinkFormat,
  DrinkOption,
  MilkType,
  Order,
  StepKey,
  StrengthLevel,
  SugarLevel,
  Temperature,
  Vessel,
} from "../lib/types";

type DraftDrink = {
  base: BaseDrink | null;
  milk: MilkType | null;
  sugar: SugarLevel | null;
  strength: StrengthLevel | null;
  temperature: Temperature | null;
  format: DrinkFormat | null;
  vessel: Vessel | null;
};

const EXIT_MS = 320;
const ENTER_MS = 320;

const emptyDraft: DraftDrink = {
  base: null,
  milk: null,
  sugar: null,
  strength: null,
  temperature: null,
  format: null,
  vessel: null,
};

function isSpecialBase(base: BaseDrink | null) {
  return base === "milo" || base === "horlicks";
}

function stepsForDraft(d: DraftDrink): StepKey[] {
  const steps: StepKey[] = ["base"];
  if (!isSpecialBase(d.base)) steps.push("milk");
  steps.push("sugar");
  if (!isSpecialBase(d.base)) steps.push("strength");
  steps.push("temperature");
  steps.push("format");
  if (d.format === "dabao") steps.push("vessel");
  return steps;
}

function canFinalize(d: DraftDrink): boolean {
  if (!d.base) return false;
  if (!isSpecialBase(d.base) && !d.milk) return false;
  if (!d.sugar) return false;
  if (!isSpecialBase(d.base) && !d.strength) return false;
  if (!d.temperature) return false;
  if (!d.format) return false;
  if (d.format === "dabao" && !d.vessel) return false;
  return true;
}

function finalizeDraft(d: DraftDrink): DrinkOption {
  if (!canFinalize(d)) {
    throw new Error("draft_incomplete");
  }
  const base = d.base!;
  const special = isSpecialBase(base);
  return {
    base,
    milk: special ? null : (d.milk ?? "default"),
    sugar: d.sugar ?? "normal",
    strength: special ? null : (d.strength ?? "normal"),
    temperature: d.temperature ?? "hot",
    format: d.format ?? "dinein",
    vessel: d.format === "dabao" ? (d.vessel ?? "cup") : null,
    quantity: 1,
  };
}

function BackChevron(props: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      className="backBtn"
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label="Back"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function Home() {
  const [phase, setPhase] = React.useState<AppPhase>("flow");
  const [order, setOrder] = React.useState<Order>({ drinks: [], payment: "cash" });

  const [draft, setDraft] = React.useState<DraftDrink>(emptyDraft);
  const [stepIdx, setStepIdx] = React.useState(0);
  const [anim, setAnim] = React.useState<"idle" | "exit" | "enter">("idle");
  const [maxMsg, setMaxMsg] = React.useState<string | null>(null);

  const [interimIndex, setInterimIndex] = React.useState<number | null>(null);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const [askingPayment, setAskingPayment] = React.useState(false);

  const steps = React.useMemo(() => stepsForDraft(draft), [draft]);
  const currentKey = askingPayment ? "payment" : steps[Math.min(stepIdx, steps.length - 1)];

  const progress = React.useMemo(() => {
    if (askingPayment) return 100;
    if (steps.length === 0) return 0;
    const done = Math.max(0, Math.min(stepIdx, steps.length - 1));
    return Math.round((done / Math.max(steps.length - 1, 1)) * 100);
  }, [askingPayment, stepIdx, steps.length]);

  function resetFlow() {
    setDraft(emptyDraft);
    setStepIdx(0);
    setAskingPayment(false);
    setMaxMsg(null);
    setAnim("idle");
  }

  function startNewDrink() {
    resetFlow();
    setPhase("flow");
  }

  function handleBack() {
    if (askingPayment) {
      setAskingPayment(false);
      setPhase("interim");
      return;
    }

    if (stepIdx <= 0) return;
    const keyToClear = steps[stepIdx];
    setDraft((d) => {
      const next: DraftDrink = { ...d };
      if (keyToClear === "base") next.base = null;
      if (keyToClear === "milk") next.milk = null;
      if (keyToClear === "sugar") next.sugar = null;
      if (keyToClear === "strength") next.strength = null;
      if (keyToClear === "temperature") next.temperature = null;
      if (keyToClear === "format") {
        next.format = null;
        next.vessel = null;
      }
      if (keyToClear === "vessel") next.vessel = null;
      return next;
    });
    setStepIdx((i) => Math.max(0, i - 1));
  }

  function animateAdvance(apply: () => void) {
    setAnim("exit");
    window.setTimeout(() => {
      apply();
      setAnim("enter");
      window.setTimeout(() => setAnim("idle"), ENTER_MS);
    }, EXIT_MS);
  }

  function advanceOrFinish(nextDraft: DraftDrink) {
    const nextSteps = stepsForDraft(nextDraft);
    const isLast = stepIdx >= nextSteps.length - 1;

    if (!isLast) {
      setDraft(nextDraft);
      setStepIdx((i) => Math.min(i + 1, nextSteps.length - 1));
      return;
    }

    const drink = finalizeDraft(nextDraft);
    setOrder((o) => {
      const idx = o.drinks.length;
      setInterimIndex(idx);
      setPhase("interim");
      return { ...o, drinks: [...o.drinks, drink] };
    });
    resetFlow();
  }

  function selectInFlow(value: string) {
    setMaxMsg(null);
    animateAdvance(() => {
      setDraft((d) => {
        const next: DraftDrink = { ...d };
        if (currentKey === "base") {
          next.base = value as BaseDrink;
          if (isSpecialBase(next.base)) {
            next.milk = null;
            next.strength = null;
          } else {
            next.milk = next.milk ?? "default";
            next.strength = next.strength ?? "normal";
          }
        } else if (currentKey === "milk") {
          next.milk = value as MilkType;
        } else if (currentKey === "sugar") {
          next.sugar = value as SugarLevel;
        } else if (currentKey === "strength") {
          next.strength = value as StrengthLevel;
        } else if (currentKey === "temperature") {
          next.temperature = value as Temperature;
        } else if (currentKey === "format") {
          next.format = value as DrinkFormat;
          if (next.format === "dinein") next.vessel = null;
          if (next.format === "dabao") next.vessel = next.vessel ?? "cup";
        } else if (currentKey === "vessel") {
          next.vessel = value as Vessel;
        }
        if (!next.sugar) next.sugar = "normal";
        if (!next.temperature) next.temperature = "hot";
        if (!next.format) next.format = "dinein";
        if (!isSpecialBase(next.base)) {
          if (!next.milk) next.milk = "default";
          if (!next.strength) next.strength = "normal";
        }

        queueMicrotask(() => advanceOrFinish(next));
        return next;
      });
    });
  }

  function selectPayment(value: Order["payment"]) {
    animateAdvance(() => {
      setOrder((o) => ({ ...o, payment: value }));
      setPhase("playback");
      setAskingPayment(false);
    });
  }

  function startPayment() {
    setAskingPayment(true);
    setPhase("flow");
    setStepIdx(0);
    setDraft(emptyDraft);
  }

  function updateQuantity(index: number, nextQty: number) {
    setOrder((o) => {
      const drinks = o.drinks.map((d, i) => (i === index ? { ...d, quantity: nextQty } : d));
      return { ...o, drinks };
    });
  }

  function startOver() {
    setOrder({ drinks: [], payment: "cash" });
    setInterimIndex(null);
    setEditingIndex(null);
    resetFlow();
    setPhase("flow");
  }

  const screenClass =
    anim === "exit" ? "screen isExiting" : anim === "enter" ? "screen isEntering" : "screen";

  return (
    <>
      <Head>
        <title>KopiOrder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="appShell">
        <div className="progressTrack">
          <div className="progressFill" style={{ width: `${progress}%` }} />
        </div>

        <div className="appFrame">
          {phase === "flow" ? (
            <div className={screenClass}>
              {!askingPayment && currentKey === "base" ? (
                <QuestionStep
                  question={baseDrinkQuestion.question}
                  options={baseDrinkQuestion.options}
                  selected={draft.base}
                  onSelect={selectInFlow}
                  topLeft={<BackChevron onClick={handleBack} disabled={stepIdx === 0} />}
                />
              ) : null}

              {!askingPayment && currentKey === "milk" ? (
                <QuestionStep
                  question={milkQuestion.question}
                  options={milkQuestion.options}
                  selected={draft.milk}
                  onSelect={selectInFlow}
                  topLeft={<BackChevron onClick={handleBack} />}
                />
              ) : null}

              {!askingPayment && currentKey === "sugar" ? (
                <QuestionStep
                  question={sugarQuestion.question}
                  options={sugarQuestion.options}
                  selected={draft.sugar}
                  onSelect={selectInFlow}
                  topLeft={<BackChevron onClick={handleBack} />}
                />
              ) : null}

              {!askingPayment && currentKey === "strength" ? (
                <QuestionStep
                  question={strengthQuestion.question}
                  options={strengthQuestion.options}
                  selected={draft.strength}
                  onSelect={selectInFlow}
                  topLeft={<BackChevron onClick={handleBack} />}
                />
              ) : null}

              {!askingPayment && currentKey === "temperature" ? (
                <QuestionStep
                  question={temperatureQuestion.question}
                  options={temperatureQuestion.options}
                  selected={draft.temperature}
                  onSelect={selectInFlow}
                  topLeft={<BackChevron onClick={handleBack} />}
                />
              ) : null}

              {!askingPayment && currentKey === "format" ? (
                <QuestionStep
                  question={formatQuestion.question}
                  options={formatQuestion.options}
                  selected={draft.format}
                  onSelect={selectInFlow}
                  topLeft={<BackChevron onClick={handleBack} />}
                />
              ) : null}

              {!askingPayment && currentKey === "vessel" ? (
                <QuestionStep
                  question={vesselQuestion.question}
                  options={vesselQuestion.options}
                  selected={draft.vessel}
                  onSelect={selectInFlow}
                  topLeft={<BackChevron onClick={handleBack} />}
                />
              ) : null}

              {askingPayment ? (
                <QuestionStep
                  question={paymentQuestion.question}
                  options={paymentQuestion.options}
                  selected={order.payment}
                  onSelect={selectPayment}
                  topLeft={<BackChevron onClick={handleBack} />}
                />
              ) : null}
            </div>
          ) : null}

          {phase === "interim" && interimIndex !== null ? (
            <div className="interim">
              <div className="interimTitle">Your drink</div>
              <DrinkTile
                drink={order.drinks[interimIndex]}
                lang="sg"
                onEdit={() => {}}
                showEdit={false}
                showStepper
                onQuantityChange={(n) => updateQuantity(interimIndex, n)}
              />

              {maxMsg ? <div className="inlineMessage">{maxMsg}</div> : null}

              <div className="interimBtns">
                <button
                  type="button"
                  className="secondaryBtn"
                  onClick={() => {
                    if (order.drinks.length >= 5) {
                      setMaxMsg("Maximum 5 drinks per order.");
                      return;
                    }
                    startNewDrink();
                  }}
                >
                  Add another drink
                </button>

                <button type="button" className="primaryBtn" onClick={startPayment}>
                  Continue to payment
                </button>
              </div>
            </div>
          ) : null}

          {phase === "playback" ? (
            <OrderPlayback
              order={order}
              onEditDrink={(idx) => {
                setEditingIndex(idx);
                setPhase("edit");
              }}
              onStartOver={startOver}
            />
          ) : null}

          {phase === "edit" && editingIndex !== null ? (
            <EditFlow
              initial={order.drinks[editingIndex]}
              onCancel={() => {
                setEditingIndex(null);
                setPhase("playback");
              }}
              onUpdate={(next) => {
                setOrder((o) => {
                  const drinks = o.drinks.map((d, i) => (i === editingIndex ? next : d));
                  return { ...o, drinks };
                });
                setEditingIndex(null);
                setPhase("playback");
              }}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
