export default (expiresInMs: number) => {
  const c = new Map<string, {ts: number; data: any}>();

  return {
    get(key: string) {
      const payload = c.get(key);
      if (!payload || (payload && payload.ts < Date.now())) {
        c.delete(key);
        console.log("Cache missed");
        return;
      }
      console.log("Cache hit");
      return payload.data;
    },
    set(key: string, data: any) {
      const ts = Date.now() + expiresInMs;
      const payload = {data, ts};
      return c.set(key, payload);
    },
  };
};
