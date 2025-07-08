import { CertRole } from '../enums/cert-role.enum';

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
