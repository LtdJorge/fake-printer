const Net = require('net');

const port = 8100;
const config = require('./config.json');

const server = new Net.Server();

server.listen(port, () => console.log("Test printer listening"));

server.on('connection', socket => {
    console.log('[Impresora]> Impresora conectada');

    socket.on('data', chunk => {
        console.log('[Impresora]> Received chunk: '+chunk.toString('latin1'));
    });

    socket.on('end', () => {
        console.log('[Impresora]> Impresora desconectada');
    });

    socket.on('error', err => console.error(`[Impresora]> Error: ${err}`));
});