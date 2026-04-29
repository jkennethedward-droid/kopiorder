import * as React from "react";
import type { DrinkOption, Language } from "../lib/types";
import { getTileText } from "../lib/buildOrder";

export function DrinkTile(props: {
  drink: DrinkOption;
  lang: Language;
  onEdit: () => void;
  onQuantityChange?: (next: number) => void;
  showStepper?: boolean;
  showEdit?: boolean;
  onTitleClick?: () => void;
  isPlaying?: boolean;
  onTileClick?: () => void;
}) {
  const { title, description, formatLine } = getTileText(props.drink, props.lang);
  const qty = props.drink.quantity;
  const onQuantityChange = props.onQuantityChange;

  return (
    <div
      className={`tile ${props.onTileClick ? "isClickable" : ""} ${props.isPlaying ? "isPlaying" : ""}`}
      onClick={props.onTileClick}
      role={props.onTileClick ? "button" : undefined}
      tabIndex={props.onTileClick ? 0 : undefined}
      onKeyDown={
        props.onTileClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") props.onTileClick?.();
            }
          : undefined
      }
    >
      <div className="tileQty">{qty}×</div>

      {props.showEdit === false ? null : (
        <button
          type="button"
          className="tileEdit"
          onClick={(e) => {
            e.stopPropagation();
            props.onEdit();
          }}
          aria-label="Edit drink"
        >
          <PencilIcon />
        </button>
      )}

      <div className="tileTitle">{title}</div>
      <div className="tileDesc">{description}</div>
      {formatLine ? <div className="tileMeta">{formatLine}</div> : null}

      {props.isPlaying ? (
        <div className="tileWave" aria-hidden="true">
          <span className="waveBar" />
          <span className="waveBar" />
          <span className="waveBar" />
        </div>
      ) : null}

      {props.showStepper && onQuantityChange ? (
        <div className="qtyRow">
          <button
            type="button"
            className="qtyBtn"
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(Math.max(0, qty - 1));
            }}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <div className="qtyValue">{qty}</div>
          <button
            type="button"
            className="qtyBtn"
            onClick={(e) => {
              e.stopPropagation();
              onQuantityChange(Math.min(5, qty + 1));
            }}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14.06 6.19l3.75 3.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

