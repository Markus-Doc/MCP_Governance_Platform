/**
 * MCP Access Governance Platform — v1
 * n8n Workflow SDK Source
 *
 * Live workflow: https://mwalker.app.n8n.cloud/workflow/W5dJjUnwbSruXHH3
 *
 * Architecture:
 *   Slack Webhook (MCP addition request)
 *   → Parse MCP Request
 *   → Fetch Notion MCP Inventory (governance context)
 *   → Security Linter — 9 Rules (deterministic, no AI in finding path)
 *   → Risk Classifier (Low / Medium / High / Prohibited)
 *   → Route By Decision (Switch)
 *       case 0 — auto_approve  → Slack notification
 *       case 1 — human_review  → Asana task + Slack notification
 *       case 2 — auto_deny     → Slack notification
 *   → Merge Decision Paths
 *   → Write Notion Evidence Log (PoC Evidence Log database)
 *   → Final Evidence Summary
 *
 * Linter Rules:
 *   MCP-N8N-001  MCP reference detected                          medium
 *   MCP-N8N-002  Credential reference on MCP-related node        high
 *   MCP-N8N-003  External MCP-like HTTP endpoint detected        high
 *   MCP-N8N-004  Write/execute capability without justification  high
 *   MCP-N8N-005  Missing workflow owner metadata                 medium
 *   MCP-N8N-006  Missing risk classification metadata            medium
 *   MCP-N8N-007  Framework mapping not submitted                 low
 *   MCP-N8N-008  Possible secret-like material in submission     critical
 *   MCP-N8N-009  Endpoint not on approved internal domain list   medium
 *
 * Decision Logic:
 *   critical finding  → auto_deny   (risk_level: Prohibited)
 *   any high finding  → human_review (risk_level: High)
 *   any medium finding → human_review (risk_level: Medium)
 *   low only          → auto_approve (risk_level: Low)
 *
 * Intake Payload Schema (POST to webhook):
 *   {
 *     workflow_name: string,
 *     mcp_endpoint: string,
 *     tool_capabilities: string[],        // read | write | execute | create | delete | admin
 *     credential_reference_present: bool,
 *     workflow_owner: string,
 *     risk_classification: string,
 *     submitted_by: string,
 *     team: string,
 *     justification: string,
 *     slack_user_id: string,
 *     slack_channel_id: string
 *   }
 *
 * Credentials required (set in n8n):
 *   - Notion (notionApi)
 *   - Slack Bot (slackApi)
 *   - Asana (asanaApi)
 *
 * Notion Integration:
 *   Read:  MCP Server Inventory page (366ae242418681729400da90083fc856)
 *   Write: PoC Evidence Log database  (86b8a07f78e4461ba488ed075613b696)
 *         Fields: Finding, Finding ID, Workflow Name, Risk Classification,
 *                 Severity, Decision, Status, Evidence Summary, Reviewer,
 *                 OWASP LLM Mapping, CSA AI Mapping, MAESTRO Mapping
 *
 * Safety:
 *   - Deterministic linter only — no AI model in finding path (CTRL-002)
 *   - No secrets in intake fields — MCP-N8N-008 scans for secret patterns
 *   - All credential IDs in this file are fictional placeholders
 */

import { workflow, node, trigger, switchCase, merge, newCredential, expr } from '@n8n/workflow-sdk';

const webhookTrigger = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2,
  config: {
    name: 'Slack MCP Request',
    parameters: { httpMethod: 'POST', path: 'mcp-governance-intake', responseMode: 'lastNode', responseData: 'noData' },
    position: [240, 400]
  },
  output: [{ body: { workflow_name: 'example-mcp-data-pipeline', mcp_endpoint: 'http://internal-kb.example.com/sse', tool_capabilities: ['read', 'write'], credential_reference_present: true, workflow_owner: '', risk_classification: '', submitted_by: 'alex.rivera', team: 'Platform Enablement', justification: 'Connect internal KB for AI agent', slack_user_id: 'U012AB3CD', slack_channel_id: 'C04MFNKMB66' } }]
});

