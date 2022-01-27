![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/skyface753/skymanager?label=docker%20build%20backend)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/skyface753/skymanager-frontend?label=docker%20build%20frontend)

![Titelbild](https://github.com/skyface753/SkyManager/blob/main/Images/Icons/SkyManager-Titelbild-Without-Background.png)

# Setup
```yaml
version: "3.2"
services:
  skymanager-backend:
    image: skyface753/skymanager
    ports:
      - 8452:80
    environment:
      DB_HOST: db                       
      DB_USER: userSkyManager
      DB_PASSWORD: "DbPassword"
      DB_NAME: SkyManager
      MASTER_KEY: "MasterKey"
      FRONTEND_URL: "http://skymanager.skyface.de:8091"
    restart: always
    depends_on:
      db:
        condition: service_healthy

  skymanager-frontend:
    image: skyface753/skymanager-frontend
    ports:
      - 8091:80
    environment:
      BACKEND_URL: "https://skymanager.skyface.de:8452"
    
  db:
    image: mariadb
    restart: always
    volumes:
      - ./DB-Data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: exampleeee
      MYSQL_DATABASE: SkyManager
      MYSQL_USER: userSkyManager
      MYSQL_PASSWORD: "DbPassword"
    healthcheck:
      test: ["CMD", "mysqladmin", "-uroot" , "-pDbPassword" ,"ping", "-h", "localhost"]
      timeout: 5s
      retries: 10

```


  



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
MASTER_KEY ist to encrypt the database. <br>
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
/bin/bash "Build and Push.sh" <br>
docker-compose -f docker-compose up

# DEMO
demo.skymanager.net (Frontend) <br>
demo-backend.skymanager.net (Backend)

## Recreate the Backend and the Database for Demo every 10 Minutes:
(cd /home/skyface/SkyManager-Demo/; docker-compose stop skymanager-demo-backend; docker-compose stop db; rm -r DbDataNeu/*; docker-compose start db; sleep 10s; docker-compose start skymanager-demo-backend)


# Android
![alt text](https://github.com/skyface753/SkyManager/blob/master/Images/Android-Screenshots/Login.jpg)
