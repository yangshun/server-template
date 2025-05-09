import env from './env.tsx';

let domain = env('CLIENT_DOMAIN');

export function setClientDomain(_domain: string) {
  if (process.env.NODE_ENV === 'development') {
    domain = _domain;
  }
}

export function getClientDomain() {
  return domain;
}
