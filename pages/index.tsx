import Head from "next/head";
import * as React from "react";
import { DrinkTile } from "../components/DrinkTile";
import { EditFlow } from "../components/EditFlow";
import { OrderPlayback } from "../components/OrderPlayback";
import { QuestionStep } from "../components/QuestionStep";
import {
  baseDrinkQuestion,
  milkQuestion,
  strengthQuestion,
  sugarQuestion,
  temperatureQuestion,
} from "../lib/questions";
import type {
  AppPhase,
  BaseDrink,
  DrinkOption,
  MilkType,
  Order,
  StepKey,
  StrengthLevel,
  SugarLevel,
  Temperature,
} from "../lib/types";

type DraftDrink = {
  base: BaseDrink | null;
  milk: MilkType | null;
  sugar: SugarLevel | null;
  strength: StrengthLevel | null;
  temperature: Temperature | null;
  vessel: null;
};

const EXIT_MS = 320;
const ENTER_MS = 320;

const emptyDraft: DraftDrink = {
  base: null,
  milk: null,
  sugar: null,
  strength: null,
  temperature: null,
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
  return steps;
}

function canFinalize(d: DraftDrink): boolean {
  if (!d.base) return false;
  if (!isSpecialBase(d.base) && !d.milk) return false;
  if (!d.sugar) return false;
  if (!isSpecialBase(d.base) && !d.strength) return false;
  if (!d.temperature) return false;
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
    vessel: null,
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

function BrandButton(props: { onClick: () => void; center?: boolean }) {
  return (
    <button
      type="button"
      className={props.center ? "brandBtn brandBtnCenter" : "brandBtn"}
      onClick={props.onClick}
    >
      Kopi Order
    </button>
  );
}

function draftOrderPreview(d: DraftDrink): string {
  if (!d.base) return "";
  const base =
    d.base === "kopi"
      ? "Kopi"
      : d.base === "teh"
        ? "Teh"
        : d.base === "milo"
          ? "Milo"
          : d.base === "horlicks"
            ? "Horlicks"
            : "Yuan Yang";

  const tokens: string[] = [base];
  const special = d.base === "milo" || d.base === "horlicks";

  if (!special && d.milk) {
    if (d.milk === "c") tokens.push("C");
    if (d.milk === "o") tokens.push("O");
  }

  if (d.sugar && d.sugar !== "normal") {
    if (d.sugar === "siudai") tokens.push("Siu Dai");
    if (d.sugar === "kosong") tokens.push("Kosong");
    if (d.sugar === "gahdai") tokens.push("Gah Dai");
  }

  if (!special && d.strength && d.strength !== "normal") {
    if (d.strength === "gau") tokens.push("Gau");
    if (d.strength === "poh") tokens.push("Poh");
  }

  if (d.temperature === "peng") tokens.push("Peng");
  return tokens.join(" ");
}

export default function Home() {
  const [phase, setPhase] = React.useState<AppPhase>("home");
  const [order, setOrder] = React.useState<Order>({ drinks: [] });

  const [draft, setDraft] = React.useState<DraftDrink>(emptyDraft);
  const [stepIdx, setStepIdx] = React.useState(0);
  const [anim, setAnim] = React.useState<"idle" | "exit" | "enter">("idle");
  const [maxMsg, setMaxMsg] = React.useState<string | null>(null);

  const [interimIndex, setInterimIndex] = React.useState<number | null>(null);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const steps = React.useMemo(() => stepsForDraft(draft), [draft]);
  const currentKey = steps[Math.min(stepIdx, steps.length - 1)];

  const progress = React.useMemo(() => {
    if (steps.length === 0) return 0;
    const done = Math.max(0, Math.min(stepIdx, steps.length - 1));
    return Math.round((done / Math.max(steps.length - 1, 1)) * 100);
  }, [stepIdx, steps.length]);

  function resetFlow() {
    setDraft(emptyDraft);
    setStepIdx(0);
    setMaxMsg(null);
    setAnim("idle");
  }

  function startNewDrink() {
    resetFlow();
    setPhase("flow");
  }

  function startFromHome() {
    animateAdvance(() => {
      resetFlow();
      setOrder({ drinks: [] });
      setInterimIndex(null);
      setEditingIndex(null);
      setPhase("flow");
    });
  }

  function handleBack() {
    if (stepIdx <= 0) return;
    const keyToClear = steps[stepIdx];
    setDraft((d) => {
      const next: DraftDrink = { ...d };
      if (keyToClear === "base") next.base = null;
      if (keyToClear === "milk") next.milk = null;
      if (keyToClear === "sugar") next.sugar = null;
      if (keyToClear === "strength") next.strength = null;
      if (keyToClear === "temperature") next.temperature = null;
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
        }
        if (!next.sugar) next.sugar = "normal";
        if (!next.temperature) next.temperature = "hot";
        if (!isSpecialBase(next.base)) {
          if (!next.milk) next.milk = "default";
          if (!next.strength) next.strength = "normal";
        }

        queueMicrotask(() => advanceOrFinish(next));
        return next;
      });
    });
  }

  function updateQuantity(index: number, nextQty: number) {
    setOrder((o) => {
      const drinks = o.drinks.map((d, i) => (i === index ? { ...d, quantity: nextQty } : d));
      return { ...o, drinks };
    });
  }

  function startOver() {
    setOrder({ drinks: [] });
    setInterimIndex(null);
    setEditingIndex(null);
    resetFlow();
    setPhase("flow");
  }

  const screenClass =
    anim === "exit" ? "screen isExiting" : anim === "enter" ? "screen isEntering" : "screen";

  const orderPreview = React.useMemo(() => draftOrderPreview(draft), [draft]);

  return (
    <>
      <Head>
        <title>KopiOrder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="appShell">
        {phase !== "home" ? (
          <div className="progressTrack">
            <div className="progressFill" style={{ width: `${progress}%` }} />
          </div>
        ) : null}

        {phase === "flow" ? (
          <div className="progressPctRow" aria-hidden="true">
            {progress}%
          </div>
        ) : null}

        <div className="appFrame">
          {phase === "home" ? (
            <div className={screenClass}>
              <div className="homeScreen">
                <div className="homeCenter">
                  <div className="homeTitle">KopiOrder</div>
                  <div className="homeSubtitle">Order kopi in 3 simple steps</div>
                  <div className="homeHint">Pick your drink · We craft the order · Press play</div>
                </div>

                <button type="button" className="primaryBtn homeCta" onClick={startFromHome}>
                  Start my order
                </button>
              </div>
            </div>
          ) : null}

          {phase === "flow" ? (
            <div className={screenClass}>
              {currentKey === "base" ? (
                <QuestionStep
                  question={baseDrinkQuestion.question}
                  options={baseDrinkQuestion.options}
                  selected={draft.base}
                  onSelect={selectInFlow}
                  topCenter={<BrandButton onClick={startOver} center />}
                  softQuestion
                  orderPreview={orderPreview}
                />
              ) : null}

              {currentKey === "milk" ? (
                <QuestionStep
                  question={milkQuestion.question}
                  options={milkQuestion.options}
                  selected={draft.milk}
                  onSelect={selectInFlow}
                  topLeft={<BrandButton onClick={startOver} />}
                  footer={<BackChevron onClick={handleBack} />}
                  orderPreview={orderPreview}
                />
              ) : null}

              {currentKey === "sugar" ? (
                <QuestionStep
                  question={sugarQuestion.question}
                  options={sugarQuestion.options}
                  selected={draft.sugar}
                  onSelect={selectInFlow}
                  topLeft={<BrandButton onClick={startOver} />}
                  footer={<BackChevron onClick={handleBack} />}
                  orderPreview={orderPreview}
                />
              ) : null}

              {currentKey === "strength" ? (
                <QuestionStep
                  question={strengthQuestion.question}
                  options={strengthQuestion.options}
                  selected={draft.strength}
                  onSelect={selectInFlow}
                  topLeft={<BrandButton onClick={startOver} />}
                  footer={<BackChevron onClick={handleBack} />}
                  orderPreview={orderPreview}
                />
              ) : null}

              {currentKey === "temperature" ? (
                <QuestionStep
                  question={temperatureQuestion.question}
                  options={temperatureQuestion.options}
                  selected={draft.temperature}
                  onSelect={selectInFlow}
                  topLeft={<BrandButton onClick={startOver} />}
                  footer={<BackChevron onClick={handleBack} />}
                  orderPreview={orderPreview}
                />
              ) : null}

            </div>
          ) : null}

          {phase === "interim" && interimIndex !== null ? (
            <div className="interim">
              <BrandButton onClick={startOver} />
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

                <button type="button" className="primaryBtn" onClick={() => setPhase("playback")}>
                  View order
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
              onSetDrinkQuantity={(idx, nextQty) => {
                setOrder((o) => {
                  const drinks = o.drinks.map((d, i) => (i === idx ? { ...d, quantity: nextQty } : d));
                  return { ...o, drinks };
                });
              }}
              onRemoveDrink={(idx) => {
                setOrder((o) => {
                  const drinks = o.drinks.filter((_, i) => i !== idx);
                  return { ...o, drinks };
                });
              }}
            />
          ) : null}

          {phase === "edit" && editingIndex !== null ? (
            <EditFlow
              initial={order.drinks[editingIndex]}
              onCancel={() => {
                setEditingIndex(null);
                setPhase("playback");
              }}
              onStartOver={startOver}
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
