import type { DrinkOption, Language, Order } from "./types";

const numberWords: Record<number, string> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
};

const zhNumerals: Record<number, string> = {
  1: "一",
  2: "两",
  3: "三",
  4: "四",
  5: "五",
};

export function kopiNameSG(drink: DrinkOption): string {
  const base =
    drink.base === "yuanyang"
      ? "Yuan Yang"
      : drink.base.charAt(0).toUpperCase() + drink.base.slice(1);

  const milkSuffix =
    drink.base === "milo" || drink.base === "horlicks"
      ? ""
      : drink.milk === "c"
        ? "-C"
        : drink.milk === "o"
          ? "-O"
          : "";

  const sugar =
    drink.sugar === "normal"
      ? ""
      : drink.sugar === "siudai"
        ? " Siu Dai"
        : drink.sugar === "kosong"
          ? " Kosong"
          : " Gah Dai";

  const strength =
    drink.base === "milo" || drink.base === "horlicks" || !drink.strength
      ? ""
      : drink.strength === "normal"
        ? ""
        : drink.strength === "gau"
          ? " Gau"
          : " Poh";

  const temp = drink.temperature === "peng" ? " Peng" : "";

  return `${base}${milkSuffix}${sugar}${strength}${temp}`.replace(/\s+/g, " ").trim();
}

export function descriptionSG(drink: DrinkOption): string {
  const base =
    drink.base === "kopi"
      ? "coffee"
      : drink.base === "teh"
        ? "tea"
        : drink.base === "yuanyang"
          ? "coffee and tea"
          : drink.base === "milo"
            ? "malted chocolate"
            : "malted milk";

  const temp = drink.temperature === "peng" ? "Iced" : "Hot";

  const milk =
    drink.base === "milo" || drink.base === "horlicks"
      ? null
      : drink.milk === "default"
        ? "condensed milk"
        : drink.milk === "c"
          ? "evaporated milk"
          : "no milk";

  const sugar =
    drink.sugar === "normal"
      ? "normal sweetness"
      : drink.sugar === "siudai"
        ? "less sugar"
        : drink.sugar === "kosong"
          ? "zero sugar"
          : "extra sweet";

  const strength =
    drink.base === "milo" || drink.base === "horlicks" || !drink.strength
      ? null
      : drink.strength === "normal"
        ? "normal strength"
        : drink.strength === "gau"
          ? "strong"
          : "light";

  const parts = [
    `${temp} ${base}`,
    milk ? milk : null,
    sugar,
    strength ? strength : null,
  ].filter(Boolean);

  return parts.join(", ");
}

export function formatLineSG(drink: DrinkOption): string {
  if (drink.format === "dinein") return "Dine in";
  return "Dabao";
}

export function paymentLabelSG(payment: Order["payment"]): string {
  if (payment === "paynow") return "PayNow";
  if (payment === "cash") return "Cash";
  return "Card";
}

export function paymentSentenceSG(payment: Order["payment"]): string {
  if (payment === "paynow") return "PayNow ah.";
  if (payment === "cash") return "Cash.";
  return "Card can.";
}

export function drinkPhraseSG(drink: DrinkOption): string {
  const qty = numberWords[drink.quantity] ?? String(drink.quantity);
  const baseRaw = kopiNameSG(drink);
  const base = baseRaw
    .replace(/-C\b/g, " C")
    .replace(/-O\b/g, " O")
    .trim()
    .toLowerCase();

  const where =
    drink.format === "dinein" ? "dine in" : "dabao";

  // Speak in clear blocks with short pauses.
  // Use "pung" as a pronunciation hint for "Peng" (rhymes with "sung").
  const baseSpoken = base.replace(/\bpeng\b/g, "pung");
  const blocks = [
    `${qty}`,
    ...baseSpoken.split(/\s+/).filter(Boolean),
    where,
  ].filter(Boolean);

  return blocks.join(" [short pause] ").replace(/\s+/g, " ").trim();
}

export function buildSGSentence(order: Order): string {
  const dabao: DrinkOption[] = [];
  const dinein: DrinkOption[] = [];
  for (const d of order.drinks) {
    if (d.format === "dabao") dabao.push(d);
    else dinein.push(d);
  }

  const chunks: string[] = [];
  if (dabao.length > 0) chunks.push(...dabao.map(drinkPhraseSG));
  if (dinein.length > 0) chunks.push(...dinein.map(drinkPhraseSG));

  const joined =
    chunks.length === 0
      ? ""
      : chunks.length === 1
        ? chunks[0]
        : `${chunks.slice(0, -1).join(", ")}, and ${chunks[chunks.length - 1]}`;

  const pay = paymentSentenceSG(order.payment);

  return `Excuse me, ${joined}. ${pay} Thank you.`
    .replace(/\s+/g, " ")
    .replace(/\.\s+\./g, ".")
    .trim();
}

