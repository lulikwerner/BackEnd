import nodemailer from 'nodemailer'

import config from '../../config.js'
import { generateMailTemplate } from '../../utils.js'
import DMailInfo from '../../constants/DMailInfo.js'

export default class MailingServices {

  constructor() {
    this.mailer = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      auth: {
        user: config.app.email,
        pass: config.app.password
      }
    })
  }

  sendMail = async (emails, template, payload) => {
    const mailInfo = DMailInfo[template];
    const html = await generateMailTemplate(template, payload);
    const result = await this.mailer.sendMail({
      from: 'Luli Store <config.app.email>',
      to: emails,
      html,
      ...mailInfo
    })
    return result;
  }

}