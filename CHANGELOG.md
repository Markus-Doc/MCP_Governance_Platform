# Changelog

All changes to the MCP Access Governance Platform workflow and documentation.

---

## v1 — 2026-05-21

### Workflow: MCP Access Governance Platform v1
**n8n:** [mwalker.app.n8n.cloud/workflow/W5dJjUnwbSruXHH3](https://mwalker.app.n8n.cloud/workflow/W5dJjUnwbSruXHH3)  
**SDK source:** `workflows/n8n/mcp_access_governance_v1_sdk.js`

#### New capabilities
- **Slack webhook trigger** — replaces Manual Trigger. Users submit MCP addition requests via POST to the governance intake webhook. Intake payload carries workflow name, endpoint, capabilities, owner, risk classification, submitter, team, justification, and Slack channel for return notification.
- **Notion MCP Inventory lookup** — fetches the MCP Server Inventory page from the AI Governance Workspace on every run. Provides governance context to the linter and evidence chain.
- **9-rule deterministic linter** — expanded from 2 rules to full MCP-N8N-001 through MCP-N8N-009 suite. Each finding includes structured `framework_mappings` covering CSA AI, MAESTRO, and OWASP LLM Top 10 (2025).
- **Risk Classifier node** — scores findings and assigns `risk_level` (Low / Medium / High / Prohibited) and `decision` (auto_approve / human_review / auto_deny). Deterministic, no AI model in the finding or decision path.
- **3-way Switch routing** — replaces single IF gate. Routes to auto_approve, human_review, or auto_deny based on Risk Classifier output.
- **Slack notifications** — three response paths send formatted Slack messages back to the requester channel: approved, pending review, or denied.
- **Notion PoC Evidence Log write** — all three decision paths converge and write a structured row to the Evidence Log database (`86b8a07f78e4461ba488ed075613b696`) with Finding ID, Workflow Name, Risk Classification, Severity, Decision, Status, Evidence Summary, Reviewer, OWASP LLM Mapping, CSA AI Mapping, and MAESTRO Mapping.
- **Final Evidence Summary node** — stamps every run with `governance_run: complete`, `platform_version: v1`, decision, risk level, finding count, Notion evidence URL, and completion timestamp.

#### Bugs fixed from v0
- `workflow_name` no longer arrives as `"unknown"` at the Security Linter. Linter now reads from `$('Parse MCP Request').item.json` explicitly.
- Evidence Summary node now correctly references upstream data via `$('Risk Classifier').item.json` instead of relying on `$json` after multi-branch fan-in.
- MCP Tool Server node architectural issue resolved: removed from main flow. Governance context now sourced from Notion directly.

#### Credentials required
| Credential | Node | Purpose |
|---|---|---|
| `notionApi` | Fetch Notion MCP Inventory, Write Notion Evidence Log | Read governance docs, write evidence rows |
| `slackApi` | Slack — Approved, Slack — Pending Review, Slack — Denied | Notify requester of decision |
| `asanaApi` | Create Asana Review Task | Human review task creation (human_review path only) |

---

## v0 — Initial PoC

**SDK source:** `workflows/n8n/mcp_access_governance_poc_v0.json`

- Manual trigger
- 2-rule linter (LINT-005: missing owner, LINT-006: missing risk classification)
- Single IF gate routing to Asana task or evidence summary
- No Notion integration
- No Slack integration
- No framework mappings in findings
