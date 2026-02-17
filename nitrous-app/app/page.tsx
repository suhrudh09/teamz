import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import { getEvents, getCategories, getJourneys, getMerchItems } from '@/lib/api'

export default async function Home() {
  // Fetch all data in parallel on the server
  const [events, categories, journeys, merchItems] = await Promise.all([
    getEvents().catch(() => []),
    getCategories().catch(() => []),
    getJourneys().catch(() => []),
    getMerchItems().catch(() => []),
  ])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        
        {/* Temporary data display to verify API connection */}
        <section style={{ padding: '100px 48px', background: 'var(--deep)' }}>
          <div className="container">
            <h2 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '36px', 
              color: '#fff',
              marginBottom: '24px'
            }}>
              API Data Check
            </h2>
            
            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>
              <p>Events: {events.length}</p>
              <p>Categories: {categories.length}</p>
              <p>Journeys: {journeys.length}</p>
              <p>Merch Items: {merchItems.length}</p>
            </div>
            
            {events.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ color: 'var(--cyan)', marginBottom: '12px' }}>First Event:</h3>
                <pre style={{ 
                  background: 'var(--card)', 
                  padding: '16px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  color: 'var(--text)'
                }}>
                  {JSON.stringify(events[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
