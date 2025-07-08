import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import * as fs from 'fs';
import * as path from 'path';
import {
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { CertLoaderOptions } from './interfaces/cert-loader-options.interface';
import { CertRole } from './enums/cert-role.enum';

@Injectable()
export class CertLoader {
  private readonly client: SecretsManagerClient;
  private readonly options: Required<CertLoaderOptions>;

  constructor(
    private readonly logger: LoggerService,
    options: CertLoaderOptions,
  ) {
    const region = options.region ?? process.env.AWS_REGION ?? 'us-east-1';
    const certDir = options.certDir ?? '/tmp/certs';
    const envRole = (process.env.CERT_ROLE as CertRole) ?? CertRole.CLIENT;
    const role = options.role ?? envRole;

    this.options = {
      ...options,
      region,
      certDir,
      role,
    };

    this.client = new SecretsManagerClient({ region });

    this.logger.log(
      `CertLoader initialized with role=${role}, region=${region}, dir=${certDir}`,
      'CertLoader',
    );
  }

  async load(): Promise<void> {
    const { certDir, secrets, role } = this.options;

    fs.mkdirSync(certDir, { recursive: true });

    const filesToLoad: Record<string, string> = {
      'ca-cert.pem': secrets.caCert,
    };

    if (role === CertRole.CLIENT || role === CertRole.BOTH) {
      filesToLoad['client-cert.pem'] = secrets.clientCert!;
      filesToLoad['client-key.pem'] = secrets.clientKey!;
    }

    if (role === CertRole.SERVER || role === CertRole.BOTH) {
      filesToLoad['server-cert.pem'] = secrets.serverCert!;
      filesToLoad['server-key.pem'] = secrets.serverKey!;
    }

    for (const [filename, secretName] of Object.entries(filesToLoad)) {
      if (!secretName) continue;

      const command = new GetSecretValueCommand({ SecretId: secretName });
      const { SecretString } = await this.client.send(command);

      if (!SecretString) {
        this.logger.error(`Secret ${secretName} is empty`, 'CertLoader');
        throw new Error(`Secret ${secretName} is empty`);
      }

      const fullPath = path.join(certDir, filename);
      fs.writeFileSync(fullPath, SecretString);
      this.logger.log(`Secret ${secretName} loaded into ${fullPath}`, 'CertLoader');
    }

    this.logger.log(`All secrets loaded into ${certDir}`, 'CertLoader');
  }
}
