import uuid from '@lukeed/uuid';
import Net from 'net';
import pm2 from 'pm2';
import bonjour, { ServiceType } from '@homebridge/ciao';
import config from './config.json';

const port = 9100;
const host = '192.168.1.91';
const server = new Net.Server();

const responder = bonjour.getResponder();

const service = responder.createService({
    name: 'POS-80 Proxy',
    type: ServiceType.PRINTER,
    hostname: 'pos80proxy',
    txt: {
        'product': 'POS-80 Proxy',
        'rp': 'auto',
        'adminurl': 'http://pos80proxy.local:80/',
        'pdl': 'raw',
        'usb_mfg': 'Approx',
        'usb_mdl': 'POS-80C',
        'txtvers': '1',
        'ty': 'Approx POS-80C',
        'priority': '50',
        'uuid': uuid.v4(),
        'note': 'Impresora cocina'
    },
    disabledIpv6: true,
    port: 9100
});

function errorOut(err, isServer) {
    const now = new Date();
    if (isServer) {
        console.error(
            `[Server]> ${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()} Error in server: ${err}`
        );
    } else {
        console.error(
            `[Client]> ${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()} Error in client: ${err}`
        );
    }
    pm2.connect(err1 => console.error(err1));
    pm2.restart('index', err1 => {
        if (err1) console.error(err1);
    });
}

function delayFunction(fun, timeout, socket, chunk, iterator) {
    setTimeout(fun, timeout, socket, chunk, iterator);
}

function printServerMessage(msg) {
    const now = new Date();
    console.log(`[Server]> ${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()} ${msg}`);
}

function printSocketMessage(msg) {
    const now = new Date();
    console.log(`[Client]> ${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()} ${msg}`);
}

function writeDataToSocket(socket, chunk, iterator) {
    if (iterator === 0) {
        socket.end();
        return;
    }
    printSocketMessage(`Sending copy: ${iterator}`);
    socket.write(chunk, () => {
        delayFunction(writeDataToSocket, 50, socket, chunk, iterator - 1);
    });
}

server.on('connection', socket => {
    printServerMessage('Server connected');
    printServerMessage(JSON.stringify(server.address()));

    const remoteSocket = new Net.Socket();

    remoteSocket.connect(config.printer.port, config.printer.address);

    socket.on('data', chunk => {
        writeDataToSocket(remoteSocket, chunk, config.printer.numberOfCopies);
    });

    socket.on('error', err => errorOut(err, true));

    socket.on('end', () => printServerMessage('Closing connection'));

    socket.on('close', () => printServerMessage('Closing socket'));

    remoteSocket.on('error', err => errorOut(err, false));
});

server.on('listening', console.log);

server.on('error', err => {
    errorOut(err, true);
    exit().then(r => r);
});

//TCP server
server.listen({ port, host }, () => {
        service.advertise().then(() => {
            printServerMessage('Announcing Bonjour service');
        });
        printServerMessage(`Listening on port: ${port}`);
    }
);

process.on('SIGINT', () => {
    exit().then(r => r);
});

async function exit() {
    await service.end();
    printServerMessage('Stopping Bonjour service announcement');
    await service.destroy();
    await responder.shutdown();
    await server.close(err => {
        if (err) errorOut(err);
        printServerMessage('Closing server');
    });
    process.exit();
}
