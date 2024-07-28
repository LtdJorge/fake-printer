const pm2 = require('pm2');

pm2.connect(err => {
    if (err) console.log(err);
    process.exit(2);
});

pm2.start({
    name: 'fake-printer',
    script: './index.js',
    output: './logs/output.log',
    error: './logs/error.log',
    pid: './fake-printer.pid',
    max_restarts: 5,
    interpreter: 'node',
    watch: true
    }, (err, _proc) =>{
        console.error(err);
});

pm2.startup('systemd', ((err, _result) => {
    console.error(err);
    pm2.disconnect();
}));

process.exit();