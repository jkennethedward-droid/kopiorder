import * as React from "react";
import type { Language, Order } from "../lib/types";
import { paymentLabelSG, paymentLabelZH } from "../lib/buildOrder";

export function PaymentTile(props: { payment: Order["payment"]; lang: Language }) {
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
    <div className="tile tilePayment">
      <div className="tileTitle">{text + suffix}</div>
      <div className="tileDesc">
        {props.lang === "zh" ? "付款方式" : "Payment method"}
      </div>
    </div>
  );
}

