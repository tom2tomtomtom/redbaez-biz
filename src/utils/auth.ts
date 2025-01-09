export const ALLOWED_DOMAINS = ['redbaez.com', 'thefamily.network'];
const ALLOWED_EMAILS = ['chrismaples2014@gmail.com'];

export const isAllowedDomain = (email: string): boolean => {
  return ALLOWED_DOMAINS.some(domain => email.endsWith(`@${domain}`)) || 
         ALLOWED_EMAILS.includes(email.toLowerCase());
};

export const getAllowedDomainsMessage = (separator: 'and' | 'or' = 'and'): string => {
  return `${ALLOWED_DOMAINS.join(` ${separator} `)}`;
};