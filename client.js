const Net = require('net');
const RedisMQ = require('rsmq');
const RSMQWorker = require('rsmq-worker');

const port = 9100;
const config = require('./config.json');
const queueName = 'PrinterQueue';

const client = new Net.Socket();
const worker = new RSMQWorker(queueName);

/*
const queue = new RedisMQ({options: {
    path: '/var/run/redis/redis-server.sock'
}});
 */


client.on('connect', () => console.log('Connected'));
client.on('error', (err) => console.log(err));

//client.connect(config.printer.port, config.printer.address,
client.connect(8100, '127.0.0.1',
    () => {
        console.log('[Cliente]> Cliente conectado');
        worker.start()
    });

worker.on('message', (message, next, id) => {
    console.log(`[Cliente]> Borrando mensaje con id: ${message.id}`);
    const buff = Buffer.from(JSON.parse(message).printJob(), 'latin1');
    client.write(buff);
    worker.del(id);
    next();
});

/*
function loop(){
    while(true){
        queue.receiveMessage({qname: queueName})
        .then((message) => {
            console.log(`[Cliente]> Borrando mensaje con id: ${message.id}`);
            const buff = Buffer.from(JSON.parse(message.message).printJob(), 'latin1');
            client.write(buff);
            queue.deleteMessage({qname: queueName, id: message});
        })
        .catch((err) => console.log(err));
    }
}
 */

let q  = queue.createQueue({qname: queueName}).then();


//loop();