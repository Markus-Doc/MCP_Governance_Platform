# Annexes

## AI and MCP Access Governance Platform — PoC v0

---

## Annex A — Request Intake Field Schema

Required fields for every MCP, AI service and external API access request:

| Field | Type | Required | Validation | Purpose |
|---|---|---|---|---|
| `requester_name` | String | Yes | Non-empty | Named accountability |
| `requester_email` | String | Yes | Valid email format | Contact and notification |
| `team` | String | Yes | Non-empty | Ownership attribution |
| `service_name` | String | Yes | Non-empty | Integration identifier |
| `service_type` | Enum | Yes | `mcp_server` / `ai_service` / `external_api` | Risk routing |
| `vendor_name` | String | Yes | Non-empty | Third-party risk assessment |
| `vendor_url` | String | No | Valid URL | Vendor reference |
| `data_classification` | Enum | Yes | `public` / `internal` / `confidential` / `restricted` | Risk scoring |
| `environment` | Enum | Yes | `sandbox` / `staging` / `production` | Risk scoring |
| `external_exposure` | Enum | Yes | `none` / `vendor` / `public_internet` | Risk scoring |
| `mcp_tool_scope` | String | Yes (for MCP) | Description of tools exposed | Tool capability review |
| `agentic_scope` | String | Yes (for AI) | Description of agent autonomy level | Agentic risk review |
| `business_purpose` | String | Yes | Minimum 50 characters | Request justification |
| `requested_permissions` | String | Yes | Non-empty | Least-privilege review |
| `review_period` | String | Yes | Duration or date | Time-bound approval |
| `credential_storage` | String | No | Description of credential handling | Secrets governance |
| `prior_review_reference` | String | No | Evidence ID of prior review | Re-review traceability |

**Validation failure behaviour:** Requests with missing required fields are returned to the requester with a specific field list. The workflow does not proceed past validation for incomplete requests.

---

## Annex B — AI and MCP Risk Classification Matrix (Detailed)

Full factor-by-level matrix with scoring guidance:

| Factor | Low (0–1) | Medium (2–3) | High (4–5) | Prohibited |
|---|---|---|---|---|
| **Data classification** | Public only | Internal | Confidential | Restricted |
| **Environment** | Sandbox only | Staging | Production | Production + unrestricted write |
| **External exposure** | None | Approved vendor | Public internet | Public internet + restricted data |
| **Privileged access** | None | Limited read elevation | Broad admin or write | Unrestricted privileged without approval |
| **MCP tool scope** | Read-only, sandboxed | Internal bounded tools | Sensitive actions, data export | Unapproved privileged tools |
| **Agentic scope** | Human-directed only | Automated with review checkpoint | Delegated tool use | Unrestricted execution, no human bounds |
| **Service maturity** | Pre-approved or internal | New, clear owner | New + sensitive data | Unowned or policy conflict |
| **Owner** | Named, confirmed | Named, pending | Named, scope unclear | No owner identified |

**Scoring:** Sum the scores for all factors. 0–4 = Low, 5–9 = Medium, 10–14 = High, any Prohibited factor = Prohibited.

**Conservative principle:** When factors are ambiguous or conflicting, classify at the higher level.

---

## Annex C — Decision Logic Matrix (Detailed)

### Auto Allow Conditions (ALL must be true)

- Service is pre-approved or internal origin
- Data classification: Public or Internal only
- Environment: Sandbox or development only
- External exposure: None or approved internal vendor
- Privileged access: None
- MCP tool scope: None or read-only with no side effects
- Agentic scope: Human-directed only
- Owner: Named and confirmed
- Business purpose: Documented and specific
- Review period: Specified
- No Prohibited factors present

### Human Review Conditions (ANY one triggers review)

- Data classification is Confidential
- Environment is Production
- Service is new and not yet assessed
- Vendor not yet assessed
- MCP tool scope includes any actions, writes, exports or privileged operations
- Agentic scope includes autonomous tool execution
- Customer or business impact possible
- Risk level is Medium or High
- Any review checklist item is unclear or incomplete

### Auto Deny Conditions (ANY one triggers denial)

- Data classification is Restricted
- Restricted or regulated data would flow to an unapproved or public endpoint
- No accountable owner identified
- Business purpose not provided or insufficient
- Requested permissions excessive for stated purpose
- MCP server behaviour unsafe or unknown with no assessment path
- Unrestricted agent execution with no human confirmation bounds
- Explicit conflict with documented policy identified

---

## Annex D — Security Review Checklist Summary

Full checklist: [10-security-review-checklist.md](../10-security-review-checklist.md)

**Nine review sections:**

1. Request completeness
2. Data classification and scope
3. Environment and infrastructure risk
4. MCP tool scope and authorisation
5. Agentic and AI agent risk
6. Credential and secrets handling
7. Logging and auditability
8. LLM and AI application security
9. Architecture guardrails

**Review outcomes:** Approve / Approve with Conditions / Deny / Needs More Information

