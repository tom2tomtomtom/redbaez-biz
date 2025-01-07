export type ProfileRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export type ProfileInsert = {
  id: string
  full_name?: string | null
  avatar_url?: string | null
  created_at?: string
}

export type ProfileUpdate = {
  id?: string
  full_name?: string | null
  avatar_url?: string | null
  created_at?: string
}