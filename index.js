const uuid = require('@lukeed/uuid');
const Net = require('net');
const pm2 = require('pm2');
const bonjour = require('@homebridge/ciao')

const port = 9100;
const host = "192.168.1.91"
const config = require('./config.json');

const server = new Net.Server();

const responder = bonjour.getResponder();

const service = responder.createService({
    name: 'POS-80 Proxy',
    type: 'printer',
    host: 'pos80proxy',
    txt: {
      "product":"POS-80 Proxy",
      "rp": "auto",
      "adminurl":"http://pos80proxy.local:80/",
      "pdl":"raw",
      "usb_mfg":"Approx",
      "usb_mdl":"POS-80C",
      "txtvers":"1",
      "ty": "Approx POS-80C",
      "priority":"50",
      "uuid": uuid.v4(),
      "note": "Impresora cocina"
    },
    disabledIpv6: true,
    port: 9100
})

function errorOut(err, isServer) {
    const now = new Date();
    if (isServer) {
        console.error(
            `[Servidor]> ${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()} Error en servidor: ${err}`
        );
    } else {
        console.error(
            `[Cliente]> ${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()} Error en cliente: ${err}`
        );
    }
    pm2.connect(err1 => console.error(err1));
    pm2.restart('index', err1 => {
        if (err1) console.error(err1);
    });
}

function delayFunction(fun, timeout, socket, chunk, iterator){
    setTimeout(fun, timeout, socket, chunk, iterator);
}

function printServerMessage(msg) {
    const now = new Date();
    console.log(`[Servidor]> ${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()} ${msg}`);
}

function printSocketMessage(msg) {
    const now = new Date();
    console.log(`[Cliente]> ${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()} ${msg}`);
}

function writeDataToSocket(socket, chunk, iterator) {
    if (iterator === 0){
        socket.end();
        return;
    }
    printSocketMessage(`Enviando copia: ${iterator}`);
    socket.write(chunk, () => {
        delayFunction(writeDataToSocket, 50, socket, chunk, iterator - 1)
    });
}

server.on('connection', socket => {
    printServerMessage('Servidor conectado');
    printServerMessage(JSON.stringify(server.address()));

    const remoteSocket = new Net.Socket();

    remoteSocket.connect(config.printer.port, config.printer.address);

    // socket.on('connect', () => {
    //     printServerMessage('Servidor conectado');
    // });

    socket.on('data', chunk => {
        writeDataToSocket(remoteSocket, chunk, config.printer.numberOfCopies);
        //     // console.log(chunk.toString('base64'));
        //     // remoteSocket.write(chunk, () => {
        //     //     remoteSocket.write(chunk, () => {
        //     //         remoteSocket.write(chunk, () => {
        //     //             printSocketMessage('Enviadas 3 copias');
        //     //         });
        //     //     });
        //     // });
    });

    // socket.on('data', chunk => {
    //     console.log(chunk.toString('hex'));
    // });

    socket.on('error', err => errorOut(err, true));

    socket.on('end', () => printServerMessage('Cerrando conexion'));

    socket.on('close', () => printServerMessage('Cerrando socket'));

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
            printServerMessage("Anunciando servicio Bonjour");
        });
        printServerMessage(`Escuchando en puerto: ${port}`);
    }
);

process.on('SIGINT', () => {
    exit().then(r => r);
});

async function exit() {
    await service.end()
    printServerMessage("Dejando de anunciar servicio Bonjour");
    await service.destroy();
    await responder.shutdown();
    await server.close(err => {
        if (err) errorOut(err);
        printServerMessage('Cerrando servidor');
    });
    process.exit();
}
