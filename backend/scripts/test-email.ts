import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function run() {
  const testEmail = "minhnguyen061104@gmail.com";
  console.log(`Sending test email to ${testEmail}...`);
  
  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID,
    template_id: process.env.EMAILJS_TEMPLATE_ID,
    user_id: process.env.EMAILJS_PUBLIC_KEY,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      to: testEmail,
      subject: "RoSi Home - Test EmailJS Integration",
      body: "Hello Minh Nguyen!\n\nThis is a test email sent directly from the RoSi Home test script to verify that EmailJS is properly configured and working.\n\nIf you receive this, the integration is successful!"
    },
  };

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS API Error: ${response.status} ${errorText}`);
    }
    console.log("✅ Email sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
}

run().catch(console.error);

run().catch(console.error);
