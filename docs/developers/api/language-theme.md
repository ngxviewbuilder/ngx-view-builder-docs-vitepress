---
title: "API: language & theme"
description: Switch language and locale, add content translations and UI dictionaries, follow the host's language, and set theme modes, design tokens and custom CSS.
---

# Language & theme

| Method | Returns | In short |
| --- | --- | --- |
| [`getLanguage` / `setLanguage`](#getlanguage-setlanguage) | `string` / `void` | The active language |
| [`resolveHostLanguage` / `applyHostLanguage`](#resolvehostlanguage-applyhostlanguage) | `{ language, locale }` | Pick the language from the page or the browser |
| [`startLanguageSync(options)`](#startlanguagesync) | `{ refresh, stop }` | Keep following the host's language |
| [`setApplicationLocale` / `getApplicationLocale`](#setapplicationlocale-getapplicationlocale) | `void` / `string` | Number and date formatting |
| [`setLocale(locale)`](#setlocale) | `void` | Locale in the formatter and in the view's settings |
| [`setContentTranslations(translations, merge?)`](#setcontenttranslations) | `void` | Translate labels, options, messages |
| [`setUiDictionaries` / `setUiTranslations`](#setuidictionaries-setuitranslations) | `void` | Translate the library's own texts |
| [`translateUi(key, fallback?)`](#translateui) | `string` | Read a UI text |
| [`setPropertyHints` / `setPropertyTypeHints`](#setpropertyhints-setpropertytypehints) | `void` | Help texts in the builder's property panel |
| [`setThemeMode` / `getThemeMode`](#setthememode-getthememode) | `void` / mode | Light or dark |
| [`setTheme(modeOrTokens)`](#settheme) | `void` | A mode or a token map |
| [`setCustomTheme` / `getCustomTheme`](#setcustomtheme-getcustomtheme) | `void` / theme | Tokens per mode |
| [`setCssVariables` / `getCssVariables`](#setcssvariables-getcssvariables) | `void` / map | Token overrides |
| [`setCustomCss` / `getCustomCss`](#setcustomcss-getcustomcss) | `void` / `string` | Extra CSS inside the view |
| [`setCustomCssUrls` / `getCustomCssUrls`](#setcustomcssurls-getcustomcssurls) | `void` / `string[]` | Extra stylesheets |

## Language

Two kinds of text are translated separately: the view's own texts (labels, options, messages a creator wrote) come from its `localization`, and the library's texts (Submit, Add row, validator messages) come from the UI dictionaries. See [Translations](../../creators/translations) and [UI translations](../ui-translations).

### `getLanguage()` / `setLanguage()`

```ts
getLanguage(): string
setLanguage(language: string): void
```

Switches both at once and redraws the view. A language the view does not list yet is added to its localization. Fires `onLanguageChanged`.

```ts
api.setLanguage('lt');
api.getLanguage(); // 'lt'
```

A bound `[language]` input on the component sets the language when it changes; a later `setLanguage()` call stays in effect until the input changes again.

### `resolveHostLanguage()` / `applyHostLanguage()`

```ts
resolveHostLanguage(options?: INgxViewBuilderLanguageResolveOptions): { language: string; locale: string }
applyHostLanguage(options?: INgxViewBuilderLanguageResolveOptions): { language: string; locale: string }
```

Picks the best language from `hostLanguageCode`, `hostLanguageResolver`, `<html lang>` or the browser, limited to `supportedLanguages`, falling back to `fallbackLanguage`. `applyHostLanguage` also applies it (and the locale, unless `applyLocale: false`).

```ts
document.documentElement.lang = 'lt-LT';
api.resolveHostLanguage({ supportedLanguages: ['en', 'lt'], fallbackLanguage: 'en' });
// { language: 'lt', locale: 'lt-LT' }
```

### `startLanguageSync()`

```ts
startLanguageSync(options?: INgxViewBuilderLanguageSyncOptions): { refresh: () => string; stop: () => void }
```

Keeps the view on the host's language: it watches `<html lang>` (`watchDocumentLanguage`, on by default) and the browser's `languagechange` (`watchSystemLanguage`). `onResolved` tells you what was picked.

```ts
const sync = api.startLanguageSync({
  supportedLanguages: ['en', 'lt', 'de'],
  fallbackLanguage: 'en',
  hostLanguageResolver: () => this.i18n.currentLang,
  onResolved: ({ language }) => console.log('view language', language),
});

this.i18n.langChanged.subscribe(() => sync.refresh());
// in ngOnDestroy
sync.stop();
```

### `setApplicationLocale()` / `getApplicationLocale()`

```ts
setApplicationLocale(locale: string): void
getApplicationLocale(): string
```

The locale for number and date formatting, independent of the language. Until set, formatting follows the view's `settings.locale`, then the browser.

```ts
api.setApplicationLocale('de-DE'); // 1.234,56
api.getApplicationLocale();        // 'de-DE'
```

### `setLocale()`

```ts
setLocale(locale: string): void
```

Sets the application locale and writes it into the view's settings, so it is saved with the view.

### `setContentTranslations()`

```ts
setContentTranslations(translations: Record<string, Record<string, string>>, merge = true): void
```

Adds translations of the view's own texts, keyed by language and translation key, the same format the Translations tab exports. Labels redraw at once when that language is active.

```ts
api.setContentTranslations({
  lt: { 'elements.firstName.label': 'Vardas', 'elements.email.label': 'El. paštas' },
  de: { 'elements.firstName.label': 'Vorname' },
});
```

### `setUiDictionaries()` / `setUiTranslations()`

```ts
setUiDictionaries(dictionaries: Record<string, Record<string, string>>, merge = true): void
setUiTranslations(dictionaries: Record<string, Record<string, string>>, merge = true): void
```

The library's own texts, by language. The two names do the same. Start from the exported `EN_UI_DICTIONARY` to see every key.

```ts
api.setUiDictionaries({ lt: { 'preview.submit': 'Pateikti', 'preview.validate': 'Tikrinti' } });
```

### `translateUi()`

```ts
translateUi(key: string, fallback?: string): string
```

```ts
api.translateUi('preview.submit');               // 'Submit'
api.translateUi('host.save', 'Save');            // 'Save' when the key is not in any dictionary
```

### `setPropertyHints()` / `setPropertyTypeHints()`

```ts
setPropertyHints(hints: Record<string, string>): void
setPropertyTypeHints(hints: Record<string, string>): void
```

Your own help texts in the builder's property panel, per property key or per editor type.

```ts
api.setPropertyHints({ name: 'Becomes the column name in our database, use camelCase.' });
api.setPropertyTypeHints({ sourceMapper: 'Ask the data team which endpoint to use.' });
```

## Theme

All visuals come from `--nvb-*` design tokens; see [Theming](../theming). Theme calls made before a view exists apply to every view created later.

### `setThemeMode()` / `getThemeMode()`

```ts
setThemeMode(theme: 'light' | 'dark'): void
getThemeMode(): 'light' | 'dark' | null
```

Fires `onThemeModeChanged`.

```ts
api.setThemeMode('dark');
api.getThemeMode(); // 'dark'
```

### `setTheme()`

```ts
setTheme(theme: 'light' | 'dark' | Record<string, string>): void
```

A mode, or a map of tokens applied on top of the active mode: one call for either.

```ts
api.setTheme('dark');
api.setTheme({ '--nvb-color-primary-500': 'oklch(64% 0.19 145)' });
```

### `setCustomTheme()` / `getCustomTheme()`

```ts
setCustomTheme(theme: { shared?: Record<string, string>; light?: Record<string, string>; dark?: Record<string, string>; mergeWithDefaults?: boolean } | null): void
getCustomTheme(): INgxViewBuilderCustomThemeDefinition | null
```

Tokens per mode; the right set is applied whenever the mode changes. Fires `onCustomThemeChanged`.

```ts
api.setCustomTheme({
  shared: { '--nvb-font-family-base': "'Inter', sans-serif" },
  light: { '--nvb-color-primary-500': 'oklch(64% 0.19 145)' },
  dark: { '--nvb-color-primary-500': 'oklch(72% 0.17 145)' },
  mergeWithDefaults: true,
});
```

### `setCssVariables()` / `getCssVariables()`

```ts
setCssVariables(cssVariables: Record<string, string>): void
getCssVariables(): Record<string, string>
```

Token overrides; names without `--` get it added. Fires `onCssVariablesChanged`.

```ts
api.setCssVariables({ '--nvb-color-primary-500': 'rgb(14, 116, 144)', 'nvb-radius-md': '10px' });
api.getCssVariables(); // { '--nvb-color-primary-500': 'rgb(14, 116, 144)', '--nvb-radius-md': '10px' }
```

### `setCustomCss()` / `getCustomCss()`

```ts
setCustomCss(cssText: string | null): void
getCustomCss(): string
```

CSS injected inside the view's shadow root, where your page's stylesheets cannot reach. Element components carry their own scoped styles, so write selectors at least as specific as theirs: target the stable `data-testid` hooks together with a class, or use `!important` for a one off. See [Custom CSS](../custom-css).

```ts
api.setCustomCss(`
  [data-testid="nvb-element-total"] .nvb-field__label { font-weight: 700; }
  .invoice-total { font-size: 18px !important; }
`);
```

### `setCustomCssUrls()` / `getCustomCssUrls()`

```ts
setCustomCssUrls(urls: string[] | null): void
getCustomCssUrls(): string[]
```

Stylesheets loaded into the view, for overrides you version with your app.

```ts
api.setCustomCssUrls(['/assets/builder-overrides.css']);
```
