const EMAILJS_CONFIG = {
  serviceId: 'service_0od3tyo',
  templateId: 'template_cwipfdc',
  publicKey: 'SKoJDpKyhviN9MWEQ',
  endpoint: 'https://api.emailjs.com/api/v1.0/email/send',
};

export function getDestinationEmail(accountId) {
  const normalized = String(accountId).trim().toLowerCase();
  if (normalized === '002' || normalized === '2' || normalized.endsWith('02')) {
    return 'cami.ubuwon.sjc@phinmaed.com';
  }
  return 'vhma.nacion.sjc@phinmaed.com';
}

export async function sendVerificationOTP(accountId, otpCode) {
  const recipientEmail = getDestinationEmail(accountId);

  const payload = {
    service_id: EMAILJS_CONFIG.serviceId,
    template_id: EMAILJS_CONFIG.templateId,
    user_id: EMAILJS_CONFIG.publicKey,
    template_params: {
      to_email: recipientEmail,
      account_id: accountId,
      otp_code: otpCode,
    },
  };

  const response = await fetch(EMAILJS_CONFIG.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to dispatch 2FA verification email.');
  }

  return true;
}