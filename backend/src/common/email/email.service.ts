import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.ethereal.email';
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER') || 'test';
    const pass = this.configService.get<string>('SMTP_PASS') || 'test';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private wrapHtml(title: string, content: string, ctaText?: string, ctaUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.025em; }
          .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 32px 24px; line-height: 1.6; font-size: 14px; }
          .cta-container { text-align: center; margin: 28px 0; }
          .cta-btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 4px rgba(37,99,235,0.2); }
          .footer { background-color: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
          .badge-green { background: #dcfce7; color: #15803d; }
          .badge-red { background: #fee2e2; color: #b91c1c; }
          .badge-blue { background: #dbeafe; color: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Zimyo HRMS Enterprise</h1>
            <p>Smart Cloud Workforce &amp; Payroll Management</p>
          </div>
          <div class="content">
            ${content}
            ${ctaText && ctaUrl ? `
              <div class="cta-container">
                <a href="${ctaUrl}" class="cta-btn" target="_blank">${ctaText}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Zimyo Enterprise HRMS. All rights reserved.</p>
            <p>This is an automated operational notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const content = `
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Password Reset Request</h2>
      <p>We received a request to reset the password for your account.</p>
      <p>Click the secure button below to choose a new password. For security reasons, this link will expire in <strong>1 hour</strong>.</p>
    `;

    const html = this.wrapHtml('Reset Your Password', content, 'Reset My Password', resetLink);

    try {
      await this.transporter.sendMail({
        from: '"HRMS Security" <noreply@hrms.com>',
        to,
        subject: '🔒 Reset Your HRMS Account Password',
        html,
      });
      this.logger.log(`Password reset email sent to: ${to}`);
    } catch (error) {
      this.logger.warn(`Failed to dispatch password reset email: ${error}`);
    }
  }

  async sendWelcomeEmail(to: string, name: string, defaultPassword?: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    const content = `
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome aboard, ${name}!</h2>
      <p>Your official employee portal profile has been activated on the HRMS platform.</p>
      <p>You can now manage your daily attendance, apply for leaves, access monthly Indian payslips, and inspect company updates anytime.</p>
      ${defaultPassword ? `
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 14px; margin: 18px 0;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">Temporary Login Password:</p>
          <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #1e293b; font-family: monospace;">${defaultPassword}</p>
        </div>
        <p style="font-size: 12px; color: #dc2626;">* Please update your password immediately after your first sign in.</p>
      ` : ''}
    `;

    const html = this.wrapHtml('Welcome to HRMS', content, 'Log In to Workspace', `${frontendUrl}/login`);

    try {
      await this.transporter.sendMail({
        from: '"HRMS Onboarding" <noreply@hrms.com>',
        to,
        subject: `👋 Welcome to the Team, ${name}!`,
        html,
      });
      this.logger.log(`Welcome email sent to: ${to}`);
    } catch (error) {
      this.logger.warn(`Failed to dispatch welcome email: ${error}`);
    }
  }

  async sendCompanyRegistrationEmail(to: string, companyName: string, slug: string, plan: string, trialEndsAt: Date) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const formattedDate = new Date(trialEndsAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const content = `
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Welcome to Zimyo SaaS HRMS!</h2>
      <p>Congratulations! Your company <strong>${companyName}</strong> workspace has been provisioned successfully.</p>
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #1e40af;"><strong>Subscription Plan:</strong> <span class="badge badge-blue">${plan.toUpperCase()}</span></p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #1e40af;"><strong>14-Day Free Trial Active Until:</strong> ${formattedDate}</p>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #1e40af;"><strong>Company Workspace Slug:</strong> <code>${slug}</code></p>
      </div>
      <p>You can now onboard employees, set up shifts, configure statutory payroll CTC rules, and track real-time attendance.</p>
    `;

    const html = this.wrapHtml('Company Workspace Activated', content, 'Open Admin Portal', `${frontendUrl}/login`);

    try {
      await this.transporter.sendMail({
        from: '"Zimyo Enterprise" <noreply@hrms.com>',
        to,
        subject: `🚀 ${companyName} Workspace Activated — 14-Day Free Trial`,
        html,
      });
      this.logger.log(`Company onboarding email sent to: ${to}`);
    } catch (error) {
      this.logger.warn(`Failed to dispatch company registration email: ${error}`);
    }
  }

  async sendLeaveStatusEmail(to: string, name: string, status: string, startDate: Date, endDate: Date, remarks?: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const isApproved = status.toLowerCase() === 'approved';
    const badgeClass = isApproved ? 'badge-green' : 'badge-red';

    const fmtStart = new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmtEnd = new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const content = `
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Leave Request Update</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your time-off request for the period <strong>${fmtStart}</strong> to <strong>${fmtEnd}</strong> has been updated:</p>
      <div style="margin: 18px 0;">
        <span class="badge ${badgeClass}" style="font-size: 14px; padding: 6px 14px;">Status: ${status.toUpperCase()}</span>
      </div>
      ${remarks ? `<p style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 13px; color: #475569; border-left: 3px solid #cbd5e1;"><strong>Manager Remarks:</strong> ${remarks}</p>` : ''}
      <p>Your quota balance has been synchronized automatically.</p>
    `;

    const html = this.wrapHtml('Leave Request Status', content, 'View Leave Quota', `${frontendUrl}/my-leaves`);

    try {
      await this.transporter.sendMail({
        from: '"HRMS Leave Desk" <noreply@hrms.com>',
        to,
        subject: `Leave Request ${isApproved ? 'Approved ✅' : 'Rejected ❌'} (${fmtStart})`,
        html,
      });
      this.logger.log(`Leave status email dispatched to: ${to}`);
    } catch (error) {
      this.logger.warn(`Failed to dispatch leave status email: ${error}`);
    }
  }

  async sendSalarySlipGeneratedEmail(to: string, name: string, monthYear: string, netSalary: number) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(netSalary);

    const content = `
      <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Salary Slip Generated</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your monthly salary slip for <strong>${monthYear}</strong> has been generated and approved by the payroll department.</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 18px 0; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #166534;">Net Disbursed Salary</p>
        <p style="margin: 6px 0 0 0; font-size: 24px; font-weight: 800; color: #15803d;">${formattedAmount}</p>
      </div>
      <p>You can view the full 2-column CTC breakdown (Basic, HRA, EPF, ESIC, Professional Tax) and print/download your official salary slip PDF on the portal.</p>
    `;

    const html = this.wrapHtml('Salary Slip Available', content, 'Download Salary Slip', `${frontendUrl}/my-payroll`);

    try {
      await this.transporter.sendMail({
        from: '"HRMS Payroll" <noreply@hrms.com>',
        to,
        subject: `💰 Your Salary Slip for ${monthYear} is Ready`,
        html,
      });
      this.logger.log(`Salary slip email sent to: ${to}`);
    } catch (error) {
      this.logger.warn(`Failed to dispatch salary slip email: ${error}`);
    }
  }
}
