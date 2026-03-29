import { Env, EnvConfig } from '../app/models';

export const environment: EnvConfig = {
  production: false,
  apiUrl: '/api',
  env: Env.DEV,
  gaMeasurementId: '',
};
