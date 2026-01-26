export const organizerWelcomeTemplate = ({ name, organizationName }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Organizer Application Submitted</title>
</head>

<body style="margin:0; padding:0; background:#020617; font-family:Arial, sans-serif;">
  <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:16px; overflow:hidden;">

    <!-- Header -->
    <div style="padding:32px; text-align:center; background:linear-gradient(135deg,#6366f1,#22d3ee); color:#fff;">
      <h1 style="margin:0;">You’re Almost There 🚀</h1>
      <p style="margin-top:8px;">Organizer application received</p>
    </div>

    <!-- Content -->
    <div style="padding:32px; color:#111827;">
      <h2 style="margin-top:0;">Hi ${name},</h2>

      <p>
        Thank you for registering as an <strong>Organizer</strong> on
        <strong>InstantBook</strong>.
      </p>

      <p>
        We’ve received your application for:
      </p>

      <div style="background:#f8fafc; padding:16px; border-radius:12px; margin:20px 0;">
        <strong>Organization:</strong> ${organizationName}
      </div>

      <p>
        Our team is currently reviewing your details. Once verified, you’ll be
        able to:
      </p>

      <ul>
        <li>Create and publish events</li>
        <li>Sell free and paid tickets</li>
        <li>Track bookings and revenue</li>
      </ul>

      <p style="margin-top:24px;">
        We’ll notify you as soon as your organizer account is approved.
      </p>

      <p>
        — Team <strong>InstantBook</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px; text-align:center; font-size:12px; color:#6b7280; background:#f9fafb;">
      © ${new Date().getFullYear()} InstantBook · Organizer Platform
    </div>

  </div>
</body>
</html>
`;
