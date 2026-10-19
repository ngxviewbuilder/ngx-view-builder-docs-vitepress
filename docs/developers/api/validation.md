---
title: "API: validation & lifecycle"
description: Validate the view on screen or any structure headlessly, show toasts, and fire the render, completion and interaction notifications.
---

# Validation & lifecycle

| Method | Returns | In short |
| --- | --- | --- |
| [`validateData()`](#validatedata) | `Promise<INgxViewBuilderValidationEvent>` | Validate the view on screen, or any structure headlessly |
| [`showToast(payload)`](#showtoast) | `void` | Show a toast inside the view |
| [`notifyValidationResult(isValid, issues)`](#notifyvalidationresult) | `void` | Fire `onValidated` |
| [`notifyComplete(isValid, data, issues)`](#notifycomplete) | `void` | Fire `onComplete` |
| [`notifySaveRequested(source?)`](#notifysaverequested) | `void` | Fire `onSaveRequested` |
| [render notifications](#notifybeforerender-notifyrender-notifyafterrender) | `void` | Fire the render phases |
| [`notifyTabChanged`](#notifytabchanged) / [`notifyCurrentPageChanged`](#notifycurrentpagechanged) / [`notifyDialogClosed`](#notifydialogclosed) | `void` | Fire navigation events |
| [element interaction notifications](#element-interaction-notifications) | `void` | Fire repeater, upload, tab and accordion events |

## Validating

### `validateData()`

```ts
validateData(options?: INgxViewBuilderValidateDataOptions): Promise<INgxViewBuilderValidationEvent>
validateData(structure: IStructure | string, data: Record<string, unknown> | string | null, options?): Promise<INgxViewBuilderValidationEvent>
```

Two ways to call it.

**The view on screen.** Without a structure, it validates the view the person is filling in, exactly like the built-in Validate button: every rule runs, messages appear under the fields, and `onValidating` / `onValidated` fire.

```ts
const result = await api.validateData();
if (!result.isValid) {
  console.table(result.issues);
  return;
}
await save(api.getData());
```

**Any structure, headlessly.** With a structure and data, it builds a throwaway copy of the view, applies the data, runs expressions and validators, and returns the result. The view on screen is not touched, so you can check stored records, a submission on its way to the server, or a structure that is not rendered at all.

```ts
const structure = await firstValueFrom(http.get<IStructure>('/api/views/client'));
const result = await api.validateData(structure, { firstName: '', email: 'not-an-email' });
```

Both return:

```json
{
  "isValid": false,
  "issues": [
    { "elementName": "firstName", "dataPath": "firstName", "errors": ["This field is required."] },
    { "elementName": "email", "dataPath": "email", "errors": ["Enter a valid email address"] }
  ]
}
```

Options:

| Option | Default | What it does |
| --- | --- | --- |
| `emitValidationEvent` | `true` | Fire `onValidated` with the result. Pass `false` for a silent check. |
| `includeHidden` | `false` | Report issues of hidden elements too. |
| `includeDisabled` | `false` | Report issues of disabled and read-only elements too. |

Validator types you [registered](./extensions#registervalidatortype-registervalidatortypes) and expression functions take part in both modes. For validating on a server, see [Headless validation](../validator).

## Toasts

### `showToast()`

```ts
showToast(payload: {
  title?: string;
  message?: string;
  variant?: 'success' | 'info' | 'warning' | 'error';
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  autoHide?: boolean;
  autoHideMs?: number;
  showIcon?: boolean;
  icon?: string;
}): void
```

The same toast the view's own *Toast* action shows, styled with its tokens.

```ts
api.showToast({ title: 'Saved', message: 'Client HF-20418 was updated.', variant: 'success' });
api.showToast({ title: 'Offline', variant: 'warning', position: 'bottom-center', autoHide: false });
```

## Notifications

These fire the events and the automation triggers behind them. The runtime and the builder call them at the right moments; call them yourself when your own code does the equivalent, for example a Save button outside the view.

### `notifyValidationResult()`

```ts
notifyValidationResult(isValid: boolean, issues: INgxViewBuilderValidationIssue[]): void
```

Fires `onValidating`, `onValidated` and the `validated` trigger.

### `notifyComplete()`

```ts
notifyComplete(isValid: boolean, data: Record<string, unknown>, issues: INgxViewBuilderValidationIssue[]): void
```

Fires `onComplete` and the `completed` trigger, what the Submit button does after validating.

```ts
const result = await api.validateData();
api.notifyComplete(result.isValid, api.getData(), result.issues);
```

### `notifySaveRequested()`

```ts
notifySaveRequested(source: 'header' | 'api' = 'api'): void
```

Fires `onSaveRequested` with `{ source, timestamp }`, the event the builder's Save button sends.

### `notifyBeforeRender()` / `notifyRender()` / `notifyAfterRender()`

```ts
notifyBeforeRender(tab: NgxViewBuilderBuilderTabCode): void
notifyRender(tab: NgxViewBuilderBuilderTabCode): void
notifyAfterRender(tab: NgxViewBuilderBuilderTabCode): void
```

Fire `onBeforeRender`, `onRender` (with one `onElementRender` per element) and `onAfterRender` (with `onElementAfterRender`). Hosts rarely need them; a reload through [`setStructure`](./structure#setstructure) fires them already.

### `notifyTabChanged()`

```ts
notifyTabChanged(tab: NgxViewBuilderBuilderTabCode): void
```

Fires `onTabChanged` with `{ tab }`.

### `notifyCurrentPageChanged()`

```ts
notifyCurrentPageChanged(pageIndex: number, pageName: string | null): void
```

Fires `onCurrentPageChanged` and the `pageChanged` trigger.

### `notifyDialogClosed()`

```ts
notifyDialogClosed(pageIndex: number, pageName: string | null, dialogTitle?: string | null, reason: 'close-button' | 'api' = 'close-button'): void
```

Fires `onDialogClosed` and the `dialogClosed` trigger, for a view rendered as a dialog.

### Element interaction notifications

```ts
notifyDynamicTableRowAdded(element, rowIndex, row?): void
notifyDynamicTableRowRemoved(element, rowIndex, row?): void
notifyDynamicPanelItemAdded(element, rowIndex, row?): void
notifyDynamicPanelItemRemoved(element, rowIndex, row?): void
notifyFileUploadFilesAdded(element, files, addedFiles): void
notifyFileUploadFileRemoved(element, files, removedFile, removedIndex): void
notifyElementTabChanged(element, previousTabValue, tabValue, tabIndex): void
notifyAccordionItemToggled(element, itemIndex, itemValue, expanded): void
```

The elements call these when a person adds a row, uploads a file, switches a tab or opens an accordion section, and each fires the [event of the same name](../events#element-interactions). `element` is the element's model; get it with [`getElementModel`](./elements#getelementmodel). When you change rows from code, use the [rows handle](./elements#rows-of-a-dynamic-table-or-panel), which fires them for you.
