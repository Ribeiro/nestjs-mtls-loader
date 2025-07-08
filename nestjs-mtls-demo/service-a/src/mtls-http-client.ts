import axios, { AxiosInstance } from 'axios';
import { getMtlsAgent } from './mtls-agent';

export function getAxiosClient(baseURL?: string): AxiosInstance {
  return axios.create({
    baseURL,
    httpsAgent: getMtlsAgent(),
  });
}
