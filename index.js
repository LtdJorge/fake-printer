const Net = require('net');
const pm2 = require('pm2');

const port = 9100;
const config = require('./config.json');

const server = new Net.Server();

function errorOut(err){
    console.error(`[Servidor]> Server error: ${err}`);
    pm2.connect(err1 => console.error(err1));
    pm2.restart('index', (err1) => {
        if (err1) console.error(err1);
    });
}

server.on('connection', socket => {

    const remoteSocket = new Net.Socket();

    remoteSocket.connect(config.printer.port, config.printer.address);

    socket.on('connect', ()=> {
        console.log('[Servidor]> Servidor conectado');
    });

    socket.on('data', chunk => {
         remoteSocket.write(chunk, () => {
            remoteSocket.write(chunk, () => {
                remoteSocket.write(chunk, () => {
                    console.log('[Servidor]> Enviadas 3 copias');
                });
            });
        });
    });
    socket.on('error', err => errorOut(err));
    remoteSocket.on('error', err => errorOut(err));
});

//TCP server
server.listen(port, () => console.log(`[Servidor]> Escuchando en puerto: ${port}`));