---

## Annex E — Audit Evidence Fields

Every evidence record includes these fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `evidence_id` | String | Yes | `EVD-YYYY-NNN` format |
| `schema_version` | String | Yes | `1.0` |
| `workflow_name` | String | Yes | Integration identifier |
| `submitted_by` | String | Yes | Named requester |
| `team` | String | Yes | Owning team |
| `service_name` | String | Yes | Integration name |
| `service_type` | Enum | Yes | mcp_server / ai_service / external_api |
| `data_classification` | Enum | Yes | public / internal / confidential / restricted |
| `environment` | Enum | Yes | sandbox / staging / production |
| `risk_level` | Enum | Yes | low / medium / high / prohibited |
| `decision` | Enum | Yes | auto_allow / human_review / auto_deny |
| `decision_reason` | String | Yes | Human-readable decision basis |
| `decision_timestamp` | ISO8601 | Yes | UTC timestamp |
| `findings_count` | Integer | Yes | Total findings from linter |
| `max_severity` | Enum | Yes | low / medium / high / prohibited |
| `findings` | Array | Yes | Array of finding objects |
| `reviewer` | String | Conditional | Required if human_review |
| `reviewer_email` | String | Conditional | Required if human_review |
| `reviewer_decision` | Enum | Conditional | approve / approve_with_conditions / deny |
| `reviewer_decision_timestamp` | ISO8601 | Conditional | Required if reviewer_decision set |
| `approval_conditions` | Array | Conditional | Required if approve_with_conditions |
| `approval_expiry` | Date | Conditional | Required if approve |
| `re_review_trigger` | String | No | Conditions that trigger re-review |
| `evidence_location` | String | Yes | URL or path to evidence record |
| `governance_note` | String | Yes | Portfolio disclaimer or operational note |

---

## Annex F — Example Asana Request

**Fictional scenario:** Alex Rivera (Platform Enablement team) requests connection to a third-party MCP server providing database query tools against a production customer database.

**Asana task content (fictional):**

```
Title: MCP Access Request — CustomerDB MCP Server

Requester: Alex Rivera (alex.rivera@example-corp.com)
Team: Platform Enablement
Service: CustomerDB MCP Server
Service Type: MCP Server
Vendor: ThirdParty Data Systems Ltd (thirdpartydatasystems.example)
Data Classification: Confidential
Environment: Production
External Exposure: Public internet (vendor-hosted MCP server)
MCP Tool Scope: query_customer_records, export_schema, list_tables
Agentic Scope: Agent queries and returns customer data to AI assistant without
               human confirmation step between query and response
Business Purpose: Enable AI customer support assistant to answer queries using
                  live database data. Support team needs real-time customer
                  record access for escalation handling.
Requested Permissions: Read access to customer_records table and schema
Review Period: 90 days
Credential Storage: n8n credential store (not yet moved to Secret Manager)
```

**Expected classification:** High → Human Review (Security team)

**Linter findings expected:**
- LINT-001: MCP server node detected
- LINT-002: MCP node has credential references
- LINT-004: AI agent has no human approval gate
- LINT-005: Workflow missing owner metadata field

**<SCREENSHOT PLACEHOLDER: Asana task as described above — showing all custom fields populated, in New Findings section>**

---

## Annex G — n8n Workflow Map

```
[Manual Trigger]
      │
      ▼
[Sample Workflow Input] ─── Sets: workflow_name, submitted_by, team,
      │                          service_name, service_type, data_classification
      ▼
[MCP Tool Server] ─── Fictional MCP node (triggers LINT-001, LINT-002)
      │                URL: http://localhost:3000/sse (fictional)
      ▼
[AI Agent — Summarise and Route] ─── Fictional agent node (triggers LINT-004)
      │                               No upstream approval gate by design
      ▼
[Code — Run Security Linter] ─── Runs 6 deterministic rules
      │                           Returns: findings[], max_severity,
      │                           human_review_required, decision
      ▼
[IF — Findings Require Review]
      │
   ┌──┴──┐
[True]  [False]
   │         │
   ▼         ▼
[Asana —  [Evidence
Create    Summary]
Review    Returns:
Task]     auto_allow or
          auto_deny
          evidence record
```

**Node types:**
- `n8n-nodes-base.manualTrigger` — Manual Trigger
- `n8n-nodes-base.set` — Sample Workflow Input
- `@n8n/n8n-nodes-langchain.mcpClientTool` — MCP Tool Server (fictional)
- `@n8n/n8n-nodes-langchain.agent` — AI Agent (fictional)
- `n8n-nodes-base.code` — Code Linter
- `n8n-nodes-base.if` — IF Router
- `n8n-nodes-base.asana` — Asana Task Creator
- `n8n-nodes-base.set` — Evidence Summary

---

## Annex H — Framework Mapping Summary

