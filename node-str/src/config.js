global.SALT_KEY = process.env.SALT_KEY;
global.EMAIL_TMPL = process.env.EMAIL_TMPL;

module.exports = {
  connectionString: process.env.CONNECTION_STRING,
  sendgridKey: process.env.SEND_GRID_KEY,
  containerConnectionString: process.env.CONTAINER_CONNECTION_STRING,
};
