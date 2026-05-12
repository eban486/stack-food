// api/create-preference.js
// Ejemplo para Vercel/Node. No pongas tu Access Token en el frontend.
// 1) npm install mercadopago
// 2) En Vercel, crear variable de entorno: MP_ACCESS_TOKEN=APP_USR-...
// 3) Cambiar SITE_URL por tu dominio real.

import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const preference = new Preference(client);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { items, pickupSlot, customerName, customerPhone, notes } = req.body;

    const body = {
      items: items.map((item) => ({
        title: item.name,
        quantity: item.quantity || 1,
        unit_price: Number(item.price),
        currency_id: 'ARS',
      })),
      external_reference: `STACK-${Date.now()}`,
      metadata: {
        pickup_slot: pickupSlot,
        customer_name: customerName,
        customer_phone: customerPhone,
        notes,
      },
      back_urls: {
        success: 'https://TU-DOMINIO.com/pago-exitoso',
        failure: 'https://TU-DOMINIO.com/pago-rechazado',
        pending: 'https://TU-DOMINIO.com/pago-pendiente',
      },
      auto_return: 'approved',
      // notification_url: 'https://TU-DOMINIO.com/api/webhook-mercadopago',
    };

    const result = await preference.create({ body });
    return res.status(200).json({ init_point: result.init_point });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
