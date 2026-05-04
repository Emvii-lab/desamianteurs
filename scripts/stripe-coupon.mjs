import https from 'https';

const SK = process.env.STRIPE_SK;

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

async function main() {
  const coupon = await stripe('POST', 'coupons', {
    percent_off: '100',
    duration: 'once',
    name: 'Inscription offerte - Association',
    max_redemptions: '500',
  });
  console.log('✓ Coupon:', coupon.id);

  const promo = await stripe('POST', 'promotion_codes', {
    coupon: coupon.id,
    code: 'ASSO2026',
    max_redemptions: '500',
  });
  console.log('✓ Code promo:', promo.id, '| code:', promo.code);
  console.log(`STRIPE_COUPON_ASSO=${coupon.id}`);
  console.log(`STRIPE_PROMO_ASSO=${promo.id}`);
}

main().catch(console.error);
