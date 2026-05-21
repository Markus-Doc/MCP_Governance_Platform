# Decision Logic Matrix

## AI and MCP Access Governance Platform

**Audience:** Security Engineers, Platform Engineers, Compliance Reviewers  
**Purpose:** Define the decision rules that map risk classification to decision outcomes

---

## Decision Outcomes

| Outcome | Trigger | Action |
|---|---|---|
| **Auto Allow** | Low risk, all conditions met | Request approved; evidence record written |
| **Human Review** | Medium or high risk | Asana security review task created; reviewer makes final decision |
| **Auto Deny** | Prohibited classification | Request rejected; denial reason recorded; evidence written |

---

## Decision Rule Table

| Risk Level | Decision | Review Queue | Evidence Requirement |
|---|---|---|---|
| **Low** | Auto Allow | None | Record request, classification outcome, auto-allow timestamp and rule basis |
| **Medium** | Human Review | Platform review team | Record risk factors, reviewer identity, review decision and review timestamp |
| **High** | Human Review | Security team | Record detailed review, specific conditions, reviewer identity and approval terms |
| **Prohibited** | Auto Deny | None (by default) | Record denial reason, specific policy basis and denial timestamp |

---

## Auto Allow Rules

A request is auto-allowed when **all** of the following conditions are true:

| Condition | Required Value |
|---|---|
| Service pre-approved or internal origin | Yes |
| Data classification | Public or Internal only |
| Environment | Sandbox or development |
| MCP tool exposure | None, or read-only with no side effects |
| Agentic scope | Human-directed only; no delegated tool execution |
| Privileged access | None |
| Owner | Named, confirmed |
| Business purpose | Documented |
| Review period | Specified |
| Vendor | Internal or pre-assessed |

**Auto allow does not apply if any factor is unclear, missing, or conflicts with this table.** When in doubt, route to human review.

---

## Human Review Rules

A request is routed to human review when **any** of the following conditions is true:

| Condition | Reason for Review |
|---|---|
| Data classification is Confidential | Sensitive data access requires human judgement |
| Environment is Production | Production impact requires human approval |
| Service is new and not yet assessed | Vendor risk assessment pending |
| MCP tools include actions, writes or data export | Tool side effects require human approval |
| Agentic scope includes delegated tool execution | Agent acting without human confirmation |
| Privileged access is requested | Elevated permissions require human review |
| Owner is named but scope is unclear | Scope clarification needed |
| Customer or business impact is possible | Business impact assessment required |
| Exception handling may be required | Complex cases require human judgement |
| Risk classification is Medium or High | Policy requires human review above Low |

**Review level:**
- Medium → Platform team review
- High → Security team review

---

## Auto Deny Rules

A request is auto-denied when **any** of the following conditions is true:

| Condition | Policy Basis |
|---|---|
| Restricted or regulated data to an unapproved or public endpoint | Data governance policy |
| No accountable owner documented | Accountability requirement |
| Business purpose not provided | Intake completeness requirement |
| Requested permissions are excessive for stated purpose | Least-privilege policy |
| MCP server behaviour is unsafe or unknown with no assessment | Third-party risk policy |
| Unrestricted agent execution with no human confirmation | Agentic AI safety policy |
| Explicit policy conflict identified | Direct policy violation |

**Auto-deny decisions cannot be overridden by a reviewer.** A denied request may only be resubmitted as a new request with the policy conflict addressed, or as a formal exception request with documented CISO-level approval.

---

## Reviewer Decision Options

When a request reaches human review, the reviewer may choose:

| Reviewer Decision | Meaning |
|---|---|
| **Approve** | Request meets security requirements; access may proceed |
| **Approve with Conditions** | Access may proceed only under specified conditions (scope limit, expiry date, monitoring requirement) |
| **Deny** | Request does not meet security requirements; access not permitted |
| **Needs More Information** | Request returned to requester for clarification before review can complete |

**Approval with conditions** must include:
- Specific, verifiable conditions
- Expiry date for the approved access
- Re-review trigger (e.g., before moving to production)

