import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host:'smtp-relay.brevo.com',
    // service: 'gmail',
    port:587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,

        // user:process.env.EMAIL_USER,
        // pass: process.env.EMAIL_PASS,
    }

});

export default transporter;