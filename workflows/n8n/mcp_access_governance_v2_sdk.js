import { workflow, node, trigger, switchCase, merge, languageModel, newCredential, expr } from '@n8n/workflow-sdk';

// =============================================================================
// MCP Access Governance Platform v2
//
// Architecture overview:
//   1. Webhook trigger — simulates any ITSM intake channel (ServiceNow, Asana, etc.)
//   2. MOCK: Sample MCP Request — injects fictional DataVault Inc. request data,
//      clearly labelled as demo/mock for portfolio demonstration purposes
//   3. Fetch Notion MCP Inventory — retrieves governance context from Notion workspace
//   4. Pre-Approval Check — checks endpoint against allowlist / denylist
//   5. Route: Pre-Approval Status — 3-way switch: pre_approved / pre_denied / new
//      a. Pre-Approved → fast-track approval, skip full review
//      b. Pre-Denied → automatic rejection, skip full review
//      c. New → full security review pipeline:
//         i.   Security Linter (9 rules: MCP-N8N-001 through MCP-N8N-009)
//         ii.  Risk Classifier (Low / Medium / High / Prohibited)
//         iii. AI Security Research Agent (GPT-4o, informational only)
//         iv.  Compile Review Package (linter + AI findings for ticket)
//         v.   Create Security Review Ticket (Asana)
//         vi.  Wait: Human Security Review (webhook resume)
//         vii. Parse Human Decision (approved / denied)
//   6. Merge Decision Paths — converges all 3 paths
//   7. Write Notion Evidence Log — creates audit record in Notion database
//   8. MOCK: Notify Requester — simulates ITSM ticket update / email notification
//   9. Final Evidence Summary — produces structured audit output
//
// Human approval endpoint (embedded in Asana ticket):
//   POST https://mwalker.app.n8n.cloud/webhook-waiting/{{ $execution.id }}
//   Body: {"decision":"approved"} or {"decision":"denied"}
//
// Credentials required:
//   - notionApi (Notion API key)
//   - openAiApi (OpenAI API key, gpt-4o)
//   - asanaApi (Asana Personal Access Token)
//
// Notion workspace:
//   - MCP Server Inventory page: 366ae242418681729400da90083fc856
//   - PoC Evidence Log database:  86b8a07f78e4461ba488ed075613b696
//
// Linter rules (MCP-N8N-001–009):
//   001 CRITICAL  HTTPS enforcement
//   002 HIGH      Credential reference present
//   003 MEDIUM    External endpoint (internet-facing)
//   004 HIGH      Write/delete/execute capability
//   005 MEDIUM    Workflow owner unset
//   006 MEDIUM    Risk classification not declared
//   007 CRITICAL  Secret pattern in endpoint URL
//   008 LOW       Business justification too brief
//   009 LOW       Endpoint path not matching MCP SSE pattern
//
// Framework mappings per rule: CSA AI, MAESTRO, OWASP LLM Top 10 2025
// =============================================================================

const notionCred = newCredential('Notion API', 'notionApi');
const openAiCred = newCredential('OpenAI API', 'openAiApi');
const asanaCred = newCredential('Asana Personal Access Token', 'asanaApi');

const webhookTrigger = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2,
  config: {
    name: 'MCP Addition Request Received',
    parameters: {
      httpMethod: 'POST',
      path: 'mcp-governance-intake',
      responseMode: 'lastNode',
      responseData: 'allEntries',
    },
    position: [240, 300],
  },
  output: [{ body: {} }],
});

