import { verifyToken } from '@clerk/backend';

export async function getAuthUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('[auth] Missing or malformed Authorization header');
    return null;
  }

  const token = authHeader.slice(7);
  if (!token || token.length < 10) {
    console.error('[auth] Token too short or empty');
    return null;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error('[auth] CLERK_SECRET_KEY not configured');
    return null;
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    return payload.sub;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('expired')) {
      console.error('[auth] Token expired');
    } else {
      console.error('[auth] Token verification failed:', message);
    }
    return null;
  }
}