export function kopiNameZH(drink: DrinkOption): string {
  const isSpecial = drink.base === "milo" || drink.base === "horlicks";
  const temp = drink.temperature === "peng" ? "冰" : "";

  const baseWord =
    drink.base === "kopi"
      ? "咖啡"
      : drink.base === "teh"
        ? drink.milk === "o"
          ? "茶"
          : "奶茶"
        : drink.base === "yuanyang"
          ? "鸳鸯"
          : drink.base === "milo"
            ? "美禄"
            : "好立克";

  const milkWord =
    isSpecial || drink.milk === null
      ? ""
      : drink.milk === "o"
        ? "无奶"
        : drink.milk === "c"
          ? "淡奶"
          : "炼奶";

  const sugarPrefix =
    drink.sugar === "kosong" ? "无糖" : "";

  const sugarSuffix =
    drink.sugar === "normal"
      ? ""
      : drink.sugar === "siudai"
        ? "少甜"
        : drink.sugar === "kosong"
          ? ""
          : "加甜";

  const strengthSuffix =
    isSpecial || !drink.strength || drink.strength === "normal"
      ? ""
      : drink.strength === "gau"
        ? "特浓"
        : "淡";

  if (isSpecial) {
    return `${temp}${sugarPrefix}${baseWord}${sugarSuffix}`.trim();
  }

  if (drink.milk === "o") {
    return `${temp}${sugarPrefix}${milkWord}${baseWord}${sugarSuffix}${strengthSuffix}`.trim();
  }

  return `${temp}${sugarPrefix}${baseWord}${milkWord}${sugarSuffix}${strengthSuffix}`.trim();
}

export function descriptionZH(drink: DrinkOption): string {
  const temp = drink.temperature === "peng" ? "冰" : "热";

  const base =
    drink.base === "kopi"
      ? "咖啡"
      : drink.base === "teh"
        ? "茶"
        : drink.base === "yuanyang"
          ? "鸳鸯"
          : drink.base === "milo"
            ? "美禄"
            : "好立克";

  const milk =
    drink.base === "milo" || drink.base === "horlicks"
      ? null
      : drink.milk === "default"
        ? "炼奶"
        : drink.milk === "c"
          ? "淡奶"
          : "无奶";

  const sugar =
    drink.sugar === "normal"
      ? "正常甜度"
      : drink.sugar === "siudai"
        ? "少甜"
        : drink.sugar === "kosong"
          ? "无糖"
          : "加甜";

  const strength =
    drink.base === "milo" || drink.base === "horlicks" || !drink.strength
      ? null
      : drink.strength === "normal"
        ? "正常浓度"
        : drink.strength === "gau"
          ? "更浓"
          : "更淡";

  const parts = [temp + base, milk, sugar, strength].filter(Boolean);
  return parts.join("，");
}

export function formatLineZH(drink: DrinkOption): string {
  if (drink.format === "dinein") return "堂食";
  return "打包";
}

export function paymentLabelZH(payment: Order["payment"]): string {
  if (payment === "paynow") return "PayNow付款";
  if (payment === "cash") return "现金";
  return "刷卡";
}

export function drinkPhraseZH(drink: DrinkOption): string {
  const qty = zhNumerals[drink.quantity] ?? String(drink.quantity);
  const name = kopiNameZH(drink);
  const where =
    drink.format === "dinein" ? "堂食" : "打包";
  return `${qty}杯${name}${where}`;
}

export function buildMandarinSentence(order: Order): string {
  const phrases = order.drinks.map(drinkPhraseZH);
  const joined =
    phrases.length === 0
      ? ""
      : phrases.length === 1
        ? phrases[0]
        : `${phrases.slice(0, -1).join("，")}，还有${phrases[phrases.length - 1]}`;

  const pay = paymentLabelZH(order.payment);
  return `我要${joined}。${pay}。谢谢。`.replace(/\s+/g, " ").trim();
}

export function getTileText(drink: DrinkOption, lang: Language): {
  title: string;
  description: string;
  formatLine: string;
} {
  return lang === "zh"
    ? { title: kopiNameZH(drink), description: descriptionZH(drink), formatLine: formatLineZH(drink) }
    : { title: kopiNameSG(drink), description: descriptionSG(drink), formatLine: formatLineSG(drink) };
}

