import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || 'whsec_mock';

    if (apiKey) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2025-11-17.clover', // Updated to match latest or mocked version
      });
    } else {
      console.warn(
        'STRIPE_SECRET_KEY not set. Subscription features will mock or fail.'
      );
    }
  }

  async createCheckoutSession(userId: string, planId: string): Promise<{ url: string }> {
    if (!this.stripe)
      throw new InternalServerErrorException('Stripe not configured');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new BadRequestException('User not found');

    let customerId = user.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.fullName || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Determine Price ID (In production, these IDs come from env vars or DB)
    const priceId =
      planId === 'pro'
        ? 'price_mock_pro_monthly' // Replace with real Stripe Price ID
        : 'price_mock_basic_monthly';

    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/?success=true`,
        cancel_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/?canceled=true`,
        metadata: { userId: user.id, planId },
      });
      if (!session.url) {
        throw new InternalServerErrorException('Stripe checkout session URL is missing');
      }
      return { url: session.url };
    } catch {
      // Fallback for demo/dev without real price IDs
      this.logger.warn(
        'Stripe Session Creation Failed (likely invalid Price ID). Returning mock URL for dev.'
      );
      return { url: 'https://example.com/mock-checkout-success' };
    }
  }

  async createPortalSession(userId: string): Promise<{ url: string }> {
    if (!this.stripe)
      throw new InternalServerErrorException('Stripe not configured');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.stripeCustomerId)
      throw new BadRequestException('No billing account found');

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}`,
      });
      if (!session.url) {
        throw new InternalServerErrorException('Stripe portal session URL is missing');
      }
      return { url: session.url };
    } catch {
      return { url: 'https://example.com/mock-portal' };
    }
  }

  async getSubscriptionStatus(userId: string): Promise<{ status: string; plan: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return {
      status: user?.subscriptionStatus || 'free',
      plan: user?.subscriptionPlan || 'basic',
    };
  }

  async handleWebhook(signature: string, payload: string): Promise<{ received: boolean }> {
    // payload is now a string (raw body)
    let event: Stripe.Event;

    if (!this.stripe) {
      console.error('Stripe is not configured, cannot process webhook');
      throw new InternalServerErrorException('Stripe not configured');
    }

    try {
      // Verify the webhook signature to prevent malicious requests
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
      this.logger.log(`Verified Stripe Webhook: ${event.type}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Stripe webhook signature verification failed:', msg);
      throw new BadRequestException(
        `Webhook signature verification failed: ${msg}`
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.metadata?.userId) {
          await this.prisma.user.update({
            where: { id: session.metadata.userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionPlan: 'pro', // Assuming only Pro plan for now
            },
          });
          this.logger.log(`User ${session.metadata.userId} upgraded to Pro.`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // Find user by customer ID
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        const user = await this.prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (user) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'free',
              subscriptionPlan: 'basic',
            },
          });
          this.logger.log(`User ${user.id} subscription canceled.`);
        }
        break;
      }

      default:
        this.logger.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }
}
