# MCP Access Governance Platform — v1 to v2 Upgrade Notes

## What Changed

Version 2 is a ground-up redesign of the governance workflow. The v1 proof of concept
used a Slack webhook as the intake trigger and relied on manual test payloads. Version 2
introduces a cleaner architecture with clearly labelled demo data, a realistic 4-step
governance flow, and a proper human-in-the-loop wait pattern.

---

## Architecture Comparison

| Aspect | v1 | v2 |
|---|---|---|
| Trigger | Slack webhook | Generic HTTP webhook (`/mcp-governance-intake`) |
| Mock data | Inline test payload | Dedicated `MOCK: Sample MCP Request` Set node |
| Intake label | Slack channel | `ITSM (ServiceNow) — DEMO MOCK` |
| Pre-approval | None | Domain allowlist / pattern denylist check |
| Routing | 3-way switch after linter | 3-way switch after pre-approval (fast-approve / auto-deny / full review) |
| AI research | Not present | AI Security Research Agent (GPT-4o) populates ticket before human review |
| Human review | Manual step (external) | n8n Wait node with webhook resume — security team POSTs decision |
| Notification | Slack DM | `MOCK: Notify Requester` Set node (simulates ITSM update) |
| Evidence | Notion write | Notion write (same database, richer fields) |
| Node count | 13 | 19 |

---

## Credentials Required

Same three credentials as v1:

| Credential name in n8n | Type | Used by |
|---|---|---|
| `Notion API` | notionApi | Fetch inventory, write evidence log |
| `OpenAI API` | openAiApi | AI Security Research Agent (GPT-4o) |
| `Asana Personal Access Token` | asanaApi | Create security review ticket |

---

## Intake Payload Schema

The webhook trigger accepts a POST to:

```
POST https://mwalker.app.n8n.cloud/webhook/mcp-governance-intake
```

Expected body (the `MOCK: Sample MCP Request` node overwrites this in demo mode):

```json
{
  "service_name": "string",
  "service_vendor": "string",
  "mcp_endpoint": "https://...",
  "tool_capabilities": ["read", "write"],
  "has_credential_reference": true,
  "workflow_owner": "string",
  "risk_classification": "string",
  "submitted_by": "user.name",
  "team": "string",
  "business_justification": "string (min 20 chars)",
  "vendor_privacy_url": "https://...",
  "vendor_github": "https://...",
  "intake_channel": "string"
}
```

---

## Pre-Approval Logic

The Pre-Approval Check node evaluates the `mcp_endpoint` field against two lists:

**Pre-approved domains (fast-track approval, no review):**
- notion.so, asana.com, github.com, atlassian.net, microsoft.com, googleapis.com

**Pre-denied patterns (automatic rejection):**
- ngrok, 0.0.0.0, tunnel., localhost, 127.0.0.1, pastebin, requestbin, beeceptor

Requests with endpoints that match neither list proceed to full security review.

---

## Full Review Pipeline (new in v2)

When a request routes to the `new` path:

1. **Security Linter** — runs 9 deterministic rules (MCP-N8N-001–009)
2. **Risk Classifier** — derives Low / Medium / High / Prohibited from linter findings
3. **AI Security Research Agent** — GPT-4o researches the vendor: privacy policy,
   CVEs, GitHub signals, MCP-specific risks, compliance posture. Output is informational only.
4. **Compile Review Package** — assembles all findings into a structured object
5. **Create Security Review Ticket** — writes an Asana task with full findings and approval instructions
6. **Wait: Human Security Review** — pauses the execution until a reviewer POSTs a decision

### Human Approval

The Asana ticket includes the resume URL:

```
Approve: POST https://mwalker.app.n8n.cloud/webhook-waiting/<execution-id>
         body: {"decision":"approved"}

Deny:    POST https://mwalker.app.n8n.cloud/webhook-waiting/<execution-id>
         body: {"decision":"denied"}
```

Optional `reviewer` field can be included in the body for audit trail purposes.

---

## Decision Outcomes

| Path | Trigger condition | Final decision | Notion evidence written |
|---|---|---|---|
| `pre_approved` | Endpoint on allowlist | `approved` | Yes |
| `pre_denied` | Endpoint matches denylist | `denied` | Yes |
| `human_review` | New vendor, human approved | `approved` | Yes |
| `human_review` | New vendor, human denied | `denied` | Yes |

---

## Notion Evidence Log Fields (v2)

Written to database `86b8a07f78e4461ba488ed075613b696`:

| Field | Type | Source |
|---|---|---|
| Title | Page title | `{vendor} — {request_id} [{DECISION}]` |
| Request ID | Rich text | Mock data |
| Vendor | Rich text | Mock data |
| MCP Endpoint | URL | Mock data |
| Risk Level | Select | Risk Classifier |
| Decision | Select | Decision path |
| Review Path | Rich text | `pre_approved` / `pre_denied` / `human_review` |
| Submitted By | Rich text | Mock data |
| Intake Channel | Rich text | `ITSM (ServiceNow) — DEMO MOCK` |

---

## Demo Mock Data

The `MOCK: Sample MCP Request` node injects a fictional DataVault Inc. request.
This simulates a realistic intake from any supported channel. All mock fields are
clearly labelled and the node name is prefixed with `MOCK:` throughout the workflow.

**Mock vendor:** DataVault Inc. (fictional — for demonstration only)
**Mock endpoint:** `https://mcp.datavault.io/sse`
**Mock submitter:** `jordan.lee`, Data Platform team
**Mock intake channel:** `ITSM (ServiceNow) — DEMO MOCK`

To test with a real payload, disable or bypass the `MOCK: Sample MCP Request` node
and POST your own body to the webhook trigger URL.
