# Website Integration Brief — AI and MCP Access Governance Platform

**Audience:** Portfolio website developer / self-reference  
**Purpose:** Instructions and copy guidance for integrating MCP Governance into the Markus-Doc portfolio website

---

## Portfolio Label

| Context | Label |
|---|---|
| Short dock / button label | MCP Gov |
| Full portfolio piece title | AI and MCP Access Governance Platform |
| Section heading | MCP Governance |
| Navigation label | MCP Governance |

Do **not** use "Governance Automation and AI Security" as the primary label for the website button or section heading. That phrase may appear in explanatory body copy only.

---

## Website Section — Recommended Copy

### Section eyebrow
```
05 / MCP GOVERNANCE
```

### Section heading
```
AI governance PoC, workflow evidence attached.
```

### Lead paragraph
```
Working governance proof of concept for AI agent and MCP access review. Structured intake,
automated risk classification, human-reviewed approval and durable audit evidence — 
implemented as a runnable n8n workflow.
```

### What it covers (bullet list)
- Governance-first control for AI tools, MCP servers, workflow integrations and API connections
- Request, classify, policy check, approval, execute, log and review
- Human-in-the-loop control for all medium and high-risk AI operations
- Identity, least privilege, human approval, audit evidence and continuous review
- n8n workflow orchestration with Asana review tasks and Notion evidence records
- Framework alignment: ISO 27001, ISO 42001, OWASP LLM Top 10, MAESTRO

### What it proves (bullet list)
- Security engineering applied to an emerging AI governance problem
- Deterministic rule-based linting with 42 passing tests
- Governance translated to testable, auditable, working code
- Enterprise deployment thinking with documented upgrade path

### Footer note
```
Portfolio-safe proof of concept. Fictional vendors, mock intake data and demo values throughout.
Not a production deployment, certification or attestation.
```

---

## Assets Required in Markus-Doc Repo

### Images (copy from MCP_Governance_Platform)

| Source | Destination | Use |
|---|---|---|
| `assets/screenshots/MCP-Gov_N8N-Workflow.png` | `assets/images/mcp-governance/MCP-Gov_N8N-Workflow.png` | Workflow evidence screenshot — mandatory |
| `assets/images/mcp_governance_asset_pack/02_mcp_governance_hero_banner.png` | `assets/images/mcp-governance/02_mcp_governance_hero_banner.png` | Optional hero or section image |

### Documents

| File | Path | Notes |
|---|---|---|
| Portfolio PDF or Markdown source | `assets/docs/Markus_Walker_MCP_Governance_Platform.md` | Markdown source if PDF generation unavailable |

---

## Links to Include in the MCP Governance Section

| Label | Target | Type |
|---|---|---|
| Download portfolio document | `./assets/docs/Markus_Walker_MCP_Governance_Platform.md` | Relative local link |
| View on GitHub | `https://github.com/markus-doc/MCP_Governance_Platform` | External |
| Workflow screenshot | `./assets/images/mcp-governance/MCP-Gov_N8N-Workflow.png` | Relative local image |

---

## Constraints

- Do not introduce React, Vite, server rendering, API routes or a build step.
- Preserve the existing desktop and mobile site implementations separately.
- Do not overwrite or rename the existing IR or Cloud PDF files.
- Do not delete existing portfolio assets.
- Keep links relative where possible.
- The website is a static site. All content must be static HTML, CSS and vanilla JavaScript.

---

## Three Portfolio Pieces Summary

The website should present three portfolio evidence pieces as a comparable group:

| Piece | Label | Description |
|---|---|---|
| IR Program | Enterprise Incident Response Program | Sanitised design portfolio, NIST SP 800-61 aligned |
| Cloud Case | Rossco's Coffee Cloud Security Plan | Fictionalised AWS security case study |
| MCP Governance | AI and MCP Access Governance Platform | Working governance PoC with workflow evidence |

MCP Governance should be presented as the most complete piece because it is a working PoC with runnable workflow evidence, not just a document.
