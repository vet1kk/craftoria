import { Env, EnvConfig } from '../app/models';

export const environment: EnvConfig = {
  production: true,
  apiUrl: '/api',
  env: Env.PROD,
  gaMeasurementId: '',
};
