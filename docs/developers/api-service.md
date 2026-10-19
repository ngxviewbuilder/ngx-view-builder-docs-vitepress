---
title: API service reference
description: NgxViewBuilderApiService, the one service a host application talks to. How calls reach the view, and every method by area with arguments, return values and examples.
---

# API service reference

`NgxViewBuilderApiService` is the one service your application talks to. Inject it anywhere, in a page component, a resolver, a service of your own, and use it to read and change the view on screen, react to what happens in it, and plug your own functions, validators, elements and icons in.

```ts
import { inject } from '@angular/core';
import { NgxViewBuilderApiService } from '@ngxviewbuilder/runtime';

export class ClientPage {
  private readonly api = inject(NgxViewBuilderApiService);

  async save(): Promise<void> {
    const result = await this.api.validateData();
    if (result.isValid) {
      await this.clients.save(this.api.getData());
    }
  }
}
```

An application that hosts the builder imports the same service from `@ngxviewbuilder/designer`. It is the same class.

## How a call reaches the view

You always inject the root service. What it talks to depends on what is on screen:

| On screen | Calls about the view (values, structure, elements, validation) go to | Registrations (functions, validators, elements, icons, theme) go to |
| --- | --- | --- |
| `<ngx-view-builder-runtime>` | that runtime view | the root and every runtime view, now and later |
| several runtime views | the one created last | the root and every runtime view |
| `<nvb-scope>` | the scope | the root and every scope |
| `<ngx-view-builder-designer>` | the view being edited (the builder owns it) | the root, the builder and its Preview |
| nothing yet | the root itself | the root; views created later pick them up |

Two things follow from that table. You can register everything at startup, before any view exists, and every view gets it. And with one view on screen you never need a reference to it, because the root forwards. Several views on one page are different, see the next section.

## The root API and a view's own API

There is one class, but there are several objects. `inject(NgxViewBuilderApiService)` gives you the root one, a single object for the whole app. Every `<ngx-view-builder-runtime>`, `<ngx-view-builder-renderer>` and `<nvb-scope>` makes one more for itself, so its data, structure and elements stay apart from every other view. A page with a nav bar view and a content view has three: the root, the nav bar's and the content's.

The component hands you its own one as `api`:

| | Root API, `inject(NgxViewBuilderApiService)` | A view's own API, `runtime.api` |
| --- | --- | --- |
| How many | one for the whole app | one per view component |
| Exists | always, even before any view | while that view component exists |
| `getData()`, `setValue()`, `getElement()`, `validateData()`... | go to the view created last | go to this view, always |
| Events (`onValueChanged`, `onComplete`...) | from every view on screen | from this view |
| Registrations (functions, validators, elements, icons) | reach every view, now and later | reach this view only |
| Use it for | registrations at startup, one view per page, listening to all views | several views on one page |

So with several views, the root is still right for registering things and for listening to everything, but a call like `getData()` on it reaches only the newest view. Ask the view itself instead:

```ts
import { Component, viewChild } from '@angular/core';
import { NgxViewBuilderRuntime } from '@ngxviewbuilder/runtime';

@Component({
  imports: [NgxViewBuilderRuntime],
  template: `
    <ngx-view-builder-runtime #client [pageJson]="clientView" />
    <ngx-view-builder-runtime #order [pageJson]="orderView" />
  `,
})
export class ClientOrderPage {
  private readonly client = viewChild.required('client', { read: NgxViewBuilderRuntime });
  private readonly order = viewChild.required('order', { read: NgxViewBuilderRuntime });

  async save(): Promise<void> {
    const check = await this.client().api.validateData();
    if (check.isValid) {
      await this.clients.save(this.client().api.getData());
    }
    this.order().api.setValue('status', 'ready');
  }
}
```

With a single view on the page, `viewChild.required(NgxViewBuilderRuntime)` is enough. The template can reach the API too, through the export names `nvbRuntime`, `nvbRenderer` and `nvbScope`:

```html
<ngx-view-builder-runtime #client="nvbRuntime" [pageJson]="clientView" />
<button type="button" (click)="client.api.validateData()">Check</button>
```

`api` exists as soon as the component does, but values and elements are there only after the view has rendered (see the tip below). On `<ngx-view-builder>` it is `undefined` until that component's view has initialised.

