import * as React from "react";
import type { Language, Order } from "../lib/types";
import { drinkPhraseSG, drinkPhraseZH } from "../lib/buildOrder";
import { DrinkTile } from "./DrinkTile";

export function OrderPlayback(props: {
  order: Order;
  onEditDrink: (index: number) => void;
  onStartOver: () => void;
  onSetDrinkQuantity: (index: number, nextQty: number) => void;
  onRemoveDrink: (index: number) => void;
}) {
  const [lang, setLang] = React.useState<Language>("sg");
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [playingIdx, setPlayingIdx] = React.useState<number | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [confirmRemoveIdx, setConfirmRemoveIdx] = React.useState<number | null>(null);

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
      if (blob.size === 0) throw new Error("tts_empty");
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
        <div className="playbackTopRow">
          <div className="pageTitleCenter">Audio Tiles</div>
        </div>

        <div className="playbackHint">
          Click on tile to play your order
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
            onTileClick={() => {
              const text = lang === "zh" ? drinkPhraseZH(drink) : drinkPhraseSG(drink);
              void speakText(idx, text);
            }}
            showStepper
            onQuantityChange={(next) => {
              if (next === 0) {
                setConfirmRemoveIdx(idx);
                return;
              }
              props.onSetDrinkQuantity(idx, next);
            }}
          />
        ))}

        <div className="playbackFooter">
          <div className="broughtBy">
            Brought to you by <span className="broughtBrand">kopi order</span>
          </div>
          <button type="button" className="startOver" onClick={props.onStartOver}>
            Start Over
          </button>
        </div>
      </div>

      {confirmRemoveIdx !== null ? (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modalCard">
            <div className="modalTitle">Remove this drink?</div>
            <div className="modalDesc">This will remove it from your order.</div>
            <div className="modalBtns">
              <button type="button" className="secondaryBtn" onClick={() => setConfirmRemoveIdx(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="primaryBtn"
                onClick={() => {
                  props.onRemoveDrink(confirmRemoveIdx);
                  setConfirmRemoveIdx(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

