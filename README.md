## SkyManager-Backend

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
MASTER_KEY ist to encrypt the database. 
<span style="color:red">*DONT REPLACE THIS KEY WHEN ALREADY SET*</span>.

## First Login
Username:   admin
Password:   SkyManager


# Development
## Debug
docker-compose -f docker-compose-debug.yml up

## Test
docker-compose -f docker-compose-test.yml build
docker-compose -f docker-compose-test.yml up

## Prod
/bin/bash "Build and Push.sh"
docker-compose -f docker-compose up

# DEMO
demo.skymanager.net (Frontend)
demo-backend.skymanager.net (Backend)

## Recreate the Backend and the Database for Demo every 10 Minutes:
(cd /home/skyface/SkyManager-Demo/; docker-compose stop skymanager-demo-backend; docker-compose stop db; rm -r DbDataNeu/*; docker-compose start db; sleep 10s; docker-compose start skymanager-demo-backend)


# Android
![alt text](https://github.com/skyface753/SkyManager/blob/master/Images/Android-Screenshots/Login.jpg)
