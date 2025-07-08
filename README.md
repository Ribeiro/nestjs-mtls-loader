# nestjs-mtls-loader

[![npm version](https://img.shields.io/npm/v/nestjs-mtls-loader)](https://www.npmjs.com/package/nestjs-mtls-loader)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Reusable mTLS certificate loader for NestJS applications using AWS Secrets Manager.

## ✨ Features

- 🔐 Securely loads TLS/mTLS certificates from AWS Secrets Manager
- ⚙️ Supports NestJS with Express or Fastify
- 🧩 Usable as a standalone class or injectable service
- 📦 Lightweight and production-ready

---

## 📦 Installation

```bash
npm install nestjs-mtls-loader
```

## 🔧 Usage

### Load certificates programmatically:

```typescript
import { CertLoader, CertRole } from 'nestjs-mtls-loader';

const loader = new CertLoader({
  region: 'us-east-1',
  role: CertRole.BOTH,
  secrets: {
    caCert: 'ca-cert',
    clientCert: 'client-cert',
    clientKey: 'client-key',
    serverCert: 'server-cert',
    serverKey: 'server-key',
  },
});

await loader.load();
```

### Use as a NestJS module:

```typescript
import { CertLoaderModule } from 'nestjs-mtls-loader';

@Module({
  imports: [
    CertLoaderModule.register({
      region: 'us-east-1',
      role: 'server',
      secrets: {
        caCert: 'ca-cert',
        serverCert: 'server-cert',
        serverKey: 'server-key',
      },
    }),
  ],
})
export class AppModule {}
```

## 📁 Output

- Secrets are saved in /tmp/certs by default:

```bash
/tmp/certs/
├── ca-cert.pem
├── client-cert.pem
├── client-key.pem
├── server-cert.pem
└── server-key.pem
```
* You can override the output path via the certDir option.

## 🔐 Environment variables (optional fallback)

* AWS_REGION
* CERT_ROLE

## 📑 Options

```typescript
export interface CertLoaderOptions {
  region?: string;
  certDir?: string;
  role?: CertRole;
  secrets: {
    caCert: string;
    clientCert?: string;
    clientKey?: string;
    serverCert?: string;
    serverKey?: string;
  };
}
```

## ✅ Supported roles

```typescript
export enum CertRole {
  SERVER = 'server',
  CLIENT = 'client',
  BOTH = 'both',
}
```




