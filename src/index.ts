import type { I18n, I18nOptions, Message, Messages, PluralForms, Unsubscribe, Vars } from './types'

export type * from './types'

const CATEGORIAS = ['zero', 'one', 'two', 'few', 'many', 'other']
const tiene = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k)

const esPlural = (m: unknown): m is PluralForms =>
  typeof m === 'object' && m !== null && typeof (m as PluralForms).other === 'string' && Object.keys(m).every((k) => CATEGORIAS.includes(k) && typeof (m as Record<string, unknown>)[k] === 'string')
const esGrupo = (m: unknown): m is Messages => typeof m === 'object' && m !== null && !esPlural(m)

/** Mezcla `b` sobre `a` sin modificar ninguno; los grupos se combinan en profundidad. */
function mezclar(a: Messages, b: Messages): Messages {
  const salida: Messages = { ...a }
  for (const k of Object.keys(b)) {
    if (k === '__proto__') continue
    salida[k] = esGrupo(salida[k]) && esGrupo(b[k]) ? mezclar(salida[k], b[k]) : b[k]
  }
  return salida
}

/** Busca una clave (`botones.guardar`); también acepta una clave plana que contenga puntos. Un grupo no es un texto. */
function buscar(textos: Messages, clave: string): string | PluralForms | undefined {
  let actual: Message | undefined = tiene(textos, clave) ? textos[clave] : undefined
  if (actual === undefined) {
    actual = textos
    for (const parte of clave.split('.')) {
      if (!esGrupo(actual) || !tiene(actual, parte)) return undefined
      actual = actual[parte]
    }
  }
  return typeof actual === 'string' || esPlural(actual) ? actual : undefined
}

/** Crea una instancia de i18n: textos por idioma, plurales, respaldo y formatos `Intl`. Sin DOM: sirve también en Node. */
export function createI18n(opciones: I18nOptions): I18n {
  let almacen: Record<string, Messages> = { ...opciones.messages }
  const respaldo = opciones.fallback
  const oyentes = new Set<(lang: string) => void>()
  const reglas = new Map<string, Intl.PluralRules>()

  /** El idioma disponible que mejor encaja (`en-US` → `en`), sin distinguir mayúsculas. */
  const elegir = (pedido: string): string | undefined => {
    const p = pedido.toLowerCase().replace('_', '-')
    for (const candidato of [p, p.split('-')[0]]) {
      const hallado = Object.keys(almacen).find((k) => k.toLowerCase() === candidato)
      if (hallado) return hallado
    }
    return undefined
  }

  /** Idioma de la página: `<html lang>` o un segmento de la ruta (`/en/`, `/pt/`) que coincida con un idioma disponible. */
  const detectar = (): string | undefined => {
    const g = globalThis as { document?: { documentElement?: { lang?: string } }; location?: { pathname?: string } }
    const candidatos = [g.document?.documentElement?.lang, ...String(g.location?.pathname ?? '').split('/')]
    for (const c of candidatos) {
      const hallado = c ? elegir(c) : undefined
      if (hallado) return hallado
    }
    return undefined
  }

  const resolver = (pedido: string): string => {
    const hallado = pedido === 'auto' ? detectar() : elegir(pedido)
    return hallado ?? (respaldo && elegir(respaldo)) ?? (pedido === 'auto' ? Object.keys(almacen)[0] : undefined) ?? pedido
  }

  let lang = resolver(opciones.lang)
  const avisar = () => oyentes.forEach((fn) => fn(lang))

  const categoria = (n: number): string => {
    let r = reglas.get(lang)
    if (!r) reglas.set(lang, (r = new Intl.PluralRules(lang)))
    return r.select(n)
  }

  const t = (clave: string, vars?: Vars): string => {
    const cadena = [lang, lang.split('-')[0], respaldo && elegir(respaldo)]
    let msg: string | PluralForms | undefined
    for (const l of cadena) {
      msg = l && almacen[l] ? buscar(almacen[l], clave) : undefined
      if (msg !== undefined) break
    }
    if (msg === undefined) return clave
    if (typeof msg !== 'string') {
      const n = Number(vars?.n)
      const cat = Number.isNaN(n) ? 'other' : n === 0 && msg.zero !== undefined ? 'zero' : categoria(n)
      msg = msg[cat as keyof PluralForms] ?? msg.other
    }
    return vars ? msg.replace(/\{(\w+)\}/g, (m, k: string) => (tiene(vars, k) ? String(vars[k]) : m)) : msg
  }

  return {
    get lang() {
      return lang
    },
    t,
    setLang(nuevo: string) {
      const anterior = lang
      lang = resolver(nuevo)
      if (lang !== anterior) avisar()
    },
    register(idioma: string, textos: Messages) {
      const clave = Object.keys(almacen).find((k) => k.toLowerCase() === idioma.toLowerCase()) ?? idioma
      almacen = { ...almacen, [clave]: mezclar(almacen[clave] ?? {}, textos) }
      avisar()
    },
    onChange(fn: (lang: string) => void): Unsubscribe {
      oyentes.add(fn)
      return () => void oyentes.delete(fn)
    },
    format: {
      number: (n, o) => new Intl.NumberFormat(lang, o).format(n),
      date: (d, o) => new Intl.DateTimeFormat(lang, o).format(d),
      currency: (n, moneda) => new Intl.NumberFormat(lang, { style: 'currency', currency: moneda }).format(n),
    },
  }
}
