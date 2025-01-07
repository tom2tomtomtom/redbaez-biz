import { ClientBaseFields } from './client-base.types';

export type ClientRow = ClientBaseFields & {
  id: number
  missing_fields: string[] | null
}