const parseSubmission = node({
  type: 'n8n-nodes-base.set',
  version: 3,
  config: {
    name: 'Parse MCP Request',
    parameters: {
      mode: 'manual',
      assignments: { assignments: [
        { id: 'f-001', name: 'workflow_name', value: expr('{{ $json.body.workflow_name || "unknown" }}'), type: 'string' },
        { id: 'f-002', name: 'mcp_endpoint', value: expr('{{ $json.body.mcp_endpoint || "" }}'), type: 'string' },
        { id: 'f-003', name: 'tool_capabilities', value: expr('{{ $json.body.tool_capabilities || [] }}'), type: 'array' },
        { id: 'f-004', name: 'credential_reference_present', value: expr('{{ $json.body.credential_reference_present || false }}'), type: 'boolean' },
        { id: 'f-005', name: 'workflow_owner', value: expr('{{ $json.body.workflow_owner || "" }}'), type: 'string' },
        { id: 'f-006', name: 'risk_classification', value: expr('{{ $json.body.risk_classification || "" }}'), type: 'string' },
        { id: 'f-007', name: 'submitted_by', value: expr('{{ $json.body.submitted_by || "unknown" }}'), type: 'string' },
        { id: 'f-008', name: 'team', value: expr('{{ $json.body.team || "unknown" }}'), type: 'string' },
        { id: 'f-009', name: 'justification', value: expr('{{ $json.body.justification || "" }}'), type: 'string' },
        { id: 'f-010', name: 'slack_user_id', value: expr('{{ $json.body.slack_user_id || "" }}'), type: 'string' },
        { id: 'f-011', name: 'slack_channel_id', value: expr('{{ $json.body.slack_channel_id || "" }}'), type: 'string' },
        { id: 'f-012', name: 'submission_timestamp', value: expr('{{ $now.toISO() }}'), type: 'string' }
      ] }
    },
    position: [460, 400]
  },
  output: [{ workflow_name: 'example-mcp-data-pipeline', mcp_endpoint: 'http://internal-kb.example.com/sse', tool_capabilities: ['read', 'write'], credential_reference_present: true, workflow_owner: '', risk_classification: '', submitted_by: 'alex.rivera', team: 'Platform Enablement', justification: 'Connect internal KB for AI agent', slack_user_id: 'U012AB3CD', slack_channel_id: 'C04MFNKMB66', submission_timestamp: '2026-05-21T04:00:00.000Z' }]
});

const fetchNotionInventory = node({
  type: 'n8n-nodes-base.notion',
  version: 2.2,
  config: {
    name: 'Fetch Notion MCP Inventory',
    parameters: { resource: 'page', operation: 'get', pageId: '366ae242418681729400da90083fc856' },
    credentials: { notionApi: newCredential('Notion') },
    position: [680, 400]
  },
  output: [{ id: '366ae242418681729400da90083fc856', properties: { title: [{ plain_text: 'MCP Server Inventory' }] } }]
});

