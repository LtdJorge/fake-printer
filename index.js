const Net = require('net');

const port = 9100;
const config = require('./config.json');

const server = new Net.Server();

server.on('connection', socket => {
    
    const remoteSocket1 = new Net.Socket();
    const remoteSocket2 = new Net.Socket();
    const remoteSocket3 = new Net.Socket();

    remoteSocket1.connect(config.printer.port, config.printer.address);
    remoteSocket2.connect(config.printer.port, config.printer.address);
    remoteSocket3.connect(config.printer.port, config.printer.address);

    socket.on('connect', ()=> {
        console.log('[Servidor]> Servidor conectado');
    });

    socket.on('data', chunk => {
         remoteSocket1.write(chunk, () => {
            remoteSocket1.write(chunk, () => {
                remoteSocket1.write(chunk, () => {
                    console.log('[Servidor]> Enviadas 3 copias');
                });
            });
        });
    });
    /*****/socket.on('error', err => console.error(`[Servidor]> SServer error: ${err}`));
    remoteSocket1.on('error', err => console.error(`[Servidor]> Socket1 error: ${err}`));
    remoteSocket2.on('error', err => console.error(`[Servidor]> Socket2 error: ${err}`));
    remoteSocket3.on('error', err => console.error(`[Servidor]> Socket3 error: ${err}`));
});

//TCP server
server.listen(port, () => console.log(`[Servidor]> Escuchando en puerto: ${port}`));