# Evidence Model and Templates

## AI and MCP Access Governance Platform

**Audience:** CISO, Compliance Officers, Audit Reviewers, Security Engineers  
**Purpose:** Define the evidence produced by the governance workflow, where it lives, and what it proves

---

## 1. Evidence Design Philosophy

Evidence is not produced retrospectively. It is built into the decision workflow as a required output of every terminal state.

This design follows SOC 2 Type II evidence thinking: evidence of control operation must be continuous, structured and tamper-evident. A governance decision that cannot be evidenced later is a governance gap.

Every decision path in the governance workflow — auto allow, human review outcome and auto deny — produces a structured evidence record at the moment of decision.

---

## 2. Evidence Types

| Evidence Type | Produced By | Decision Path | Stored In |
|---|---|---|---|
| **Intake record** | Asana task creation | All paths | Asana |
| **Linter finding record** | Code node (linter rules) | All paths | n8n execution log; GitHub `evidence/samples/` |
| **Classification record** | Risk classifier output | All paths | n8n execution log |
| **Auto-allow evidence** | Evidence Summary node | Auto allow only | n8n log; GitHub |
| **Review task record** | Asana task creation node | Human review paths | Asana |
| **Reviewer decision record** | Reviewer action in Asana | Human review paths | Asana; GitHub; optional Notion |
| **Auto-deny evidence** | Evidence Summary node | Auto deny only | n8n log; GitHub |
| **Exception record** | Separate exception intake | Exception cases only | Notion; GitHub |

---

## 3. Evidence Schema

### 3.1 Linter Finding Record

Every finding produced by the linter contains:

```json
{
  "finding_id": "FIND-2026-001",
  "rule_id": "LINT-001",
  "rule_title": "MCP-related node detected in workflow",
  "severity": "high",
  "human_review_required": true,
  "workflow_name": "example-mcp-data-pipeline",
  "node_name": "MCP Tool Server",
  "evidence_path": "nodes[2].type",
  "evidence_value": "@n8n/n8n-nodes-langchain.mcpClientTool",
  "description": "MCP client tool node detected. MCP-connected tools can access business systems, external services and sensitive data on behalf of AI agents. Review is required before this workflow is approved for use.",
  "remediation": "Conduct a security review of the MCP server configuration, tool scope, credential handling and agentic workflow boundaries.",
  "framework_mappings": {
    "csa_ai": ["access_control", "human_oversight", "accountability", "auditability"],
    "maestro": ["tool_execution", "orchestration"],
    "owasp_llm": ["LLM01_prompt_injection", "LLM08_excessive_agency"],
    "enterprise_assurance": ["iso_27001_a9", "iso_42001_clause8", "soc2_cc61", "zero_trust"]
  },
  "finding_timestamp": "2026-05-21T09:00:00Z",
  "governance_note": "Fictional sample. No real data or credentials."
}
```

**<SCREENSHOT PLACEHOLDER: GitHub file view of finding JSON record — showing finding_id, rule_id, severity, human_review_required, framework_mappings fields>**

### 3.2 Full Evidence Record

The complete evidence record for a decision outcome:

```json
{
  "evidence_id": "EVD-2026-001",
  "schema_version": "1.0",
  "workflow_name": "example-mcp-data-pipeline",
  "submitted_by": "Alex Rivera",
  "team": "Platform Enablement",
  "service_name": "CustomerDB MCP Server",
  "service_type": "mcp_server",
  "data_classification": "confidential",
  "environment": "production",
  "risk_level": "high",
  "decision": "human_review",
  "decision_reason": "High severity findings requiring security review before access approval",
  "decision_timestamp": "2026-05-21T09:00:00Z",
  "findings_count": 4,
  "max_severity": "high",
  "findings": [
    {
      "rule_id": "LINT-001",
      "severity": "high",
      "human_review_required": true,
      "description": "MCP-related node detected in workflow"
    },
    {
      "rule_id": "LINT-002",
      "severity": "high",
      "human_review_required": true,
      "description": "MCP node has credential references"
    },
    {
      "rule_id": "LINT-004",
      "severity": "high",
      "human_review_required": true,
      "description": "AI agent node has no human approval gate"
    },
    {
      "rule_id": "LINT-005",
      "severity": "medium",
      "human_review_required": false,
      "description": "Workflow missing owner metadata"
    }
  ],
  "reviewer": null,
  "reviewer_decision": null,
  "reviewer_decision_timestamp": null,
  "approval_conditions": null,
  "approval_expiry": null,
  "evidence_location": "github://evidence/samples/EVD-2026-001.json",
  "governance_note": "Fictional sample. No real data or credentials. Portfolio demonstration only."
}
```

### 3.3 Reviewer Decision Record

After a reviewer completes their review in Asana:

