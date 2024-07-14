const RELAYER_API_URL = 'https://relayerapi.emailwallet.org';

export async function createAccount(email: string): Promise<string> {
  const response = await fetch(`${RELAYER_API_URL}/api/createAccount`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_addr: email }),
  });
  const textResponse = await response.text();
  console.log(`zkEmail createAccount response for ${email}:`, textResponse);
  return textResponse != '0x' ? textResponse : '';
}

export async function isAccountCreated(email: string): Promise<boolean> {
  const response = await fetch(`${RELAYER_API_URL}/api/isAccountCreated`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_addr: email }),
  });
  const text = await response.text();
  console.log(`zkEmail isAccountCreated response for ${email}`, text);
  return text == 'true';
}

export const recoverAccountCode = async (email: string): Promise<string> => {
  const response = await fetch(`${RELAYER_API_URL}/api/recoverAccountCode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email_addr: email }),
  });
  const data = await response.text();
  return data
    ? 'Account key recovery email sent'
    : 'Failed to send account key recovery email';
};
