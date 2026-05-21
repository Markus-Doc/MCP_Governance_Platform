# AI and MCP Access Governance Platform

**A working proof of concept and enterprise-ready design pattern for governing AI agent and MCP-connected integrations before they become unmanaged risk.**

---

## Quick Start — Run the Demo

The workflow ships with a one-click demo trigger and pre-loaded fictional data (DataVault Inc.) so it runs end-to-end without any setup beyond credentials.

### Option A — Import and run in your own n8n instance

1. **Download the workflow JSON:**
   [`workflows/n8n/mcp_access_governance_v2.json`](workflows/n8n/mcp_access_governance_v2.json)

2. **Import into n8n:**
   n8n → Workflows → **Import from file** → select the JSON

3. **Add credentials** (Settings → Credentials → New):

   | Credential | Type | Used for |
   |---|---|---|
   | `Notion API` | Notion API | Fetch MCP inventory, write evidence log |
   | `OpenAI API` | OpenAI API | AI Security Research Agent (GPT-4o) |
   | `Asana Personal Access Token` | Asana | Create security review ticket |

4. **Run the demo:**
   Open the workflow → click **"Test workflow"** (top right) → the `DEMO: Click to Run` manual trigger fires and the full pipeline executes with mock DataVault Inc. data.

5. **Approve or deny the request** (only for the full human-review path):
   The workflow pauses at the Wait node. Copy the execution ID shown in the Asana ticket and POST to:
   ```
   POST https://<your-n8n-host>/webhook-waiting/<execution-id>
   Content-Type: application/json

   {"decision": "approved"}
   ```

> **Note on credentials:** The live instance at `mwalker.app.n8n.cloud` may have credentials rotated or deactivated after the initial demo period. Import the JSON and connect your own credentials for a fully self-contained run.

### Option B — View the live instance (read-only)

The workflow is deployed at:
`https://mwalker.app.n8n.cloud/workflow/W5dJjUnwbSruXHH3`

Execution history and evidence log entries are visible in the Notion workspace:
`https://www.notion.so/AI-Governance-Workspace-366ae242418680ceb66ceff42b357d4a`

---

---

> This project demonstrates a working proof of concept and an enterprise-ready design pattern. It does not claim to be a production deployment, certification, attestation or complete enterprise control environment.

---

## The Business Problem

A backend developer wants to connect a new third-party database provider tool through MCP or a related API integration into internal infrastructure. That integration may expose:

- Internal service metadata and network context
- API credentials and access tokens
- Repository context and intellectual property
- Sensitive business data or customer records

**Security engineers need a repeatable intake and review workflow before approving that integration.**

Without one, organisations face:

| Risk | Business Impact |
|---|---|
| AI access sprawl | Agents accumulate tool access without structured review |
| Accountability gaps | No documented owner for AI workflows or MCP-connected tools |
| Audit evidence gaps | No durable record of who reviewed what and what they decided |
| Shadow integrations | Developers connect MCP servers before security teams know they exist |
| Framework alignment gaps | No mapping between AI risks and recognised governance controls |

---

## What This Project Demonstrates

The **AI and MCP Access Governance Platform** is a security engineering project proposal, solution design and working n8n proof of concept.

It shows how an organisation can introduce practical, repeatable governance around AI agent integrations and MCP-connected tools without slowing legitimate development work.

The platform treats governance as an enabling capability:

- Teams can request AI and MCP integrations through a structured intake path
- Security engineers receive consistent, classifiable request data
- Risk is classified automatically using documented rules
- Low-risk requests are fast-tracked; high-risk requests go to human review
- Every decision produces durable audit evidence
- Findings map to recognised governance frameworks

**The request is submitted through Asana. n8n validates the request, checks risk signals, classifies risk, maps findings to governance controls, routes the decision outcome, creates review tasks where needed and records evidence.**

---

## Two Audiences

### For CISO, Security Leadership and Governance Owners

- [Executive Landing Page](docs/charter/01-executive-landing.md) — Business problem, risk reduction, governance model and MVP scope
- [Project Charter](docs/charter/02-project-charter.md) — Full corporate-facing charter with scope, objectives, stakeholders and success criteria
- [Governance Control Register](docs/governance/08-governance-control-register.md) — Control objectives mapped to workflow behaviour and frameworks
- [Evidence Model](docs/evidence/09-evidence-model.md) — How evidence is captured, where it lives and what it proves

