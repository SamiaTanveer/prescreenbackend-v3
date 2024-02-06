import { Injectable, Inject } from '@nestjs/common';
import { STRIPE_CLIENT } from 'src/file/constant';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(@Inject(STRIPE_CLIENT) private stripe: Stripe) {}

  async createPaymentIntent(dto: { price: number }) {
    return await this.stripe.paymentIntents.create({
      amount: Math.round(dto.price * 100),
      currency: 'USD',
      payment_method_types: ['card'],
      //   payment_method: dto.intentId,
    });
  }
}
