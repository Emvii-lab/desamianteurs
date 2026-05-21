import type { Metadata } from 'next'
import ProfilClientForm from './ProfilClientForm'

export const metadata: Metadata = { title: 'Mon profil | Désamianteurs.com' }

export default function ProfilClientPage() {
  return <ProfilClientForm />
}
