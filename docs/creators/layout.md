---
title: Layout & containers
description: Rows, columns, responsive widths, and how containers organise a view.
---

# Layout & containers

## Rows and columns

The canvas is a stack of **rows**. Each row holds one or more **columns**, and each column holds exactly one element. You create layout by dragging:

- Drop an element **below** another → new row.
- Drop an element **beside** another → same row, new column.
- Drop an element **into a container** → nested rows inside that container.

## Widths

Every element has three width properties in the **Design** category:

| Property | Applies on |
| --- | --- |
| Width | Desktop |
| Tablet width | Tablet viewport |
| Mobile width | Mobile viewport |

Use `%` for fluid layouts (`50%`, `33%`) or `px` for fixed sizes. **Fit content** makes the element only as wide as its content, which suits buttons.

Test each breakpoint with the viewport switcher in [Preview](./preview).

## Container elements at a glance

| Container | Use for |
| --- | --- |
| **Panel** | Grouping related fields under a heading, with background/border styling |
| **Tabs** / **Tabs Pro** | Switching between sections without leaving the page |
| **Accordion** | Collapsible sections |
| **Dynamic panel** | A repeatable group where the user adds and removes entries (e.g. several addresses) |
| **Dialog** | Content that opens in a modal window |
| **Splitter** | Two resizable side-by-side areas |
| **Spacer** | Empty vertical space |
| **Divider** | A horizontal separator line |

Details and properties for each: [Containers](./elements/containers).

## Element spacing

The global gap between rows is set in **Form settings → Element spacing**. Panels additionally have their own padding controls (desktop and mobile) in the **Design** category.

## Practical guidelines

- Group related fields into panels; users scan grouped forms faster.
- Prefer 2 columns maximum on data-entry forms; more becomes hard to scan.
- Set mobile widths to `100%` for nearly everything.
- Use a Dynamic panel instead of duplicating the same fields ("Address 1", "Address 2"…).
