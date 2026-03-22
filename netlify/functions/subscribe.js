const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  let email, zipcode;
  try {
    ({ email, zipcode } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid request body' }) };
  }

  if (!email || !zipcode) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Email and zip code are required' }) };
  }

  if (!/^\d{5}$/.test(String(zipcode))) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Please enter a valid 5-digit zip code' }) };
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Please enter a valid email address' }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Generate verification token
  const token = crypto.randomBytes(32).toString('hex');

  // Insert into waitlist (ignore if email already exists)
  const { error: dbError } = await supabase
    .from('landing_waitlist')
    .upsert({ email, zipcode: parseInt(zipcode), token, verified: false }, { onConflict: 'email', ignoreDuplicates: false });

  if (dbError) {
    console.error('Supabase error:', dbError);
    return { statusCode: 500, body: JSON.stringify({ message: 'Could not save your signup. Please try again.' }) };
  }

  // Send verification email
  const verifyUrl = `https://tresorhunt.com/.netlify/functions/verify?token=${token}`;

  const { error: emailError } = await resend.emails.send({
    from: 'Tresor Hunt <hello@tresorhunt.com>',
    to: email,
    subject: 'Confirm your spot on the Tresor Hunt waitlist ✦',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#0d0d1a;font-family:'Helvetica Neue',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 20px;">
          <tr><td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;border:1px solid rgba(255,217,61,0.2);overflow:hidden;max-width:100%;">
              <!-- Header -->
              <tr>
                <td style="background:#0d0d1a;padding:32px;text-align:center;border-bottom:1px solid rgba(255,217,61,0.15);">
                  <p style="font-family:'Courier New',monospace;font-size:2rem;color:#FFD93D;letter-spacing:8px;margin:0;">TRESOR</p>
                  <p style="font-size:0.6rem;letter-spacing:6px;color:#FF6B6B;margin:4px 0 0;">H U N T</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;text-align:center;">
                  <p style="font-size:2rem;margin:0 0 16px;">✦</p>
                  <h1 style="color:#FFD93D;font-size:1.5rem;font-weight:900;letter-spacing:1px;margin:0 0 12px;">You're almost in.</h1>
                  <p style="color:rgba(232,232,240,0.7);font-size:1rem;line-height:1.6;margin:0 0 32px;">
                    Click below to confirm your spot on the waitlist. We'll let you know the moment we launch near zip code <strong style="color:#FFD93D;">${zipcode}</strong>.
                  </p>
                  <a href="${verifyUrl}" style="display:inline-block;background:#FFD93D;color:#0d0d1a;text-decoration:none;font-weight:900;font-size:1rem;letter-spacing:2px;padding:16px 36px;border-radius:10px;">
                    CONFIRM MY SPOT
                  </a>
                  <p style="color:rgba(232,232,240,0.3);font-size:0.75rem;margin:24px 0 0;line-height:1.5;">
                    Or copy this link: <br>
                    <span style="color:rgba(255,217,61,0.5);word-break:break-all;">${verifyUrl}</span>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;text-align:center;border-top:1px solid rgba(255,217,61,0.1);">
                  <p style="color:rgba(232,232,240,0.3);font-size:0.75rem;margin:0;">
                    You're receiving this because you signed up at tresorhunt.com.<br>
                    If this wasn't you, you can ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });

  if (emailError) {
    console.error('Resend error:', emailError);
    // Signup saved, but email failed — still return success to user, log internally
    return { statusCode: 200, body: JSON.stringify({ message: 'Signed up! (Email delivery issue — contact hello@tresorhunt.com)' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success! Check your inbox to confirm your spot.' }),
  };
};
