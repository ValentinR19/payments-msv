import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { CreatePaymentSessionDTO } from './models/dto/create-payment-session.dto';
import { Request, Response } from 'express';
@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  async createPaymentsession(createPaymentSessionDTO: CreatePaymentSessionDTO) {
    const { currency, items } = createPaymentSessionDTO;
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
      //Colocar aqui el ID de mi orden
      payment_intent_data: {
        metadata: {},
      },
      //Items que la gente compra
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3003/payments/success',
      cancel_url: 'http://localhost:3003/payments/cancelled',
    });
    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    const endpointSecret = 'whsec_9ee85f9d34c4b8200b90688c2c713d7c6079b0712dcbfe8bb4fdda0a3cda25e9';

    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
      console.log('Error: ', error.message);
      return res.status(400).send(`Webhook Error: ${error.message} status: ${error.status}`);
    }

    console.log('Event: ', event);
    return res.status(200).json({ sig });
  }
}
