# Technical Case Study

## AI and MCP Access Governance Platform — PoC v0

**Scenario:** AI-Native Governance Engineering for MCP-Connected Infrastructure  
**Format:** Technical portfolio case study  
**Audience:** Lead Security Engineers, Platform Engineers, Security Architects, Technical Hiring Reviewers

---

## Problem

Modern enterprise workflow platforms now support Model Context Protocol (MCP) servers. MCP gives AI agents the ability to call tools, query databases, access APIs and take actions in business systems on behalf of users or automated processes.

This creates a governance gap that existing access management approaches do not address:

- **Traditional IAM** governs human identities and static service accounts. It was not designed for AI agents that dynamically call tools through MCP interfaces.
- **Shadow integrations** occur when developers connect MCP servers to local or cloud workflow environments before security teams are aware.
- **Audit evidence failures** result when AI agent decisions and tool calls cannot be traced back to an approved access request and a named reviewer.
- **Framework gaps** mean that technical findings cannot be mapped to governance controls without manual cross-referencing work.

**The specific scenario addressed by this project:** A backend developer wants to connect a third-party database provider through an MCP server to the company's n8n workflow environment. The MCP server can expose internal database schema, query production customer records and return sensitive data to an AI agent — without any security review having occurred.

---

## The Engineering Approach

Rather than building a policy document, this project builds a working control loop:

```
Inspect → Classify → Route → Review → Evidence
```

This loop is implemented as:

1. A deterministic Python security linter (`src/linter/`) that inspects n8n workflow JSON exports
2. A working n8n workflow (`workflows/n8n/mcp_access_governance_poc_v0.json`) that runs the linter, applies decision logic and routes to Asana
3. A structured evidence model that produces auditable records at every terminal decision
4. A governance documentation package aligned to ISO/IEC 27001, ISO/IEC 42001, CSA AI, MAESTRO, OWASP LLM and SOC 2

---

## What Was Built

### Security Linter (`src/linter/`)

Six deterministic, stateless, side-effect-free rules:

| Rule | Severity | Signal |
|---|---|---|
| LINT-001 | High | MCP client tool node detected in workflow |
| LINT-002 | High | MCP node has credential references |
| LINT-003 | Medium | HTTP node making direct call to MCP-like endpoint |
| LINT-004 | High | AI agent node with no human approval gate upstream |
| LINT-005 | Medium | Workflow missing owner metadata |
| LINT-006 | Low | Workflow missing risk classification metadata |

**Architecture:**
- `WorkflowLinter` — accepts workflow dict, JSON string or file path; runs all rules; returns `LinterReport`
- `LinterReport` — aggregates findings; exposes `finding_count`, `max_severity`, `findings_by_severity`
- `LinterFinding` — immutable dataclass with full finding fields and `to_dict()` for JSON serialisation
- `FrameworkMappings` — structured CSA AI, MAESTRO, OWASP LLM and enterprise assurance tags

**Design choices:**
- Rules are pure functions — easy to test, impossible to have side effects
- Framework mappings are embedded in findings at generation time — no post-processing needed for audit
- `human_review_required` flag on each finding drives the n8n IF node routing decision
- All 42 pytest tests pass across positive, negative, serialisation and integration scenarios

### n8n Workflow

The workflow demonstrates the control loop in an importable, runnable n8n format:

```
Manual Trigger
→ Sample Workflow Input (fictional MCP server request)
→ MCP Tool Server node (fictional — intentionally triggers LINT-001, LINT-002)
→ AI Agent node (fictional — intentionally triggers LINT-004 — no approval gate)
→ Code node — Run Security Linter
→ IF node — route on human_review_required
→ [True]  Asana — Create Review Task
→ [False] Evidence Summary
```

**Design choices:**
- Manual Trigger makes the PoC runnable without real credentials
- Fictional MCP and AI Agent nodes are intentionally included to generate findings — they demonstrate the linter's detection capability without connecting to real infrastructure
- All credential IDs are fictional placeholders (`cred-fictional-001`) — no real credentials are ever present
- The `_governance_note` field in the export makes the fictional nature explicit
- The workflow intentionally triggers LINT-001, LINT-002, LINT-004 and LINT-005 to demonstrate a realistic high-risk scenario

### Framework Alignment

Every finding includes `framework_mappings` covering:

| Framework | Coverage |
|---|---|
| CSA AI Controls Matrix | 8 control themes mapped across 6 rules |
| MAESTRO | 4 threat layers: tool_execution, orchestration, external_integration, governance_observability |
| OWASP LLM Top 10 | LLM01 (prompt injection), LLM06 (sensitive data), LLM08 (excessive agency), LLM09 (overreliance) |
| ISO/IEC 27001 | A.9 (access control), A.12.4 (logging), A.15 (supplier risk) |
| ISO/IEC 42001 | Clauses 5.3, 6, 8.4, 9 |
| SOC 2 | CC6.1, CC7.2 |
| Zero Trust | Explicit verification, least privilege, assume breach |

This means findings are audit-ready at generation. A reviewer reading a finding in Asana sees the governance significance without manual cross-referencing.

### Evidence Package

The project produces four evidence types:

