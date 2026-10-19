---
title: API
description: "Browse your application's REST API in the NGX View Builder API tab and turn an endpoint into a data source with its URL, method and request body filled in."
---

# API

When your developers describe their REST API with OpenAPI, the builder can read that description for you. You see every endpoint the application offers, what it expects and what it answers, and you connect a form to one of them without asking anybody for a URL.

It comes with the OpenAPI plugin and needs a license key in the builder settings (see [Licensing](../developers/licensing#licensed-plugins)). Without one, the tab says what is missing.

## The API tab

The left side lists the endpoints, grouped the way the API groups them (Customers, Orders, Lookups, and so on). Each line shows the method, the path and a short description. Search finds an endpoint by any word of its path, name or group, and the method buttons above the list hide or show `GET`, `POST`, `PUT`, `PATCH` and `DELETE`.

Click an endpoint to see it on the right:

| Section | What it tells you |
| --- | --- |
| **Parameters** | The values that go into the address. `{id}` in the path is a path parameter, the others are added after a `?`. A red star marks the required ones. |
| **Request body** | The fields a `POST`, `PUT` or `PATCH` sends, with their types. A field inside another field is indented under it. |
| **Response** | What comes back. **Example** shows a made-up answer with the right shape, **Schema** lists every field with its type. |
| **Try it** | For `GET` endpoints only: fill in the parameters, send the request and see the real answer. Nothing that changes data can be sent from here. |

Endpoints marked **SSE** and **WS** are live: the server keeps sending to them. Picking one makes an [event stream or WebSocket source](./data-sources#event-stream), and their **Message** section shows what each update looks like. Try it does not open them; watch them in the Preview.

**Use as data source** adds a data source for the endpoint to the view you are editing. It appears in the **Data sources** tab below the canvas, named after the endpoint, for example `listCustomers`.

## Picking an endpoint in a data source

In the **Data sources** tab, a REST source has an **API** row above the request. Type a few letters, such as `customer` or `orders`, and pick the endpoint from the list. The source takes from it:

- the **Url**, with `{placeholders}` for the values the address needs, such as `/api/customers/{id}`,
- the **Method**,
- for `POST`, `PUT` and `PATCH`, a **Request body** with every field the API accepts.

The body is a starting point. Fields named like a field of your form are already bound to it: if the form has an `email` field, the body says `"email": "{email}"`. The rest are empty. Click **Choose body fields** to open the visual builder (the same one as **Build visually**), keep what you need, bind the rest to form fields and remove what you do not send. See [Building JSON without typing it](./data-sources#building-json-without-typing-it).

Under the endpoint the row also tells you what to do with the answer:

- **The rows are in "items"** means the list comes wrapped in an object. Put `items` in the **Items path** of the table, list or dropdown that shows them.
- **"id" works as the value and "name" as the label** names the fields to use when a dropdown loads its options from this source.

**Pick another endpoint** replaces it, **Show in API tab** opens the endpoint's description, and **Unlink** forgets which endpoint the source came from while keeping its URL and body.

If the API later drops an endpoint a source was made from, the row says so, and you know that source needs a new endpoint before the form breaks.

A name or title you gave the source yourself is never replaced. Only the automatic ones, such as `source3` and "Source 3", take the endpoint's name.
