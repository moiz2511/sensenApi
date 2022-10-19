// var server = require('../server/server');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

module.exports = {
  // new email 
  sendEmail: (emailParams, cb) => {
    if (emailParams.to == undefined || emailParams.text == undefined)
      cb('data missing');
    else {
      const msg = {
        to: emailParams.to,
        from: 'connect@cindt.com',
        subject: emailParams.subject ? emailParams.subject : 'Mail from sensen',
        text: emailParams.text,
        html: '<strong>' + emailParams.html + '</strong>',
      };
      sgMail.send(msg, cb);
    }
  }
  // new email end *//

}