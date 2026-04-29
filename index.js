import http from 'node:http';
import dotenv from 'dotenv';
import { createApp } from './src/app.js';

dotenv.config();

async function main() {
    const server = http.createServer(createApp());

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    });
}


main();






