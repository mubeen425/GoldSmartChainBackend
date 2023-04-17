// const { SMTPClient, Message } = require("emailjs");
const config = require("config");
const nodemailer = require("nodemailer");

function send(to, subject, text, verifyToken) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.easyname.com',
    port: 465,
    secure: true,
    auth: config.get("mailconf"),
  });
  const message = {
    from: config.get("mailconf.user"),
    to: to,
    subject: subject,
    html: `<html><div style=\"font-family: Arial, sans-serif; color: #333333; background-color: #f5f5f5; padding: 30px;\">
    <div style=\"max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);\">
      <div style=\"padding: 30px;\">
        <img src=\"https://fervent-curie.185-178-192-38.plesk.page/static/media/logo2.d0751e1279e020f8625e.png" alt="Logo" style="display: block; margin: 0 auto; width: 200px; height: 150px;\">
        <h2 style=\"text-align: center; margin-top: 30px; margin-bottom: 0;\">${text=='forgot'?'Reset Your Password':'Verify Your Email'}</h2>
        <p style=\"text-align: center; font-size: 16px;\">${text=='forgot'?'Please click the button below to reset your password:':'Please verify your email address to complete your registration:'}</p>
        <div style=\"text-align: center;\">
          <a href="${config.get("baseurl")}/api/user/${text=='forgot'?'forgotform':'verify'}/${verifyToken}" style=\"display: inline-block; padding: 10px 20px; background-color: #1f88be; color: white; font-size: 16px; text-decoration: none; border-radius: 5px; margin-top: 30px;\">${text=='forgot'?'Reset Password':'Verify Email'}</a>
        </div>
      </div>
      <div style=\"background-color: #1f88be; color: white; text-align: center; padding: 10px; font-size: 14px;\">
        <p style=\"margin: 0;\">If you did not sign up for this service, please disregard this email.</p>
      </div>
    </div>
  </div></html>`
  };

  transporter.sendMail(message, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
}


module.exports = send;
