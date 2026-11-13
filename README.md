# nexus-i18n

Núcleo de i18n diminuto para las librerías NEXUS (nexus-dialogs, nexus-tours, nexus-expediente): claves anidadas, interpolación, plurales con `Intl.PluralRules`, idioma de respaldo y formatos `Intl`. Sin dependencias y sin DOM.

> Estado: esqueleto. La API está definida en `src/types.ts`; falta implementarla.

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

## Desarrollo

```sh
npm install
npm run typecheck && npm test && npm run build
```

MIT © DevMedina
