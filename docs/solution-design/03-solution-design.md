# Solution Design

## AI and MCP Access Governance Platform — PoC v0

**Audience:** Lead Security Engineers, Platform Engineers, Implementation Reviewers  
**Document type:** Solution design for the working proof of concept

---

## 1. Overview

The solution provides automated intake, risk classification, decision routing and evidence capture for requests to connect AI agents, MCP servers and external APIs to internal infrastructure.

The working PoC uses n8n as the orchestration layer, Asana as the human review and evidence system and Notion as the governance knowledge base.

---

## 2. Business Scenario

A backend developer submits a request to connect a third-party MCP server providing database query tools to the company's internal n8n workflow environment. The MCP server can:

- Query production database tables via a tool interface
- Return schema metadata and query results to the AI agent
- Accept tool call parameters that could include sensitive field filters

Without a governance workflow, the developer can connect this server from their local n8n instance and begin using it. The security team learns about the integration only if something goes wrong.

**The solution intercepts the request before connection, classifies the risk, routes it to the appropriate decision path and produces a durable evidence record.**

---

## 3. Component Architecture

### 3.1 Intake Layer — Asana

Requesters submit a structured Asana task to the `MCP Access Governance Reviews` project.

Required fields (enforced by n8n validation node):

| Field | Type | Purpose |
|---|---|---|
| `requester_name` | String | Named accountability |
| `requester_email` | String | Contact and notification |
| `team` | String | Ownership attribution |
| `service_name` | String | Integration identifier |
| `service_type` | Enum | AI service / MCP server / external API |
| `vendor_name` | String | Third-party risk assessment |
| `data_classification` | Enum | Public / Internal / Confidential / Restricted |
| `environment` | Enum | Sandbox / Staging / Production |
| `mcp_tool_scope` | String | What tools the MCP server exposes |
| `agentic_scope` | String | Whether the agent can take actions with side effects |
| `business_purpose` | String | Justification for the request |
| `requested_permissions` | String | Specific access or credential requirements |
| `review_period` | String | Proposed access duration |

**<SCREENSHOT PLACEHOLDER: Asana task template showing custom fields for MCP access request — service type, data classification, environment, MCP tool scope fields visible>**

### 3.2 Orchestration Layer — n8n

The n8n workflow processes each request through five logical stages:

```
Stage 1: Trigger
   Manual Trigger (PoC) or Asana webhook (production)

Stage 2: Input Normalisation
   Set node — populates sample request fields
   (In production: Asana API node reads task fields)

Stage 3: Risk Classification (Code Node)
   JavaScript embedded in n8n Code node
   Checks: MCP node presence, credential references,
   agent nodes, owner metadata, risk classification metadata
   Emits: structured findings with severity and framework tags

Stage 4: Decision Router (IF Node)
   IF findings_requiring_review = true → Human Review branch
   ELSE → Auto Allow / Auto Deny branch

Stage 5: Terminal Actions
   Human Review branch: Asana task creation (Security Review queue)
   Auto Allow branch: Evidence summary node
   Auto Deny branch: Evidence summary node with denial reason
```

**<SCREENSHOT PLACEHOLDER: n8n workflow canvas — all five stages visible with node names and connection arrows>**

### 3.3 Risk Classification Engine

The linter runs deterministic checks implemented in a JavaScript Code node (PoC) and a separate Python module (`src/linter/`) for testing and extensibility.

Six rules:

| Rule | Severity | Check |
|---|---|---|
| LINT-001 | High | MCP-related node detected in workflow |
| LINT-002 | High | MCP node has credential references |
| LINT-003 | Medium | HTTP request to MCP-like endpoint (direct call pattern) |
| LINT-004 | High | AI agent node has no human approval gate upstream |
| LINT-005 | Medium | Workflow missing owner metadata |
| LINT-006 | Low | Workflow missing risk classification metadata |

Rules are stateless, deterministic and side-effect-free.

**<SCREENSHOT PLACEHOLDER: n8n Code node showing linter rule logic — rule IDs, severity levels and finding structure visible>**

### 3.4 Decision Routing — IF Node

```javascript
// Simplified routing logic
if (findings.some(f => f.human_review_required === true)) {
  // Route to human review branch
} else if (findings.some(f => f.severity === 'prohibited')) {
  // Route to auto deny branch
} else {
  // Route to auto allow branch
}
```

**<SCREENSHOT PLACEHOLDER: n8n IF node configuration — condition checking human_review_required field>**

### 3.5 Human Review — Asana Task Creation

When the human review branch is triggered, n8n creates an Asana task in the Security Review queue with:

- Finding summary
- Severity levels
- Framework mapping tags (CSA AI, MAESTRO themes)
- Requester details
- Service and data classification
- Reviewer assignment (configurable)

**<SCREENSHOT PLACEHOLDER: Asana security review task created by n8n — showing finding summary, severity, CSA AI tags and reviewer assignment field>**

### 3.6 Evidence Layer

