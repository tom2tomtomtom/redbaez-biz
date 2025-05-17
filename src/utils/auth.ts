export const ALLOWED_DOMAINS = ['redbaez.com', 'thefamily.network'];
const ALLOWED_EMAILS = ['chrismaples2014@gmail.com'];

export const isAllowedDomain = (email: string): boolean => {
  const lowerEmail = email.toLowerCase();
  return (
    ALLOWED_DOMAINS.some(domain => lowerEmail.endsWith(`@${domain.toLowerCase()}`)) ||
    ALLOWED_EMAILS.includes(lowerEmail)
  );
};

export const getAllowedDomainsMessage = (separator: 'and' | 'or' = 'and'): string => {
  return `${ALLOWED_DOMAINS.join(` ${separator} `)}`;
};