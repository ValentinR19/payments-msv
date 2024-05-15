import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentSessionDTO } from './models/dto/create-payment-session.dto';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern('create.payment.session')
  async createPaymentSession(@Payload() createPaymentSessionDTO: CreatePaymentSessionDTO) {
    return this.paymentsService.createPaymentsession(createPaymentSessionDTO);
  }

  @MessagePattern('payment.success')
  async success() {
    return {
      ok: true,
      message: 'Payment succesful',
    };
  }

  @MessagePattern('payment.cancelled')
  async cancelled() {
    return {
      ok: false,
      message: 'Payment cancel',
    };
  }

  @MessagePattern('payment.webhook')
  @Post('webhook')
  async stripeWebHook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res);
  }
}
