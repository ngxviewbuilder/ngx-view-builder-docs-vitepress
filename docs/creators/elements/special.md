---
title: Special inputs
description: File upload and Signature pad.
---

# Special inputs

## File upload (`fileUpload`)

Lets users attach files. The element stores file metadata in the form data and can upload to a server through a data source.

| Property | What it does |
| --- | --- |
| **Accepted types** | Restrict extensions/MIME types per HTML `accept` rules (e.g. `.pdf,image/*`) |
| **Max files** | How many files may be attached; further uploads are blocked at the limit |
| **Max file size (MB)** | Oversized files are rejected before upload |
| **Dropzone text** | Caption of the drag-and-drop area. Keep it short and say what to do |
| **Upload data source** | Source that receives the file: a POST (or configured method) with `FormData` |
| **Upload form field name** | The `FormData` field name for the file (e.g. `file`) |
| **Download data source / Delete data source** | Sources for fetching and removing stored files; the file key is passed via the key field below |
| **File key / name / size / type field** | Field names in the server's file object (default: `key`, `name`, `size`, `contentType`) |

::: warning Without an upload data source, the file never leaves the browser
Only local metadata (name/size/type) is kept as the field's value, so the field can look "filled in" while your backend never receives the actual bytes. Set **Upload data source** whenever the file must be stored server-side.
:::

A few things worth knowing before you brief your developer:

- Uploads are always sent as `multipart/form-data` with a single field (its name is **Upload form field name**), never JSON, never base64. Any **Request body** template configured on the upload source is ignored; only `{placeholders}` in its URL are used.
- With **Max files** > 1, files upload as separate sequential requests, not one batch call.
- There's no upload progress percentage, only pending/ready/error per file, and no resumable or chunked upload.
- The field's value in the form result is whatever your endpoint's response contained (the **File key / name / size / type field** properties), never the file's bytes.

**For the exact request/response JSON your backend must implement, see [File upload requests](../../developers/data-sources#file-upload-requests) in the developer docs.**

Typical setup, CV upload:

- *Name*: `cvFile`, *Accepted types*: `.pdf`, *Max size*: `5 MB`, *Required*: on.
- Upload data source: `uploadDocument` (a REST source configured by your developer).

Check with expressions:

```text
visibleIf on "Continue" hint:  isEmpty({cvFile})
len({attachments}) > 0         → at least one file attached
```

## Signature pad (`signaturePad`)

A draw area for a handwritten signature (mouse or touch). The value is the signature image data, stored under the element's name and submitted with the form.

| Property | What it does |
| --- | --- |
| **Pen / background color** | Drawing style |
| **Clear button** | Lets the user retry |
| **Required** | Signature must be present before submit |

Use it at the end of agreements together with a Single checkbox (*"I confirm the data is correct"*).
