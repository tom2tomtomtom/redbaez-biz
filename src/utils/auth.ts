export const ALLOWED_DOMAINS = ['redbaez.com', 'thefamily.network'];

export const isAllowedDomain = (email: string): boolean => {
  return ALLOWED_DOMAINS.some(domain => email.endsWith(`@${domain}`));
};

export const getAllowedDomainsMessage = (separator: 'and' | 'or' = 'and'): string => {
  return `${ALLOWED_DOMAINS.join(` ${separator} `)}`;
};