const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('tail -n 100 /var/www/backend/storage/logs/laravel.log', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => { conn.end(); })
          .on('data', (data) => { console.log(data.toString()); });
  });
}).connect({ host: '95.217.43.157', port: 2224, username: 'root', password: 'akram321' });
