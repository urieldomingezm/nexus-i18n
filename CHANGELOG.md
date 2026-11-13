# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versiones con [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado

- Núcleo de i18n sin dependencias y sin DOM (~1.1 KB gzip): `createI18n({ lang, fallback, messages })` con `t()` (claves anidadas, interpolación `{n}` y plurales con `Intl.PluralRules`), idioma de respaldo, variantes regionales (`en-US` → `en`), `lang: 'auto'` (`<html lang>` o la ruta), `setLang`, `register`, `onChange` y formatos `Intl` de número, fecha y moneda.
- Publicación automatizada: «Nueva versión» sube la versión y «Publicar en npm» la deja en espera hasta aprobarla con 2FA.
