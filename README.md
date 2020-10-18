# Frontend of croco.finance

## Demo video

[comment]: <> (Live project on ropsten testnet: http://btctornado.cash)

https://www.youtube.com/watch?v=kACj6qjLhcE

## Run in the browser

1. Clone the project:

    ```bash
    git clone https://github.com/tbtctornado/frontend.git
    ```

2. Enter the directory and install the dependencies:
    ```bash
    cd frontend
    npm install
    ```
3. Run the project and open [http://localhost:3000](http://localhost:3000) to view it in the browser.
    ```bash
    npm run start
    ```

**Error Note**: If you get an error message saying:

```bash
Module not found: Can't resolve 'worker_threads'
```

then go to the **./node_modules/websnark/src/groth16.js** file and comment the line where **NodeWorker** is initialized - like in the following example. Then run the project again.

```javascript
if (!inBrowser) {
    // NodeWorker = require("worker_threads").Worker;
    NodeCrypto = require('crypto');
}
```

## Get in touch

Join our [Telegram](https://t.me/joinchat/SyRsTU1ruK8YRXAjypaJ8Q) group!

We will answer all questions about the project or help you with building tornado mixer for your own token. Or just come to say hello!
