// Returns greeting string based on Singapore time (UTC+8)
// Derive SGT from UTC: new Date(Date.now() + 8 * 60 * 60 * 1000)
// Before 12:00 → "Good morning" / "早上好"
// 12:00–17:59 → "Good afternoon" / "下午好"
// 18:00 onwards → "Good evening" / "晚上好"

export function getSGTGreeting(lang: "sg" | "zh"): string {
  const sgt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const hours = sgt.getUTCHours();

  if (hours < 12) return lang === "zh" ? "早上好" : "Good morning";
  if (hours < 18) return lang === "zh" ? "下午好" : "Good afternoon";
  return lang === "zh" ? "晚上好" : "Good evening";
}