To tell views apart in events, listen on each view rather than on the root. Each component has outputs such as `(valueChanged)`, and `runtime.api.onValueChanged` fires for that view only. A root `onValueChanged` payload has the `dataPath` but not the view it came from, so two views with a field of the same name look the same there.

::: tip Waiting for a view
Values and elements exist once the view has rendered. Subscribe to `onAfterRender`, or call the API from a button or an event handler, rather than straight from your constructor.
:::

## Reading this reference

Each page groups the methods of one area. Every method shows its signature, what it does, an example, and what it returns. Types are written in TypeScript; `IStructure` is the view JSON described in [Structure JSON](./structure-json).

| Page | What it covers |
| --- | --- |
| [Structure & settings](./api/structure) | Read, replace and patch the view definition and its settings |
| [Data & values](./api/data) | Form data, single values, server errors, the dirty flag |
| [Elements](./api/elements) | Finding elements, reading and writing their properties, the element handle, rows of repeaters, element defaults |
| [Validation & lifecycle](./api/validation) | Validating the view or any structure, toasts, render and completion notifications |
| [Data sources & variables](./api/data-sources) | Reloading sources, host sources, websocket authorization, runtime variables and external context |
| [Language & theme](./api/language-theme) | Language, locale, translations, UI dictionaries, theme modes, tokens and custom CSS |
| [Extensions](./api/extensions) | Expression functions, validator types, custom elements and properties, icons, table cells |
| [Builder, templates & tables](./api/builder) | Template library, element library, table settings and filters, builder tabs |

Events have their own page: [Events reference](./events).

## Every method at a glance

