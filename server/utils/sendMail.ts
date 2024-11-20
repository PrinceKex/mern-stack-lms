require('dotenv').config()
import nodemailer, { Transporter } from 'nodemailer'
import ejs from 'ejs'
import path from 'path'
import { EmailOptions } from '../types/tokenTypes'

const sendMail = async (options: EmailOptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    service: process.env.SMTP_SERVICE,
    //secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  const { email, subject, template, data } = options

  // get the path to the email template file
  const templatePath = path.join(__dirname, '../mails', template)

  // render the email template with the ejs
  const html: string = await ejs.renderFile(templatePath, data)

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject,
    html,
  }

  await transporter.sendMail(mailOptions)
}

export default sendMail
