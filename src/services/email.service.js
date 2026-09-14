import transporter from '../config/mailer.js';

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Jodhpur Voyage" <no-reply@jodhpurvoyage.com>',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('📧 Error sending email:', error.message);
    // Don't throw fatal error on email failure so main transaction proceeds
    return null;
  }
};

export const sendBookingConfirmationEmail = async (booking) => {
  const subject = `Booking Confirmation - ${booking.bookingNumber} | Jodhpur Voyage`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #0f3460;">Padharo Mhare Desh! 🙏</h2>
      <p>Dear <strong>${booking.customerName}</strong>,</p>
      <p>Thank you for choosing <strong>Jodhpur Voyage</strong>. Your tour reservation is confirmed!</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #16213e;">Booking Summary</h3>
        <p><strong>Booking ID:</strong> ${booking.bookingNumber}</p>
        <p><strong>Tour Package:</strong> ${booking.tourTitle}</p>
        <p><strong>Travel Date:</strong> ${new Date(booking.travelDate).toLocaleDateString()}</p>
        <p><strong>Guests:</strong> ${booking.guests?.adults || 1} Adults${booking.guests?.children ? `, ${booking.guests.children} Children` : ''}</p>
        <p><strong>Total Amount:</strong> ₹${booking.totalAmount?.toLocaleString('en-IN')}</p>
        <p><strong>Payment Status:</strong> <span style="color: green; font-weight: bold;">${booking.paymentStatus}</span></p>
      </div>

      <p>Our lead travel guide will connect with you 24 hours prior to departure.</p>
      <p>Warm Regards,<br/><strong>Team Jodhpur Voyage</strong></p>
    </div>
  `;

  return sendEmail({
    to: booking.customerEmail,
    subject,
    html
  });
};

export const sendEnquiryNotificationEmail = async (enquiry) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@jodhpurvoyage.com';
  const subject = `New Lead / Enquiry: ${enquiry.type} from ${enquiry.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3>New Lead Received on Jodhpur Voyage</h3>
      <p><strong>Name:</strong> ${enquiry.name}</p>
      <p><strong>Email:</strong> ${enquiry.email}</p>
      <p><strong>Phone:</strong> ${enquiry.phone}</p>
      <p><strong>Type:</strong> ${enquiry.type}</p>
      <p><strong>Message:</strong> ${enquiry.message}</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    html
  });
};
