const isDev = import.meta.env.MODE !== 'production';

const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
       
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
       
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDev) {
       
      console.error(...args);
    }
  },
};

export default logger;
export { logger };
