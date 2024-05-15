import { Injectable, Logger } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { CreatePaymentSessionDTO } from './models/dto/create-payment-session.dto';
import { Request, Response } from 'express';
@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);

  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentsession(createPaymentSessionDTO: CreatePaymentSessionDTO) {
    this.logger.log(`Se inicia la creacion del pago`);
    const { currency, items, idOrder } = createPaymentSessionDTO;

    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });
    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          idOrder: idOrder,
        },
      },
      //Items que la gente compra
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });
    this.logger.log(`Se Completa la creacion del pago`);

    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    };
  }

  async stripeWebhook(req: Request, res: Response) {
    this.logger.log(`Entra la request del WebHook`);
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    const endpointSecret = envs.stripeEndpointSecret;

    try {
      event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
    } catch (error) {
      return res.status(400).send(`Webhook Error: ${error.message} status: ${error.status}`);
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceded = event.data.object;
        this.logger.log('Evento pagado con exito');
        console.log({
          metadata: chargeSucceded.metadata,
          idOrder: chargeSucceded.metadata.idOrder,
        });
        break;
      default:
        this.logger.warn(`Event ${event.type} not handle`);
    }

    return res.status(200).json({ sig });
  }
}
