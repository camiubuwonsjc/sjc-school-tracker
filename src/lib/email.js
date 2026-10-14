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
  const now = new Date();
  const validTill = new Date(now.getTime() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const payload = {
    service_id: EMAILJS_CONFIG.serviceId,
    template_id: EMAILJS_CONFIG.templateId,
    user_id: EMAILJS_CONFIG.publicKey,
    template_params: {
      to_email: recipientEmail, email: recipientEmail, recipient: recipientEmail,
      account_id: accountId, account: accountId, user_id: accountId,
      to_name: accountId === 'admin' ? 'Supervisor' : 'Staff Member',
      otp_code: otpCode, otp: otpCode, code: otpCode, passcode: otpCode,
      time: validTill, valid_until: validTill, expiry: validTill
    },
  };
  await fetch(EMAILJS_CONFIG.endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  return true;
}