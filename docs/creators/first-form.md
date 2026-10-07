---
title: Your first form
description: Build a working client registration form in ten minutes.
---

# Your first form

This walkthrough builds a small **client registration form**: name, email, client type, a company-only section, and a submit button. It touches the four skills you will use every day: placing elements, naming them, adding logic, and previewing.

<figure class="doc-video">
  <a href="/first-form/first-form.webp" target="_blank" rel="noopener" title="Open full size">
  <img
    src="/first-form/first-form.webp"
    width="1280"
    height="764"
    alt="The whole walkthrough in the builder: First name and Email are dragged side by side, a Client type radio gets the options Private person and Company, the email is made required with an email check, a Company details panel with a Company code field appears only for companies, a Register button shows a success toast, and the Preview tab tests an empty submit, the Company choice and a valid registration."
  />
  </a>
  <figcaption>The five steps below, recorded in the <a href="https://demo.ngxviewbuilder.io/builder">live builder</a>. Click it to watch at full size.</figcaption>
</figure>

## 1. Place the fields

From the **Single line inputs** group, drag onto the canvas (or double click a tile to add it after the selected element):

- **Text**: set *Label* to `First name`, *Name* to `firstName`.
- **Text**: set *Label* to `Email`, *Name* to `email`.

From the **Choice inputs** group:

- **Radio**: set *Label* to `Client type`, *Name* to `clientType`. In the **Options** category add two options: `Private person` (value `person`) and `Company` (value `company`).

::: tip
Drag two elements next to each other to place them side by side in one row. They share the row evenly without any width. Set a *Width* in the **Design** category only for an uneven split, and only on one of them: `50%` on both makes the second one wrap, because a percentage does not count the gap between them.
:::

## 2. Make fields required

Select the email field and in the **Restrictions** category turn on **Required**. In **Validators**, set *Required message* to `Email is required`.

Then add a format check: in **Validators → Validators** add a rule of type `email` with the message `Enter a valid email address`.

## 3. Add a conditional section

From **Containers**, drag a **Panel** below the radio. Set its *Label* to `Company details`. Inside it place a **Text** element named `companyCode` with label `Company code`.

Select the panel and in the **Logic** category set:

```
visibleIf:  {clientType} == "company"
```

The panel now appears only when *Company* is selected. Expressions in `{curly braces}` reference other fields by name; see [Expressions basics](./expressions).

Make the company code mandatory only when visible. On the `companyCode` field set:

```
requireIf:  {clientType} == "company"
```

## 4. Add a submit button

From **Actions**, drag a **Button**. Set *Label* to `Register`. In the **Actions** category add an event:

- **Trigger**: `click`
- **Validate form**: on
- **Type**: `toast` with title `Done`, message `Registration saved`, variant `success`

In a real project the button would call a data source (`Type: dataSource`) to send the data to a server; see [Events & actions](./events-actions).

## 5. Preview

Switch to the **Preview** tab. Test that:

- Submitting an empty form shows the required messages.
- Choosing *Company* reveals the company panel and makes the code required.
- A valid submit shows the success toast.

## The result

Your form produces this data object at runtime:

```json
{
  "firstName": "Sam",
  "email": "sam@harborfoods.com",
  "clientType": "company",
  "companyCode": "HF-20418"
}
```

Every key is the `name` you gave an element. This is what the application receives when the form is submitted.

## Next steps

- [Pages & navigation](./pages): split long forms into steps.
- [Validation](./validation): all validator types.
- [Data sources](./data-sources): load the client types from an API instead of hardcoding them.
