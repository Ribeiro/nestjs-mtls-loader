import { CertLoader, CertRole } from 'nestjs-mtls-loader';
import { getAxiosClient } from './mtls-http-client';

async function bootstrap() {
  const loader = new CertLoader(console, {
    role: CertRole.CLIENT,
    secrets: {
      caCert: process.env.CA_CERT_SECRET_NAME || 'ca-cert',
      clientCert: process.env.CLIENT_CERT_SECRET_NAME || 'client-cert',
      clientKey: process.env.CLIENT_KEY_SECRET_NAME || 'client-key',
    },
  });

  await loader.load();

  const client = getAxiosClient('https://service-b.local');

  try {
    const response = await client.get('/api/ping');
    console.log('Resposta:', response.data);
  } catch (err) {
    if (err instanceof Error) {
      console.error('Erro ao chamar service-b:', err.message);
    } else {
      console.error('Erro desconhecido ao chamar service-b:', err);
    }
  }
}

bootstrap();
