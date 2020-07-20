const Net = require('net');

const port = 9100;
const config = require('./config.json');
const { Console } = require('console');
const queueName = 'PrinterQueue';

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

    let count = 0;
    const buffEnd = new Buffer.from([0x1B,0x40,0x1D,0x56,0x1]);

    socket.on('data', chunk => {
        /* if(!count){
            //console.log('[Servidor]> Enviando ' + chunk.toString("latin1"));
            //let data = Buffer.concat([chunk, buffEnd]);*/
            
             remoteSocket1.write(chunk, () => {
                remoteSocket1.write(chunk, () => {
                    remoteSocket1.write(chunk, () => {
                        console.log('[Servidor]> Enviadas 3 copias');
                    });
                });
            });            
            /*count++;
        } else{
            count = 0;
        } */
    });
    /*****/socket.on('error', err => console.error(`[Servidor]> SServer error: ${err}`));
    remoteSocket1.on('error', err => console.error(`[Servidor]> Socket1 error: ${err}`));
    remoteSocket2.on('error', err => console.error(`[Servidor]> Socket2 error: ${err}`));
    remoteSocket3.on('error', err => console.error(`[Servidor]> Socket3 error: ${err}`));
})



//TCP server
server.listen(port, () => console.log(`[Servidor]> Escuchando en puerto: ${port}`));