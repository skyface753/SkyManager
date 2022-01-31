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
3.  Run "docker-compose up -d"
```yaml
version: "3.2"
services:
  skymanager-backend:
    image: skyface753/skymanager
    ports:
      - 8080:80
    volumes:
      - ./uploads:/usr/src/app/uploads
    environment:
      DB_HOST: db                     
      DB_USER: dbUser
      DB_PASSWORD: dbPass
      DB_NAME: dbName
      MASTER_KEY: MasterKey
      FRONTEND_URL: "http://<your IP or DNS>:80" #URL to the FrontEnd
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

    DB_HOST || 'db',
    DB_USER || 'userSkyManager',
    DB_PASSWORD || "example",
    DB_NAME || 'SkyManager',
    MASTER_KEY || 'VQeR0Li42T'
    SMTP_HOST 
    SMTP_PORT
    SMTP_USER
    SMTP_PASSWORD
    SMTP_SECURE || false
    SMTP_SENDER || SMTP_USER
    IMAP_USER
    IMAP_PASSWORD
    IMAP_HOST
    IMAP_PORT
    IMAP_TLS || false
    INSTANCE_URL || null
    FRONTEND_URL || null    // Sets the URL for Send-Mailer

## SkyManager-Frontend

    BACKEND_URL || null     // User wont be asked for the url (Just asked for Username and Password)

## Encryption
MASTER_KEY to encrypt the database. 
<span style="color:red">*DONT REPLACE THIS KEY WHEN ALREADY SET*</span>.

## First Login
Username:   admin <br>
Password:   SkyManager

## Datas
db: /var/lib/mysql <br>
Backend: /usr/src/app/uploads


# Development
## Debug
docker-compose -f docker-compose-debug.yml up

## Test
docker-compose -f docker-compose-test.yml build <br>
docker-compose -f docker-compose-test.yml up

## Prod
docker-compose -f docker-compose up -d

# DEMO
demo.skymanager.net (Frontend) <br>
demo-backend.skymanager.net (Backend)

## Recreate the Backend and the Database for Demo every 10 Minutes:
(cd /home/skyface/SkyManager-Demo/; docker-compose stop skymanager-demo-backend; docker-compose stop db; rm -r DbDataNeu/*; docker-compose start db; sleep 10s; docker-compose start skymanager-demo-backend)

# Feedback
In App you can send Feedback to the Developer.
"Feedback" to Sentry
"Send Feedback" to wiredash


# Android
<!-- ![alt text](https://github.com/skyface753/SkyManager/blob/master/Images/Android-Screenshots/Login.jpg) -->
