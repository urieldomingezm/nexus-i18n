# nexus-i18n

Núcleo de i18n diminuto para las librerías NEXUS (nexus-dialogs, nexus-tours, nexus-expediente): claves anidadas, interpolación, plurales con `Intl.PluralRules`, idioma de respaldo y formatos `Intl`. Sin dependencias y sin DOM.

> Estado: núcleo implementado y probado (~1.1 KB gzip). Aún sin publicar en npm.

```ts
import { createI18n } from 'nexus-i18n'

const i18n = createI18n({
  lang: 'auto',
  fallback: 'es',
  messages: {
    es: { botones: { guardar: 'Guardar' }, dias: { one: '{n} día', other: '{n} días' } },
    en: { botones: { guardar: 'Save' }, dias: { one: '{n} day', other: '{n} days' } },
  },
})

i18n.t('botones.guardar')
i18n.t('dias', { n: 3 })
i18n.setLang('en')
```

## Notas de uso

- Idioma: acepta variantes (`en-US` → `en`) sin distinguir mayúsculas; si no existe, usa `fallback`. `lang: 'auto'` toma `<html lang>` o un segmento de la ruta (`/en/`); `setLang('auto')` vuelve a detectar.
- Claves: anidadas (`botones.guardar`); si falta en el idioma activo se busca en el de respaldo, y si no existe en ninguno `t()` devuelve la clave.
- Plurales: se elige con `Intl.PluralRules` usando la variable `n`; `zero` solo se usa si lo defines.
- `register()` mezcla en profundidad con lo que ya había y avisa a `onChange`.
- No toca el DOM, así que `onChange` no observa cambios en `<html lang>`: llama a `setLang`.

## Desarrollo

```sh
npm install
npm run typecheck && npm test && npm run build
```

MIT © DevMedina
