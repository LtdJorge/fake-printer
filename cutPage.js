const socket = new require('net').Socket();
socket.connect(9100, '192.168.1.100');
function exit(){
    process.exit();
}
socket.write(new Buffer.from([0x1B,0x40,0x1D,0x56,0x1]), exit );