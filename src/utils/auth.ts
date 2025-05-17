export const ALLOWED_DOMAINS = ['redbaez.com', 'thefamily.network'];
const ALLOWED_EMAILS = ['chrismaples2014@gmail.com'];

export const isAllowedDomain = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase();
  return ALLOWED_DOMAINS.some(domain => normalizedEmail.endsWith(`@${domain.toLowerCase()}`)) ||
         ALLOWED_EMAILS.includes(normalizedEmail);
};

export const getAllowedDomainsMessage = (separator: 'and' | 'or' = 'and'): string => {
  return `${ALLOWED_DOMAINS.join(` ${separator} `)}`;
};