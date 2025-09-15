const mailgun = require("mailgun-js");
const { mailgunApi, mailgunDomain } = require("../config");

class EmailCtrl {
  constructor() {
    this.mg = mailgun({ apiKey: mailgunApi, domain: mailgunDomain });
    this.logoUrl =
      '<img src="https://kadeda.kdsg.gov.ng/logo.png" alt="Kaduna State Logo" style="width: auto; height: 100px;">';
  }

  getFooter() {
    const currentYear = new Date().getFullYear();
    return `
        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f7f7f7; border-top: 1px solid #ddd;">
            <p style="color: #555; font-size: 14px; line-height: 1.5;">
                Need help? Contact our support team at 
                <a href="mailto:support@kadeda.kdsg.gov.ng" style="color:#2cbeef; text-decoration: none;">
                    support@kadeda.kdsg.gov.ng
                </a><br>
                Visit our website: 
                <a href="https://kadeda.kdsg.gov.ng" style="color:#2cbeef; text-decoration: none;">
                    kadeda.kdsg.gov.ng
                </a><br>
                © ${currentYear} Kaduna State Government (KADEDA). All rights reserved.
            </p>
        </div>`;
  }

  // Welcome email for enumerators
  async welcomeEmailEnumerator(email) {
    console.log("welcomeEmailEnumerator was called");

    let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center;">${this.logoUrl}</div>
            <h2 style="color: #333; text-align: center;">Welcome to KADEDA Grant Platform</h2>
            <h3 style="color: #2cbeef; text-align: center; font-weight: normal;">Kaduna State Government</h3>
            <p style="color: #555;">Hello,</p>
            <p style="color: #555;">
                Welcome to the Kaduna State Enterprise Development Agency (KADEDA) grant platform. Below are your account credentials:
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                    <h3 style="background-color:#2cbeef; color: white; padding: 10px; border-radius: 5px;">**********</h3>
                    <p style="font-style: italic;">For security, you will be required to change this password upon first login.</p>
                </div>
            </div>
            <p style="color: #555;">As an enumerator, you will log in via the mobile app and can only capture data.</p>
            <p style="color: #555;">Best regards,<br>The KADEDA Team</p>
            ${this.getFooter()}
        </div>`;

    const emailData = {
      from: `Kaduna State Government (KADEDA) <no-reply@mailer.africaudio.ng>`,
      to: email,
      subject: "Welcome to KADEDA Grant Platform",
      html,
    };

    // await this.mg.messages().send(emailData);
    try {
      const response = await this.mg.messages().send(emailData);
      console.log("Mailgun response:", response);
      return response;
    } catch (error) {
      console.error("Mailgun send error:", error);
      throw error;
    }
  }

  async welcomeApplicants(email) {
    console.log("welcomeApplicants was called");

    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <div style="text-align: center;">${this.logoUrl}</div>
      <h2 style="color: #333; text-align: center;">Welcome to KADEDA Grant Platform</h2>
      <h3 style="color: #2cbeef; text-align: center; font-weight: normal;">Kaduna State Government</h3>
      
      <p style="color: #555;">Dear Applicant,</p>
      
      <p style="color: #555;">
        Welcome to the <strong>Kaduna State Enterprise Development Agency (KADEDA) Grant Platform</strong>.
        We are excited to have you on board as you begin your application journey.
      </p>

      <p style="color: #555;">
        Please look out for follow-up emails that will guide you through the next steps 
        of your registration and application process. Make sure to check your inbox 
        (and spam folder just in case) so you don’t miss any important updates.
      </p>

      <p style="color: #555;">
        If you have any questions, feel free to reach out to our support team.
      </p>

      <p style="color: #555;">Best regards,<br>The KADEDA Team</p>
      ${this.getFooter()}
    </div>`;

    const emailData = {
      from: `Kaduna State Government (KADEDA) <no-reply@mailer.africaudio.ng>`,
      to: email,
      subject: "Welcome to KADEDA Grant Platform",
      html,
    };

    try {
      const response = await this.mg.messages().send(emailData);
      console.log("Mailgun response:", response);
      return response;
    } catch (error) {
      console.error("Mailgun send error:", error);
      throw error;
    }
  }

