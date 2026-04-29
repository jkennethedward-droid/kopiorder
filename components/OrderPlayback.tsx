import * as React from "react";
import type { Language, Order } from "../lib/types";
import { drinkPhraseSG, drinkPhraseZH } from "../lib/buildOrder";
import { DrinkTile } from "./DrinkTile";
import { PaymentTile } from "./PaymentTile";

export function OrderPlayback(props: {
  order: Order;
  onEditDrink: (index: number) => void;
  onStartOver: () => void;
}) {
  const [lang, setLang] = React.useState<Language>("sg");
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [playingIdx, setPlayingIdx] = React.useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  async function speakText(idx: number, text: string) {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setPlayingIdx(idx);
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, mode: lang }),
      });

      if (!res.ok) throw new Error("tts_failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      await audio.play();
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
      });
      URL.revokeObjectURL(url);
    } catch {
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === "zh" ? "zh-CN" : "en-SG";
        window.speechSynthesis.cancel();
        await new Promise<void>((resolve) => {
          u.onend = () => resolve();
          u.onerror = () => resolve();
          window.speechSynthesis.speak(u);
        });
      } catch {
        // silent fallback: nothing else to do
      }
    } finally {
      setIsSpeaking(false);
      setPlayingIdx(null);
    }
  }

  return (
    <div className="playback">
      <div className="playbackHeader">
        <button type="button" className="brandBtn" onClick={props.onStartOver}>
          Kopi Order
        </button>

        <div className="sectionTitle">Order</div>

        <div className="playbackHint">
          Select language and click on title to play your order
        </div>

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
              Mandarin
            </button>
          </div>
        </div>
      </div>

      <div className="tileStack">
        {props.order.drinks.map((drink, idx) => (
          <DrinkTile
            key={idx}
            drink={drink}
            lang={lang}
            onEdit={() => props.onEditDrink(idx)}
            isPlaying={playingIdx === idx}
            onTitleClick={() => {
              const text = lang === "zh" ? drinkPhraseZH(drink) : drinkPhraseSG(drink);
              void speakText(idx, text);
            }}
          />
        ))}

        <PaymentTile payment={props.order.payment} lang={lang} />
      </div>
    </div>
  );
}

