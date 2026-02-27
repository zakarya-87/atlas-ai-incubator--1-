import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private isDev: boolean;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.isDev = false;
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(this.configService.get('SMTP_PORT') || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      this.isDev = true;
      this.logger.warn(
        'SMTP Credentials not found. EmailService running in DEV mode (Console Log Only).'
      );
    }
  }

  async sendWelcomeEmail(to: string): Promise<void> {
    const subject = 'Welcome to ATLAS AI Incubator';
    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #00A896;">Welcome to ATLAS AI</h1>
            <p>Hello,</p>
            <p>Thank you for joining the ATLAS AI Incubator. You now have access to our powerful suite of strategic planning agents.</p>
            <p>We recommend starting with the <strong>Fundamentals Module</strong> to validate your business concept.</p>
            <br/>
            <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}" style="background-color: #00A896; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">The ATLAS AI Team</p>
        </div>
      `;
    await this.send(to, subject, html);
  }

  async sendInviteEmail(to: string, inviterName: string, ventureName: string): Promise<void> {
    const subject = `${inviterName} invited you to join "${ventureName}" on ATLAS`;
    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00A896;">Team Invitation</h2>
            <p>You have been invited to collaborate on the venture <strong>${ventureName}</strong>.</p>
            <p>Log in to your ATLAS dashboard to access the shared workspace.</p>
            <br/>
            <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}" style="background-color: #00A896; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Accept Invitation</a>
        </div>
      `;
    await this.send(to, subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (this.isDev) {
      this.logger.debug(`
          ================ [DEV EMAIL] ================
          TO: ${to}
          SUBJECT: ${subject}
          ---------------------------------------------
          ${html.replace(/<[^>]*>?/gm, '').substring(0, 150)}... (HTML Content Hidden)
          =============================================
          `);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: '"ATLAS AI" <noreply@atlas-incubator.com>',
        to,
        subject,
        html,
      });
      this.logger.log(`📧 Email sent to ${to}`);
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      // Don't throw, just log. Email failure shouldn't block the user flow.
    }
  }
}
