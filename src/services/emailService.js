import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

const isConfigured = () => Boolean(SERVICE_ID && PUBLIC_KEY && TEMPLATE_ID);

/**
 * Core send function — uses a single master template.
 * The template uses {{subject}}, {{candidate_name}}, {{message}}, {{to_email}}.
 */
const send = async ({ toEmail, candidateName, subject, message }) => {
  if (!isConfigured()) {
    console.warn('[EmailJS] Not configured — skipping email. Add VITE_EMAILJS_* keys to .env');
    return;
  }
  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: toEmail,
        candidate_name: candidateName,
        subject,
        message,
        name: 'HireZone Hiring Team',  // → {{name}} From Name in your template
        email: toEmail,               // → {{email}} Reply To in your template
      },
      PUBLIC_KEY
    );
    console.log(`[EmailJS] ✓ Sent "${subject}" → ${toEmail}`);
  } catch (err) {
    // Never crash the app on email failure
    console.error('[EmailJS] Failed to send email:', err);
  }
};

/**
 * Sends when HR selects a candidate and moves them to the first interview stage.
 */
export const sendStageAdvancedEmail = ({ candidateName, toEmail, jobTitle, stageName }) =>
  send({
    toEmail,
    candidateName,
    subject: `You've been selected — ${stageName} | ${jobTitle}`,
    message: `You have been selected to proceed in the hiring process for the role of ${jobTitle} at HireZone.\n\nYour next step: ${stageName}\n\nOur team will be in contact with further details about the schedule and format.`,
  });

/**
 * Sends when a candidate is marked as Hired.
 */
export const sendHiredEmail = ({ candidateName, toEmail, jobTitle, startDate, offerNotes }) =>
  send({
    toEmail,
    candidateName,
    subject: `Congratulations! You've been hired — ${jobTitle}`,
    message: `We are thrilled to offer you the position of ${jobTitle} at HireZone. 🎉\n\nStart Date: ${startDate || 'To be confirmed'}\n\n${offerNotes || 'Our HR team will be in touch with your onboarding details.'}\n\nWelcome to the team!`,
  });

/**
 * Sends when a candidate is marked as Failed/Rejected.
 */
export const sendRejectedEmail = ({ candidateName, toEmail, jobTitle }) =>
  send({
    toEmail,
    candidateName,
    subject: `Update on your application — ${jobTitle}`,
    message: `Thank you for taking the time to apply for the ${jobTitle} position at HireZone and for going through our interview process.\n\nAfter careful consideration, we have decided not to move forward with your application at this time.\n\nWe truly appreciate your interest and encourage you to apply for future openings that match your profile.\n\nWishing you all the best!`,
  });

/**
 * Sends when a candidate's feedback is published by an interviewer.
 */
export const sendFeedbackPublishedEmail = ({ candidateName, toEmail, jobTitle, stageName }) =>
  send({
    toEmail,
    candidateName,
    subject: `Interview feedback available — ${stageName} | ${jobTitle}`,
    message: `Your interviewer has submitted feedback for your ${stageName} interview for the role of ${jobTitle}.\n\nOur hiring team will review the feedback and be in touch with next steps shortly.`,
  });

/**
 * Sends a welcome / application received confirmation.
 */
export const sendCandidateWelcomeEmail = ({ candidateName, toEmail, jobTitle }) =>
  send({
    toEmail,
    candidateName,
    subject: `Application received — ${jobTitle}`,
    message: `Thank you for applying for the ${jobTitle} position at HireZone.\n\nWe have received your application and our team will review it. If you are selected, you will receive an email with next steps.\n\nThank you for your interest!`,
  });
