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
| **Dropzone text** | Caption of the drag-and-drop area — a short, action-clear call to action |
| **Upload data source** | Source that receives the file — a POST (or configured method) with `FormData` |
| **Upload form field name** | The `FormData` field name for the file (e.g. `file`) |
| **Download data source / Delete data source** | Sources for fetching and removing stored files; the file key is passed via the key field below |
| **File key / name / size / type field** | Field names in the server's file object (e.g. `fil_key`, `fil_name`, `fil_size`, `fil_content_type`) |

Typical setup — CV upload:

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
