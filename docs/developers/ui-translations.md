---
title: UI translations
description: Translate the builder interface itself (tabs, buttons, property labels).
---

# UI translations

Two translation systems exist. Don't mix them up:

| System | Translates | Managed by |
| --- | --- | --- |
| **Content translations** | the view's labels, options, messages | creators, in the [Translations tab](../creators/translations) |
| **UI dictionaries** | the builder/runtime chrome: tabs, buttons, property editor labels | developers (this page) |

## Providing dictionaries

```ts
import { provideNgxViewBuilderUiTranslations } from 'ngx-view-builder';
import { LT_UI_DICTIONARY } from './i18n/lt';

providers: [
  provideNgxViewBuilderUiTranslations({ lt: LT_UI_DICTIONARY }, { language: 'lt' }),
]
```

## Starting from the built-in English dictionary

The library exports its own complete English dictionary, every translatable key with its default text, so you don't have to hunt them down one by one:

```ts
import { EN_UI_DICTIONARY } from 'ngx-view-builder';

console.log(Object.keys(EN_UI_DICTIONARY).length); // every translatable key
```

Copy it, translate the values, keep the keys:

```ts
// i18n/de.ts
import { EN_UI_DICTIONARY } from 'ngx-view-builder';

export const DE_UI_DICTIONARY: Record<string, string> = {
  ...EN_UI_DICTIONARY,
  'eventAction.action.validate': 'Validieren',
  'eventAction.action.submit': 'Absenden',
  // ...translate the rest
};
```

This is also the fastest way to spot **missing** translations in a dictionary you already maintain: diff its keys against `Object.keys(EN_UI_DICTIONARY)`.

A dictionary is a nested/flat map of key → text, keyed by language code. Other channels:

```ts
api.setUiDictionaries({ lt: LT_UI_DICTIONARY }, /* merge */ true);
// or per component: [uiDictionaries]="dicts"
// or inside extensions config: { uiDictionaries: { lt: {...} } }
```

## Using translations in host code

Host UI that lives next to the builder (header actions, toolbars) can reuse the same dictionaries:

```ts
label: this.api.translateUi('host.actions.save.label', 'Save'),
```

`translateUi(key, fallback)` returns the fallback when the key is missing, so it is always safe to call. A `uiTranslate` pipe is exported for templates.

## Language resolution & sync

Match the builder language to your app automatically:

```ts
const handle = this.api.startLanguageSync({
  hostLanguageResolver: () => this.i18n.currentLang,
  supportedLanguages: ['lt', 'en'],
  fallbackLanguage: 'en',
  watchDocumentLanguage: true,   // follows <html lang="">
  applyLocale: true,             // also sets number/date locale
});
// handle.refresh(); handle.stop();
```

One-off resolution: `api.resolveHostLanguage(...)` / `api.applyHostLanguage(...)`; direct control: `api.setLanguage('lt')`, `api.setApplicationLocale('lt-LT')`.

## Workflow for a new language

1. Start from `EN_UI_DICTIONARY` (exported by the library, see above), or the demo app's complete `lt` dictionary in `projects/test-app/.../lt.ts` for a worked example.
2. Translate the values; keep the keys.
3. Register via the provider; set `language` or wire `startLanguageSync`.
4. Untranslated keys fall back to built-in English texts.
