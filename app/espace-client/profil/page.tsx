import type { Metadata } from 'next'
import ProfilClientForm from './ProfilClientForm'

export const metadata: Metadata = { title: 'Mon profil | Désamianteurs.fr' }

export default function ProfilClientPage() {
  return <ProfilClientForm />
}
