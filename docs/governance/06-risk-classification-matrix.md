# Risk Classification Matrix

## AI and MCP Access Governance Platform

**Audience:** Security Engineers, Governance Owners, Compliance Reviewers  
**Purpose:** Define the risk factors and levels used to classify MCP, AI agent and external API access requests

---

## Classification Principles

Risk classification uses a **multi-factor conservative model**. When multiple risk factors are present, classification escalates to the higher level. Speed of integration does not override risk classification authority.

The matrix deliberately separates delivery velocity from approval authority. AI-native development can move fast — but fast prototyping is compatible with governance when scope, owner, data classification, tool capability and evidence requirements are explicit before access is granted.

---

## Risk Factor Matrix

| Risk Factor | Low | Medium | High | Prohibited |
|---|---|---|---|---|
| **Data classification** | Public | Internal | Confidential | Restricted |
| **Environment** | Sandbox or development | Staging | Production | Production with unrestricted write access |
| **External exposure** | None (internal only) | Approved vendor | Public internet | Public internet with restricted or confidential data |
| **Privileged access** | None | Limited elevated read | Broad administrative | Production privileged access without explicit approval |
| **MCP tool exposure** | Read-only, sandboxed tools | Internal tool access with bounded scope | Sensitive action tools or data export capability | Unapproved privileged tool invocation or unrestricted tool scope |
| **Agentic workflow scope** | Human-directed research or drafting only | Automated operational workflow with a manual review checkpoint | Delegated tool use that can affect systems, records or external services | Unrestricted agent execution without human confirmation or side-effect bounds |
| **Service maturity and assurance** | Pre-approved or sandboxed internal service | New service with clear owner and bounded scope | New service handling sensitive data or with customer impact potential | Unowned service, unknown vendor assurance posture, or policy conflict |
| **Ownership** | Named owner with active team | Named owner, team confirmation pending | Named owner but scope or team unclear | No accountable owner identified |

---

## Risk Level Definitions

### Low Risk

**Decision:** Auto Allow

Characteristics:
- Known or pre-approved service
- Read-only or narrow-scope access
- Public or internal data only
- Sandbox or development environment
- No MCP tool side effects
- Human-directed agent scope
- Clear named owner and business purpose

**Example:** Developer requests read-only access to an internal documentation API via a pre-approved n8n integration node. Data is internal, environment is sandbox, no sensitive data involved.

---

### Medium Risk

**Decision:** Human Review (Platform team)

Characteristics:
- New service or vendor not yet assessed
- Access to internal data with some sensitivity
- Staging environment or limited production read
- MCP tools with internal scope but not validated
- Automated workflow with a review checkpoint
- Owner named but some fields incomplete

**Example:** Developer requests integration with a new internal search service that indexes internal project documentation. Staging environment, internal data, vendor is known but not formally assessed.

---

### High Risk

**Decision:** Human Review (Security team)

Characteristics:
- Confidential data access
- Production environment
- External AI service or third-party MCP server
- MCP tools that can take actions, export data or modify records
- Agentic workflow with delegated tool use
- New vendor with unknown assurance posture
- Customer or business impact possible

**Example:** Developer requests connection to a third-party MCP server providing database query tools against a production customer database. Data is confidential, environment is production, agent can query and return customer records without human confirmation.

---

### Prohibited

**Decision:** Auto Deny

Characteristics:
- Regulated, restricted or sensitive data to an unapproved or public endpoint
- Broad write or administrative access without explicit approval
- No accountable owner or business purpose documented
- Unrestricted agent execution or tool scope without human bounds
- Unsafe or unvalidated MCP server
- Explicit policy conflict identified

**Example:** Developer requests integration with an unknown external analytics aggregator. Data classification is restricted, no owner documented, agent scope includes bulk export and unrestricted queries, vendor assurance unknown.

---

## Multi-Factor Escalation Rules

When multiple factors are present, apply the highest applicable classification:

| Scenario | Resulting Classification |
|---|---|
| Internal data + production environment + new vendor | High |
| Sandbox + public data + read-only + named owner | Low |
| Confidential data + staging + MCP tool with side effects | High |
| Restricted data + any external exposure | Prohibited |
| No owner + any risk level | Escalate one level (or Prohibited if already High) |
| Agentic scope with side effects + no approval gate | High or Prohibited depending on data classification |

---

## Classification Examples

### Example 1 — Auto Allow

**Request:** Read-only access to internal documentation knowledge base via an approved REST API  
**Data:** Internal  
**Environment:** Sandbox  
**MCP/Tool scope:** None — standard HTTP GET  
**Owner:** Named, confirmed  
**Classification:** **Low → Auto Allow**

---

### Example 2 — Human Review (Medium)

**Request:** New integration with internal HR data search API, staging environment  
**Data:** Internal (HR documents — some sensitivity)  
**Environment:** Staging  
**MCP/Tool scope:** Search and retrieve (read-only, no modification)  
**Vendor:** Internal team, not formally assessed for this use  
**Classification:** **Medium → Human Review (Platform team)**

---

### Example 3 — Human Review (High)

**Request:** Third-party MCP server connecting to production customer database  
**Data:** Confidential (customer records)  
**Environment:** Production  
**MCP/Tool scope:** `query_customer_records`, `export_schema`, `list_tables`  
**Agentic scope:** Agent queries and returns customer data without human confirmation  
**Vendor:** External, not assessed  
**Classification:** **High → Human Review (Security team)**

---

### Example 4 — Auto Deny

**Request:** External analytics aggregator with restricted data export, no named owner  
**Data:** Restricted  
**Environment:** Production  
**MCP/Tool scope:** `export_all`, `bulk_download`, `unrestricted_query`  
**Owner:** None documented  
**Business purpose:** Not provided  
**Classification:** **Prohibited → Auto Deny**

---

## Governance Notes

- Classification is the responsibility of the automated linter. Human reviewers may override classification upward but should document the reason.
- Prohibited classification is always auto-denied. Human reviewers cannot override an auto-deny without a documented exception approved by the Governance Owner.
- Exceptions to the prohibited level require a separate exception request with explicit CISO-level approval.
- Risk classification is point-in-time. A material change to scope, data use, tool capability or vendor posture triggers re-classification under GOV-08.
