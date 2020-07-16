const Net = require('net');

const port = 9100;
const config = require('./config.json');

const server = new Net.Server();
const client = new Net.Socket();

server.listen(port, () => console.log(`Server listening on port ${port}`));
server.on('connection', socket => {

    console.log('> Servidor conectado');

    client.connect(config.printers[0].port, config.printers[0].address, () => {
        console.log('Client connected')
    });
    
    let chunkBuffer = [];

    let chunkNumber = 0;
    socket.on('data', chunk => {
        chunkBuffer = chunkBuffer.concat(chunk);
        chunkNumber++
    });
    socket.on('end', () => {
        console.log('> Servidor desconectado');
        console.log(`> Recibidos: ${chunkNumber} chunks`);
        console.log('> Enviando a impresora');
        chunkBuffer.forEach(chunk => {
                await writeAsync(chunk, client);
        });
    });
    socket.on('error', err => console.error(`Error: ${err}`));
})

async function writeAsync(data, client){
    client.write(data);
    
}
/*
async function sendToPrinter(buffer, allPrinters){
    if(allPrinters){
        config.printers.forEach(printer => {
            rawPrint(buffer, printer.numberOfCopies)
        });
    }
}

function rawPrint(buffer, times){
    for(i=0; i<times; i++){
        printer.printText(buffer, {}, )
    }
}*/