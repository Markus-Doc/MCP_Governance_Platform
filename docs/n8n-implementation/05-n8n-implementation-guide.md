# n8n Implementation and Import Guide

## AI and MCP Access Governance Platform — PoC v0

**Audience:** Platform Engineers, Implementation Reviewers, Security Engineers  
**Workflow file:** `workflows/n8n/mcp_access_governance_poc_v0.json`

---

## 1. Overview

This guide covers:

- Importing the n8n workflow into n8n Cloud or a self-hosted instance
- Configuring required credentials (Asana, Notion)
- Understanding the workflow node structure
- Running a test against sample payloads
- Known limitations and production considerations

---

## 2. Prerequisites

| Requirement | Notes |
|---|---|
| n8n Cloud account or self-hosted n8n instance | Free tier sufficient for PoC |
| Asana account | Free tier sufficient; access to create projects and custom fields |
| Notion account (optional) | For governance knowledge base integration |
| GitHub access | To clone or download this repository |

---

## 3. Import the Workflow

### 3.1 Download the Workflow JSON

The importable workflow is at:

```
workflows/n8n/mcp_access_governance_poc_v0.json
```

Download or clone this repository and locate the file.

### 3.2 Import into n8n

1. Open your n8n instance
2. Navigate to **Workflows** in the left sidebar
3. Click **New Workflow** → **Import from JSON**
4. Paste the contents of `mcp_access_governance_poc_v0.json` or upload the file
5. Click **Import**
6. The workflow `MCP Access Governance PoC v0` will appear in your workspace

**<SCREENSHOT PLACEHOLDER: n8n Import from JSON dialog — paste area visible with workflow name field>**

**<SCREENSHOT PLACEHOLDER: n8n workflow canvas after import — all nodes visible: Manual Trigger, Sample Workflow Input, MCP Tool Server, AI Agent, Code Linter, IF Router, Asana Task Creation, Evidence Summary>**

---

## 4. Workflow Node Reference

| Node Name | Type | Purpose |
|---|---|---|
| **Manual Trigger** | `n8n-nodes-base.manualTrigger` | Starts the workflow — replace with Asana webhook for production |
| **Sample Workflow Input** | `n8n-nodes-base.set` | Populates sample request fields for demo purposes |
| **MCP Tool Server** | `@n8n/n8n-nodes-langchain.mcpClientTool` | Fictional MCP server node — triggers LINT-001 and LINT-002 for demo |
| **AI Agent — Summarise and Route** | `@n8n/n8n-nodes-langchain.agent` | Fictional AI agent node — triggers LINT-004 for demo (no approval gate) |
| **Code — Run Security Linter** | `n8n-nodes-base.code` | Runs deterministic linter checks; emits structured findings |
| **IF — Findings Require Review** | `n8n-nodes-base.if` | Routes workflow based on `human_review_required` flag |
| **Asana — Create Review Task** | `n8n-nodes-base.asana` | Creates Asana task in Security Review queue (requires configured credential) |
| **Evidence Summary** | `n8n-nodes-base.set` | Constructs final evidence record with all findings and decision |

**<SCREENSHOT PLACEHOLDER: n8n Code node — linter JavaScript code visible with rule IDs, severity levels and framework_mappings structure>**

---

## 5. Credential Configuration

### 5.1 Asana Credential Setup

The Asana node requires an Asana credential configured in n8n.

**Step 1: Create an Asana Personal Access Token**

1. Log in to Asana
2. Go to **My Profile Settings** → **Apps** → **Developer Apps**
3. Click **New Access Token**
4. Name it: `n8n MCP Governance PoC`
5. Copy the token — you will not see it again

**Step 2: Add credential in n8n**

1. In n8n, go to **Credentials** in the left sidebar
2. Click **New Credential** → search for **Asana**
3. Select **Asana API** credential type
4. Paste the access token
5. Name the credential: `Asana — MCP Governance PoC`
6. Click **Save**

**Step 3: Configure the Asana node**

1. Open the **Asana — Create Review Task** node in the workflow
2. Under **Credential**, select `Asana — MCP Governance PoC`
3. Set the **Project ID** to your `MCP Access Governance Reviews` Asana project ID
4. Set the **Section** to the `New Findings` section ID

**<SCREENSHOT PLACEHOLDER: n8n Asana credential configuration dialog — credential name field and API token field visible (token value redacted)>**

**<SCREENSHOT PLACEHOLDER: n8n Asana node configuration — project ID and section fields, assignee field highlighted>**

### 5.2 Required Asana Project Structure

Create a project in Asana named `MCP Access Governance Reviews` with these sections:

| Section | Purpose |
|---|---|
| `New Findings` | New linter findings awaiting triage |
| `In Review` | Assigned to security reviewer |
| `Approved Risk` | Reviewed and approved (with conditions if applicable) |
| `Remediation Required` | Changes required before access approved |
| `Closed Evidence` | Review complete; evidence archived |

