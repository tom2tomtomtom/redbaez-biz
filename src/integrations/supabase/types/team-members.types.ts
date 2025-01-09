export type TeamMemberRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type TeamMemberInsert = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export type TeamMemberUpdate = {
  id?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}