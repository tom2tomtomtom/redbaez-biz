import { ClientBaseFields } from './client-base.types';

export type ClientUpdate = Partial<ClientBaseFields> & {
  id?: number
  missing_fields?: string[] | null
}