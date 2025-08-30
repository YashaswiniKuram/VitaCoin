import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (emailData: EmailData) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured');
    return;
  }

  const msg = {
    to: emailData.to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@vitacoin.app',
    subject: emailData.subject,
    text: emailData.text,
    html: emailData.html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendDailyBonusReminder = async (email: string, displayName: string, streak: number) => {
  const subject = 'Don\'t miss your daily bonus! 🪙';
  const text = `Hi ${displayName}! You haven't claimed your daily bonus yet. Your current streak is ${streak} days. Don't break it!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F0B90B;">VitaCoin Daily Bonus Reminder</h2>
      <p>Hi <strong>${displayName}</strong>!</p>
      <p>You haven't claimed your daily bonus yet. Your current streak is <strong>${streak} days</strong>.</p>
      <p>Don't break your streak! Claim your bonus now and earn <strong>${100 + (streak * 5)} coins</strong>.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
           style="background-color: #F0B90B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Claim Your Bonus
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Keep up the great work! Consistency is key to success.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};

export const sendQuizReminder = async (email: string, displayName: string, missedCategories: string[]) => {
  const subject = 'Complete your daily quizzes! 🧠';
  const categoriesText = missedCategories.join(', ');
  const text = `Hi ${displayName}! You haven't completed your daily quizzes yet. Missing categories: ${categoriesText}. Complete them to earn coins and maintain your streak!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F0B90B;">VitaCoin Quiz Reminder</h2>
      <p>Hi <strong>${displayName}</strong>!</p>
      <p>You haven't completed your daily quizzes yet.</p>
      <p><strong>Missing categories:</strong> ${categoriesText}</p>
      <p>Complete them to earn up to <strong>25 coins</strong> per quiz and maintain your streak!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
           style="background-color: #F0B90B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Take Quizzes Now
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Challenge yourself and grow your knowledge!</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};

export const sendStreakBrokenNotification = async (email: string, displayName: string, type: 'login' | 'quiz', previousStreak: number) => {
  const subject = `Your ${type} streak was broken 😔`;
  const text = `Hi ${displayName}! Your ${type} streak of ${previousStreak} days was broken. Don't give up! Start a new streak today.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #C43308;">Streak Broken</h2>
      <p>Hi <strong>${displayName}</strong>,</p>
      <p>Your <strong>${type}</strong> streak of <strong>${previousStreak} days</strong> was broken.</p>
      <p>Don't give up! Every expert was once a beginner. Start a new streak today and come back stronger!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
           style="background-color: #F0B90B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Start New Streak
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Your comeback is always stronger than your setback!</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};

export const sendBadgeEarnedNotification = async (email: string, displayName: string, badgeName: string) => {
  const subject = `🎉 You earned a new badge: ${badgeName}!`;
  const text = `Congratulations ${displayName}! You've earned the "${badgeName}" badge. Keep up the excellent work!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F0B90B;">🎉 New Badge Earned!</h2>
      <p>Congratulations <strong>${displayName}</strong>!</p>
      <p>You've earned the <strong>"${badgeName}"</strong> badge!</p>
      <p>This achievement shows your dedication and progress. Keep up the excellent work!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
           style="background-color: #F0B90B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          View Your Badges
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">You're doing amazing! Keep pushing forward!</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
};
