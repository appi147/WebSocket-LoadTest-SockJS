# Load Testing a WebSocket app with Apache Jmeter

## Installation of Apache Jmeter

- Download Apache Jmeter from [https://jmeter.apache.org/download_jmeter.cgi](https://jmeter.apache.org/download_jmeter.cgi)

- Extract and Add `bin` folder to Path in environment variables.

## Pre-requisites for running WebSocket App

- JDK 21
- IDE (optional)

## How HTTPS and WSS is enabled in local

1. Create a self-signed certificate and place it in `src/main/resources`
    ```shell
    keytool -genkeypair -alias springboot -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore keystore.p12 -validity 3650
    ```
2. Configure application.properties
    ```properties
    server.port=8443
    server.ssl.key-store=classpath:keystore.p12
    server.ssl.key-store-password=your-password
    server.ssl.key-store-type=PKCS12
    server.ssl.key-alias=springboot
   ```
3. Generate certificate in `ui` directory
    ```shell
   openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost-cert.pem -days 365 -nodes
   ```
4. Update `vite.config.js`
    ```
    // previous imports
    import fs from 'fs';
    
    export default defineConfig({
        // other config
        server: {
            https: {
                key : fs.readFileSync('./localhost-key.pem'),
                cert: fs.readFileSync('./localhost-cert.pem'),
            },
        }
    })
    ```
5. Run app with `HTTPS=true npm run dev`