1. **Linter finding records** — structured JSON per finding, with full framework tags
2. **Decision evidence records** — auto allow, human review outcome, auto deny
3. **Reviewer decision records** — identity, timestamp, conditions, expiry
4. **Exception records** — for time-limited overrides with governance owner approval

Evidence is stored in GitHub (`evidence/samples/`) — tamper-evident by default via Git's content-addressable storage.

### Test Suite

42 pytest tests:

| Category | Count | Coverage |
|---|---|---|
| Rule positive tests | 18 | Each rule fires for matching input |
| Rule negative tests | 12 | Rules do not fire for non-matching input |
| LinterReport tests | 6 | Properties, aggregation, max_severity |
| Serialisation tests | 4 | `to_dict()` output matches schema |
| Integration tests | 2 | Full linter run against PoC workflow export |

All 42 tests pass.

---

## Design Decisions and Trade-offs

### Deterministic Before AI

**Decision:** v0 uses deterministic rule-based linting. No LLM-generated findings.

**Rationale:** Deterministic rules are testable, explainable and reliable. Before trusting an AI to generate governance findings, the control loop must be proven correct. AI enrichment (Gemini for explanation) is planned for Phase 2 — but only after the deterministic foundation is established.

**Trade-off:** Less nuanced findings for complex workflows. Mitigated by the human review path, which is the intended resolution for complex cases.

### Evidence at Generation Time

**Decision:** Framework mappings are embedded in findings at the point of generation, not applied later.

**Rationale:** Post-processing framework mapping creates a secondary step that could fail, be skipped or be incomplete. Embedding tags at generation makes findings immediately audit-ready.

**Trade-off:** Rule functions are slightly more complex. Mitigated by the `FrameworkMappings` dataclass which provides clean structure.

### Manual Trigger for PoC

**Decision:** The n8n workflow uses a Manual Trigger, not an Asana webhook.

**Rationale:** An Asana webhook requires live credentials and a public n8n endpoint. The PoC must be demonstrable without those dependencies. The Manual Trigger makes the workflow runnable in any n8n instance immediately after import.

**Trade-off:** Not a live end-to-end integration. Mitigated by the documentation of the production webhook pattern and the sample payloads in this repository.

### Fictional Nodes for Demonstration

**Decision:** The n8n workflow includes fictional MCP Tool Server and AI Agent nodes that are intentionally designed to trigger linter findings.

**Rationale:** A workflow with no findings would not demonstrate the linter's detection capability. The fictional nodes generate LINT-001, LINT-002 and LINT-004 findings, showing the full human review path. This is explicitly documented in the `_governance_note` field.

**Trade-off:** These nodes cannot be connected to real infrastructure without a separate security review. This is documented clearly in the implementation guide.

---

## Security Engineering Principles Applied

| Principle | Application |
|---|---|
| **Least privilege** | Integration guides specify minimum credential scopes; least-privilege conditions enforced in approval workflow |
| **Human-in-the-loop** | Medium and high-risk requests always require human review; auto-allow is limited to demonstrably low-risk |
| **Zero Trust** | No implicit trust for new integrations; every request must pass intake, classification and review |
| **Defence in depth** | Multiple overlapping controls — intake validation, deterministic linting, human review, evidence capture, periodic review |
| **Evidence by design** | Evidence is produced at the moment of decision, not reconstructed later |
| **No secrets in code** | All credential IDs are fictional; no real credentials at any point in the repository |
| **Audit-ready findings** | Framework tags embedded in findings at generation — not added as a post-processing step |

---

## What This Demonstrates for a Portfolio Reviewer

| Capability | Evidence in This Project |
|---|---|
| Security engineering applied to an emerging problem | MCP and agentic AI governance is a new risk area; this project addresses it with working code |
| Translation of governance requirements to testable code | 42 passing tests; deterministic rule coverage; schema-validated output |
| Framework alignment at the engineering level | Framework mappings in every finding — not just in a document |
| Evidence-oriented design | Structured evidence model with audit chain for every decision path |
| Full documentation of a security project | Charter, architecture, design, implementation guide, checklist, case study, demo script |
| Enterprise deployment thinking | GCP, IAM, Secret Manager, Cloud Logging, BigQuery — documented, not just mentioned |
| Honest scoping | Clear PoC limitations documented; no overclaiming |

---

## Limitations and Honest Assessment

This is a proof of concept. It demonstrates the pattern, not a production deployment.

| Limitation | Impact | Production Resolution |
|---|---|---|
| Manual Trigger | Not real-time intake | Asana webhook with HMAC verification |
| Sample data hardcoded | Not reading live Asana requests | n8n Asana API node with custom field mapping |
| Evidence in files | Not durable at scale | BigQuery append-only tables |
| No identity verification | Requester can claim any name | Google Workspace identity integration |
| No re-review scheduler | Access doesn't expire automatically | Scheduled n8n workflow surfacing expired approvals |
| No SIEM output | Events not visible to security operations | Google Security Operations forwarding |
| Linter run on export only | Does not monitor live workflow changes | CI/CD integration (GitHub Actions) |

None of these are design flaws — they are intentional PoC scope boundaries, each with a documented enterprise equivalent.
