import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { readFileSync } from 'fs'
import { join } from 'path'

const TIMELINE_LABELS: Record<string, string> = {
  emergency:       'Urgent',
  within_1_month:  'Sous 1 mois',
  within_3_months: 'Sous 3 mois',
  over_3_months:   'Plus de 3 mois',
}

function buildHtml(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (html, [key, val]) => html.replaceAll(`{{${key}}}`, val),
    template
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prenom, email, service, type_bien, ville, code_postal, delai, ref_demande } = body

    if (!email) return NextResponse.json({ error: 'email requis' }, { status: 400 })

    const template = readFileSync(
      join(process.cwd(), 'emails', 'confirmation-demande.html'),
      'utf-8'
    )

    const html = buildHtml(template, {
      prenom:       prenom || 'Client',
      service:      service || '—',
      type_bien:    type_bien || '—',
      ville:        ville || '—',
      code_postal:  code_postal || '—',
      delai:        TIMELINE_LABELS[delai] || delai || '—',
      ref_demande:  ref_demande?.slice(0, 8).toUpperCase() || '—',
    })

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Désamianteurs.com" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Votre demande a bien été envoyée — Désamianteurs.com',
      html,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[confirmation-demande]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
