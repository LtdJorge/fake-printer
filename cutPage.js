const socket = new require('net').Socket();

socket.connect(9100, '192.168.0.12');

function exit() {
    process.exit();
}

socket.write(new Buffer.from([0x1b, 0x40, 0x1d, 0x56, 0x48]), exit);
