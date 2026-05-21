# Security Architecture and Governance Design

## AI and MCP Access Governance Platform

**Audience:** Security Architects, Lead Security Engineers, Compliance and Risk Reviewers  
**Framework alignment:** NIST SP 800-37, NIST SP 800-30, ISO/IEC 27001, ISO/IEC 42001, Zero Trust, MAESTRO, OWASP LLM Top 10

---

## 1. Security Design Philosophy

The platform applies **defence in depth** across the intake, classification, review and evidence layers. No single control is relied upon to prevent all risk. Multiple, overlapping controls reduce the likelihood and impact of a governance failure.

The security architecture is grounded in **Zero Trust** principles:
- No implicit trust for AI agents, MCP servers or external integrations
- Explicit verification required before any tool access is approved
- Least-privilege access as the default posture
- All decisions logged and auditable

---

## 2. Trust Model

### 2.1 Trust Boundaries

```
UNTRUSTED                              TRUSTED (after review)
────────────────────────────────────────────────────────────
New MCP servers          →   [Governance Workflow]  →   Approved integration
New AI agent workflows   →   [Risk Classification]  →   Evidence record
New external APIs        →   [Human Review]         →   Documented decision
Third-party credentials  →   [Secret Manager]       →   Managed credential
```

**Principle:** Everything starts untrusted. The governance workflow is the trust-granting mechanism. Trust is not implicit — it must be earned through intake, classification and review.

### 2.2 Zones

| Zone | Contents | Trust Level |
|---|---|---|
| Intake zone | Asana request form | Low trust — unvalidated input |
| Orchestration zone | n8n workflow engine | Controlled — validated, least-privilege credentials |
| Review zone | Asana security review tasks | Human authority — reviewer identity confirmed |
| Evidence zone | GitHub, Notion, BigQuery | High integrity — tamper-evident by design |
| Infrastructure zone | GCP, internal APIs, databases | High trust — access gated by governance review |

---

## 3. Threat Surface and Mitigations

### 3.1 MAESTRO Threat Layer Mapping

The MAESTRO framework structures agentic AI threats across seven layers. This platform addresses threats at four primary layers:

| MAESTRO Layer | Threat Addressed | Platform Control |
|---|---|---|
| **Tool Execution** | MCP server called with unauthorised scope or sensitive parameters | LINT-001, LINT-002: detect MCP nodes and credential references before approval |
| **Orchestration** | AI agent makes decisions or takes actions without human oversight | LINT-004: detect AI agent nodes without upstream approval gate |
| **External Integration** | HTTP calls to MCP-like endpoints bypassing the governance workflow | LINT-003: detect direct endpoint calls |
| **Governance Observability** | No audit trail; workflow owner unknown; risk not classified | LINT-005, LINT-006: detect missing owner and classification metadata |

### 3.2 OWASP LLM Top 10 Coverage

| OWASP LLM Risk | How This Platform Addresses It |
|---|---|
| **LLM01: Prompt Injection** | MCP tool scope reviewed at intake; review considers prompt injection risk in `agentic_scope` field |
| **LLM06: Sensitive Information Disclosure** | Data classification field required at intake; confidential / restricted data triggers human review |
| **LLM08: Excessive Agency** | LINT-004 flags AI agent nodes without approval gates; agentic scope assessed in risk classification |
| **LLM09: Overreliance** | Human review required for all medium and high-risk; auto-allow only for demonstrably low-risk |
| **LLM10: Model Theft** | IP and repository context exposure assessed through data classification and MCP tool scope fields |

### 3.3 MCP-Specific Threats

| Threat | Description | Mitigation |
|---|---|---|
| **Confused deputy** | MCP server called on behalf of wrong user or purpose | Requester context, consent boundaries and tool scope reviewed at intake |
| **Tool scope creep** | MCP server exposes more tools than the integration requires | `mcp_tool_scope` field required; reviewed by security team for high-risk requests |
| **Credential exposure in workflow** | OAuth tokens or API keys embedded in n8n workflow nodes | LINT-002 detects credential references on MCP nodes; export review enforced |
| **Unreviewed capability expansion** | MCP server updates its tool set after initial approval | GOV-08 requires re-review on material scope change |
| **Server-side injection** | MCP server returns malicious content to manipulate agent | Prompt injection risk assessed at intake; tool scope bounded in approved configuration |

---

## 4. Security Controls

### 4.1 Preventive Controls

| Control | Implementation |
|---|---|
| Required intake fields | n8n validation node rejects incomplete requests |
| Data classification required | `data_classification` field is mandatory; missing = auto deny |
| Owner required | `requester_name` and `team` fields mandatory |
| Prohibited path blocks | Auto deny for policy-conflicting requests before any review |
| Least-privilege credentials | Integration guides specify minimum credential scopes |

### 4.2 Detective Controls

| Control | Implementation |
|---|---|
| Linter rule LINT-001 | Detects MCP nodes in workflow |
| Linter rule LINT-002 | Detects credential references on MCP nodes |
| Linter rule LINT-003 | Detects direct HTTP calls to MCP-like endpoints |
| Linter rule LINT-004 | Detects AI agent nodes without human approval gates |
| Linter rule LINT-005 | Detects missing workflow owner metadata |
| Linter rule LINT-006 | Detects missing risk classification metadata |

### 4.3 Corrective and Recovery Controls

| Control | Implementation |
|---|---|
| Human review queue | Asana tasks for medium/high-risk; reviewer makes approve / deny / conditional decision |
| Conditional approval | Reviewer can approve with documented conditions (scope limits, expiry date) |
| Re-review trigger | GOV-08 — approved access flagged for re-review on scope change |
| Evidence trail | Decision records preserved in GitHub; Notion optional |

### 4.4 Evidence Controls (Audit)

