import { describe, it } from 'vitest'

describe('createI18n', () => {
  it.todo('t() resuelve claves anidadas')
  it.todo('t() interpola {vars}')
  it.todo('t() elige plural con Intl.PluralRules')
  it.todo('cae al idioma de respaldo si falta la clave')
  it.todo("lang: 'auto' lee <html lang> y la ruta")
  it.todo('setLang() avisa a los suscriptores de onChange()')
  it.todo('register() añade idiomas y extiende los existentes')
  it.todo('format.* usa el idioma activo')
})