  // Verify email with OTP
  async verifyEmailEnumerator(email, otp) {
    let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center;">${this.logoUrl}</div>
            <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
            <h3 style="color:#2cbeef; text-align: center; font-weight: normal;">Kaduna State Government (KADEDA)</h3>
            <p style="color: #555;">Hello,</p>
            <p style="color: #555;">Thank you for registering with the KADEDA Grant Application Platform. Please use the verification code below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
                    <p>Your verification code is:</p>
                    <h2 style="background-color:#2cbeef; color: white; padding: 15px; border-radius: 5px; letter-spacing: 5px;">${otp}</h2>
                    <p style="color: #777; font-size: 13px;">This code will expire in 10 minutes</p>
                </div>
            </div>
            <p style="color: #555;">If you didn't request this, please ignore this email.</p>
            <p style="color: #555;">Best regards,<br>The KADEDA Team</p>
            ${this.getFooter()}
        </div>`;

    const emailData = {
      from: `Kaduna State Government (KADEDA) <no-reply@mailer.africaudio.ng>`,
      to: email,
      subject: "Verify Your KADEDA Account",
      html,
    };

    await this.mg.messages().send(emailData);
  }

  // Password reset for enumerators
  async forgetPasswordEnumerator(email, code) {
    let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center;">${this.logoUrl}</div>
            <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
            <h3 style="color:#2cbeef; text-align: center; font-weight: normal;">Kaduna State Government (KADEDA)</h3>
            <p style="color: #555;">We received a request to reset your password. Use the code below:</p>
            <div style="text-align: center; margin: 20px 0;">
                <h3 style="background-color:#2cbeef; color: white; padding: 10px; border-radius: 5px;">${code}</h3>
            </div>
            <p style="color: #555;">This code will expire in 15 minutes. If you didn’t request it, ignore this message.</p>
            <p style="color: #555;">Best regards,<br>The KADEDA Team</p>
            ${this.getFooter()}
        </div>`;

    const emailData = {
      from: `Kaduna State Government (KADEDA) <no-reply@mailer.africaudio.ng>`,
      to: email,
      subject: "KADEDA Password Reset Request",
      html,
    };

    await this.mg.messages().send(emailData);
  }

  async applicationStartedEmail(email, applicationNumber) {
    let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center;">${this.logoUrl}</div>
            <h2 style="color: #333; text-align: center;">Your Application Has Been Started</h2>
            <h3 style="color:#2cbeef; text-align: center; font-weight: normal;">Kaduna State Government (KADEDA)</h3>
            
            <p style="color: #555;">Hello,</p>
            <p style="color: #555;">
                Thank you for registering with the Kaduna State Enterprise Development Agency (KADEDA) grant platform. 
                We are pleased to inform you that your application process has been initiated.
            </p>
            
            <div style="text-align: center; margin: 20px 0;">
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                    <p>Your unique application number is:</p>
                    <h2 style="background-color:#2cbeef; color: white; padding: 15px; border-radius: 5px;">${applicationNumber}</h2>
                    <p style="font-size: 13px; color: #777;">Please keep this number safe. You will use it for tracking and correspondence regarding your application.</p>
                </div>
            </div>
            
            <p style="color: #555;">Next Steps:</p>
            <ul style="color: #555; line-height: 1.6;">
                <li>Log in to your account and complete all required fields.</li>
                <li>Ensure that your documents are uploaded correctly.</li>
                <li>Monitor your application status regularly.</li>
            </ul>
            
            <p style="color: #555;">Best regards,<br>The KADEDA Team</p>
            ${this.getFooter()}
        </div>`;

    const emailData = {
      from: `Kaduna State Government (KADEDA) <no-reply@mailer.africaudio.ng>`,
      to: email,
      subject: "KADEDA Application Started",
      html,
    };

    await this.mg.messages().send(emailData);
  }
}

module.exports = new EmailCtrl();
