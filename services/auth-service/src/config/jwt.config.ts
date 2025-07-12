export const config = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  issuer: process.env.JWT_ISSUER || 'pharmacy-control-system',
  audience: process.env.JWT_AUDIENCE || 'pharmacy-users',
};