---

## Decision Routing Logic (n8n IF Node)

```javascript
// Simplified routing logic — see Code node for full implementation
const findings = items[0].json.findings;
const hasHumanReviewRequired = findings.some(f => f.human_review_required === true);
const hasProhibited = findings.some(f => f.severity === 'prohibited');

if (hasProhibited) {
  return { decision: 'auto_deny' };
} else if (hasHumanReviewRequired) {
  return { decision: 'human_review' };
} else {
  return { decision: 'auto_allow' };
}
```

**<SCREENSHOT PLACEHOLDER: n8n IF node — condition configuration showing human_review_required field check and true/false branch destinations>**

---

## Re-Review Triggers

Approved access must be re-reviewed when any of the following change materially:

| Change | Re-Review Required |
|---|---|
| MCP server updates its tool set | Yes — new tools may exceed original approved scope |
| Data classification of accessed data increases | Yes — higher sensitivity changes the risk profile |
| Agent scope expands beyond approved boundaries | Yes — scope change constitutes a new access request |
| Vendor assurance posture changes | Yes — vendor risk may have increased |
| Access moves from sandbox/staging to production | Yes — environment change is a material escalation |
| Named owner leaves the organisation | Yes — accountability must be re-established |

---

## Decision Examples

### Example 1 — Auto Allow

**Request:** Internal documentation reader, sandbox, internal data, read-only, named owner  
**Linter findings:** LINT-006 (missing risk classification tag) — Low severity, no human review required  
**Decision:** Auto Allow  
**Evidence record:** Request ID, classification outcome, auto-allow timestamp, LINT-006 advisory note

---

### Example 2 — Human Review (High)

**Request:** Third-party MCP server, production, confidential customer data, `query_customer_records` tool  
**Linter findings:** LINT-001 (High), LINT-002 (High), LINT-004 (High — no approval gate), LINT-005 (Medium — no owner metadata)  
**Decision:** Human Review — Security team  
**Asana task:** Created in `New Findings` section with finding summary, severity breakdown, CSA AI tags, MAESTRO layers  
**Reviewer:** Assigned to security engineer  
**Reviewer decision:** Approve with Conditions  
**Conditions:** Read-only tools only (`query_customer_records` without `export_schema`); sandbox environment only; 30-day expiry; monitoring required  
**Evidence record:** Full review chain — findings, reviewer identity, conditions, approval timestamp

---

### Example 3 — Auto Deny

**Request:** Unknown external aggregator, restricted data, no owner, no business purpose  
**Linter findings:** Multiple Prohibited indicators  
**Decision:** Auto Deny  
**Denial reason:** Restricted data classification to unassessed public endpoint; no accountable owner; no documented business purpose  
**Evidence record:** Denial reason, policy basis, denial timestamp

---

## Evidence Fields for Each Decision

### Auto Allow Evidence

```json
{
  "decision": "auto_allow",
  "decision_timestamp": "2026-05-21T09:15:00Z",
  "risk_level": "low",
  "findings_count": 1,
  "findings": [{ "rule_id": "LINT-006", "severity": "low" }],
  "auto_allow_basis": "All auto-allow conditions met",
  "review_period_expiry": "2026-06-21"
}
```

### Human Review Evidence

```json
{
  "decision": "human_review",
  "decision_timestamp": "2026-05-21T09:00:00Z",
  "risk_level": "high",
  "findings_count": 4,
  "reviewer": "Jamie Chen",
  "reviewer_decision": "approve_with_conditions",
  "conditions": ["read-only tools only", "sandbox environment", "30-day expiry"],
  "review_completed_timestamp": "2026-05-21T14:30:00Z"
}
```

### Auto Deny Evidence

```json
{
  "decision": "auto_deny",
  "decision_timestamp": "2026-05-21T09:05:00Z",
  "risk_level": "prohibited",
  "denial_reason": "Restricted data to unassessed public endpoint; no accountable owner",
  "policy_basis": "Data governance policy; Accountability requirement"
}
```
