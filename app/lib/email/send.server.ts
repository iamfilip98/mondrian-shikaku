import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'Mondrian Shikaku <noreply@mondrianshikaku.com>';

export async function sendDailyReminder(to: string, username: string, streak: number) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not configured, skipping email');
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: streak > 0
      ? `Your ${streak}-day streak is waiting — Daily puzzle is live`
      : "Today's daily puzzle is ready",
    html: `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 3px solid #0A0A0A; padding: 24px;">
          <div style="height: 6px; background: #D40920; margin: -24px -24px 24px;"></div>
          <h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; margin: 0 0 16px; color: #0A0A0A;">
            ${streak > 0 ? `${streak}-day streak!` : 'Daily Puzzle'}
          </h1>
          <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 24px;">
            Hi ${username}, today's 10×10 daily puzzle is ready. ${
              streak > 0 ? `Don't break your ${streak}-day streak!` : 'Start building your streak today.'
            }
          </p>
          <a href="https://mondrianshikaku.com/daily"
             style="display: inline-block; padding: 12px 24px; background: #0A0A0A; color: #F5F5F0;
                    font-size: 14px; font-weight: 500; text-decoration: none; border: none;">
            Play Today's Puzzle
          </a>
        </div>
        <p style="font-size: 11px; color: #999; margin-top: 16px; text-align: center;">
          You're receiving this because you opted in on your profile.
          <a href="https://mondrianshikaku.com/profile" style="color: #1356A2;">Manage preferences</a>
        </p>
      </div>
    `,
  });
}

export async function sendStreakRiskReminder(to: string, username: string, streak: number) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not configured, skipping email');
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your ${streak}-day streak expires tonight!`,
    html: `
      <div style="font-family: 'Outfit', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px;">
        <div style="border: 3px solid #0A0A0A; padding: 24px;">
          <div style="height: 6px; background: #F9C30F; margin: -24px -24px 24px;"></div>
          <h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; margin: 0 0 16px; color: #0A0A0A;">
            Streak at risk!
          </h1>
          <p style="font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 24px;">
            Hi ${username}, you haven't played today's daily puzzle yet. Your ${streak}-day streak
            will reset at midnight UTC if you don't play.
          </p>
          <a href="https://mondrianshikaku.com/daily"
             style="display: inline-block; padding: 12px 24px; background: #D40920; color: #F5F5F0;
                    font-size: 14px; font-weight: 500; text-decoration: none; border: none;">
            Save Your Streak
          </a>
        </div>
        <p style="font-size: 11px; color: #999; margin-top: 16px; text-align: center;">
          <a href="https://mondrianshikaku.com/profile" style="color: #1356A2;">Manage preferences</a>
        </p>
      </div>
    `,
  });
}
