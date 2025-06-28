const isDev = import.meta.env.MODE !== 'production';

const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
};

export default logger;
export { logger };
