import { createServer } from 'node:http';

const apiName = process.env.MOCK_API_NAME;

if (!apiName) {
  throw new Error('MOCK_API_NAME must be set.');
}

const responses = {
  'benefit-checker': {
    'GET /health': {
      status: 200,
      body: { status: 'ok', service: 'benefit-checker-orchestrator', mock: true },
    },
    'POST /v1/benefit-checks/assessments': {
      status: 201,
      body: {
        requestId: 'mvp-mock-request',
        provider: 'mock-benefit-checker',
        assessment: {
          assessmentId: '00000000-0000-4000-8000-000000000001',
          decision: 'REFER_FOR_REVIEW',
          matchedEntitlements: [],
          riskFlags: [],
          processedAt: '2026-01-01T00:00:00Z',
          decisionSummary: 'Synthetic MVP response; no assessment was performed.',
        },
        mock: true,
      },
    },
  },
  'file-transfer': {
    'GET /health': {
      status: 200,
      body: { status: 'ok', service: 'file-transfer-mock', mock: true },
    },
    'POST /transfer-tickets': {
      status: 200,
      body: {
        transferTicket: '00000000-0000-4000-8000-000000000002',
        clientId: 'mvp-mock-client',
        upload: {
          method: 'PUT',
          url: 'https://example.invalid/mock-upload',
          headers: {},
          expiresInSeconds: 60,
        },
        object: { bucket: 'mock-only', key: 'mock/example.csv' },
        mock: true,
      },
    },
  },
  ualpa: {
    'GET /health': {
      status: 200,
      body: { status: 'ok', service: 'ualpa-mock', mock: true },
    },
    'GET /v1/lpas': {
      status: 200,
      body: { items: [], mock: true },
    },
  },
  'manage-pom-cases': {
    'GET /health': {
      status: 200,
      body: { status: 'ok', service: 'manage-pom-cases-mock', mock: true },
    },
  },
};

const server = createServer((request, response) => {
  request.resume();
  response.setHeader('content-type', 'application/json');

  if (request.method === 'GET' && request.url === '/_health') {
    response.writeHead(200);
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  const apiResponses = responses[apiName];
  const result = apiResponses?.[`${request.method} ${request.url}`];

  if (!result) {
    response.writeHead(404);
    response.end(JSON.stringify({ error: 'No matching synthetic API operation.', mock: true }));
    return;
  }

  response.writeHead(result.status);
  response.end(JSON.stringify(result.body));
});

server.listen(8080, '0.0.0.0');
