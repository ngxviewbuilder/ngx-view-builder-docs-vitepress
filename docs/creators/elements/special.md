---
title: Special inputs
description: File upload and Signature pad.
---

# Special inputs

## File upload (`fileUpload`)

Lets users attach files. **Save files as** decides where the file goes:

- **Base64 in the form data** (the default): nothing is sent anywhere. The file is read in the browser and its content travels inside the form value, so whoever receives the submitted form gets the file too.
- **Upload to server (data source)**: each file is sent to the **Upload data source** as soon as it is picked, and the form value keeps only the key your server returns.

The value looks the same either way (an array of these when **Multiple** is on), which keeps the backend simple:

```json
{ "name": "cv.pdf", "size": 48213, "type": "application/pdf", "lastModified": 1790764181739, "contentType": "application/pdf", "base64": "JVBERi0xLjcK..." }
```

With **Upload to server**, `fileKey` takes the place of `base64`.

| Property | What it does |
| --- | --- |
| **Save files as** | `Base64 in the form data` or `Upload to server (data source)`. The fields below marked *server* only show in the second mode. |
| **Accepted types** | Restrict extensions/MIME types per HTML `accept` rules (e.g. `.pdf,image/*`) |
| **Max files** | How many files may be attached; further uploads are blocked at the limit |
| **Max file size (MB)** | Oversized files are rejected before upload |
| **Dropzone text** | Caption of the drag-and-drop area. Keep it short and say what to do |
| **Upload data source** (*server*) | Source that receives the file: a POST (or configured method) with `FormData` |
| **Upload form field name** (*server*) | The `FormData` field name for the file (e.g. `file`) |
| **Download data source / Delete data source** (*server*) | Sources for fetching and removing stored files; the file key is passed via the key field below |
| **File key / name / size / type field** (*server*) | Field names in the server's response (default: `key`, `name`, `size`, `contentType`) |

::: tip Set a max file size with base64
Base64 makes the value about a third larger than the file itself, and the whole value travels with every submit. Keep **Max file size** sensible (a few MB) or switch to **Upload to server** for large files.
:::

A few things worth knowing before you brief your developer:

- In server mode uploads are always sent as `multipart/form-data` with a single field (its name is **Upload form field name**), never JSON. Any **Request body** template configured on the upload source is ignored; only `{placeholders}` in its URL are used.
- With **Max files** > 1, files upload as separate sequential requests, not one batch call.
- There's no upload progress percentage, only pending/ready/error per file, and no resumable or chunked upload.
- A view saved before **Save files as** existed keeps uploading if it has an upload data source.

**For the exact request/response JSON your backend must implement, see [File upload requests](../../developers/data-sources#file-upload-requests) in the developer docs.**

Typical setup, CV upload:

- *Name*: `cvFile`, *Accepted types*: `.pdf`, *Max size*: `5 MB`, *Required*: on.
- *Save files as*: `Upload to server`, upload data source `uploadDocument` (a REST source configured by your developer). For a small form that is emailed as a whole, `Base64 in the form data` needs no backend setup at all.

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
