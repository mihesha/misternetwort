const { Client } = require('ssh2');
const fs = require('fs');
const { execSync } = require('child_process');

console.log('📦 بناء مشروع الواجهة محلياً (لتجنب انهيار Turbopack في السيرفر)...');
try {
  execSync('npm run build', { cwd: './frontend', stdio: 'inherit' });
} catch (e) {
  console.error('❌ فشل بناء مشروع الواجهة.');
  process.exit(1);
}

console.log('🗜️ ضغط الملفات للرفع...');
try {
  // Compress backend and frontend ignoring node_modules, vendor, database, but KEEP .next (excluding its cache to avoid lock errors)
  execSync('tar.exe -a -c -f deploy.zip --exclude "node_modules" --exclude ".git" --exclude "vendor" --exclude "database.sqlite" --exclude "frontend/.next/cache" --exclude "frontend/.next/dev" backend frontend');
} catch (e) {
  console.error('❌ فشل ضغط الملفات.');
  process.exit(1);
}

// 🔒 نظام الحماية: استدعاء كلمة المرور من ملف .env المحلي (لا ترفعه إلى GitHub)
let sshPassword = process.env.SSH_PASSWORD;
try {
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/^SSH_PASSWORD=(.*)$/m);
    if (match) sshPassword = match[1].trim().replace(/['"]/g, ''); // إزالة علامات التنصيص إن وُجدت
  }
} catch (e) {
  // تجاهل الخطأ في حالة عدم وجود الملف
}

if (!sshPassword) {
  console.error('❌ [خطأ أمني]: كلمة مرور السيرفر مفقودة!');
  console.error('يرجى إنشاء ملف اسمه .env في المجلد الرئيسي ووضع السطر التالي داخله:');
  console.error('SSH_PASSWORD=your_actual_password');
  process.exit(1);
}

const conn = new Client();
console.log('🌐 جاري الاتصال بالسيرفر...');

conn.on('ready', () => {
  console.log('✅ تم الاتصال بالسيرفر. جاري رفع الملفات (سيكون أسرع بكثير الآن)...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    sftp.fastPut('deploy.zip', '/root/deploy.zip', (err) => {
      if (err) throw err;
      console.log('✅ تم الرفع بنجاح! جاري التثبيت والبناء في السيرفر (قد يستغرق بناء الواجهة دقيقة)...');

      const commands = [
        'unzip -o /root/deploy.zip -d /var/www/',
        'rm -f /root/deploy.zip',
        'cd /var/www/backend && composer install --optimize-autoloader --no-dev',
        'cd /var/www/backend && php artisan migrate --force',
        'cd /var/www/backend && php artisan config:cache && php artisan route:cache && php artisan view:cache',
        'cd /var/www/frontend && npm install --omit=dev',
        'cd /var/www/backend && pm2 restart backend || pm2 start "php artisan serve --host=0.0.0.0 --port=8000" --name "backend"',
        'cd /var/www/backend && pm2 restart reverb || pm2 start "php artisan reverb:start" --name "reverb"',
        'cd /var/www/frontend && PORT=3000 pm2 restart frontend || PORT=3000 pm2 start "npm run start" --name "frontend"',
        'pm2 save'
      ].join(' && ');

      conn.exec(commands, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log('🎉 تم نشر التحديثات على السيرفر بنجاح!');
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      });
    });
  });
}).connect({
  host: '95.217.43.157',
  port: 2224,
  username: 'root',
  password: sshPassword
});
