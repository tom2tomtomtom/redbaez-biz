export type RecommendationRow = {
  id: string
  type: string | null
  priority: number | null
  description: string | null
  action_url: string | null
  client_id: number | null
  due_date: string | null
  status: string | null
  created_at: string | null
}

export type RecommendationInsert = Partial<RecommendationRow>
export type RecommendationUpdate = Partial<RecommendationRow>