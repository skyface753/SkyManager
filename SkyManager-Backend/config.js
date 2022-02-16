const env = process.env;



const config = {
  ssl:{
    key: env.SSL_KEY || null,
    cert: env.SSL_CERT || null,
  },
  db: {
    host: env.DB_HOST || null,
    user: env.MYSQL_USER || null,
    password: env.MYSQL_PASSWORD || null,
    database: env.MYSQL_DATABASE || null,
  },
  masterkey:{
    key: env.MASTER_KEY || null,
  },
  smtpMail:{
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE || false,  // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
    },
    sender: env.SMTP_SENDER || env.SMTP_USER
  },
  imapMail:{
    user: env.IMAP_USER,
    password: env.IMAP_PASSWORD,
    host: env.IMAP_HOST,
    port: env.IMAP_PORT,
    tls: env.IMAP_TLS || false,
  },
  frontendURL: env.FRONTEND_URL || null,
  showapidocs: env.SHOW_API_DOCS || false,
};


module.exports = config;