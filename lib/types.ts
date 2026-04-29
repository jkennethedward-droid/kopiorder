export type BaseDrink = "kopi" | "teh" | "milo" | "horlicks" | "yuanyang";
export type MilkType = "default" | "c" | "o";
export type SugarLevel = "normal" | "siudai" | "kosong" | "gahdai";
export type StrengthLevel = "normal" | "gau" | "poh";
export type Temperature = "hot" | "peng";

export interface DrinkOption {
  base: BaseDrink;
  milk: MilkType | null;
  sugar: SugarLevel;
  strength: StrengthLevel | null;
  temperature: Temperature;
  vessel: null;
  quantity: number;
}

export interface Order {
  drinks: DrinkOption[];
}

export type AppPhase = "flow" | "interim" | "playback" | "edit";
export type Language = "sg" | "zh";

export type StepKey =
  | "base"
  | "milk"
  | "sugar"
  | "strength"
  | "temperature"
  ;

export type SpeakMode = Language;
