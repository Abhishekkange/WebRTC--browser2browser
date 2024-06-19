const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = 3400;

// Serve the HTML file
app.use(express.static('public'));

const server = app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
