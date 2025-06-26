import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { to, subject, html } = await req.json();

  try {
    const response = await resend.emails.send({
      from: 'Spotify Time Capsule <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, response });
  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Email failed' }, { status: 500 });
  }
}
