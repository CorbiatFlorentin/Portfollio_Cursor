import { messages, type Locale, type MessageTree } from "./messages";

const KEY = "portfolio.locale";

export function detectLocale(): Locale {
  const saved = localStorage.getItem(KEY) as Locale | null;
  if (saved === "en" || saved === "fr") return saved;
  const lang = (navigator.language || "en").toLowerCase();
  return lang.startsWith("fr") ? "fr" : "en";
}

export function persistLocale(locale: Locale) {
  localStorage.setItem(KEY, locale);
}

export function getMessages(locale: Locale): MessageTree {
  return messages[locale];
}
