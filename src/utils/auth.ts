import { ALLOWED_EMAILS as ENV_ALLOWED_EMAILS } from '@/config/env';

export const ALLOWED_DOMAINS = ['redbaez.com', 'thefamily.network'];

const EXTRA_ALLOWED_EMAILS = ENV_ALLOWED_EMAILS
  ? ENV_ALLOWED_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  : [];

export const isAllowedDomain = (email: string): boolean => {
  const lower = email.toLowerCase();
  return (
    ALLOWED_DOMAINS.some((domain) => lower.endsWith(`@${domain}`)) ||
    EXTRA_ALLOWED_EMAILS.includes(lower)
  );
};

export const getAllowedDomainsMessage = (separator: 'and' | 'or' = 'and'): string => {
  const parts = [...ALLOWED_DOMAINS, ...EXTRA_ALLOWED_EMAILS];
  return `${parts.join(` ${separator} `)}`;
};