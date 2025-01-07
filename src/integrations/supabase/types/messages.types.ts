export type MessageRow = {
  id: number
  type: string
  content: string
  created_at: string
}

export type MessageInsert = {
  id?: number
  type: string
  content: string
  created_at?: string
}

export type MessageUpdate = {
  id?: number
  type?: string
  content?: string
  created_at?: string
}