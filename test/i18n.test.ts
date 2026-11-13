import { afterEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from '../src'

const messages = {
  es: { hola: 'Hola', botones: { guardar: 'Guardar' }, saludo: 'Hola, {nombre}', dias: { one: '{n} día', other: '{n} días' }, solo_es: 'Solo en español', 'a.b': 'clave plana' },
  en: { hola: 'Hello', botones: { guardar: 'Save' }, saludo: 'Hello, {nombre}', dias: { one: '{n} day', other: '{n} days' } },
}
const crear = (lang = 'es') => createI18n({ lang, fallback: 'es', messages })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('t()', () => {
  it('resuelve claves anidadas y planas', () => {
    const i = crear()
    expect(i.t('hola')).toBe('Hola')
    expect(i.t('botones.guardar')).toBe('Guardar')
    expect(i.t('a.b')).toBe('clave plana')
  })
  it('interpola {vars} y deja las que faltan tal cual', () => {
    const i = crear()
    expect(i.t('saludo', { nombre: 'Uriel' })).toBe('Hola, Uriel')
    expect(i.t('saludo', {})).toBe('Hola, {nombre}')
    expect(i.t('saludo')).toBe('Hola, {nombre}')
  })
  it('elige el plural con Intl.PluralRules', () => {
    const i = crear()
    expect(i.t('dias', { n: 1 })).toBe('1 día')
    expect(i.t('dias', { n: 3 })).toBe('3 días')
    i.setLang('en')
    expect(i.t('dias', { n: 1 })).toBe('1 day')
    expect(i.t('dias', { n: 0 })).toBe('0 days')
  })
  it('usa la forma `zero` solo cuando existe', () => {
    const i = createI18n({ lang: 'en', messages: { en: { n: { zero: 'none', one: '{n} item', other: '{n} items' } } } })
    expect(i.t('n', { n: 0 })).toBe('none')
    expect(i.t('n', { n: 2 })).toBe('2 items')
  })
  it('sin `n` un plural usa `other`', () => {
    expect(crear().t('dias')).toBe('{n} días')
  })
  it('cae al idioma de respaldo si falta la clave', () => {
    expect(crear('en').t('solo_es')).toBe('Solo en español')
  })
  it('devuelve la clave si no existe en ningún idioma o si es un grupo', () => {
    const i = crear()
    expect(i.t('no.existe')).toBe('no.existe')
    expect(i.t('botones')).toBe('botones')
  })
  it('no sigue claves heredadas del prototipo', () => {
    expect(crear().t('constructor')).toBe('constructor')
    expect(crear().t('__proto__.x')).toBe('__proto__.x')
  })
})

describe('idioma activo', () => {
  it('acepta variantes regionales y mayúsculas', () => {
    expect(crear('EN-us').lang).toBe('en')
    expect(crear('es_MX').lang).toBe('es')
  })
  it('un idioma desconocido cae al de respaldo', () => {
    const i = crear('xx')
    expect(i.lang).toBe('es')
    expect(i.t('hola')).toBe('Hola')
  })
  it("lang: 'auto' lee <html lang>", () => {
    vi.stubGlobal('document', { documentElement: { lang: 'en' } })
    expect(crear('auto').lang).toBe('en')
  })
  it("lang: 'auto' lee la ruta si <html lang> no coincide", () => {
    vi.stubGlobal('document', { documentElement: { lang: 'de' } })
    vi.stubGlobal('location', { pathname: '/nexus-dialogs/en/guia' })
    expect(crear('auto').lang).toBe('en')
  })
  it("lang: 'auto' sin pista usa el respaldo; sin respaldo, el primer idioma", () => {
    expect(crear('auto').lang).toBe('es')
    expect(createI18n({ lang: 'auto', messages: { fr: {}, en: {} } }).lang).toBe('fr')
  })
  it("setLang('auto') vuelve a detectar", () => {
    const i = crear('en')
    vi.stubGlobal('document', { documentElement: { lang: 'es' } })
    i.setLang('auto')
    expect(i.lang).toBe('es')
  })
})

describe('onChange / setLang / register', () => {
  it('avisa solo cuando el idioma cambia de verdad', () => {
    const i = crear()
    const fn = vi.fn()
    i.onChange(fn)
    i.setLang('es')
    expect(fn).not.toHaveBeenCalled()
    i.setLang('en')
    expect(fn).toHaveBeenCalledWith('en')
  })
  it('onChange devuelve la función para darse de baja', () => {
    const i = crear()
    const fn = vi.fn()
    const baja = i.onChange(fn)
    baja()
    i.setLang('en')
    expect(fn).not.toHaveBeenCalled()
  })
  it('register añade idiomas nuevos y extiende los existentes sin borrar lo demás', () => {
    const i = crear()
    i.register('pt', { hola: 'Olá' })
    i.register('es', { botones: { cancelar: 'Cancelar' } })
    expect(i.t('botones.guardar')).toBe('Guardar')
    expect(i.t('botones.cancelar')).toBe('Cancelar')
    i.setLang('pt')
    expect(i.t('hola')).toBe('Olá')
    expect(i.t('botones.guardar')).toBe('Guardar')
  })
  it('register avisa a los suscriptores', () => {
    const i = crear()
    const fn = vi.fn()
    i.onChange(fn)
    i.register('pt', { hola: 'Olá' })
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('register ignora __proto__', () => {
    const i = crear()
    i.register('es', JSON.parse('{"__proto__":{"x":"hack"}}'))
    expect(({} as Record<string, unknown>).x).toBeUndefined()
  })
  it('no modifica los textos que recibió', () => {
    const copia = JSON.stringify(messages)
    const i = crear()
    i.register('es', { hola: 'Buenas' })
    expect(JSON.stringify(messages)).toBe(copia)
  })
})

describe('format', () => {
  it('usa el idioma activo', () => {
    const i = crear()
    expect(i.format.number(1234.5)).toBe(new Intl.NumberFormat('es').format(1234.5))
    expect(i.format.currency(10, 'MXN')).toBe(new Intl.NumberFormat('es', { style: 'currency', currency: 'MXN' }).format(10))
    i.setLang('en')
    expect(i.format.number(1234.5)).toBe('1,234.5')
    expect(i.format.date(Date.UTC(2026, 10, 13), { timeZone: 'UTC', dateStyle: 'long' })).toBe('November 13, 2026')
  })
})