```json
{
  "evidence_id": "EVD-2026-001",
  "reviewer": "Jamie Chen",
  "reviewer_email": "jamie.chen@example-corp.com",
  "reviewer_decision": "approve_with_conditions",
  "reviewer_decision_timestamp": "2026-05-21T14:30:00Z",
  "approval_conditions": [
    "Read-only tools only (query_customer_records; no export_schema or list_tables)",
    "Sandbox environment only — not approved for production",
    "30-day access window; expiry 2026-06-21",
    "Monitoring required: all MCP tool calls logged to Cloud Logging"
  ],
  "approval_expiry": "2026-06-21",
  "re_review_trigger": "Before promotion to production environment",
  "evidence_updated_timestamp": "2026-05-21T14:35:00Z",
  "governance_note": "Fictional sample."
}
```

---

## 4. Evidence Chain for Audit Queries

### Query: "Show evidence that human oversight controls were applied to AI agent workflows"

| Step | Evidence |
|---|---|
| 1 | Linter finding LINT-004 — AI agent without approval gate (CSA AI `human_oversight` tag) |
| 2 | n8n IF node routes to human_review branch (execution log) |
| 3 | Asana review task created — task ID, finding summary, reviewer assigned |
| 4 | Reviewer makes decision — identity, timestamp, decision recorded |
| 5 | Evidence record written with full chain — GitHub-committed, tamper-evident |

**Result:** Complete, auditable chain from detection to decision.

**<SCREENSHOT PLACEHOLDER: Evidence chain diagram — Linter Finding → n8n execution → Asana review task → Reviewer decision → Evidence JSON record>**

### Query: "Show evidence that restricted data access was denied"

| Step | Evidence |
|---|---|
| 1 | Intake record shows `data_classification: restricted` |
| 2 | Linter classification: Prohibited |
| 3 | n8n auto-deny branch triggered |
| 4 | Denial reason documented: "Restricted data to unassessed public endpoint" |
| 5 | Auto-deny evidence record written with denial reason and policy basis |

---

## 5. Evidence Storage

### 5.1 PoC Storage

| Evidence Type | Storage Location |
|---|---|
| Intake records | Asana task history |
| Execution logs | n8n execution history (30-day retention on Cloud tier) |
| Finding records | GitHub `evidence/samples/` directory |
| Reviewer decisions | Asana task comments + GitHub evidence JSON update |
| Exception records | Notion exception register + GitHub |

### 5.2 Production Storage (Enterprise Recommended)

| Evidence Type | Storage Location |
|---|---|
| All governance events | BigQuery (long-term retention, queryable) |
| Finding records | PostgreSQL or BigQuery |
| Reviewer decisions | BigQuery + Asana task history |
| Audit exports | Google Cloud Storage (durable, access-controlled) |
| SIEM events | Google Security Operations |

---

## 6. Evidence Integrity

Evidence records committed to GitHub benefit from Git's content-addressable storage:

- Each commit is SHA-256 hashed
- Commit history is tamper-evident
- Changes to evidence records are visible in the commit log
- Branch protection and signed commits recommended for production

For an enterprise deployment, additional evidence integrity controls include:

- BigQuery append-only tables
- Cloud Logging immutability settings
- WORM storage for long-term audit retention

---

## 7. Evidence Templates

### Template 1 — Auto Allow Record

```json
{
  "evidence_id": "[EVD-YYYY-NNN]",
  "decision": "auto_allow",
  "workflow_name": "[name]",
  "submitted_by": "[name]",
  "team": "[team]",
  "data_classification": "low_or_internal",
  "environment": "sandbox_or_staging",
  "risk_level": "low",
  "decision_timestamp": "[ISO8601]",
  "findings_count": 0,
  "auto_allow_basis": "All auto-allow conditions met",
  "review_period_expiry": "[date]",
  "evidence_location": "github://evidence/samples/[filename].json"
}
```

### Template 2 — Human Review Initiated

```json
{
  "evidence_id": "[EVD-YYYY-NNN]",
  "decision": "human_review",
  "workflow_name": "[name]",
  "submitted_by": "[name]",
  "team": "[team]",
  "risk_level": "[medium|high]",
  "decision_timestamp": "[ISO8601]",
  "findings_count": "[n]",
  "max_severity": "[medium|high]",
  "asana_task_id": "[task_id]",
  "reviewer": null,
  "reviewer_decision": null
}
```

### Template 3 — Reviewer Decision Record

```json
{
  "evidence_id": "[EVD-YYYY-NNN]",
  "reviewer": "[name]",
  "reviewer_email": "[email]",
  "reviewer_decision": "[approve|approve_with_conditions|deny]",
  "reviewer_decision_timestamp": "[ISO8601]",
  "approval_conditions": ["[condition_1]", "[condition_2]"],
  "approval_expiry": "[date]",
  "re_review_trigger": "[trigger_description]"
}
```

### Template 4 — Auto Deny Record

```json
{
  "evidence_id": "[EVD-YYYY-NNN]",
  "decision": "auto_deny",
  "workflow_name": "[name]",
  "submitted_by": "[name]",
  "team": "[team]",
  "risk_level": "prohibited",
  "decision_timestamp": "[ISO8601]",
  "denial_reason": "[specific reason]",
  "policy_basis": "[policy references]"
}
```