**Required custom fields on the project:**

| Field Name | Type | Options |
|---|---|---|
| Service Type | Dropdown | AI Service, MCP Server, External API |
| Data Classification | Dropdown | Public, Internal, Confidential, Restricted |
| Environment | Dropdown | Sandbox, Staging, Production |
| Risk Level | Dropdown | Low, Medium, High, Prohibited |
| Decision Outcome | Dropdown | Auto Allow, Human Review, Auto Deny, Approved, Denied |
| CSA AI Theme | Text | Free text — populated by n8n |
| MAESTRO Layer | Text | Free text — populated by n8n |

**<SCREENSHOT PLACEHOLDER: Asana project settings showing custom fields — Service Type, Data Classification, Environment, Risk Level, Decision Outcome>**

### 5.3 Notion Credential Setup (Optional)

If using Notion for the governance knowledge base:

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Name it: `n8n MCP Governance`
4. Copy the Internal Integration Token
5. In n8n, create a **Notion API** credential with this token
6. In Notion, share your governance database with the integration

**Recommended Notion structure:**

| Database | Purpose |
|---|---|
| MCP Server Inventory | Approved and pending MCP servers with risk level |
| Governance Decision Log | All decisions with evidence references |
| Control Register | GOV-01 through GOV-08 with status |
| Exception Register | Time-limited exceptions with expiry dates |

**<SCREENSHOT PLACEHOLDER: Notion governance workspace showing MCP Server Inventory database with columns: Server Name, Vendor, Risk Level, Status, Decision Date, Reviewer>**

---

## 6. Running the Workflow — Test Run Guide

### 6.1 First Run (Manual Trigger — Demo Mode)

1. Open the imported workflow in n8n
2. Confirm the workflow is **Active** (toggle in top right)
3. Click **Test Workflow** (play button)
4. Select **Manual Trigger** node and click **Execute Node**
5. The workflow will run through all nodes using the sample input data

**Expected output:**

```json
{
  "findings_count": 4,
  "max_severity": "high",
  "findings": [
    { "rule_id": "LINT-001", "severity": "high", "human_review_required": true },
    { "rule_id": "LINT-002", "severity": "high", "human_review_required": true },
    { "rule_id": "LINT-004", "severity": "high", "human_review_required": true },
    { "rule_id": "LINT-005", "severity": "medium", "human_review_required": false }
  ],
  "decision": "human_review",
  "evidence_written": true
}
```

**<SCREENSHOT PLACEHOLDER: n8n execution results panel — showing Code node output with 4 findings, IF node routing to human_review branch>**

### 6.2 Test the Auto Allow Path

To test the auto-allow path, modify the **Sample Workflow Input** node:

- Set `workflow_owner` to a non-empty value (e.g., `"Alex Rivera"`)
- Set `risk_classification` to `"low"`
- Remove or disable the **MCP Tool Server** node
- Remove or disable the **AI Agent** node

Re-run the workflow. Expected: 0 findings, `decision: auto_allow`.

**<SCREENSHOT PLACEHOLDER: n8n execution results for auto-allow path — 0 findings, IF node routing to allow branch, Evidence Summary node output>**

### 6.3 Test the Auto Deny Path

To test the auto-deny path, modify the **Sample Workflow Input** node:

- Set `data_classification` to `"restricted"`
- Set `environment` to `"production"`
- Set `vendor_verified` to `false`

Re-run the workflow. Expected: `decision: auto_deny` with written denial reason.

---

## 7. Sample Request Payloads

### 7.1 High-Risk MCP Server Request (Triggers Human Review)

```json
{
  "workflow_name": "customer-data-mcp-pipeline",
  "requester_name": "Alex Rivera",
  "requester_email": "alex.rivera@example-corp.com",
  "team": "Platform Enablement",
  "service_name": "CustomerDB MCP Server",
  "service_type": "mcp_server",
  "vendor_name": "ThirdParty Data Systems Ltd",
  "data_classification": "confidential",
  "environment": "production",
  "mcp_tool_scope": "query_customer_records, export_schema, list_tables",
  "agentic_scope": "Agent can query and return customer records to AI assistant without human confirmation step",
  "business_purpose": "Enable AI assistant to answer customer support queries using live database data",
  "requested_permissions": "Read access to customer_records table, schema inspection",
  "review_period": "90 days"
}
```

**Expected decision:** `human_review` — data_classification=confidential, production environment, MCP tool with data export capability, agentic scope with no human confirmation.

### 7.2 Low-Risk Internal Tool Request (Auto Allow)