const mockData = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'MOCK: Sample MCP Request',
    parameters: {
      mode: 'manual',
      duplicateItem: false,
      assignments: {
        assignments: [
          { id: '1', name: 'service_name', value: 'DataVault MCP Server', type: 'string' },
          { id: '2', name: 'service_vendor', value: 'DataVault Inc.', type: 'string' },
          { id: '3', name: 'mcp_endpoint', value: 'https://mcp.datavault.io/sse', type: 'string' },
          { id: '4', name: 'tool_capabilities', value: expr('{{ ["read", "write"] }}'), type: 'array' },
          { id: '5', name: 'has_credential_reference', value: true, type: 'boolean' },
          { id: '6', name: 'workflow_owner', value: '', type: 'string' },
          { id: '7', name: 'risk_classification', value: '', type: 'string' },
          { id: '8', name: 'submitted_by', value: 'jordan.lee', type: 'string' },
          { id: '9', name: 'team', value: 'Data Platform', type: 'string' },
          { id: '10', name: 'business_justification', value: 'Enable AI agents to read and write analytics data via DataVault MCP integration for the new data pipeline project.', type: 'string' },
          { id: '11', name: 'vendor_privacy_url', value: 'https://datavault.io/privacy', type: 'string' },
          { id: '12', name: 'vendor_github', value: 'https://github.com/datavault-io/mcp-server', type: 'string' },
          { id: '13', name: 'intake_channel', value: 'ITSM (ServiceNow) — DEMO MOCK', type: 'string' },
          { id: '14', name: 'request_id', value: expr('{{ "GOVREQ-" + $now.toFormat("yyyyMMdd") + "-001" }}'), type: 'string' },
        ],
      },
    },
    position: [460, 300],
  },
  output: [{
    service_name: 'DataVault MCP Server',
    service_vendor: 'DataVault Inc.',
    mcp_endpoint: 'https://mcp.datavault.io/sse',
    tool_capabilities: ['read', 'write'],
    has_credential_reference: true,
    workflow_owner: '',
    risk_classification: '',
    submitted_by: 'jordan.lee',
    team: 'Data Platform',
    business_justification: 'Enable AI agents to read and write analytics data...',
    vendor_privacy_url: 'https://datavault.io/privacy',
    vendor_github: 'https://github.com/datavault-io/mcp-server',
    intake_channel: 'ITSM (ServiceNow) — DEMO MOCK',
    request_id: 'GOVREQ-20240101-001',
  }],
});

const fetchNotionInventory = node({
  type: 'n8n-nodes-base.notion',
  version: 2.2,
  config: {
    name: 'Fetch Notion MCP Inventory',
    parameters: {
      resource: 'page',
      operation: 'get',
      pageId: expr('{{ "366ae242418681729400da90083fc856" }}'),
    },
    credentials: { notionApi: notionCred },
    position: [680, 300],
  },
  output: [{ id: '366ae242418681729400da90083fc856' }],
});

