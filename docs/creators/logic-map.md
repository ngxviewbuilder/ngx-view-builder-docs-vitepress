---
title: Logic map
description: See how the fields of a view depend on each other, on one canvas.
---

# Logic map

A large form hides its logic in dozens of property panels: this field shows when that one is filled in, that total is calculated from three others, a button calls a data source and puts the answer somewhere else. The **Logic map** tab puts all of it on one canvas, so you can see how the form works without opening every element.

It comes with the Logic map plugin and needs a license key in the builder settings (see [Licensing](../developers/licensing#licensed-plugins)). Without one, the tab says what is missing.

## Reading the map

Each card is something with logic: a field, a data source, a variable, a view rule or a trigger. A card shows the element's label, its type and the page it sits on. A field inside a dynamic table or a panel says so on top of the card, such as "Column of Order lines" or "In Billing address", so two fields called `city` never look alike. The number on the right is how many rules the element has.

The links run left to right, from what drives a value to what it changes. Each link type has its own colour and line style:

| Link | Means |
| --- | --- |
| Shows or hides | a `visibleIf` condition reads the field on the left |
| Makes required | a `requireIf` condition |
| Disables or locks | `disableIf` or `readonlyIf` |
| Calculates or sets a value | a calculation, or an event that sets a value |
| Clears a value | a `resetIf` condition |
| Validates | a validator that reads another field |
| Loads data | a data source call, its parameters, options that reload |
| Runs an action | dialogs, navigation, messages, submit |

The list of link types on the left doubles as a filter: untick one to hide those links. **Elements without logic** adds the plain fields back, and **Page** narrows the map to one page.

## Tracing one field

Click a card. The map highlights everything the field depends on and everything it changes, through any number of steps, and dims the rest. The panel on the right lists:

- **Rules on this element**, each read back in words, for example "Required when Country of registration is not US and Annual revenue (EUR) > 85000".
- **Depends on** and **Affects**, each with how far away it is ("Direct", "2 steps away").

Tick **Highlight direct links only** to keep just the first step. **Edit in builder** (or a double click on the card) opens the element in the Builder tab with its properties ready.

## Needs attention

The map also checks the logic. Under **Needs attention** it lists:

- a condition or calculation that refers to a field, data source or variable the view does not have,
- an event that changes an element that is not there,
- a data source that is used but not defined,
- values that calculate each other in a loop, which never settle.

Click an item to jump to the card.

## Moving around

Drag the canvas to move it, Ctrl + scroll to zoom, or use `+`, `-`, `0` (100%) and `F` (fit) on the keyboard. The minimap in the corner shows where you are. Search finds a field by its label or name.

The download button saves the map as an SVG with a legend, ready for a wiki page or a ticket.
