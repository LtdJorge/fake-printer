const Net = require('net');
const pm2 = require('pm2');

const port = 9100;
const config = require('./config.json');

const server = new Net.Server();

function errorOut(err){
    console.error(`[Servidor]> Server error: ${err}`);
    pm2.connect(err1 => console.error(err1));
    pm2.list((err1, processDescriptionList) => {
        //pm2.restart(processDescriptionList[0].name, (err1, proc) => console.log())
        console.log(processDescriptionList[0].name);
    })

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
    socket.on('error', err => console.error(`[Servidor]> SServer error: ${err}`));
    remoteSocket.on('error', err => console.error(`[Servidor]> Socket1 error: ${err}`));
});

//TCP server
server.listen(port, () => console.log(`[Servidor]> Escuchando en puerto: ${port}`));
errorOut('fake error');