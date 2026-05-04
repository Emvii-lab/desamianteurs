import https from 'https';

const SK = process.env.STRIPE_SK;
if (!SK) throw new Error('STRIPE_SK manquant');

function stripe(method, path, params = {}) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const options = {
      hostname: 'api.stripe.com',
      path: `/v1/${path}`,
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(SK + ':').toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.error) reject(new Error(json.error.message));
        else resolve(json);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const post = (path, p) => stripe('POST', path, p);

async function main() {
  console.log('=== Création produits ===');

  const pAsso = await post('products', {
    name: "Frais d'inscription - Association",
    description: "Cotisation d'adhésion à l'association partenaire. Payable à l'inscription.",
  });
  console.log('✓ Frais asso:', pAsso.id);

  const pEss = await post('products', {
    name: 'Essentiel',
    description: "Accès à la plateforme, demandes occasionnelles, présence dans l'annuaire.",
  });
  console.log('✓ Essentiel:', pEss.id);

  const pPerf = await post('products', {
    name: 'Performance',
    description: '2ème vague de distribution, 5 dossiers simultanés, flux régulier de leads.',
  });
  console.log('✓ Performance:', pPerf.id);

  const pPrem = await post('products', {
    name: 'Premium',
    description: '1ère vague prioritaire, dossiers illimités, alertes temps réel, tableau de bord avancé.',
  });
  console.log('✓ Premium:', pPrem.id);

  console.log('\n=== Création prix ===');

  const priceAsso = await post('prices', {
    product: pAsso.id,
    unit_amount: '8000',
    currency: 'eur',
  });
  console.log('✓ Prix frais asso (80€ one-time):', priceAsso.id);

  const priceEss = await post('prices', {
    product: pEss.id,
    unit_amount: '4900',
    currency: 'eur',
    'recurring[interval]': 'month',
  });
  console.log('✓ Prix Essentiel (49€/mois):', priceEss.id);

  const pricePerf = await post('prices', {
    product: pPerf.id,
    unit_amount: '9900',
    currency: 'eur',
    'recurring[interval]': 'month',
  });
  console.log('✓ Prix Performance (99€/mois):', pricePerf.id);

  const pricePrem = await post('prices', {
    product: pPrem.id,
    unit_amount: '21900',
    currency: 'eur',
    'recurring[interval]': 'month',
  });
  console.log('✓ Prix Premium (219€/mois):', pricePrem.id);

  console.log('\n=== Coupon + code promo ===');

  const coupon = await post('coupons', {
    percent_off: '100',
    duration: 'once',
    name: "Frais d'inscription offerts - Partenaire association",
    max_redemptions: '500',
  });
  console.log('✓ Coupon 100% off:', coupon.id);

  const promo = await post('promotion_codes', {
    coupon: coupon.id,
    code: 'ASSO2026',
    max_redemptions: '500',
  });
  console.log('✓ Code promo ASSO2026:', promo.id);

  console.log('\n=== Variables à ajouter dans .env.local ===');
  console.log(`STRIPE_PRICE_ASSO=${priceAsso.id}`);
  console.log(`STRIPE_PRICE_ESSENTIEL=${priceEss.id}`);
  console.log(`STRIPE_PRICE_PERFORMANCE=${pricePerf.id}`);
  console.log(`STRIPE_PRICE_PREMIUM=${pricePrem.id}`);
  console.log(`STRIPE_COUPON_ASSO=${coupon.id}`);
}

main().catch(console.error);
