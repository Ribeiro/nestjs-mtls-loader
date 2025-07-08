import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CertLoader, CertRole } from 'nestjs-mtls-loader';

async function bootstrap() {
  const loader = new CertLoader(console, {
    role: CertRole.SERVER,
    secrets: {
      caCert: process.env.CA_CERT_SECRET_NAME || 'ca-cert',
      serverCert: process.env.SERVER_CERT_SECRET_NAME || 'server-cert',
      serverKey: process.env.SERVER_KEY_SECRET_NAME || 'server-key',
    },
  });

  await loader.load();

  const httpsOptions = {
    key: fs.readFileSync('/tmp/certs/server-key.pem'),
    cert: fs.readFileSync('/tmp/certs/server-cert.pem'),
    ca: fs.readFileSync('/tmp/certs/ca-cert.pem'),
    requestCert: true,
    rejectUnauthorized: true,
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  await app.listen(443);
}
bootstrap();
