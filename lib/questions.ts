import type {
  BaseDrink,
  MilkType,
  StepKey,
  StrengthLevel,
  SugarLevel,
  Temperature,
} from "./types";

export type OptionValue =
  | BaseDrink
  | MilkType
  | SugarLevel
  | StrengthLevel
  | Temperature;

export interface QuestionOption<T extends OptionValue> {
  value: T;
  label: string;
  description: string;
}

export interface QuestionDef<T extends OptionValue> {
  key: StepKey;
  question: string;
  options: QuestionOption<T>[];
}

export const baseDrinkQuestion: QuestionDef<BaseDrink> = {
  key: "base",
  question: "What are you having?",
  options: [
    {
      value: "kopi",
      label: "Kopi",
      description:
        "Traditional coffee with condensed milk. Strong, sweet, robusta beans.",
    },
    {
      value: "teh",
      label: "Teh",
      description: "Milk tea. Same system as kopi, swap coffee for Ceylon tea.",
    },
    {
      value: "milo",
      label: "Milo",
      description: "Malted chocolate drink. Always a crowd pleaser.",
    },
    {
      value: "horlicks",
      label: "Horlicks",
      description: "Malted milk. Milder and creamier than Milo.",
    },
    {
      value: "yuanyang",
      label: "Yuan Yang",
      description: "Half coffee, half tea. When you genuinely cannot decide.",
    },
  ],
};

export const milkQuestion: QuestionDef<MilkType> = {
  key: "milk",
  question: "How do you want your milk?",
  options: [
    {
      value: "default",
      label: "Default",
      description: "Condensed milk. Sweet, creamy, the classic kopitiam way.",
    },
    {
      value: "c",
      label: "C - Evaporated milk",
      description: "Carnation milk. Less sweet, slightly lighter.",
    },
    {
      value: "o",
      label: "O - No milk",
      description: "Black. Just the drink, nothing added.",
    },
  ],
};

export const sugarQuestion: QuestionDef<SugarLevel> = {
  key: "sugar",
  question: "How sweet?",
  options: [
    {
      value: "normal",
      label: "Normal",
      description: "Standard sweetness, as the person at the counter makes it.",
    },
    {
      value: "siudai",
      label: "Siu Dai",
      description: "Less sugar. Good if you find it too sweet.",
    },
    {
      value: "kosong",
      label: "Kosong",
      description: "Zero sugar. Nothing added at all.",
    },
    {
      value: "gahdai",
      label: "Gah Dai",
      description: "Extra sweet. More condensed milk, more sugar.",
    },
  ],
};

export const strengthQuestion: QuestionDef<StrengthLevel> = {
  key: "strength",
  question: "How strong?",
  options: [
    { value: "normal", label: "Normal", description: "Standard brew, the default." },
    {
      value: "gau",
      label: "Gau",
      description: "Strong. More coffee, less water. Morning fuel.",
    },
    {
      value: "poh",
      label: "Poh",
      description: "Light. Watered down, gentler on the stomach.",
    },
  ],
};

export const temperatureQuestion: QuestionDef<Temperature> = {
  key: "temperature",
  question: "Hot or cold?",
  options: [
    { value: "hot", label: "Hot", description: "Served hot in a ceramic cup or glass." },
    {
      value: "peng",
      label: "Peng",
      description: "Over ice. The only sensible choice in Singapore heat.",
    },
  ],
};

export const questionsByKey: Record<StepKey, QuestionDef<OptionValue>> = {
  base: baseDrinkQuestion,
  milk: milkQuestion,
  sugar: sugarQuestion,
  strength: strengthQuestion,
  temperature: temperatureQuestion,
};