const securityLinter = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Security Linter — 9 Rules',
    parameters: {
      jsCode: "const d = $('Parse MCP Request').item.json;\nconst workflowName = d.workflow_name || 'unknown';\nconst mcpEndpoint = d.mcp_endpoint || '';\nconst toolCaps = Array.isArray(d.tool_capabilities) ? d.tool_capabilities : [];\nconst credPresent = !!d.credential_reference_present;\nconst owner = d.workflow_owner || null;\nconst riskClass = d.risk_classification || null;\nconst justification = d.justification || '';\nconst findings = [];\nconst secretPatterns = /\\b(password|secret|token|api[_\\-]?key|bearer|private[_\\-]?key)\\b/i;\nconst isExternal = mcpEndpoint && !mcpEndpoint.includes('localhost') && !mcpEndpoint.includes('127.0.0.1') && !mcpEndpoint.includes('internal') && !mcpEndpoint.match(/10\\.\\d|172\\.16|192\\.168/);\nconst isWriteCapable = toolCaps.some(c => ['write','execute','create','delete','admin'].includes(c.toLowerCase()));\nif (mcpEndpoint) findings.push({ rule_id: 'MCP-N8N-001', severity: 'medium', title: 'MCP reference detected', node_ref: 'mcp_endpoint', human_review_required: true, framework_mappings: { csa_ai: ['third_party_risk','access_control','auditability'], maestro: ['external_integration','tool_execution','governance_observability'], owasp: ['LLM03:2025','LLM06:2025'] } });\nif (credPresent && mcpEndpoint) findings.push({ rule_id: 'MCP-N8N-002', severity: 'high', title: 'Credential reference on MCP-related node', node_ref: 'mcp_endpoint', human_review_required: true, framework_mappings: { csa_ai: ['access_control','data_governance','auditability'], maestro: ['tool_execution','environment_boundary','external_integration'], owasp: ['LLM02:2025','LLM03:2025','LLM05:2025'] } });\nif (mcpEndpoint && isExternal) findings.push({ rule_id: 'MCP-N8N-003', severity: 'high', title: 'External MCP-like HTTP endpoint detected', node_ref: 'mcp_endpoint', human_review_required: true, framework_mappings: { csa_ai: ['third_party_risk','data_governance'], maestro: ['external_integration','environment_boundary'], owasp: ['LLM03:2025','LLM05:2025','LLM06:2025'] } });\nif (isWriteCapable && !justification) findings.push({ rule_id: 'MCP-N8N-004', severity: 'high', title: 'Write or execute capability requested without business justification', node_ref: 'tool_capabilities', human_review_required: true, framework_mappings: { csa_ai: ['human_oversight','safe_ai_operation','accountability'], maestro: ['agent_decision_path','tool_execution','orchestration'], owasp: ['LLM01:2025','LLM05:2025','LLM06:2025'] } });\nif (!owner) findings.push({ rule_id: 'MCP-N8N-005', severity: 'medium', title: 'Missing workflow owner metadata', node_ref: 'workflow_owner', human_review_required: false, framework_mappings: { csa_ai: ['accountability','auditability','risk_management'], maestro: ['governance_observability'], owasp: ['LLM06:2025'] } });\nif (!riskClass) findings.push({ rule_id: 'MCP-N8N-006', severity: 'medium', title: 'Missing risk classification metadata', node_ref: 'risk_classification', human_review_required: false, framework_mappings: { csa_ai: ['risk_management','safe_ai_operation','auditability'], maestro: ['governance_observability','environment_boundary'], owasp: ['LLM06:2025','LLM09:2025'] } });\nfindings.push({ rule_id: 'MCP-N8N-007', severity: 'low', title: 'Framework mapping not submitted with intake request', node_ref: 'intake_form', human_review_required: false, framework_mappings: { csa_ai: ['auditability','accountability'], maestro: ['governance_observability'], owasp: [] } });\nif (secretPatterns.test(justification) || secretPatterns.test(workflowName)) findings.push({ rule_id: 'MCP-N8N-008', severity: 'critical', title: 'Possible secret-like material detected in submission', node_ref: 'intake_form', human_review_required: true, framework_mappings: { csa_ai: ['data_governance','access_control','auditability'], maestro: ['environment_boundary','external_integration','governance_observability'], owasp: ['LLM02:2025','LLM07:2025'] } });\nif (mcpEndpoint && !mcpEndpoint.includes('internal') && !mcpEndpoint.includes('localhost')) findings.push({ rule_id: 'MCP-N8N-009', severity: 'medium', title: 'MCP endpoint not on approved internal domain list', node_ref: 'mcp_endpoint', human_review_required: true, framework_mappings: { csa_ai: ['third_party_risk','secure_development'], maestro: ['supply_chain','tool_execution','external_integration'], owasp: ['LLM03:2025','LLM05:2025'] } });\nreturn [{ json: { workflow_name: workflowName, mcp_endpoint: mcpEndpoint, tool_capabilities: toolCaps, credential_reference_present: credPresent, workflow_owner: owner, risk_classification: riskClass, submitted_by: d.submitted_by || 'unknown', team: d.team || 'unknown', justification, slack_user_id: d.slack_user_id || '', slack_channel_id: d.slack_channel_id || '', submission_timestamp: d.submission_timestamp || '', findings, finding_count: findings.length } }];"
    },
    position: [900, 400]
  },
  output: [{ workflow_name: 'example-mcp-data-pipeline', findings: [], finding_count: 5 }]
});

