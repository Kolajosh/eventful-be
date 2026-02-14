interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  // In a real application, integration with SendGrid, Mailgun, or AWS SES would happen here.
  // For this MVP, we will log the email to the console.
  console.log(`
  📧  ---------------- EMAIL SENT ----------------  📧
  To: ${options.to}
  Subject: ${options.subject}
  Body: 
  ${options.html}
  ----------------------------------------------------
  `);
  return true;
};

export const sendTicketEmail = async (
  userEmail: string,
  userName: string,
  ticket: any,
  event: any,
) => {
  const subject = `Your Ticket for ${event.title}`;
  const html = `
    <h1>Hi ${userName},</h1>
    <p>You have successfully purchased a ticket for <strong>${event.title}</strong>.</p>
    <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
    <p><strong>Location:</strong> ${event.location}</p>
    <br/>
    <h3>Your Ticket Code:</h3>
    <pre>${ticket.id}</pre>
    <p>Please present your QR code at the venue.</p>
  `;

  await sendEmail({ to: userEmail, subject, html });
};