const preApprovalCheck = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Pre-Approval Check',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `const d = $('MOCK: Sample MCP Request').item.json;
const endpoint = (d.mcp_endpoint || '').toLowerCase();
const preApprovedDomains = ['notion.so','asana.com','github.com','atlassian.net','microsoft.com','googleapis.com'];
const preDeniedPatterns = ['ngrok','0.0.0.0','tunnel.','localhost','127.0.0.1','pastebin','requestbin','beeceptor'];
let status = 'new';
for (const domain of preApprovedDomains) { if (endpoint.includes(domain)) { status = 'pre_approved'; break; } }
if (status === 'new') { for (const pat of preDeniedPatterns) { if (endpoint.includes(pat)) { status = 'pre_denied'; break; } } }
return [{ json: { ...d, pre_approval_status: status, checked_at: new Date().toISOString() } }];`,
    },
    position: [900, 300],
  },
  output: [{
    service_name: 'DataVault MCP Server',
    service_vendor: 'DataVault Inc.',
    mcp_endpoint: 'https://mcp.datavault.io/sse',
    tool_capabilities: ['read', 'write'],
    has_credential_reference: true,
    workflow_owner: '',
    risk_classification: '',
    submitted_by: 'jordan.lee',
    team: 'Data Platform',
    business_justification: 'Enable AI agents to read and write analytics data...',
    vendor_privacy_url: 'https://datavault.io/privacy',
    vendor_github: 'https://github.com/datavault-io/mcp-server',
    intake_channel: 'ITSM (ServiceNow) — DEMO MOCK',
    request_id: 'GOVREQ-20240101-001',
    pre_approval_status: 'new',
    checked_at: '2024-01-01T00:00:00.000Z',
  }],
});

const routePreApproval = switchCase({
  version: 3.2,
  config: {
    name: 'Route: Pre-Approval Status',
    parameters: {
      mode: 'rules',
      dataType: 'string',
      value1: expr('{{ $json.pre_approval_status }}'),
      rules: {
        values: [
          {
            conditions: {
              options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
              conditions: [{ leftValue: expr('{{ $json.pre_approval_status }}'), rightValue: 'pre_approved', operator: { type: 'string', operation: 'equals' } }],
              combinator: 'and',
            },
            renameOutput: true,
            outputKey: 'pre_approved',
          },
          {
            conditions: {
              options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
              conditions: [{ leftValue: expr('{{ $json.pre_approval_status }}'), rightValue: 'pre_denied', operator: { type: 'string', operation: 'equals' } }],
              combinator: 'and',
            },
            renameOutput: true,
            outputKey: 'pre_denied',
          },
          {
            conditions: {
              options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
              conditions: [{ leftValue: expr('{{ $json.pre_approval_status }}'), rightValue: 'new', operator: { type: 'string', operation: 'equals' } }],
              combinator: 'and',
            },
            renameOutput: true,
            outputKey: 'new',
          },
        ],
      },
      fallbackOutput: 'extra',
    },
    position: [1120, 300],
  },
});

const mergeDecisionPaths = merge({
  version: 3.2,
  config: {
    name: 'Merge Decision Paths',
    parameters: { mode: 'append', numberInputs: 3 },
    position: [2200, 300],
  },
});

const setPreApproved = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Set: Pre-Approved Outcome',
    parameters: {
      mode: 'manual',
      duplicateItem: false,
      assignments: {
        assignments: [
          { id: '1', name: 'final_decision', value: 'approved', type: 'string' },
          { id: '2', name: 'decision_reason', value: 'Vendor domain is on the pre-approved list. No further review required.', type: 'string' },
          { id: '3', name: 'risk_level', value: 'Low', type: 'string' },
          { id: '4', name: 'review_path', value: 'pre_approved', type: 'string' },
          { id: '5', name: 'service_name', value: expr('{{ $json.service_name }}'), type: 'string' },
          { id: '6', name: 'service_vendor', value: expr('{{ $json.service_vendor }}'), type: 'string' },
          { id: '7', name: 'request_id', value: expr('{{ $json.request_id }}'), type: 'string' },
          { id: '8', name: 'submitted_by', value: expr('{{ $json.submitted_by }}'), type: 'string' },
          { id: '9', name: 'intake_channel', value: expr('{{ $json.intake_channel }}'), type: 'string' },
          { id: '10', name: 'mcp_endpoint', value: expr('{{ $json.mcp_endpoint }}'), type: 'string' },
        ],
      },
    },
    position: [1340, 100],
  },
  output: [{
    final_decision: 'approved',
    decision_reason: 'Vendor domain is on the pre-approved list.',
    risk_level: 'Low',
    review_path: 'pre_approved',
    service_name: 'DataVault MCP Server',
    service_vendor: 'DataVault Inc.',
    request_id: 'GOVREQ-20240101-001',
    submitted_by: 'jordan.lee',
    intake_channel: 'ITSM (ServiceNow) — DEMO MOCK',
    mcp_endpoint: 'https://mcp.datavault.io/sse',
  }],
});

const setPreDenied = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Set: Pre-Denied Outcome',
    parameters: {
      mode: 'manual',
      duplicateItem: false,
      assignments: {
        assignments: [
          { id: '1', name: 'final_decision', value: 'denied', type: 'string' },
          { id: '2', name: 'decision_reason', value: 'Endpoint matches a pre-denied pattern. Request automatically rejected.', type: 'string' },
          { id: '3', name: 'risk_level', value: 'Prohibited', type: 'string' },
          { id: '4', name: 'review_path', value: 'pre_denied', type: 'string' },
          { id: '5', name: 'service_name', value: expr('{{ $json.service_name }}'), type: 'string' },
          { id: '6', name: 'service_vendor', value: expr('{{ $json.service_vendor }}'), type: 'string' },
          { id: '7', name: 'request_id', value: expr('{{ $json.request_id }}'), type: 'string' },
          { id: '8', name: 'submitted_by', value: expr('{{ $json.submitted_by }}'), type: 'string' },
          { id: '9', name: 'intake_channel', value: expr('{{ $json.intake_channel }}'), type: 'string' },
          { id: '10', name: 'mcp_endpoint', value: expr('{{ $json.mcp_endpoint }}'), type: 'string' },
        ],
      },
    },
    position: [1340, 300],
  },
  output: [{
    final_decision: 'denied',
    decision_reason: 'Endpoint matches a pre-denied pattern.',
    risk_level: 'Prohibited',
    review_path: 'pre_denied',
    service_name: 'DataVault MCP Server',
    service_vendor: 'DataVault Inc.',
    request_id: 'GOVREQ-20240101-001',
    submitted_by: 'jordan.lee',
    intake_channel: 'ITSM (ServiceNow) — DEMO MOCK',
    mcp_endpoint: 'https://mcp.datavault.io/sse',
  }],
});

const securityLinter = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Security Linter — 9 Rules',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `const d = $('MOCK: Sample MCP Request').item.json;
const findings = [];
const endpoint = (d.mcp_endpoint || '').toLowerCase();
const caps = Array.isArray(d.tool_capabilities) ? d.tool_capabilities.map(c => c.toLowerCase()) : [];
const isExternal = !endpoint.includes('localhost') && !endpoint.includes('127.0.0.1');
const isWriteCapable = caps.some(c => ['write','delete','execute'].includes(c));
const secretPatterns = [/api[-_]?key/i,/password/i,/secret/i,/token/i,/credential/i];

