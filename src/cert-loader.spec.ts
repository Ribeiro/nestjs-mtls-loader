import 'reflect-metadata';

const mockMkdirSync = jest.fn();
const mockWriteFileSync = jest.fn();

jest.doMock('fs', () => ({
  ...jest.requireActual('fs'),
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync,
}));

import { CertLoader } from '../src/cert-loader.service';
import { CertRole } from '../src/enums/cert-role.enum';
import * as path from 'path';
import { LoggerService } from '@nestjs/common';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

jest.mock('@aws-sdk/client-secrets-manager');

describe('CertLoader', () => {
  const mockLogger: LoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockSend = jest.fn();
  (SecretsManagerClient as any).mockImplementation(() => ({
    send: mockSend,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    mockMkdirSync.mockImplementation(() => undefined);
    mockWriteFileSync.mockImplementation(() => undefined);
  });

  it('should load only CA cert for role=client if others are undefined', async () => {
    mockSend.mockResolvedValue({ SecretString: 'ca-content' });

    const loader = new CertLoader(mockLogger, {
      role: CertRole.CLIENT,
      secrets: { caCert: 'ca-cert' },
    });

    await loader.load();

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      path.join('/tmp/certs', 'ca-cert.pem'),
      'ca-content',
    );
  });

  it('should load all certs for role=both', async () => {
    mockSend.mockResolvedValue({ SecretString: 'cert-content' });

    const loader = new CertLoader(mockLogger, {
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

    expect(mockSend).toHaveBeenCalledTimes(5);
    expect(mockWriteFileSync).toHaveBeenCalledTimes(5);
  });

  it('should throw error if secret value is empty', async () => {
    mockSend.mockResolvedValue({ SecretString: '' });

    const loader = new CertLoader(mockLogger, {
      role: CertRole.CLIENT,
      secrets: { caCert: 'ca-cert' },
    });

    await expect(loader.load()).rejects.toThrow('Secret ca-cert is empty');
    expect(mockLogger.error).toHaveBeenCalledWith('Secret ca-cert is empty', 'CertLoader');
  });

  it('should skip files with missing secret name', async () => {
    mockSend.mockResolvedValue({ SecretString: 'ca-content' });

    const loader = new CertLoader(mockLogger, {
      role: CertRole.CLIENT,
      secrets: {
        caCert: 'ca-cert',
        clientCert: undefined,
        clientKey: undefined,
      },
    });

    await loader.load();

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
  });
});