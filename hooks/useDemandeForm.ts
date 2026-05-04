import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DemandeFormData } from '@/lib/types'

const demandeSchema = z.object({
  serviceTypes: z.array(z.string()).min(1, "Veuillez choisir au moins une prestation"),
  userType: z.string().min(1, "Veuillez préciser votre profil"),
  propertyType: z.string().min(1, "Veuillez choisir un type de bien"),
  surface: z.string().optional(),
  situationPhase: z.string().optional(),
  situationContext: z.array(z.string()),
  interventionTypes: z.array(z.string()),
  moePhase: z.string().optional(),
  accreditations: z.array(z.string()),
  timing: z.string().min(1, "Veuillez préciser le délai"),
  budget: z.string().min(1, "Veuillez choisir un budget"),
  addressSearch: z.string().optional(),
  streetAddress: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, "La ville est requise"),
  postalCode: z.string().min(1, "Le code postal est requis"),
  department: z.string().optional(),
  complement: z.string().optional(),
  accessibility: z.string().optional(),
  floor: z.string().min(1, "Veuillez préciser l'étage"),
  elevator: z.string().min(1, "Veuillez préciser la présence d'un ascenseur"),
  description: z.string().optional(),
  // Auth/Contact
  prenom: z.string().min(1, "Le prénom est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(10, "Téléphone invalide"),
  password: z.string().min(8, "8 caractères minimum").optional(),
  passwordConfirm: z.string().optional(),
  cgu: z.boolean().refine(v => v === true, "Vous devez accepter les CGU"),
  notifs: z.boolean(),
}).refine(data => {
  if (data.password && data.password !== data.passwordConfirm) return false
  return true
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["passwordConfirm"]
})

export type DemandeFormValues = z.infer<typeof demandeSchema>

export function useDemandeForm(defaultValues?: Partial<DemandeFormValues>) {
  return useForm<DemandeFormValues>({
    resolver: zodResolver(demandeSchema),
    defaultValues: {
      serviceTypes: [],
      userType: "",
      propertyType: "",
      surface: "",
      situationPhase: "",
      situationContext: [],
      interventionTypes: [],
      moePhase: "",
      accreditations: [],
      timing: "",
      budget: "",
      addressSearch: "",
      streetAddress: "",
      city: "",
      postalCode: "",
      department: "",
      complement: "",
      accessibility: "",
      floor: "",
      elevator: "",
      description: "",
      prenom: "",
      nom: "",
      email: "",
      telephone: "",
      password: "",
      passwordConfirm: "",
      cgu: false,
      notifs: false,
      ...defaultValues
    } as any
  })
}
