import * as https from 'https';
import * as fs from 'fs';

let agent: https.Agent;

export function getMtlsAgent(): https.Agent {
  if (!agent) {
    agent = new https.Agent({
      cert: fs.readFileSync('/tmp/certs/client-cert.pem'),
      key: fs.readFileSync('/tmp/certs/client-key.pem'),
      ca: fs.readFileSync('/tmp/certs/ca-cert.pem'),
      rejectUnauthorized: true,
    });
  }

  return agent;
}
