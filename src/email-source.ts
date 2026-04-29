// src/config/email.config.ts
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
export const APP_URL = process.env.APP_URL || 'http://localhost:5000';
