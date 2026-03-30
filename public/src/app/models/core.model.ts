export interface EnvConfig {
  production: boolean,
  apiUrl: string,
  env: Env,
  gaMeasurementId: string
}

export enum Env {
  PROD = 'prod',
  DEV = 'dev',
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