### For Lead Security Engineers and Implementation Reviewers

- [Solution Design](docs/solution-design/03-solution-design.md) — Architecture, components, data flow and integration model
- [Security Architecture](docs/security-architecture/04-security-architecture.md) — Trust model, threat surface, defence controls and enterprise deployment path
- [n8n Implementation Guide](docs/n8n-implementation/05-n8n-implementation-guide.md) — Workflow import, credential setup, Asana configuration, test run guide
- [Risk Classification Matrix](docs/governance/06-risk-classification-matrix.md) — How requests are scored and classified
- [Decision Logic Matrix](docs/governance/07-decision-logic-matrix.md) — Auto allow, human review and auto deny rules

---

## Working PoC Stack

| Platform | Role |
|---|---|
| **n8n Cloud** | Workflow orchestration, request validation, risk classification, decision routing, evidence summary |
| **Asana** | Human review tasks, remediation tracking, operational audit evidence |
| **Notion** | Governance knowledge base, MCP server inventory, control notes, decision records |
| **GitHub** | Source control, documentation, workflow exports, evidence artefacts |

---

## Governance and Standards Alignment

This project references and aligns with:

- **NIST SP 800-37** — Risk management framework structure
- **NIST SP 800-30** — Risk assessment language and treatment
- **ISO/IEC 27001** — Information security management, access control, supplier risk, auditability
- **ISO/IEC 42001** — AI management system, AI lifecycle governance, human oversight
- **SOC 2 Type II style evidence thinking** — Proving controls operate over time
- **CSA AI Controls Matrix** — Cloud AI governance and security controls
- **MAESTRO** — Agentic AI and multi-agent threat modelling
- **OWASP LLM Top 10** — AI application security risks
- **MCP Security Guidance** — Consent, authorisation, tool access, confused deputy protections

The project does not claim formal certification or attestation against any of these frameworks.

---

## Repository Structure

```
MCP_Governance_Platform/
├── README.md                          ← This file (Executive Landing Page)
├── docs/
│   ├── charter/
│   │   ├── 01-executive-landing.md    ← Executive audience overview
│   │   └── 02-project-charter.md     ← Full corporate charter
│   ├── solution-design/
│   │   └── 03-solution-design.md     ← Architecture and components
│   ├── security-architecture/
│   │   └── 04-security-architecture.md  ← Security model and controls
│   ├── n8n-implementation/
│   │   └── 05-n8n-implementation-guide.md  ← Import and configuration guide
│   ├── governance/
│   │   ├── 06-risk-classification-matrix.md
│   │   ├── 07-decision-logic-matrix.md
│   │   └── 08-governance-control-register.md
│   └── evidence/
│       ├── 09-evidence-model.md
│       ├── 10-security-review-checklist.md
│       ├── 11-demo-script.md
│       ├── 12-technical-case-study.md
│       └── annexes/
│           └── 13-annexes.md
├── workflows/
│   └── n8n/
│       └── mcp_access_governance_poc_v0.json  ← Importable n8n workflow
├── examples/
│   ├── payloads/                      ← Sample request payloads
│   └── findings/                      ← Sample linter finding outputs
└── schemas/                           ← JSON schemas for intake and evidence
```

---

## Quick Start for Reviewers

1. Read the [Executive Landing Page](docs/charter/01-executive-landing.md)
2. Review the [Project Charter](docs/charter/02-project-charter.md)
3. Import the [n8n Workflow](workflows/n8n/mcp_access_governance_poc_v0.json) — see [Import Guide](docs/n8n-implementation/05-n8n-implementation-guide.md)
4. Run a test using the [Demo Script](docs/evidence/11-demo-script.md)

---

## Safety and Data Handling

All sample data in this repository is fictional. This repository contains no:

- API keys or OAuth tokens
- Real customer data or personal information
- Production credentials or secrets
- Private organisation identifiers
- Live deployment configuration

Workflow exports have been reviewed to confirm all credential IDs are fictional placeholders.
