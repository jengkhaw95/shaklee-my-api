export default (expiresInMs: number) => {
  const c = new Map<string, {ts: number; data: any}>();

  const timeout = new Map<string, NodeJS.Timeout>();

  return {
    get(key: string) {
      const payload = c.get(key);
      if (!payload || (payload && payload.ts < Date.now())) {
        c.delete(key);
        console.log(`Cache missed: ${key}`);
        return;
      }
      console.log(`Cache hit: ${key}`);
      return payload.data;
    },
    set(key: string, data: any) {
      const ts = Date.now() + expiresInMs;
      if (timeout.has(key)) {
        console.log(`Cache reset: ${key}`);
        clearTimeout(timeout.get(key));
      }
      timeout.set(
        key,
        setTimeout(() => {
          console.log(`Cache cleared: ${key}`);
          timeout.delete(key);
          c.delete(key);
        }, expiresInMs)
      );
      const payload = {data, ts};
      return c.set(key, payload);
    },
    getCache() {
      return c;
    },
  };
};
