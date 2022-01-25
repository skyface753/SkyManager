const env = process.env;



const config = {
  db: { /* don't expose password or any sensitive info, done only for demo */
    host: env.DB_HOST || null,
    user: env.DB_USER || null,
    password: env.DB_PASSWORD || null,
    database: env.DB_NAME || null,
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
  instanceUrl: env.INSTANCE_URL || null,
  frontendURL: env.FRONTEND_URL || null,
};


module.exports = config;