const riskClassifier = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Risk Classifier',
    parameters: {
      jsCode: "const d = $input.first().json;\nconst findings = d.findings || [];\nconst hasCritical = findings.some(f => f.severity === 'critical');\nconst hasHigh = findings.some(f => f.severity === 'high');\nconst hasMedium = findings.some(f => f.severity === 'medium');\nconst highCount = findings.filter(f => f.severity === 'high').length;\nconst medCount = findings.filter(f => f.severity === 'medium').length;\nlet risk_level, decision, decision_reason;\nif (hasCritical) { risk_level = 'Prohibited'; decision = 'auto_deny'; decision_reason = 'Critical finding detected: possible secret or prohibited pattern. Request automatically denied.'; }\nelse if (hasHigh) { risk_level = 'High'; decision = 'human_review'; decision_reason = highCount + ' high-severity finding(s). Security team review required before approval.'; }\nelse if (hasMedium) { risk_level = 'Medium'; decision = 'human_review'; decision_reason = medCount + ' medium-severity finding(s). Governance metadata gaps must be resolved.'; }\nelse { risk_level = 'Low'; decision = 'auto_approve'; decision_reason = 'No medium, high or critical findings. Request meets baseline governance requirements.'; }\nconst highest_severity = hasCritical ? 'Critical' : hasHigh ? 'High' : hasMedium ? 'Medium' : 'Low';\nreturn [{ json: { ...d, risk_level, decision, decision_reason, highest_severity } }];"
    },
    position: [1120, 400]
  },
  output: [{ risk_level: 'High', decision: 'human_review', decision_reason: '2 high-severity findings.', highest_severity: 'High' }]
});

