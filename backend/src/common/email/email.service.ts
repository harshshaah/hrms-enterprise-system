import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.ethereal.email',
      port: this.configService.get<number>('SMTP_PORT') || 587,
      auth: {
        user: this.configService.get<string>('SMTP_USER') || 'test',
        pass: this.configService.get<string>('SMTP_PASS') || 'test',
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: '"HRMS Admin" <noreply@hrms.com>',
      to,
      subject: 'Password Reset Request',
      html: `
        <h3>Hello,</h3>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  async sendWelcomeEmail(to: string, name: string, defaultPassword?: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    
    const mailOptions = {
      from: '"HRMS Admin" <noreply@hrms.com>',
      to,
      subject: 'Welcome to HRMS',
      html: `
        <h3>Hello ${name},</h3>
        <p>Welcome to HRMS! Your account has been created successfully.</p>
        <p>You can login at: <a href="${frontendUrl}/login">${frontendUrl}/login</a></p>
        ${defaultPassword ? `<p>Your default password is: <b>${defaultPassword}</b></p><p>Please change it after your first login.</p>` : ''}
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  async sendLeaveStatusEmail(to: string, name: string, status: string, startDate: Date, endDate: Date, remarks?: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    
    const mailOptions = {
      from: '"HRMS Admin" <noreply@hrms.com>',
      to,
      subject: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <h3>Hello ${name},</h3>
        <p>Your leave request from <b>${startDate.toLocaleDateString()}</b> to <b>${endDate.toLocaleDateString()}</b> has been <b>${status}</b>.</p>
        ${remarks ? `<p>Remarks: ${remarks}</p>` : ''}
        <p>You can check the details on your <a href="${frontendUrl}/my-leaves">dashboard</a>.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send leave status email:', error);
    }
  }
}