Every terminal decision produces a structured JSON evidence record:

```json
{
  "evidence_id": "EVD-2026-001",
  "workflow_name": "example-mcp-data-pipeline",
  "submitted_by": "Alex Rivera",
  "team": "Platform Enablement",
  "decision": "human_review",
  "decision_timestamp": "2026-05-21T09:00:00Z",
  "findings": [...],
  "reviewer": null,
  "reviewer_decision": null,
  "evidence_location": "github://evidence/samples/",
  "governance_note": "Fictional sample. No real data."
}
```

Evidence is stored in GitHub (`evidence/samples/`) and optionally in Notion as a governance database entry.

---

## 4. Data Flow

```
Requester → Asana task (structured fields)
         → n8n trigger (Asana webhook or manual)
         → Field validation (reject incomplete)
         → Risk classification (linter rules)
         → Decision logic (IF routing)
         → Terminal action:
              Auto Allow → Evidence record
              Human Review → Asana task → Reviewer decision → Evidence record
              Auto Deny → Evidence record with denial reason
         → Evidence stored (GitHub + optional Notion)
```

---

## 5. Integration Points

### 5.1 Asana Integration

- **Credential type:** Asana OAuth 2.0 personal access token or OAuth app
- **Permissions required:** Read tasks (intake), create tasks (review queue), update tasks (status)
- **Project structure:**
  - `MCP Access Governance Reviews` — intake project
  - Sections: `New Findings`, `In Review`, `Approved Risk`, `Remediation Required`, `Closed Evidence`
- **Custom fields:** service_type, data_classification, environment, risk_level, decision_outcome

See [n8n Implementation Guide](../n8n-implementation/05-n8n-implementation-guide.md) for credential setup steps.

### 5.2 Notion Integration (Optional)

- **Purpose:** Governance knowledge base, MCP server inventory, decision records
- **Credential type:** Notion internal integration token
- **Databases used:** MCP Server Inventory, Governance Decision Log, Control Register
- **Permissions required:** Read and write to designated databases

### 5.3 GitHub Integration (Evidence)

- Evidence records are committed to `evidence/samples/` as JSON files
- No API integration required for the PoC
- Production deployment could use GitHub Actions to trigger on finding creation

---

## 6. PoC Limitations

The following are intentional PoC scope boundaries, not design gaps:

| Limitation | Production Equivalent |
|---|---|
| Manual Trigger in PoC | Asana webhook or scheduled poll in production |
| Sample input data hardcoded | Live Asana task field reading |
| Evidence written to files | Evidence to database (BigQuery / PostgreSQL) |
| No AI-generated explanations | Gemini API enrichment in Phase 2 |
| No real Asana task creation (unless credentials configured) | Full Asana OAuth with live project |
| No SIEM output | Google Security Operations forwarding |
| No alerting | Slack notification node (optional in PoC) |

---

## 7. Test Coverage

The Python linter module (`src/linter/`) includes 42 pytest tests:

- Positive tests: confirm findings raised for risky workflow patterns
- Negative tests: confirm clean workflows produce no findings
- Serialisation tests: confirm JSON output matches `finding.schema.json`
- Integration test: run linter against the PoC workflow export; confirm expected findings

All 42 tests pass.

---

## 8. Schema References

| Schema | Location | Purpose |
|---|---|---|
| Request intake schema | `schemas/request_intake.schema.json` | Validates Asana request fields |
| Finding schema | `schemas/finding.schema.json` | Structures linter output |
| Risk classification schema | `schemas/risk_classification.schema.json` | Validates risk level output |
| Decision result schema | `schemas/decision_result.schema.json` | Validates decision routing output |
| Audit evidence schema | `schemas/audit_evidence.schema.json` | Structures evidence records |

---

## 9. Enterprise Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE CLOUD PLATFORM                    │
│                                                             │
│  ┌──────────────────┐   ┌─────────────────────────────┐   │
│  │  Self-hosted n8n │   │   Google Secret Manager     │   │
│  │  (GCP Compute)   │   │   (Credential storage)      │   │
│  └─────────┬────────┘   └─────────────────────────────┘   │
│            │                                                │
│  ┌─────────▼────────┐   ┌─────────────────────────────┐   │
│  │  Cloud Logging   │   │  Google Security Operations │   │
│  │  (Telemetry)     │   │  (SIEM + detection)         │   │
│  └─────────┬────────┘   └─────────────────────────────┘   │
│            │                                                │
│  ┌─────────▼────────┐   ┌─────────────────────────────┐   │
│  │    BigQuery      │   │  GCP IAM Service Accounts   │   │
│  │  (Governance     │   │  (Least privilege connectors)│  │
│  │   Reporting)     │   └─────────────────────────────┘   │
│  └──────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
         │                          │
  ┌──────▼──────┐           ┌──────▼──────┐
  │    Asana    │           │    Notion   │
  │  (Review)   │           │  (Gov. KB)  │
  └─────────────┘           └─────────────┘
```
