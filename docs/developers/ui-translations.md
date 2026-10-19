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
import { provideNgxViewBuilderUiTranslations } from '@ngxviewbuilder/runtime';
import { LT_UI_DICTIONARY } from './i18n/lt';

providers: [
  provideNgxViewBuilderUiTranslations({ lt: LT_UI_DICTIONARY }, { language: 'lt' }),
]
```

## Starting from the built-in English dictionary

The library exports its own complete English dictionary, every translatable key with its default text, so you don't have to hunt them down one by one:

```ts
import { EN_UI_DICTIONARY } from '@ngxviewbuilder/runtime';

console.log(Object.keys(EN_UI_DICTIONARY).length); // every translatable key
```

Copy it, translate the values, keep the keys:

```ts
// i18n/de.ts
import { EN_UI_DICTIONARY } from '@ngxviewbuilder/runtime';

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

## Translating the plugins

The official plugins use the same dictionaries, so a host translates them like the rest of the builder. Each exports its English texts, every key with its default, to hand to a translator:

| Export | Package | Covers |
| --- | --- | --- |
| `NGX_VIEW_BUILDER_LOGIC_MAP_UI_EN` | `@ngxviewbuilder/plugin-logic-map` | the Logic map tab |
| `NGX_VIEW_BUILDER_DOCS_UI_EN` | `@ngxviewbuilder/plugin-docs` | the Documentation tab and panel, the copied and downloaded table |
| `NGX_VIEW_BUILDER_OPENAPI_UI_EN` | `@ngxviewbuilder/plugin-openapi` | the API tab and the API row of the data source editor |
| `NGX_VIEW_BUILDER_SHARED_UI_EN` | `@ngxviewbuilder/plugin-shared` | the sentences about rules both plugins write, and the license notice |

```ts
provideNgxViewBuilderUiTranslations({
  lt: {
    'logicMap.title': 'Logikos žemėlapis',
    'logic.visibleIf.when': 'Matomas, kai',
    'logic.op.isNot': 'nėra',
    'docs.progress': 'Aprašyta {documented} iš {total} elementų',
  },
});
```

The sentences about rules ("Visible when Country is not US and Revenue > 85000") are put together from these keys, operators included, so they read naturally once the keys are translated. Words in braces are filled in by the plugin: keep them, in whatever place the language needs. Element type names come from the builder's own `element.<type>` keys and property names from `property.<key>`, so they match the rest of the builder. A key you leave out stays in English, and dates follow the language.

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

The same goes for a language you never registered a dictionary for. Switch a view to `de` without a `de` dictionary and the builder chrome stays in English, rather than showing raw keys like `tab.preview`.
