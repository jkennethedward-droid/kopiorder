import * as React from "react";

export type QuestionOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

export function QuestionStep<T extends string>(props: {
  question: string;
  options: QuestionOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
  inlineMessage?: string | null;
  topLeft?: React.ReactNode;
  topCenter?: React.ReactNode;
  topRight?: React.ReactNode;
  softQuestion?: boolean;
}) {
  return (
    <div className="step">
      <div className="stepTop">
        <div className="stepTopGrid">
          <div className="stepTopLeft">{props.topLeft}</div>
          <div className="stepTopCenter">{props.topCenter}</div>
          <div className="stepTopRight">{props.topRight}</div>
        </div>
      </div>

      <div className="stepBody">
        <h1 className={`stepQuestion ${props.softQuestion ? "isSoft" : ""}`}>{props.question}</h1>

        <div className="optionList">
          {props.options.map((opt) => {
            const isSelected = props.selected === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`optionCard ${isSelected ? "isSelected" : ""}`}
                onClick={() => props.onSelect(opt.value)}
              >
                <div className="optionLabel">{opt.label}</div>
                <div className="optionDesc">{opt.description}</div>
              </button>
            );
          })}
        </div>

        {props.inlineMessage ? (
          <div className="inlineMessage" role="status">
            {props.inlineMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}

