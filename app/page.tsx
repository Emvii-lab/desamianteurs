import HomeClient from './HomeClient'
import { fetchKpis, fetchFeaturedPros } from '@/lib/kpis'

export default async function Page() {
  const [kpis, pros] = await Promise.all([fetchKpis(), fetchFeaturedPros()])
  return <HomeClient kpis={kpis} pros={pros} />
}
