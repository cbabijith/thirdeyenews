export async function triggerRevalidation(slugOrId: string) {
  try {
    const userWebsiteUrl = process.env.USER_WEBSITE_URL || process.env.NEXT_PUBLIC_USER_WEBSITE_URL || 'http://localhost:3001'
    const token = process.env.API_ACCESS_TOKEN || 'thirdeye_secure_token_9f8e7d6c5b4a3a2b1'

    // Revalidate the specific news page
    const resDetail = await fetch(`${userWebsiteUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `/news/${slugOrId}`, token }),
    })
    const jsonDetail = await resDetail.json()
    console.log(`Revalidation response for /news/${slugOrId}:`, jsonDetail)

    // Revalidate the home page to update listing feeds
    const resHome = await fetch(`${userWebsiteUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/', token }),
    })
    const jsonHome = await resHome.json()
    console.log('Revalidation response for /:', jsonHome)
  } catch (err) {
    console.error('Failed to trigger revalidation:', err)
  }
}