| Linter Rule | CSA AI Themes | MAESTRO Layers | OWASP LLM | ISO 27001 | ISO 42001 |
|---|---|---|---|---|---|
| LINT-001 | access_control, human_oversight, accountability, auditability | tool_execution, orchestration | LLM08 | A.9.1, A.15.1 | 8.4, 6 |
| LINT-002 | access_control, human_oversight, third_party_risk | tool_execution, external_integration | LLM01 | A.9.2, A.15.1 | 8.4 |
| LINT-003 | access_control, auditability, third_party_risk | external_integration | LLM01 | A.9.1, A.12.4 | 6 |
| LINT-004 | human_oversight, accountability, safe_ai_operation, auditability | orchestration, governance_observability | LLM08, LLM09 | A.6.1.1 | 8.4, 5.3 |
| LINT-005 | accountability, auditability, governance_ownership | governance_observability | LLM09 | A.6.1.1 | 5.3, 9 |
| LINT-006 | accountability, auditability, governance_ownership | governance_observability | — | A.12.4 | 6, 9 |

---

## Annex I — Threat Model Starter

### Assets

- Request intake records (Asana tasks)
- Risk classification findings (linter output)
- Reviewer decisions and approval conditions
- Audit evidence records (GitHub, Notion, BigQuery)
- MCP server and tool metadata
- Connector credentials (n8n credential store / Secret Manager)

### Threat Scenarios

| Threat | Example | Starter Mitigation |
|---|---|---|
| **Confused deputy** | MCP tool called on behalf of wrong user | Requester context, consent boundaries and tool scope reviewed at intake |
| **Prompt injection** | Malicious input manipulates AI agent to leak data | Data class and tool exposure reviewed; output filters considered |
| **Excessive privilege** | Broad tool scope granted for narrow business purpose | Least-privilege conditions enforced in approval; scope documented |
| **Evidence gap** | Decision cannot be reconstructed for audit | Evidence produced at decision time; GitHub-committed |
| **Secret leakage** | API token committed to workflow export | All credential IDs are fictional placeholders; export reviewed pre-commit |
| **Shadow integration** | MCP connection made before security review | Structured intake required; webhook-triggered review before connection |
| **Scope creep post-approval** | MCP server expands tool set after approval | GOV-08 periodic review; re-review triggered on scope change |
| **Reviewer bypass** | High-risk request routed as low-risk | Deterministic classification; reviewer identity captured; prohibited = no override |

### STRIDE Application

| Category | Applicable Threat | Platform Control |
|---|---|---|
| **Spoofing** | Requester impersonation | Named requester required; Google Workspace identity in enterprise |
| **Tampering** | Evidence record modification | Git content-addressable storage; BigQuery append-only in enterprise |
| **Repudiation** | Reviewer denies making decision | Reviewer identity and timestamp captured in evidence |
| **Information disclosure** | Sensitive data via MCP tool | Data classification at intake; tool scope reviewed |
| **Denial of service** | Intake flood overwhelming review queue | Rate limiting on webhook in production; reviewer capacity monitoring |
| **Elevation of privilege** | Low-risk request auto-allowed when high-risk | Conservative multi-factor classification; any prohibited = auto deny |

---

## Annex J — Glossary

| Term | Definition |
|---|---|
| **Agentic AI** | An AI system that autonomously plans, decides and takes actions, including calling external tools |
| **Asana** | Task management platform used as the intake and human review system in this project |
| **Audit evidence** | Structured records that demonstrate a control operated at a specific point in time |
| **Auto allow** | Decision outcome for Low-risk requests — access permitted without human review |
| **Auto deny** | Decision outcome for Prohibited requests — access denied without human review |
| **Confused deputy** | A security vulnerability where a system acts on behalf of the wrong principal |
| **CSA AI** | Cloud Security Alliance AI Controls Matrix — a framework for cloud AI governance |
| **Defence in depth** | Security strategy using multiple overlapping controls |
| **Evidence chain** | The sequence of records linking a finding to a decision to an audit outcome |
| **GOV-01 through GOV-08** | The eight governance control objectives of this platform |
| **Human review** | Decision path requiring a named security reviewer to approve, deny or conditionally approve |
| **LINT-001 through LINT-006** | The six deterministic linter rules in this project |
| **MAESTRO** | A threat modelling framework for agentic and multi-agent AI systems |
| **MCP** | Model Context Protocol — a standard for connecting AI models to external tools and data sources |
| **MCP server** | A server implementing the MCP protocol, exposing tools that AI agents can call |
| **n8n** | An open-source workflow automation platform used as the orchestration layer |
| **OWASP LLM Top 10** | OWASP's list of the top 10 security risks in large language model applications |
| **PoC** | Proof of Concept — a working but non-production demonstration |
| **Prohibited** | Risk classification level — request auto-denied; cannot be overridden without CISO exception |
| **SOC 2 Type II** | A compliance framework for demonstrating that security controls operate over time |
| **Zero Trust** | Security model where no implicit trust is granted; all access must be explicitly verified |