const routeByDecision = switchCase({
  version: 3.2,
  config: {
    name: 'Route By Decision',
    parameters: {
      mode: 'rules',
      rules: { values: [
        { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' }, conditions: [{ id: 'r-001', leftValue: expr('{{ $json.decision }}'), rightValue: 'auto_approve', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
        { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' }, conditions: [{ id: 'r-002', leftValue: expr('{{ $json.decision }}'), rightValue: 'human_review', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } },
        { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' }, conditions: [{ id: 'r-003', leftValue: expr('{{ $json.decision }}'), rightValue: 'auto_deny', operator: { type: 'string', operation: 'equals' } }], combinator: 'and' } }
      ] }
    },
    position: [1340, 400]
  }
});

const notifyApproved = node({
  type: 'n8n-nodes-base.slack',
  version: 2.3,
  config: {
    name: 'Slack — Approved',
    parameters: {
      resource: 'message', operation: 'post', select: 'channel',
      channelId: { __rl: true, value: expr('{{ $json.slack_channel_id }}'), mode: 'id' },
      text: expr(':white_check_mark: *MCP Request Approved* — `{{ $json.workflow_name }}`\n\nRisk Level: *{{ $json.risk_level }}* | Findings: {{ $json.finding_count }}\n_{{ $json.decision_reason }}_\n\nEvidence recorded in Notion.')
    },
    credentials: { slackApi: newCredential('Slack Bot') },
    position: [1560, 200]
  },
  output: [{ ok: true }]
});

const createAsanaTask = node({
  type: 'n8n-nodes-base.asana',
  version: 1,
  config: {
    name: 'Create Asana Review Task',
    parameters: {
      operation: 'create', resource: 'task',
      workspace: 'fictional-workspace-id-001',
      projectId: 'fictional-project-id-001',
      name: expr('MCP Governance Review: {{ $json.workflow_name }}'),
      description: expr('MCP Access Governance — Human Review Required\n\nWorkflow: {{ $json.workflow_name }}\nEndpoint: {{ $json.mcp_endpoint }}\nSubmitted by: {{ $json.submitted_by }} ({{ $json.team }})\nJustification: {{ $json.justification }}\n\nRisk Level: {{ $json.risk_level }} | Highest Severity: {{ $json.highest_severity }}\nFinding Count: {{ $json.finding_count }}\n\nDecision Reason: {{ $json.decision_reason }}\n\nFindings:\n{{ JSON.stringify($json.findings, null, 2) }}\n\n— MCP Access Governance Platform v1'),
      section: 'fictional-section-new-findings-001'
    },
    credentials: { asanaApi: newCredential('Asana') },
    position: [1560, 400]
  },
  output: [{ gid: 'asana-task-001', permalink_url: 'https://app.asana.com/0/fictional-project/asana-task-001' }]
});

const notifyPending = node({
  type: 'n8n-nodes-base.slack',
  version: 2.3,
  config: {
    name: 'Slack — Pending Review',
    parameters: {
      resource: 'message', operation: 'post', select: 'channel',
      channelId: { __rl: true, value: expr("{{ $('Risk Classifier').item.json.slack_channel_id }}"), mode: 'id' },
      text: expr(":hourglass_flowing_sand: *MCP Request — Under Security Review* — `{{ $('Risk Classifier').item.json.workflow_name }}`\n\nRisk Level: *{{ $('Risk Classifier').item.json.risk_level }}* | Highest Finding: *{{ $('Risk Classifier').item.json.highest_severity }}*\n_{{ $('Risk Classifier').item.json.decision_reason }}_\n\nAn Asana review task has been created. You will be notified once a decision is made.")
    },
    credentials: { slackApi: newCredential('Slack Bot') },
    position: [1780, 400]
  },
  output: [{ ok: true }]
});

const notifyDenied = node({
  type: 'n8n-nodes-base.slack',
  version: 2.3,
  config: {
    name: 'Slack — Denied',
    parameters: {
      resource: 'message', operation: 'post', select: 'channel',
      channelId: { __rl: true, value: expr('{{ $json.slack_channel_id }}'), mode: 'id' },
      text: expr(':no_entry: *MCP Request Automatically Denied* — `{{ $json.workflow_name }}`\n\nRisk Level: *{{ $json.risk_level }}*\n_{{ $json.decision_reason }}_\n\nPlease remove any secret-like material or prohibited patterns and resubmit.')
    },
    credentials: { slackApi: newCredential('Slack Bot') },
    position: [1560, 600]
  },
  output: [{ ok: true }]
});

const mergeDecisionPaths = merge({
  version: 3.2,
  config: {
    name: 'Merge Decision Paths',
    parameters: { mode: 'append', numberInputs: 3 },
    position: [2000, 400]
  }
});

const writeNotionEvidence = node({
  type: 'n8n-nodes-base.notion',
  version: 2.2,
  config: {
    name: 'Write Notion Evidence Log',
    parameters: {
      resource: 'databasePage',
      operation: 'create',
      databaseId: expr('{{ "86b8a07f78e4461ba488ed075613b696" }}'),
      title: expr("{{ $('Risk Classifier').item.json.workflow_name }}: {{ $('Risk Classifier').item.json.highest_severity }} ({{ $('Risk Classifier').item.json.decision }})"),
      propertiesUi: {
        propertyValues: [
          { key: 'Finding ID', value: expr('MCP-GOV-{{ $now.toFormat("yyyyMMdd-HHmmss") }}') },
          { key: 'Workflow Name', value: expr("{{ $('Risk Classifier').item.json.workflow_name }}") },
          { key: 'Risk Classification', value: expr("{{ $('Risk Classifier').item.json.risk_level }}") },
          { key: 'Severity', value: expr("{{ $('Risk Classifier').item.json.highest_severity }}") },
          { key: 'Decision', value: expr("{{ $('Risk Classifier').item.json.decision === \"auto_approve\" ? \"Approved Risk\" : $('Risk Classifier').item.json.decision === \"auto_deny\" ? \"Rejected\" : \"Pending Review\" }}") },
          { key: 'Status', value: 'Not started' },
          { key: 'Evidence Summary', value: expr("{{ $('Risk Classifier').item.json.decision_reason }} | Submitted by: {{ $('Risk Classifier').item.json.submitted_by }} ({{ $('Risk Classifier').item.json.team }}) | Findings: {{ $('Risk Classifier').item.json.finding_count }}") },
          { key: 'Reviewer', value: expr("{{ $('Risk Classifier').item.json.submitted_by }}") },
          { key: 'OWASP LLM Mapping', value: expr("{{ $('Risk Classifier').item.json.findings.flatMap(f => f.framework_mappings.owasp || []).filter((v, i, a) => a.indexOf(v) === i).join(\", \") }}") },
          { key: 'CSA AI Mapping', value: expr("{{ $('Risk Classifier').item.json.findings.flatMap(f => f.framework_mappings.csa_ai || []).filter((v, i, a) => a.indexOf(v) === i).join(\", \") }}") },
          { key: 'MAESTRO Mapping', value: expr("{{ $('Risk Classifier').item.json.findings.flatMap(f => f.framework_mappings.maestro || []).filter((v, i, a) => a.indexOf(v) === i).join(\", \") }}") }
        ]
      }
    },
    credentials: { notionApi: newCredential('Notion') },
    position: [2220, 400]
  },
  output: [{ id: 'notion-evidence-page-001', url: 'https://notion.so/366ae242418680ceb66ceff42b357d4a' }]
});

const finalEvidenceSummary = node({
  type: 'n8n-nodes-base.set',
  version: 3,
  config: {
    name: 'Final Evidence Summary',
    parameters: {
      mode: 'manual',
      assignments: { assignments: [
        { id: 'e-001', name: 'governance_run', value: 'complete', type: 'string' },
        { id: 'e-002', name: 'platform_version', value: 'v1', type: 'string' },
        { id: 'e-003', name: 'workflow_name', value: expr("{{ $('Risk Classifier').item.json.workflow_name }}"), type: 'string' },
        { id: 'e-004', name: 'decision', value: expr("{{ $('Risk Classifier').item.json.decision }}"), type: 'string' },
        { id: 'e-005', name: 'risk_level', value: expr("{{ $('Risk Classifier').item.json.risk_level }}"), type: 'string' },
        { id: 'e-006', name: 'finding_count', value: expr("{{ $('Risk Classifier').item.json.finding_count }}"), type: 'number' },
        { id: 'e-007', name: 'notion_evidence_url', value: expr('{{ $json.url }}'), type: 'string' },
        { id: 'e-008', name: 'completed_at', value: expr('{{ $now.toISO() }}'), type: 'string' }
      ] }
    },
    position: [2440, 400]
  },
  output: [{ governance_run: 'complete', platform_version: 'v1' }]
});

export default workflow('W5dJjUnwbSruXHH3', 'MCP Access Governance Platform v1')
  .add(webhookTrigger)
  .to(parseSubmission)
  .to(fetchNotionInventory)
  .to(securityLinter)
  .to(riskClassifier)
  .to(routeByDecision
    .onCase(0, notifyApproved.to(mergeDecisionPaths.input(0)))
    .onCase(1, createAsanaTask.to(notifyPending).to(mergeDecisionPaths.input(1)))
    .onCase(2, notifyDenied.to(mergeDecisionPaths.input(2)))
  )
  .add(mergeDecisionPaths)
  .to(writeNotionEvidence)
  .to(finalEvidenceSummary);
