import env from './env.js';

export const appConfig = {
  nodeEnv: env.nodeEnv,
  cors: {
    origin: env.corsOrigin,
    credentials: true,
  },
};

export default appConfig;
