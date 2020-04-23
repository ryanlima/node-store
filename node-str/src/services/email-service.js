const config = require("../config");
const sendgrid = require("@sendgrid/mail");

sendgrid.setApiKey(config.sendgridKey);

exports.send = async (to, subject, body) => {
  const msg = {
    to,
    from: "yourEmail@gmail.com",
    subject,
    html: body,
  };

  sendgrid
    .send(msg)
    .then(() => {
      console.log("message sent");
    })
    .catch((error) => {
      console.log(error.response.body);
    });
};
