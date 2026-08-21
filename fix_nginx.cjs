const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const config = `server {
    listen 80;
    listen 8081;
    listen [::]:80;
    listen [::]:8081;

    server_name cardbox.basmasoft.com *.cardbox.basmasoft.com;

    client_max_body_size 100M;

    access_log /var/log/nginx/cardbox-access.log;
    error_log  /var/log/nginx/cardbox-error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    location ~ /\\.(env|git|htaccess) {
        deny all;
    }
}`;
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const stream = sftp.createWriteStream('/etc/nginx/sites-available/cardbox');
    stream.write(config);
    stream.end();
    stream.on('close', () => {
      conn.exec('nginx -t && systemctl reload nginx', (err, stream2) => {
        stream2.on('data', d => process.stdout.write(d)).stderr.on('data', d => process.stderr.write(d)).on('close', () => {
          console.log('Nginx updated and reloaded.');
          conn.end();
        });
      });
    });
  });
}).connect({ host: '95.217.43.157', port: 2224, username: 'root', password: 'akram321' });
