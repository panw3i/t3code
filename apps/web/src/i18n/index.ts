// English source text is the key (`t("Chat width")`); untranslated strings fall back to English.
// The locale is fixed at module load and changing it reloads the page,
// so `t()` is safe in module-level constants as well as in components.

import zhCN from "./zh-CN";

export type Locale = "en" | "zh-CN";
export type LocalePreference = "system" | Locale;

export const LOCALE_PREFERENCES: ReadonlyArray<LocalePreference> = ["system", "en", "zh-CN"];

const LOCALE_STORAGE_KEY = "t3code:locale";

const DICTIONARIES: Record<Locale, Readonly<Record<string, string>> | null> = {
  en: null,
  "zh-CN": zhCN,
};

function readStoredPreference(): LocalePreference {
  try {
    const stored = globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY);
    return stored === "en" || stored === "zh-CN" ? stored : "system";
  } catch {
    return "system";
  }
}

function resolveSystemLocale(): Locale {
  const languages = globalThis.navigator?.languages ?? [globalThis.navigator?.language ?? ""];
  return languages.some((language) => language?.toLowerCase().startsWith("zh")) ? "zh-CN" : "en";
}

const localePreference = readStoredPreference();
const locale: Locale = localePreference === "system" ? resolveSystemLocale() : localePreference;
const dictionary = DICTIONARIES[locale];

if (typeof document !== "undefined") {
  document.documentElement.lang = locale;
}

export function getLocale(): Locale {
  return locale;
}

export function getLocalePreference(): LocalePreference {
  return localePreference;
}

export function setLocalePreference(preference: LocalePreference): void {
  try {
    if (preference === "system") {
      globalThis.localStorage?.removeItem(LOCALE_STORAGE_KEY);
    } else {
      globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, preference);
    }
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this load only.
  }
  globalThis.location?.reload();
}

export type TranslationParams = Readonly<Record<string, string | number>>;

/** Translates English source text, replacing `{name}` placeholders with `params`. */
export function t(source: string, params?: TranslationParams): string {
  const message = dictionary?.[source] ?? source;
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : match,
  );
}

/** Locale-aware plural helper: Chinese has no plural forms, English picks by count. */
export function tPlural(
  count: number,
  one: string,
  other: string,
  params?: TranslationParams,
): string {
  return t(count === 1 ? one : other, { count, ...params });
}
