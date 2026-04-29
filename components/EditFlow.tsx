import * as React from "react";
import type { DrinkOption } from "../lib/types";
import {
  baseDrinkQuestion,
  formatQuestion,
  milkQuestion,
  strengthQuestion,
  sugarQuestion,
  temperatureQuestion,
} from "../lib/questions";

export function EditFlow(props: {
  initial: DrinkOption;
  onCancel: () => void;
  onUpdate: (next: DrinkOption) => void;
  onStartOver?: () => void;
}) {
  const [draft, setDraft] = React.useState<DrinkOption>(() => normalize(props.initial));

  const isSpecial = draft.base === "milo" || draft.base === "horlicks";

  function update(next: DrinkOption) {
    setDraft(normalize(next));
  }

  function sectionTitle(n: number, title: string) {
    return (
      <div className="editSectionTitle">
        <div className="editStepNo">Step {n}</div>
        <div className="editStepLabel">{title}</div>
      </div>
    );
  }

  return (
    <div className="edit">
      <div className="editHeader">
        <div className="topLeftRow">
          <button
            type="button"
            className="brandBtn"
            onClick={props.onStartOver ?? props.onCancel}
          >
            Kopi Order
          </button>
          <button type="button" className="backBtn" onClick={props.onCancel} aria-label="Back">
            <ChevronLeft />
          </button>
        </div>
      </div>

      <div className="editBody">
        <div className="editSection">
          {sectionTitle(1, baseDrinkQuestion.question)}
          <div className="editOptions">
            {baseDrinkQuestion.options.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`optionCard ${draft.base === o.value ? "isSelected" : ""}`}
                onClick={() => update({ ...draft, base: o.value })}
              >
                <div className="optionLabel">{o.label}</div>
                <div className="optionDesc">{o.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="editSection">
          {sectionTitle(2, milkQuestion.question)}
          {isSpecial ? (
            <div className="editNote">Not applicable for Milo or Horlicks.</div>
          ) : (
            <div className="editOptions">
              {milkQuestion.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`optionCard ${draft.milk === o.value ? "isSelected" : ""}`}
                  onClick={() => update({ ...draft, milk: o.value })}
                >
                  <div className="optionLabel">{o.label}</div>
                  <div className="optionDesc">{o.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="editSection">
          {sectionTitle(3, sugarQuestion.question)}
          <div className="editOptions">
            {sugarQuestion.options.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`optionCard ${draft.sugar === o.value ? "isSelected" : ""}`}
                onClick={() => update({ ...draft, sugar: o.value })}
              >
                <div className="optionLabel">{o.label}</div>
                <div className="optionDesc">{o.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="editSection">
          {sectionTitle(4, strengthQuestion.question)}
          {isSpecial ? (
            <div className="editNote">Not applicable for Milo or Horlicks.</div>
          ) : (
            <div className="editOptions">
              {strengthQuestion.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`optionCard ${draft.strength === o.value ? "isSelected" : ""}`}
                  onClick={() => update({ ...draft, strength: o.value })}
                >
                  <div className="optionLabel">{o.label}</div>
                  <div className="optionDesc">{o.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="editSection">
          {sectionTitle(5, temperatureQuestion.question)}
          <div className="editOptions">
            {temperatureQuestion.options.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`optionCard ${draft.temperature === o.value ? "isSelected" : ""}`}
                onClick={() => update({ ...draft, temperature: o.value })}
              >
                <div className="optionLabel">{o.label}</div>
                <div className="optionDesc">{o.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="editSection">
          {sectionTitle(6, formatQuestion.question)}
          <div className="editOptions">
            {formatQuestion.options.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`optionCard ${draft.format === o.value ? "isSelected" : ""}`}
                onClick={() => update({ ...draft, format: o.value })}
              >
                <div className="optionLabel">{o.label}</div>
                <div className="optionDesc">{o.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="primaryBtn" onClick={() => props.onUpdate(draft)}>
          Update drink
        </button>
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalize(drink: DrinkOption): DrinkOption {
  const isSpecial = drink.base === "milo" || drink.base === "horlicks";
  let next: DrinkOption = { ...drink };

  if (isSpecial) {
    next = { ...next, milk: null, strength: null };
  } else {
    next = {
      ...next,
      milk: next.milk ?? "default",
      strength: next.strength ?? "normal",
    };
  }

  next = { ...next, vessel: null };

  if (next.quantity < 1) next.quantity = 1;
  return next;
}