```json
{
  "workflow_name": "internal-docs-reader",
  "requester_name": "Sam Patel",
  "requester_email": "sam.patel@example-corp.com",
  "team": "Developer Experience",
  "service_name": "Internal Docs API",
  "service_type": "external_api",
  "vendor_name": "Internal Engineering",
  "data_classification": "internal",
  "environment": "sandbox",
  "mcp_tool_scope": "read_docs (read-only)",
  "agentic_scope": "Human-directed only — user prompts agent to fetch document",
  "business_purpose": "Allow AI assistant to surface relevant internal documentation",
  "requested_permissions": "Read-only access to /docs endpoint",
  "review_period": "30 days"
}
```

**Expected decision:** `auto_allow` — internal data, sandbox environment, read-only, pre-assessed internal service, human-directed scope.

### 7.3 Prohibited Request (Auto Deny)

```json
{
  "workflow_name": "analytics-export-agent",
  "requester_name": "",
  "requester_email": "",
  "team": "",
  "service_name": "Public Analytics Aggregator",
  "service_type": "external_api",
  "vendor_name": "Unknown Vendor",
  "data_classification": "restricted",
  "environment": "production",
  "mcp_tool_scope": "export_all, bulk_download, unrestricted_query",
  "agentic_scope": "Agent executes data exports without human confirmation",
  "business_purpose": "",
  "requested_permissions": "Full read/write to analytics database",
  "review_period": ""
}
```

**Expected decision:** `auto_deny` — restricted data to unknown vendor, no owner, no business purpose, unrestricted agent execution.

---

## 8. Expected Outputs

### 8.1 n8n Execution Log

After a successful test run:

**<SCREENSHOT PLACEHOLDER: n8n execution history list — showing completed executions for MCP Access Governance PoC v0 with status, timestamp and duration>**

### 8.2 Asana Review Task

If Asana credentials are configured and the human review path fires:

**<SCREENSHOT PLACEHOLDER: Asana task created by n8n — task title "Security Review Required: customer-data-mcp-pipeline", description showing findings, severity, CSA AI tags, in New Findings section>**

### 8.3 Evidence Summary

The Evidence Summary node outputs a structured record. Example:

```json
{
  "evidence_id": "EVD-2026-002",
  "workflow_name": "customer-data-mcp-pipeline",
  "submitted_by": "Alex Rivera",
  "team": "Platform Enablement",
  "decision": "human_review",
  "decision_reason": "High severity findings requiring security review before access approval",
  "decision_timestamp": "2026-05-21T09:00:00Z",
  "findings_count": 4,
  "max_severity": "high",
  "findings": [
    {
      "rule_id": "LINT-001",
      "severity": "high",
      "description": "MCP-related node detected in workflow",
      "human_review_required": true,
      "framework_mappings": {
        "csa_ai": ["access_control", "human_oversight", "accountability", "auditability"],
        "maestro": ["tool_execution", "orchestration"],
        "enterprise_assurance": ["iso_27001", "iso_42001"]
      }
    }
  ],
  "governance_note": "Fictional sample. No real data or credentials. Portfolio demonstration only."
}
```

---

## 9. Production Deployment Considerations

| Area | PoC | Production |
|---|---|---|
| Trigger | Manual | Asana webhook (verify HMAC signature) |
| Credentials | n8n credential store | Google Secret Manager |
| Hosting | n8n Cloud | Self-hosted n8n on GCP |
| Evidence storage | n8n execution log | BigQuery + GitHub |
| Notifications | None | Slack or email via n8n notify node |
| Reviewer assignment | Manual | Auto-assign by data classification or team |
| Identity | n8n user session | GCP IAM service accounts |

---

## 10. Troubleshooting

| Issue | Likely Cause | Resolution |
|---|---|---|
| Asana node fails with 401 | Invalid or expired access token | Regenerate Asana PAT and update credential in n8n |
| Asana node fails with 404 | Incorrect project or section ID | Verify project ID from Asana URL; section ID from Asana API |
| Code node fails | JavaScript syntax error | Check n8n version compatibility; review Code node output in execution log |
| IF node routes incorrectly | `human_review_required` field missing | Check Code node output; confirm linter is emitting correct field |
| Notion node fails | Integration not shared with database | Share Notion database with the integration via database settings |
| Workflow import fails | JSON validation error | Validate JSON with a JSON linter before import |

---

## 11. Known Limitations

- The PoC uses a **Manual Trigger**. A production deployment would use an Asana webhook.
- The **MCP Tool Server** and **AI Agent** nodes in the export are **fictional placeholders**. They are intentionally included to trigger LINT-001, LINT-002 and LINT-004 for demonstration purposes. They should not be connected to real infrastructure without a separate security review.
- All **credential IDs** in the workflow JSON are fictional (`cred-fictional-001`). They must be replaced with real n8n credentials before any real integration can operate.
- The **Evidence Summary** node writes evidence to n8n's execution log, not to a durable database. A production deployment should write to BigQuery or a PostgreSQL database.
- **No AI-enriched findings** in v0. LLM-powered finding explanations (via Gemini or OpenAI) are planned for a future phase.
