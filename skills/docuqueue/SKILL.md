---
name: docuqueue
description: Generate PDFs, fill forms, and manage documents using DocuQueue. Use when the user asks to "create a PDF", "generate a document", "fill a form", "make an invoice", "create a contract", "build a certificate", "create a proposal", or mentions DocuQueue, document generation, PDF creation, or form filling. Not for: editing existing PDFs, converting between file formats, or working with local files without an API.
---

## DocuQueue Document Generation

Generate professional PDFs from templates and data using the DocuQueue API via MCP tools.

### Available MCP Tools

- `docuqueue_list_templates` — Browse available document designs
- `docuqueue_create_template` — Design a new document layout
- `docuqueue_fill_template` — Create a document with your data
- `docuqueue_preview_template` — See how your document will look
- `docuqueue_get_status` — Check if your document is ready
- `docuqueue_download_pdf` — Get your finished document
- `docuqueue_extract_branding` — Match a company's visual style from their website

### Workflow

1. **List templates first** — Always call `docuqueue_list_templates` to show available designs before generating.
2. **Preview if unsure** — Use `docuqueue_preview_template` to verify the template matches the user's needs.
3. **Fill with data** — Call `docuqueue_fill_template` with the template ID and user data as JSON.
4. **Check status** — Use `docuqueue_get_status` to poll until the document is ready.
5. **Download** — Call `docuqueue_download_pdf` to get the final PDF URL.

### Example Prompts

**Invoice:**
> Create an invoice for Acme Corp, 3 widgets at $50 each, 10% tax

**Certificate:**
> Create a certificate for John Doe, completed the Python bootcamp on August 12, 2026

**Contract:**
> Create an NDA between Acme Corp and Globex Corp, effective January 1, 2026

**Form filling:**
> Fill in this W-9 form: name "Acme Corp", EIN "12-3456789", address "123 Main St"

### Constraints

- Never fabricate template IDs — always list templates first.
- Always preview before generating if the user hasn't specified a template.
- Return the download URL directly, don't describe the PDF contents.
- If authentication fails, ask the user to re-authenticate with DocuQueue.

### Anti-Triggers

- Do not use for editing existing PDFs (use a PDF editor instead).
- Do not use for converting between file formats (use a converter).
- Do not use for working with local files without the DocuQueue API.
