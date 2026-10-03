/** Existing dates survive edits and republication. Legacy unknown dates stay unknown. */
export function publicationDate(current: { is_published: boolean; published_at: Date | null } | null, published: boolean): Date | null {
  if (current?.published_at) return current.published_at
  if (published && !current?.is_published) return new Date()
  return null
}
