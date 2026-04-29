import * as React from "react";
import type { Language, Order } from "../lib/types";
import { buildMandarinSentence, buildSGSentence } from "../lib/buildOrder";
import { getSGTGreeting } from "../lib/time";
import { DrinkTile } from "./DrinkTile";
import { PaymentTile } from "./PaymentTile";

export function OrderPlayback(props: {
  order: Order;
  onEditDrink: (index: number) => void;
  onStartOver: () => void;
}) {
  const [lang, setLang] = React.useState<Language>("sg");
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const greeting = getSGTGreeting(lang);

  async function speak() {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const text = lang === "zh" ? buildMandarinSentence(props.order) : buildSGSentence(props.order);
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, mode: lang }),
      });

      if (!res.ok) throw new Error("tts_failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      try {
        const text = lang === "zh" ? buildMandarinSentence(props.order) : buildSGSentence(props.order);
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "zh" ? "zh-CN" : "en-SG";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {
        // silent fallback: nothing else to do
      }
    } finally {
      setIsSpeaking(false);
    }
  }

  return (
    <div className="playback">
      <div className="playbackHeader">
        <div className="greeting">{greeting}</div>

        <div className="toggleSticky">
          <div className="togglePills" role="tablist" aria-label="Language">
            <button
              type="button"
              className={`pill ${lang === "sg" ? "isActive" : ""}`}
              onClick={() => setLang("sg")}
              role="tab"
              aria-selected={lang === "sg"}
            >
              SG Lingo
            </button>
            <button
              type="button"
              className={`pill ${lang === "zh" ? "isActive" : ""}`}
              onClick={() => setLang("zh")}
              role="tab"
              aria-selected={lang === "zh"}
            >
              普通话
            </button>
          </div>
        </div>
      </div>

      <div className="tileStack">
        {props.order.drinks.map((drink, idx) => (
          <DrinkTile key={idx} drink={drink} lang={lang} onEdit={() => props.onEditDrink(idx)} />
        ))}

        <PaymentTile payment={props.order.payment} lang={lang} />

        <button type="button" className="speakBtn" onClick={speak} disabled={isSpeaking}>
          {lang === "zh" ? "🔊 说出你的订单" : "🔊 Say your order"}
        </button>

        <button type="button" className="startOver" onClick={props.onStartOver}>
          Start Over
        </button>
      </div>
    </div>
  );
}