if (!endpoint.startsWith('https://')) findings.push({ rule_id:'MCP-N8N-001', severity:'CRITICAL', title:'MCP endpoint does not use HTTPS', node_ref:'mcp_endpoint', human_review_required:true, framework_mappings:{ csa_ai:'CCM-06', maestro:'L2-NET', owasp:'LLM06' } });
if (!d.has_credential_reference) findings.push({ rule_id:'MCP-N8N-002', severity:'HIGH', title:'No credential reference on MCP node', node_ref:'has_credential_reference', human_review_required:true, framework_mappings:{ csa_ai:'IAM-01', maestro:'L3-AUTHZ', owasp:'LLM08' } });
if (isExternal) findings.push({ rule_id:'MCP-N8N-003', severity:'MEDIUM', title:'MCP endpoint is external (internet-facing)', node_ref:'mcp_endpoint', human_review_required:true, framework_mappings:{ csa_ai:'CCM-08', maestro:'L2-NET', owasp:'LLM02' } });
if (isWriteCapable) findings.push({ rule_id:'MCP-N8N-004', severity:'HIGH', title:'MCP tool exposes write/delete/execute capability', node_ref:'tool_capabilities', human_review_required:true, framework_mappings:{ csa_ai:'DSP-07', maestro:'L4-APP', owasp:'LLM01' } });
if (!d.workflow_owner || d.workflow_owner.trim() === '') findings.push({ rule_id:'MCP-N8N-005', severity:'MEDIUM', title:'Workflow owner is unset', node_ref:'workflow_owner', human_review_required:false, framework_mappings:{ csa_ai:'GRC-04', maestro:'L6-GOV', owasp:'LLM09' } });
if (!d.risk_classification || d.risk_classification.trim() === '') findings.push({ rule_id:'MCP-N8N-006', severity:'MEDIUM', title:'Risk classification not declared by requestor', node_ref:'risk_classification', human_review_required:false, framework_mappings:{ csa_ai:'GRC-02', maestro:'L6-GOV', owasp:'LLM09' } });
for (const pat of secretPatterns) { if (pat.test(d.mcp_endpoint || '')) { findings.push({ rule_id:'MCP-N8N-007', severity:'CRITICAL', title:'Potential secret embedded in MCP endpoint URL', node_ref:'mcp_endpoint', human_review_required:true, framework_mappings:{ csa_ai:'EKM-01', maestro:'L3-AUTHZ', owasp:'LLM08' } }); break; } }
if (!d.business_justification || d.business_justification.trim().length < 20) findings.push({ rule_id:'MCP-N8N-008', severity:'LOW', title:'Business justification is missing or too brief', node_ref:'business_justification', human_review_required:false, framework_mappings:{ csa_ai:'GRC-01', maestro:'L6-GOV', owasp:'LLM09' } });
if (!endpoint.includes('/sse') && !endpoint.includes('/mcp') && !endpoint.includes('/stream')) findings.push({ rule_id:'MCP-N8N-009', severity:'LOW', title:'Endpoint path does not match expected MCP SSE pattern', node_ref:'mcp_endpoint', human_review_required:false, framework_mappings:{ csa_ai:'CCM-09', maestro:'L2-NET', owasp:'LLM02' } });
return [{ json: { ...d, linter_findings: findings, linter_finding_count: findings.length, linted_at: new Date().toISOString() } }];`,
    },
    position: [1340, 500],
  },
  output: [{
    service_name: 'DataVault MCP Server',
    service_vendor: 'DataVault Inc.',
    mcp_endpoint: 'https://mcp.datavault.io/sse',
    tool_capabilities: ['read', 'write'],
    has_credential_reference: true,
    workflow_owner: '',
    risk_classification: '',
    submitted_by: 'jordan.lee',
    team: 'Data Platform',
    business_justification: 'Enable AI agents...',
    vendor_privacy_url: 'https://datavault.io/privacy',
    vendor_github: 'https://github.com/datavault-io/mcp-server',
    intake_channel: 'ITSM (ServiceNow) — DEMO MOCK',
    request_id: 'GOVREQ-20240101-001',
    pre_approval_status: 'new',
    linter_findings: [],
    linter_finding_count: 0,
    linted_at: '2024-01-01T00:00:00.000Z',
  }],
});

const riskClassifier = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Risk Classifier',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `const d = $json;
const findings = d.linter_findings || [];
const hasCritical = findings.some(f => f.severity === 'CRITICAL');
const hasHigh = findings.some(f => f.severity === 'HIGH');
const hasMedium = findings.some(f => f.severity === 'MEDIUM');
let risk_level, preliminary_decision;
if (hasCritical) { risk_level = 'Prohibited'; preliminary_decision = 'auto_deny'; }
else if (hasHigh) { risk_level = 'High'; preliminary_decision = 'human_review'; }
else if (hasMedium) { risk_level = 'Medium'; preliminary_decision = 'human_review'; }
else { risk_level = 'Low'; preliminary_decision = 'auto_approve'; }
return [{ json: { ...d, risk_level, preliminary_decision, classified_at: new Date().toISOString() } }];`,
    },
    position: [1560, 500],
  },
  output: [{
    service_name: 'DataVault MCP Server',
    service_vendor: 'DataVault Inc.',
    mcp_endpoint: 'https://mcp.datavault.io/sse',
    tool_capabilities: ['read', 'write'],
    has_credential_reference: true,
    workflow_owner: '',
    risk_classification: '',
    submitted_by: 'jordan.lee',
    team: 'Data Platform',
    business_justification: 'Enable AI agents...',
    vendor_privacy_url: 'https://datavault.io/privacy',
    vendor_github: 'https://github.com/datavault-io/mcp-server',
    intake_channel: 'ITSM (ServiceNow) — DEMO MOCK',
    request_id: 'GOVREQ-20240101-001',
    pre_approval_status: 'new',
    linter_findings: [],
    linter_finding_count: 0,
    linted_at: '2024-01-01T00:00:00.000Z',
    risk_level: 'High',
    preliminary_decision: 'human_review',
    classified_at: '2024-01-01T00:00:00.000Z',
  }],
});

const openAiModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
  version: 1.3,
  config: {
    name: 'OpenAI Research Model',
    parameters: { model: expr('{{ "gpt-4o" }}') },
    credentials: { openAiApi: openAiCred },
    position: [1780, 700],
  },
});

const aiResearchAgent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 1.7,
  config: {
    name: 'AI Security Research Agent',
    parameters: {
      agent: 'conversationalAgent',
      promptType: 'define',
      text: expr('{{ "You are a security research agent assisting a governance team reviewing an MCP server addition request. Do NOT make final approval decisions — surface evidence for the human reviewer only.\\n\\nRequest details:\\n" + JSON.stringify($(\\"Risk Classifier\\").item.json, null, 2) + "\\n\\nResearch and report on:\\n1. Vendor reputation and public security posture\\n2. Privacy policy assessment (URL: " + $(\\"Risk Classifier\\").item.json.vendor_privacy_url + ")\\n3. Known CVEs or public vulnerability disclosures\\n4. GitHub repository code quality and security signals (URL: " + $(\\"Risk Classifier\\").item.json.vendor_github + ")\\n5. MCP-specific risks: tool poisoning, data exfiltration, prompt injection\\n6. Compliance alignment: GDPR, SOC 2, ISO 27001\\n7. Overall risk signal (informational only)" }}'),
      systemMessage: 'You are an enterprise security research agent. Provide structured, evidence-based findings. The final approve/deny decision belongs to the human security reviewer — not you.',
      hasOutputParser: false,
    },
    subnodes: { model: openAiModel },
    position: [1780, 500],
  },
  output: [{ output: 'AI security research findings for DataVault Inc...' }],
});

const compileReviewPackage = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Compile Review Package',
    parameters: {
      mode: 'manual',
      duplicateItem: false,
      assignments: {
        assignments: [
          { id: '1', name: 'service_name', value: expr('{{ $("Risk Classifier").item.json.service_name }}'), type: 'string' },
          { id: '2', name: 'service_vendor', value: expr('{{ $("Risk Classifier").item.json.service_vendor }}'), type: 'string' },
          { id: '3', name: 'request_id', value: expr('{{ $("Risk Classifier").item.json.request_id }}'), type: 'string' },
          { id: '4', name: 'submitted_by', value: expr('{{ $("Risk Classifier").item.json.submitted_by }}'), type: 'string' },
          { id: '5', name: 'mcp_endpoint', value: expr('{{ $("Risk Classifier").item.json.mcp_endpoint }}'), type: 'string' },
          { id: '6', name: 'risk_level', value: expr('{{ $("Risk Classifier").item.json.risk_level }}'), type: 'string' },
          { id: '7', name: 'preliminary_decision', value: expr('{{ $("Risk Classifier").item.json.preliminary_decision }}'), type: 'string' },
          { id: '8', name: 'linter_findings', value: expr('{{ $("Risk Classifier").item.json.linter_findings }}'), type: 'array' },
          { id: '9', name: 'linter_finding_count', value: expr('{{ $("Risk Classifier").item.json.linter_finding_count }}'), type: 'number' },
          { id: '10', name: 'ai_security_report', value: expr('{{ $json.output }}'), type: 'string' },
          { id: '11', name: 'business_justification', value: expr('{{ $("Risk Classifier").item.json.business_justification }}'), type: 'string' },
          { id: '12', name: 'intake_channel', value: expr('{{ $("Risk Classifier").item.json.intake_channel }}'), type: 'string' },
          { id: '13', name: 'review_path', value: 'human_review', type: 'string' },
          { id: '14', name: 'vendor_privacy_url', value: expr('{{ $("Risk Classifier").item.json.vendor_privacy_url }}'), type: 'string' },
          { id: '15', name: 'vendor_github', value: expr('{{ $("Risk Classifier").item.json.vendor_github }}'), type: 'string' },
        ],
      },
    },
    position: [2000, 500],
  },
  output: [{
    service_name: 'DataVault MCP Server',
    service_vendor: 'DataVault Inc.',
    request_id: 'GOVREQ-20240101-001',
    submitted_by: 'jordan.lee',
    mcp_endpoint: 'https://mcp.datavault.io/sse',
    risk_level: 'High',
    preliminary_decision: 'human_review',
    linter_findings: [],
    linter_finding_count: 0,
    ai_security_report: 'AI security research findings...',
    business_justification: 'Enable AI agents...',
    intake_channel: 'ITSM (ServiceNow) — DEMO MOCK',
    review_path: 'human_review',
    vendor_privacy_url: 'https://datavault.io/privacy',
    vendor_github: 'https://github.com/datavault-io/mcp-server',
  }],
});

const createAsanaTask = node({
  type: 'n8n-nodes-base.asana',
  version: 1,
  config: {
    name: 'Create Security Review Ticket',
    parameters: {
      operation: 'create',
      workspace: expr('{{ $("Risk Classifier").item.json.team || "your-asana-workspace-gid" }}'),
      name: expr('{{ "[GOVREQ] MCP Security Review: " + $("Compile Review Package").item.json.service_vendor + " — " + $("Compile Review Package").item.json.request_id }}'),
      additionalFields: {
        notes: expr('{{ "=== MCP GOVERNANCE REVIEW REQUEST ===\\n\\nRequest ID: " + $("Compile Review Package").item.json.request_id + "\\nVendor: " + $("Compile Review Package").item.json.service_vendor + "\\nEndpoint: " + $("Compile Review Package").item.json.mcp_endpoint + "\\nSubmitted By: " + $("Compile Review Package").item.json.submitted_by + "\\nRisk Level: " + $("Compile Review Package").item.json.risk_level + "\\n\\n--- LINTER FINDINGS (" + $("Compile Review Package").item.json.linter_finding_count + ") ---\\n" + JSON.stringify($("Compile Review Package").item.json.linter_findings, null, 2) + "\\n\\n--- AI SECURITY RESEARCH REPORT ---\\n" + $("Compile Review Package").item.json.ai_security_report + "\\n\\n=== ACTION REQUIRED ===\\nApprove: POST https://mwalker.app.n8n.cloud/webhook-waiting/" + $execution.id + "  body: {\\"decision\\":\\"approved\\"}\\nDeny:    POST https://mwalker.app.n8n.cloud/webhook-waiting/" + $execution.id + "  body: {\\"decision\\":\\"denied\\"}" }}'),
      },
    },
    credentials: { asanaApi: asanaCred },
    position: [2220, 500],
  },
  output: [{ gid: '1234567890', name: '[GOVREQ] MCP Security Review: DataVault Inc.' }],
});

const waitHumanReview = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: {
    name: 'Wait: Human Security Review',
    parameters: {
      resume: 'webhook',
    },
    position: [2440, 500],
  },
  output: [{ body: { decision: 'approved' } }],
});

const parseHumanDecision = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Human Decision',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: `const pkg = $('Compile Review Package').item.json;
const body = $json.body || {};
const query = $json.query || {};
const decision = (body.decision || query.decision || 'denied').toLowerCase();
const isApproved = decision === 'approved';
return [{
  json: {
    ...pkg,
    final_decision: isApproved ? 'approved' : 'denied',
    decision_reason: isApproved ? 'Human security reviewer approved the MCP integration.' : 'Human security reviewer denied the MCP integration.',
    decision_by: body.reviewer || query.reviewer || 'security-team',
    decided_at: new Date().toISOString(),
    review_path: 'human_review',
  }
}];`,
    },
    position: [2660, 500],
  },
  output: [{
    service_name: 'DataVault MCP Server',
    service_vendor: 'DataVault Inc.',
    request_id: 'GOVREQ-20240101-001',
    submitted_by: 'jordan.lee',
    mcp_endpoint: 'https://mcp.datavault.io/sse',
    risk_level: 'High',
    preliminary_decision: 'human_review',
    linter_findings: [],
    linter_finding_count: 0,
    ai_security_report: 'AI security research findings...',
    business_justification: 'Enable AI agents...',
    intake_channel: 'ITSM (ServiceNow) — DEMO MOCK',
    review_path: 'human_review',
    final_decision: 'approved',
    decision_reason: 'Human security reviewer approved the MCP integration.',
    decision_by: 'security-team',
    decided_at: '2024-01-01T00:00:00.000Z',
  }],
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
      title: expr('{{ $("Merge Decision Paths").item.json.service_vendor + " — " + $("Merge Decision Paths").item.json.request_id + " [" + ($("Merge Decision Paths").item.json.final_decision || "PENDING").toUpperCase() + "]" }}'),
      propertiesUi: {
        propertyValues: [
          { key: 'Request ID', type: 'rich_text', textContent: expr('{{ $("Merge Decision Paths").item.json.request_id }}') },
          { key: 'Vendor', type: 'rich_text', textContent: expr('{{ $("Merge Decision Paths").item.json.service_vendor }}') },
          { key: 'MCP Endpoint', type: 'url', urlValue: expr('{{ $("Merge Decision Paths").item.json.mcp_endpoint }}') },
          { key: 'Risk Level', type: 'select', selectValue: expr('{{ $("Merge Decision Paths").item.json.risk_level }}') },
          { key: 'Decision', type: 'select', selectValue: expr('{{ $("Merge Decision Paths").item.json.final_decision }}') },
          { key: 'Review Path', type: 'rich_text', textContent: expr('{{ $("Merge Decision Paths").item.json.review_path }}') },
          { key: 'Submitted By', type: 'rich_text', textContent: expr('{{ $("Merge Decision Paths").item.json.submitted_by }}') },
          { key: 'Intake Channel', type: 'rich_text', textContent: expr('{{ $("Merge Decision Paths").item.json.intake_channel || "ITSM (ServiceNow) — DEMO MOCK" }}') },
        ],
      },
    },
    credentials: { notionApi: notionCred },
    position: [2440, 300],
  },
  output: [{ id: 'notion-page-id', url: 'https://notion.so/evidence-entry' }],
});

const mockNotifyRequester = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'MOCK: Notify Requester',
    parameters: {
      mode: 'manual',
      duplicateItem: false,
      assignments: {
        assignments: [
          { id: '1', name: 'notification_channel', value: 'ITSM (ServiceNow) — DEMO MOCK', type: 'string' },
          { id: '2', name: 'notification_status', value: 'sent', type: 'string' },
          { id: '3', name: 'notification_subject', value: expr('{{ "MCP Governance Decision: " + ($("Merge Decision Paths").item.json.final_decision || "PENDING").toUpperCase() + " — " + $("Merge Decision Paths").item.json.service_vendor }}'), type: 'string' },
          { id: '4', name: 'notification_message', value: expr('{{ "Your MCP integration request for " + $("Merge Decision Paths").item.json.service_vendor + " has been " + $("Merge Decision Paths").item.json.final_decision + ". Risk level: " + $("Merge Decision Paths").item.json.risk_level + ". Review path: " + $("Merge Decision Paths").item.json.review_path }}'), type: 'string' },
          { id: '5', name: 'notified_at', value: expr('{{ $now.toISO() }}'), type: 'string' },
        ],
      },
    },
    position: [2660, 300],
  },
  output: [{ notification_status: 'sent', notification_channel: 'ITSM (ServiceNow) — DEMO MOCK' }],
});

const finalEvidenceSummary = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Final Evidence Summary',
    parameters: {
      mode: 'manual',
      duplicateItem: false,
      assignments: {
        assignments: [
          { id: '1', name: 'audit_complete', value: true, type: 'boolean' },
          { id: '2', name: 'request_id', value: expr('{{ $("Merge Decision Paths").item.json.request_id }}'), type: 'string' },
          { id: '3', name: 'service_vendor', value: expr('{{ $("Merge Decision Paths").item.json.service_vendor }}'), type: 'string' },
          { id: '4', name: 'final_decision', value: expr('{{ $("Merge Decision Paths").item.json.final_decision }}'), type: 'string' },
          { id: '5', name: 'risk_level', value: expr('{{ $("Merge Decision Paths").item.json.risk_level }}'), type: 'string' },
          { id: '6', name: 'review_path', value: expr('{{ $("Merge Decision Paths").item.json.review_path }}'), type: 'string' },
          { id: '7', name: 'decision_reason', value: expr('{{ $("Merge Decision Paths").item.json.decision_reason }}'), type: 'string' },
          { id: '8', name: 'notion_evidence_url', value: expr('{{ $("Write Notion Evidence Log").item.json.url }}'), type: 'string' },
          { id: '9', name: 'completed_at', value: expr('{{ $now.toISO() }}'), type: 'string' },
        ],
      },
    },
    position: [2880, 300],
  },
  output: [{ audit_complete: true }],
});

export default workflow('W5dJjUnwbSruXHH3', 'MCP Access Governance Platform v2')
  .add(webhookTrigger)
  .to(mockData)
  .to(fetchNotionInventory)
  .to(preApprovalCheck)
  .to(
    routePreApproval
      .onCase(0, setPreApproved.to(mergeDecisionPaths.input(0)))
      .onCase(1, setPreDenied.to(mergeDecisionPaths.input(1)))
      .onCase(2,
        securityLinter
          .to(riskClassifier)
          .to(aiResearchAgent)
          .to(compileReviewPackage)
          .to(createAsanaTask)
          .to(waitHumanReview)
          .to(parseHumanDecision)
          .to(mergeDecisionPaths.input(2))
      )
  )
  .add(mergeDecisionPaths)
  .to(writeNotionEvidence)
  .to(mockNotifyRequester)
  .to(finalEvidenceSummary);
