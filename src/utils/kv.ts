declare const SHORTENER_DSTN: KVNamespace;

export const ShortenerDB = SHORTENER_DSTN;

export async function getShortLink(code: string): Promise<{ code: string, target: string; ttl?: number } | null> {
  return await ShortenerDB.get<{ code: string, target: string; ttl?: number }>(`links/${code}`, { cacheTtl: 60, type: 'json' });
}

export async function getShortLinkStats(code: string): Promise<{ code: string, target: string; visits: number } | null> {
  const data = await ShortenerDB.get<{ code: string, target: string; }>(`links/${code}`, { cacheTtl: 60, type: 'json' });
  if (!data) return null;

  const stats = await ShortenerDB.get<{ visits: number }>(`stats/${code}`, { cacheTtl: 60, type: 'json' });

  return { code, target: data.target, visits: stats?.visits || 0 };
}

export async function getShortLinks(): Promise<({ code: string, target: string; visits: number } | null)[]> {
  const links = await ShortenerDB.list({ prefix: 'links/' });

  const runs = [];
  for (const link of links.keys) runs.push(getShortLinkStats(link.name.split('links/')[1]));
  const res = await Promise.all(runs);

  return res.sort((a, b) => ((b && a) ? b.visits - a.visits : 1));
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

  const getStats = await ShortenerDB.get<{ visits: number }>(`stats/${code}`, { type: 'json' });
  const stats = getStats || { visits: 0 };
  stats.visits++;

  await Promise.all([
    ShortenerDB.put(`stats/${code}/${ip}/tracked`, 'true', { expirationTtl: 3600 }),
    ShortenerDB.put(`stats/${code}`, JSON.stringify(stats)),
    ShortenerDB.put(`visits/${Buffer.from(`${new Date().getTime()}:${userAgent}:${ip}`).toString('base64')}`, JSON.stringify({ code, ip, userAgent, time: new Date().toISOString() }))
  ]);

  return;
}