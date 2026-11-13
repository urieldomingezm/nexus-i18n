/** Valor de un mensaje: texto, plural por categoría Intl, o grupo anidado. */
export type Message = string | PluralForms | Messages
export interface Messages {
  [key: string]: Message
}
/** Categorías de Intl.PluralRules; `other` es obligatoria. */
export interface PluralForms {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}
export type Vars = Record<string, string | number>
export type Unsubscribe = () => void

export interface I18nOptions {
  /** Idioma activo; `'auto'` lo toma de `<html lang>` o de la ruta (`/en`, `/pt`). */
  lang: string
  /** Idioma al que se recurre cuando falta una clave. */
  fallback?: string
  messages: Record<string, Messages>
}

export interface I18n {
  readonly lang: string
  t(key: string, vars?: Vars): string
  setLang(lang: string): void
  /** Añade o extiende los textos de un idioma. */
  register(lang: string, messages: Messages): void
  onChange(fn: (lang: string) => void): Unsubscribe
  /** Formatos Intl ligados al idioma activo. */
  format: {
    number(n: number, opts?: Intl.NumberFormatOptions): string
    date(d: Date | number, opts?: Intl.DateTimeFormatOptions): string
    currency(n: number, currency: string): string
  }
}
