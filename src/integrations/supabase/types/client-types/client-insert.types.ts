import { ClientBaseFields } from './client-base.types';

export type ClientInsert = Partial<ClientBaseFields> & {
  name: string
  type: string
}