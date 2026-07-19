---
title: Creators
description: What creators build and control in NGX View Builder.
---

# Introduction for creators

NGX View Builder is a visual builder. You drag elements onto a canvas, configure them in the properties sidebar, and the result is a complete view — a form, a data screen, or a multi-step flow — that the application renders to end users.

You never write Angular code. Everything you configure is stored as a view definition (JSON) that developers plug into the application.

## The mental model

Every view has three layers:

1. **Structure** — pages, panels, tabs, and other containers that organise the screen.
2. **Elements** — inputs, choices, buttons, tables, and content blocks placed inside the structure.
3. **Behaviour** — validation, conditional logic, expressions, events, and data sources.

At runtime, every element with a `name` writes its value into the form result under that name. If a text field is named `customerEmail`, the submitted data contains `{ "customerEmail": "..." }`.

::: tip Names matter
Give every value-producing element a short, stable name like `firstName` or `deliveryDate`. Names become data keys and are how expressions reference other fields — `{firstName}`.
:::

## What you can build

- **Forms** — registrations, applications, questionnaires, with validation and conditional sections.
- **Data screens** — tables with filters, editable rows, charts, status badges, and action buttons.
- **Guided flows** — multi-page steppers where each step validates before continuing.
- **Content pages** — rich text, images, video, and reusable HTML templates.
- **Dynamic views** — dropdowns, tables, and charts fed by live REST data.

## Where to go next

| I want to… | Read |
| --- | --- |
| See the builder screen areas | [The builder workspace](./workspace) |
| Build something right now | [Your first form](./first-form) |
| Find the right element | [Elements overview](./elements/) |
| Show/hide fields conditionally | [Conditional logic](./conditional-logic) |
| Load options from an API | [Data sources](./data-sources) |
| Validate user input | [Validation](./validation) |

Or open the [live demo](/demo) from the **Demo** link in the top menu and explore as you read.
