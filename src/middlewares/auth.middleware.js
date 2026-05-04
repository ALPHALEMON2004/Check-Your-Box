import JWT from 'jsonwebtoken';
import { PUBLIC_KEY } from '../utils/cert.js';

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, entry) => {
    const index = entry.indexOf('=');
    if (index === -1) {
      return cookies;
    }

    const key = entry.slice(0, index).trim();
    const value = entry.slice(index + 1).trim();
    cookies[key] = value;
    return cookies;
  }, {});
}

function getAuthToken(req) {
  const authorizationHeader = req.headers.authorization;
  if (authorizationHeader?.startsWith('Bearer ')) {
    return authorizationHeader.slice(7);
  }

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.authToken || cookies.token;
  return token ? decodeURIComponent(token) : null;
}

export function requireLocationAuth(req, res, next) {
  const token = getAuthToken(req);
  const redirectTarget = `/o/authenticate?redirect_uri=${encodeURIComponent('/location')}`;

  if (!token) {
    return res.redirect(redirectTarget);
  }

  try {
    const claims = JWT.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
    req.user = claims;
    return next();
  } catch {
    return res.redirect(redirectTarget);
  }
}