| Control | Implementation |
|---|---|
| Structured evidence records | JSON evidence schema for every terminal decision |
| Timestamp capture | `decision_timestamp` in every evidence record |
| Framework tags | CSA AI and MAESTRO tags in every finding record |
| Reviewer identity | Reviewer name and decision captured in evidence |
| Evidence location | GitHub-committed evidence records are tamper-evident by default |

---

## 5. Secrets and Credential Management

### 5.1 PoC

- All credential IDs in the n8n workflow export are fictional placeholders (`cred-fictional-001`)
- No API keys, OAuth tokens or real credentials are present anywhere in this repository
- Credentials are configured in n8n's credential store only — never in workflow JSON

### 5.2 Production

| Credential Type | Storage | Access |
|---|---|---|
| Asana OAuth token | Google Secret Manager | n8n service account only |
| Notion integration token | Google Secret Manager | n8n service account only |
| n8n API key (if used) | Google Secret Manager | Automation service account only |
| GCP service account key | GCP IAM (keyless recommended) | Workload identity federation |

**Principle:** No secrets in code, configuration files or workflow exports at any time.

---

## 6. Identity and Access

### 6.1 PoC

- n8n Cloud: user-authenticated session
- Asana: personal access token or OAuth (documented in implementation guide)
- Notion: internal integration token

### 6.2 Enterprise

| Identity | Control |
|---|---|
| n8n service identity | GCP IAM service account, least privilege |
| Reviewer identity | Google Workspace identity; reviewer identity captured in evidence |
| Workflow ownership | Named owner required in Asana request; accountability enforced |
| MCP server identity | Vendor identity and assurance posture assessed at intake |

---

## 7. Data Governance

| Data Type | Classification | Handling |
|---|---|---|
| Request intake fields | Internal | Stored in Asana; n8n transit only; not stored in workflow logs |
| Finding records | Internal | GitHub evidence files; Notion governance database |
| Evidence JSON | Internal | GitHub-committed; Notion optional |
| Credential references | Confidential | n8n credential store only; never in workflow JSON |
| Sample/demo data | Public safe | Fictional; no real data at any point |

---

## 8. Audit and Evidence Design

The platform is designed to support SOC 2 Type II style audit queries. For a query such as:

> "Show evidence that human oversight controls were applied to AI agent workflows between [date range]."

The answer chain is:

1. Linter finding with LINT-004 (AI agent without approval gate) — structured JSON with CSA AI `human_oversight` tag
2. Asana task created for human review — task ID, reviewer assignment, timestamp
3. Reviewer decision recorded — approve / deny / conditional, with rationale
4. Evidence record written — GitHub commit with timestamp, reviewer, decision and framework tags

**<SCREENSHOT PLACEHOLDER: Evidence JSON record showing finding_id, severity, framework_mappings (CSA AI human_oversight), reviewer decision and evidence_location fields>**

---

## 9. Governance Framework Alignment Detail

### 9.1 ISO/IEC 27001 Alignment

| Control | ISO/IEC 27001 Reference |
|---|---|
| Access request intake | A.9.1 — Access control policy |
| Data classification at intake | A.8.2 — Information classification |
| Least-privilege approval | A.9.2 — User access management |
| Supplier risk assessment | A.15.1 — Information security in supplier relationships |
| Audit evidence capture | A.12.4 — Logging and monitoring |
| Periodic review | A.9.2.5 — Review of user access rights |

### 9.2 ISO/IEC 42001 Alignment

| Control | ISO/IEC 42001 Reference |
|---|---|
| Human review for AI decisions | Clause 8.4 — AI system operation, human oversight |
| Named accountability | Clause 5.3 — Roles, responsibilities and authorities |
| Evidence and audit trail | Clause 9 — Performance evaluation |
| Risk classification and planning | Clause 6 — Planning and AI risk assessment |
| Scope governance | Clause 4 — Context of the organisation |

### 9.3 CSA AI Controls Matrix Alignment

Every linter finding maps to one or more CSA AI control themes:

| CSA AI Theme | Linter Coverage |
|---|---|
| `access_control` | LINT-001, LINT-002, LINT-003 |
| `human_oversight` | LINT-004 |
| `accountability` | LINT-004, LINT-005 |
| `auditability` | LINT-001 through LINT-006 |
| `safe_ai_operation` | LINT-004 |
| `third_party_risk` | LINT-002, LINT-003 |
| `governance_ownership` | LINT-005, LINT-006 |

---

## 10. Production Hardening Checklist

For a production deployment, the following additional controls are recommended:

- [ ] Replace Manual Trigger with Asana webhook (HMAC signature verified)
- [ ] Move all credentials to Google Secret Manager
- [ ] Configure n8n with dedicated GCP IAM service accounts
- [ ] Enable Google Cloud Logging for all n8n workflow executions
- [ ] Forward findings to Google Security Operations
- [ ] Write evidence records to BigQuery for long-term retention and reporting
- [ ] Enable Asana task notification to security reviewer via email or Slack
- [ ] Implement periodic review job (scheduled n8n workflow for access re-review)
- [ ] Add rate limiting on intake trigger
- [ ] Conduct penetration test of n8n and Asana integration before production
- [ ] Define incident response procedure for governance workflow failure

---

## 11. Known Limitations of the PoC

| Limitation | Risk if Ignored in Production |
|---|---|
| Manual Trigger (not webhook) | Requests not processed in real time |
| No real Asana task reading | Request field data not validated from live system |
| Evidence written to files | Evidence not durable at enterprise scale |
| No SIEM forwarding | Governance events not visible to security operations |
| No identity verification of requester | Requester can claim any name |
| No re-review scheduler | Approved access may persist without periodic review |

These are intentional PoC boundaries. Each has a documented enterprise equivalent.