| Area | Methods |
| --- | --- |
| Structure | [`getStructure`](./api/structure#getstructure) · [`getStructureModel`](./api/structure#getstructuremodel) · [`setStructure`](./api/structure#setstructure) · [`updateStructure`](./api/structure#updatestructure) · [`notifyStructureChanged`](./api/structure#notifystructurechanged) · [`captureStructureSource`](./api/structure#capturestructuresource-clearcapturedstructuresource) · [`clearCapturedStructureSource`](./api/structure#capturestructuresource-clearcapturedstructuresource) |
| Settings | [`getSettings`](./api/structure#getsettings) · [`getSetting`](./api/structure#getsetting) · [`setSetting`](./api/structure#setsetting) · [`patchSettings`](./api/structure#patchsettings) · [`updateSettings`](./api/structure#updatesettings) · [`replaceSettings`](./api/structure#replacesettings) |
| Data | [`getData`](./api/data#getdata) · [`setData`](./api/data#setdata) · [`setElementsData`](./api/data#setelementsdata) · [`setValue`](./api/data#setvalue) · [`setElementValue`](./api/data#setelementvalue) · [`getElementValue`](./api/data#getelementvalue) · [`clearValue`](./api/data#clearvalue) · [`clearValues`](./api/data#clearvalues) · [`clearElementValue`](./api/data#clearelementvalue) · [`resetElementValue`](./api/data#resetelementvalue) · [`clearData`](./api/data#cleardata) · [`isDirty`](./api/data#isdirty) · [`markPristine`](./api/data#markpristine) · [`setElementErrors`](./api/data#setelementerrors) · [`clearElementErrors`](./api/data#clearelementerrors) · [`getElementErrors`](./api/data#getelementerrors) |
| Element lookup | [`getElement`](./api/elements#getelement) · [`getElementModel`](./api/elements#getelementmodel) · [`getElementLookup`](./api/elements#getelementlookup) · [`getElementByDataPath`](./api/elements#getelementbydatapath) · [`getElementBySchemaPath`](./api/elements#getelementbyschemapath) · [`getRenderedElements`](./api/elements#getrenderedelements) · [`getElementName` and friends](./api/elements#single-lookup-fields) · [`describeElement`](./api/elements#describeelement) |
| DOM | [`getElementDom`](./api/elements#getelementdom) · [`getElementDomById`](./api/elements#getelementdombyid) · [`getElementDomByTestId`](./api/elements#getelementdombytestid) · [`queryRenderDom`](./api/elements#queryrenderdom) · [`queryRenderDomAll`](./api/elements#queryrenderdomall) · [`getRenderRoot`](./api/elements#getrenderroot-registerrenderroot) · [`registerRenderRoot`](./api/elements#getrenderroot-registerrenderroot) |
| Properties | [`getElementProperty`](./api/elements#getelementproperty) · [`setElementProperty`](./api/elements#setelementproperty) · [`setElementProperties`](./api/elements#setelementproperties) · [`removeElementProperty`](./api/elements#removeelementproperty-removeelementproperties) · [`removeElementProperties`](./api/elements#removeelementproperty-removeelementproperties) · [`resetElementProperty`](./api/elements#resetelementproperty-resetelementproperties) · [`resetElementProperties`](./api/elements#resetelementproperty-resetelementproperties) · [`updateElement`](./api/elements#updateelement) · [`refreshElement`](./api/elements#refreshelement) |
| Element handle | [`element`](./api/elements#element-getelementapi) · [`getElementApi`](./api/elements#element-getelementapi) · [rows](./api/elements#rows-of-a-dynamic-table-or-panel) · [columns](./api/elements#columns-of-a-repeater) · [cells](./api/elements#cells) |
| Element defaults | [`setElementTypeDefault`](./api/elements#setelementtypedefault-setelementtypedefaults) · [`setElementTypeDefaults`](./api/elements#setelementtypedefault-setelementtypedefaults) · [`setElementDefaults`](./api/elements#setelementdefaults-defaults) · [`defaults`](./api/elements#setelementdefaults-defaults) · [`getElementDefaults`](./api/elements#getelementdefaults-clearelementdefaults) · [`clearElementDefaults`](./api/elements#getelementdefaults-clearelementdefaults) · [`getElementTypeBuiltInDefaults`](./api/elements#getelementtypebuiltindefaults) |
| Validation | [`validateData`](./api/validation#validatedata) · [`showToast`](./api/validation#showtoast) · [`notifyValidationResult`](./api/validation#notifyvalidationresult) · [`notifyComplete`](./api/validation#notifycomplete) · [`notifySaveRequested`](./api/validation#notifysaverequested) |
| Lifecycle | [render notifications](./api/validation#notifybeforerender-notifyrender-notifyafterrender) · [`notifyTabChanged`](./api/validation#notifytabchanged) · [`notifyCurrentPageChanged`](./api/validation#notifycurrentpagechanged) · [`notifyDialogClosed`](./api/validation#notifydialogclosed) · [element interaction notifications](./api/validation#element-interaction-notifications) |
| Data sources | [`reloadDataSource`](./api/data-sources#reloaddatasource) · [`reloadElementDataSource`](./api/data-sources#reloadelementdatasource) · [`reloadElementsByDataSource`](./api/data-sources#reloadelementsbydatasource) · [`setDefaultDataSources`](./api/data-sources#setdefaultdatasources) · [`setDataSourceTypeSettings`](./api/data-sources#setdatasourcetypesettings-getdatasourcetypesettings) · [`getDataSourceTypeSettings`](./api/data-sources#setdatasourcetypesettings-getdatasourcetypesettings) · [`setWebsocketAuthorizer`](./api/data-sources#setwebsocketauthorizer) |
| Variables | [`setRuntimeVariableContext`](./api/data-sources#setruntimevariablecontext) · [`getRuntimeVariableContext`](./api/data-sources#getruntimevariablecontext-clearruntimevariablecontext) · [`clearRuntimeVariableContext`](./api/data-sources#getruntimevariablecontext-clearruntimevariablecontext) · [`setRuntimeVariableDefinitions`](./api/data-sources#setruntimevariabledefinitions) · [`getRuntimeVariableDefinitions`](./api/data-sources#getruntimevariabledefinitions) · [`configureRuntimeVariables`](./api/data-sources#configureruntimevariables) |
| Language | [`getLanguage`](./api/language-theme#getlanguage-setlanguage) · [`setLanguage`](./api/language-theme#getlanguage-setlanguage) · [`resolveHostLanguage`](./api/language-theme#resolvehostlanguage-applyhostlanguage) · [`applyHostLanguage`](./api/language-theme#resolvehostlanguage-applyhostlanguage) · [`startLanguageSync`](./api/language-theme#startlanguagesync) · [`setApplicationLocale`](./api/language-theme#setapplicationlocale-getapplicationlocale) · [`getApplicationLocale`](./api/language-theme#setapplicationlocale-getapplicationlocale) · [`setLocale`](./api/language-theme#setlocale) · [`setContentTranslations`](./api/language-theme#setcontenttranslations) · [`setUiDictionaries`](./api/language-theme#setuidictionaries-setuitranslations) · [`setUiTranslations`](./api/language-theme#setuidictionaries-setuitranslations) · [`translateUi`](./api/language-theme#translateui) · [`setPropertyHints`](./api/language-theme#setpropertyhints-setpropertytypehints) · [`setPropertyTypeHints`](./api/language-theme#setpropertyhints-setpropertytypehints) |
| Theme | [`setThemeMode`](./api/language-theme#setthememode-getthememode) · [`getThemeMode`](./api/language-theme#setthememode-getthememode) · [`setTheme`](./api/language-theme#settheme) · [`setCustomTheme`](./api/language-theme#setcustomtheme-getcustomtheme) · [`getCustomTheme`](./api/language-theme#setcustomtheme-getcustomtheme) · [`setCssVariables`](./api/language-theme#setcssvariables-getcssvariables) · [`getCssVariables`](./api/language-theme#setcssvariables-getcssvariables) · [`setCustomCss`](./api/language-theme#setcustomcss-getcustomcss) · [`getCustomCss`](./api/language-theme#setcustomcss-getcustomcss) · [`setCustomCssUrls`](./api/language-theme#setcustomcssurls-getcustomcssurls) · [`getCustomCssUrls`](./api/language-theme#setcustomcssurls-getcustomcssurls) |
| Extensions | [`registerExtensions`](./api/extensions#registerextensions-registerextensionsasync) · [`registerExtensionsAsync`](./api/extensions#registerextensions-registerextensionsasync) · [expression functions](./api/extensions#registerexpressionfunction-registerexpressionfunctions) · [validator types](./api/extensions#registervalidatortype-registervalidatortypes) · [`getRegisteredValidatorTypes`](./api/extensions#getregisteredvalidatortypes-clearregisteredvalidatortypes) · [`clearRegisteredValidatorTypes`](./api/extensions#getregisteredvalidatortypes-clearregisteredvalidatortypes) · [custom elements](./api/extensions#registercustomelement-registercustomelements) · [`registerElementGroup`](./api/extensions#registerelementgroup) · [element properties](./api/extensions#element-properties) · [SVG icons](./api/extensions#svg-icons) · [table cell types](./api/extensions#table-cell-element-types) · [`getTableHeaderCenterExtensions`](./api/extensions#gettableheadercenterextensions) |
| Templates | [`getTemplates`](./api/builder#gettemplates) · [`loadTemplates`](./api/builder#loadtemplates-settemplates) · [`saveTemplate`](./api/builder#savetemplate-upserttemplate) · [`deleteTemplate`](./api/builder#deletetemplate-removetemplate) · [`setTemplateActionMap`](./api/builder#settemplateactionmap-registertemplateactiondatasource) · [`registerTemplateActionDataSource`](./api/builder#settemplateactionmap-registertemplateactiondatasource) |
| Element library | [`loadSidebarGroups`](./api/builder#loadsidebargroups) · [`saveSidebarGroup`](./api/builder#savesidebargroup-upsertsidebargroup) · [`deleteSidebarGroup`](./api/builder#deletesidebargroup-removesidebargroup) |
| Tables | [`setTableSettings`](./api/builder#settablesettings-gettablesettings) · [`getTableSettings`](./api/builder#settablesettings-gettablesettings) · [`setTableFilters`](./api/builder#settablefilters-gettablefilters) · [`getTableFilters`](./api/builder#settablefilters-gettablefilters) · [`setTableSavedFilters`](./api/builder#settablesavedfilters-gettablesavedfilters) · [`getTableSavedFilters`](./api/builder#settablesavedfilters-gettablesavedfilters) · [`request*` methods](./api/builder#asking-the-host-for-table-state) |
| Builder | [`switchToTab`](./api/builder#switchtotab-requesttabchange) · [`requestTabChange`](./api/builder#switchtotab-requesttabchange) · [`isBuilderAttached`](./api/builder#isbuilderattached-getbuilderadapter-attachbuilderadapter) · [`getBuilderAdapter`](./api/builder#isbuilderattached-getbuilderadapter-attachbuilderadapter) · [`attachBuilderAdapter`](./api/builder#isbuilderattached-getbuilderadapter-attachbuilderadapter) · [`setAiAssistantConfig`](./api/builder#setaiassistantconfig-getaiassistantconfig) · [`getAiAssistantConfig`](./api/builder#setaiassistantconfig-getaiassistantconfig) |
