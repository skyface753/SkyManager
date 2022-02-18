![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/skyface753/skymanager?label=docker%20build%20backend)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/skyface753/skymanager-frontend?label=docker%20build%20frontend)

![Titelbild](https://github.com/skyface753/SkyManager/blob/main/Images/Icons/SkyManager-Titelbild-Without-Background.png)

# Setup

## Setup
1. Create docker-compose.yml file from below or Clone the Repo
2. Change the environment variables in the docker-compose.yml file:
   1. DB_USER
   2. DB_PASSWORD
   3. DB_NAME
   4. <span style="color:red">MASTERKEY (Don't change these key) </span>
   5. FRONTEND_URL (If you want to send Mails with Links to Tickets)
   6. BACKEND_URL (Autofills the url in Browser)
   7. MYSQL_ROOT_PASSWORD (in db Service and the Healthcheck)
   8. MYSQL_DATABASE
   9. MYSQL_USER
   10. MYSQL_PASSWORD
3. If you want to use SSL, you need to use an official SSL certificate. (Self-Signed Certificates are not allowed by Frontend)
   1. Copy the certificate and key into a folder like "ssl-certs"
   2. Add Volume to docker-compose.yml:
      - "./ssl-certs:/usr/src/app/sslcert"
   3. Change the environment variables in the docker-compose.yml file:
      1. SSL_CERT -> "Name of the certificate file.cert"
      2. SSL_KEY -> "Name of the key file.key"
4.  Run "docker-compose up -d"
```yaml
version: "3.2"
services:
  skymanager-backend:
    image: skyface753/skymanager
    ports:
      - 8080:80
      - 8443:443 # Only needed if you want to use SSL
    volumes:
      - ./uploads:/usr/src/app/uploads
      - ./ssl-certs:/usr/src/app/sslcert # Only needed if you want to use SSL
    environment:
      DB_HOST: db                     
      DB_USER: dbUser
      DB_PASSWORD: dbPass
      DB_NAME: dbName
      MASTER_KEY: MasterKey
      FRONTEND_URL: "http://<your IP or DNS>:80" #URL to the FrontEnd
      SSL_CERT: "certificate.cert" # Only needed if you want to use SSL
      SSL_KEY: "key.key" # Only needed if you want to use SSL
    restart: always
    depends_on:
      db:
        condition: service_healthy

  skymanager-frontend:
    image: skyface753/skymanager-frontend
    ports:
      - 80:80
    environment:
      BACKEND_URL: "https://<your IP or DNS:8080" #URL to the Backend
    
  db:
    image: mariadb
    restart: always
    volumes:
      - ./DB-Data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: dbRootPw
      MYSQL_DATABASE: dbName
      MYSQL_USER: dbuser
      MYSQL_PASSWORD: dbPass
    healthcheck:
      test: ["CMD", "mysqladmin", "-uroot" , "-pdbRootPw" ,"ping", "-h", "localhost"]
      timeout: 5s
      retries: 10

```
  

# Environment Variables

### SkyManager-Backend

| Required | Variable | Default | Description |
| -------- | -------- | ------- | ----------- |
| Yes | DB_HOST |  | Hostname of the Database |
| Yes | DB_USER |  | Username of the Database |
| Yes | DB_PASSWORD |  | Password of the Database |
| Yes | DB_NAME |  | Name of the Database |
| Yes | MASTER_KEY |  | Key to Encyrpt the Customer-Passwords |
| No  | SMTP_HOST |  | Hostname of the SMTP Server |
| No  | SMTP_PORT |  | Port of the SMTP Server |
| No  | SMTP_USER |  | Username of the SMTP Server |
| No  | SMTP_PASSWORD |  | Password of the SMTP Server |
| No  | SMTP_SECURE | false | Use SSL for the SMTP Server |
| No  | SMTP_SENDER | SMTP_USER | Email-Address of the Sender |
| No  | IMAP_USER |  | Username of the IMAP Server |
| No  | IMAP_PASSWORD |  | Password of the IMAP Server |
| No  | IMAP_HOST |  | Hostname of the IMAP Server |
| No  | IMAP_PORT |  | Port of the IMAP Server |
| No  | IMAP_TLS | false | Use SSL for the IMAP Server |
| No  | FRONTEND_URL |  | URL to the Frontend for Send-Mailer |    
| No  | SSL_KEY |  | Name of the SSL-Key-File |
| No  | SSL_CERT |  | Name of the SSL-Cert-File |

## SkyManager-Frontend

| Required | Variable | Default | Description |
| -------- | -------- | ------- | ----------- |
| No  | BACKEND_URL |  | URL to the Backend for Autofill |

## Encryption
MASTER_KEY to encrypt the database. 
<span style="color:red">*DONT REPLACE THIS KEY WHEN ALREADY SET*</span>.

## First Login
Username:   admin <br>
Password:   SkyManager

## Datas
db: <br>
/var/lib/mysql <br><br>
Backend: <br>
/usr/src/app/uploads<br>
/usr/src/app/sslcert<br>


# Development
## Debug
docker-compose -f docker-compose-debug.yml up -d --build

## Test
docker-compose -f docker-compose-test.yml build <br>
docker-compose -f docker-compose-test.yml up

## Prod
docker-compose -f docker-compose up -d

### Build for Prod MultiArch
docker buildx build --push --platform linux/arm/v7,linux/arm64/v8,linux/amd64 -t skyface753/skymanager ./SkyManager-Backend

# DEMO
[SkyManager-Demo](https://demo.skymanager.net)

## Recreate the Backend and the Database for Demo every 10 Minutes:
(cd /home/skyface/SkyManager-Demo/; docker-compose stop skymanager-demo-backend; docker-compose stop db; rm -r DbDataNeu/*; docker-compose start db; sleep 10s; docker-compose start skymanager-demo-backend)

# Feedback
In App you can send Feedback to the Developer.
"Feedback" to Sentry


<!-- # Android -->
<!-- ![alt text](https://github.com/skyface753/SkyManager/blob/master/Images/Android-Screenshots/Login.jpg) -->
