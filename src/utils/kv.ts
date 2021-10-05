declare const SHORTENER_DSTN: KVNamespace;

export const ShortenerDB = SHORTENER_DSTN;

export async function getShortLink(code: string): Promise<{ code: string, target: string; ttl?: number } | null> {
  const data = await ShortenerDB.get(`links/${code}`, { cacheTtl: 60 });
  if (!data) return null;
  else return JSON.parse(data);
}

export async function deleteShortLink(code: string): Promise<boolean | null> {
  const data = await ShortenerDB.get(`links/${code}`, { cacheTtl: 60 });
  if (!data) return null;
  else {
    await ShortenerDB.delete(`links/${code}`);
    return true;
  }
}

export async function createShortLink(code: string, target: string, ttl?: number): Promise<{ code: string, target: string, ttl?: number }> {
  if (ttl && ttl < 60) ttl = 60;
  const options = ttl ? { expirationTtl: ttl } : {};
  await ShortenerDB.put(`links/${code}`, JSON.stringify({ target, created: new Date().toISOString() }), options);
  return { code, target, ttl };
}

export async function trackVisit(code: string, ip: string, userAgent: string): Promise<void> {
  const recentlyTracked = await ShortenerDB.get(`stats/${code}/${ip}/tracked`);
  if (recentlyTracked) return;

  const getStats = await ShortenerDB.get(`stats/${code}`);
  let stats = getStats ? JSON.parse(getStats) : { visits: 0 };
  stats.visits++;

  await ShortenerDB.put(`stats/${code}/${ip}/tracked`, 'true', { expirationTtl: 3600 });
  await ShortenerDB.put(`stats/${code}`, JSON.stringify(stats));
  await ShortenerDB.put(`visits/${Buffer.from(`${new Date().getTime()}:${userAgent}:${ip}`).toString('base64')}`, JSON.stringify({ code, ip, userAgent, time: new Date().toISOString() }));

  return;
}