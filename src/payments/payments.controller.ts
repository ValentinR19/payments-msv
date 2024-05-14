import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentSessionDTO } from './models/dto/create-payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  async createPaymentSession(@Body() createPaymentSessionDTO: CreatePaymentSessionDTO) {
    return this.paymentsService.createPaymentsession(createPaymentSessionDTO);
  }

  @Get('success')
  async success() {
    return {
      ok: true,
      message: 'Payment succesful',
    };
  }

  @Get('cancelled')
  async cancelled() {
    return {
      ok: false,
      message: 'Payment cancel',
    };
  }

  @Post('webhook')
  async stripeWebHook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res);
  }
}
