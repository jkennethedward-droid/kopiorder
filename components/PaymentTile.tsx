import * as React from "react";
import type { Language, Order } from "../lib/types";
import { paymentLabelSG, paymentLabelZH } from "../lib/buildOrder";

export function PaymentTile(props: {
  payment: Order["payment"];
  lang: Language;
  isPlaying?: boolean;
  onTileClick?: () => void;
}) {
  const text =
    props.lang === "zh" ? paymentLabelZH(props.payment) : paymentLabelSG(props.payment);

  const suffix =
    props.lang === "zh"
      ? ""
      : props.payment === "paynow"
        ? " ah"
        : props.payment === "card"
          ? " can"
          : "";

  return (
    <div
      className={`tile tilePayment ${props.onTileClick ? "isClickable" : ""} ${props.isPlaying ? "isPlaying" : ""}`}
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
      <div className="tileTitle">{text + suffix}</div>
      <div className="tileDesc">
        {props.lang === "zh" ? "付款方式" : "Payment method"}
      </div>

      {props.isPlaying ? (
        <div className="tileWave" aria-hidden="true">
          <span className="waveBar" />
          <span className="waveBar" />
          <span className="waveBar" />
        </div>
      ) : null}
    </div>
  );
}

