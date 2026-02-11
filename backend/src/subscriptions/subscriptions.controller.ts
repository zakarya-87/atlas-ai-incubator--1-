import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


import { SubscriptionsService } from './subscriptions.service';
import { GetUser } from '../auth/get-user.decorator';
import type { User } from '@prisma/client';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

interface RequestWithRawBody extends Request {
  rawBody?: string;
}

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe Checkout Session' })
  async createCheckoutSession(

    @GetUser() user: User,
    @Body('planId') planId: string
  ): Promise<{ url: string }> {
    return this.subscriptionsService.createCheckoutSession(user.id, planId);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe Customer Portal Session' })
  async createPortalSession(@GetUser() user: User): Promise<{ url: string }> {

    return this.subscriptionsService.createPortalSession(user.id);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription status' })
  async getStatus(@GetUser() user: User): Promise<{ status: string; plan: string }> {

    return this.subscriptionsService.getSubscriptionStatus(user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe Webhook Handler (Public)' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: unknown, // Raw body will be handled via custom middleware in production
    @Req() request: RequestWithRawBody
  ): Promise<{ received: boolean }> {
    if (!signature)
      throw new BadRequestException('Missing stripe-signature header');

    // For proper signature verification, the raw body is required
    // In production, configure raw body middleware for this specific endpoint:
    // https://docs.stripe.com/webhooks#verify-webhook-signatures
    // The raw body would be attached to request by custom middleware
    // https://docs.stripe.com/webhooks#verify-webhook-signatures
    // The raw body would be attached to request by custom middleware
    const rawBody = request.rawBody || JSON.stringify(body);
    return this.subscriptionsService.handleWebhook(signature, rawBody);
  }
}
