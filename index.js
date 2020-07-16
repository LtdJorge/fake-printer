const Net = require('net');
const RedisMQ = require('rsmq-promise');

const port = 9100;
const config = require('./config.json');
const queueName = 'PrinterQueue';

const server = new Net.Server();
const client = new Net.Socket();
const queue = new RedisMQ({options: {
        path: '/var/run/redis/redis-server.sock'
    }});

//Redis queue
queue.createQueue({
    qname: queueName
}).then(done => console.log('[Servidor]> Queue created')).catch(error => console.log(error));

//TCP server
server.listen(port, () => console.log(`Server listening on port ${port}`));

server.on('connection', socket => {

    console.log('[Servidor]> Servidor conectado');
    //TODO: move
    /*client.connect(config.printers[0].port, config.printers[0].address, () => {
        console.log('[Cliente]> Cliente conectado')
    });*/
    
    let chunkBuffer = [];

    let chunkNumber = 0;
    socket.on('data', chunk => {
        chunkBuffer = chunkBuffer.concat(chunk);
        chunkNumber++
    });
    socket.on('end', () => {
        console.log('[Servidor]> Servidor desconectado');
        console.log(`[Servidor]> Recibidos: ${chunkNumber} chunks`);
        console.log('[Servidor]> Enviando a impresora');
        let message = {
            printer: config.printer,
            printJob: chunkBuffer
        }
        console.log(`[Servidor]> ${JSON.stringify(message)}`);
        /*queue.sendMessage({

        })*/
        /*chunkBuffer.forEach(chunk => {
                await writeAsync(chunk, client);
        });*/
    });
    socket.on('error', err => console.error(`[Servidor]> Error: ${err}`));
})

process.on('exit', () => {
    console.log('Exiting...');
    queue.deleteQueue({qname: queueName});
})