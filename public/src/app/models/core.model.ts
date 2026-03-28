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