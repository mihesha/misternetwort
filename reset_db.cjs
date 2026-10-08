/**
 * reset_db.cjs — تصفير قاعدة بيانات السيرفر بالكامل (حذف جميع بيانات الاختبار)
 *
 * الاستخدام:
 *   node reset_db.cjs            (يطلب تأكيداً بكتابة كلمة RESET)
 *   node reset_db.cjs --yes      (بدون تأكيد)
 *   node reset_db.cjs --no-backup (بدون أخذ نسخة احتياطية - غير مفضّل)
 *
 * ماذا يفعل؟
 *   1) نسخة احتياطية من قاعدة البيانات في /root/db_backup_<التاريخ>.* (sqlite أو mysql)
 *   2) إيقاف الخدمات (backend / reverb) ووضع التطبيق في وضع الصيانة
 *   3) php artisan migrate:fresh --force  (حذف كل الجداول وإعادة إنشائها فارغة)
 *   4) حذف جميع الملفات المرفوعة في storage/app/public (إيصالات، شعارات المحافظ)
 *   5) (اختياري) إنشاء حساب super_admin جديد (لأن الجداول ستصبح فارغة تماماً)
 *   6) مسح الكاش وتشغيل الخدمات من جديد
 *
 * كلمة مرور SSH تُقرأ من SSH_PASSWORD في ملف .env بالمجلد الرئيسي.
 */
const { Client } = require('ssh2');
const fs = require('fs');
const readline = require('readline');

const APP_DIR = '/var/www/backend';
const args = process.argv.slice(2);
const SKIP_CONFIRM = args.includes('--yes');
const NO_BACKUP = args.includes('--no-backup');

let sshPassword = process.env.SSH_PASSWORD;
try {
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/^SSH_PASSWORD=(.*)$/m);
    if (match) sshPassword = match[1].trim().replace(/['"]/g, '');
  }
} catch (e) { }

if (!sshPassword) {
  console.error('❌ كلمة مرور السيرفر مفقودة. ضع SSH_PASSWORD=... في ملف .env');
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));

function run(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      stream
        .on('close', (code) => (code === 0 ? resolve() : reject(new Error(`فشل الأمر (code ${code}): ${cmd.slice(0, 120)}...`))))
        .on('data', (d) => process.stdout.write(d))
        .stderr.on('data', (d) => process.stderr.write(d));
    });
  });
}

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');

async function main() {
  console.log('⚠️  سيتم حذف "جميع" بيانات قاعدة البيانات على السيرفر 95.217.43.157 (لا يمكن التراجع إلا بالنسخة الاحتياطية).');

  if (!SKIP_CONFIRM) {
    const ans = await ask('للمتابعة اكتب RESET ثم Enter: ');
    if (ans !== 'RESET') {
      console.log('تم الإلغاء.');
      rl.close();
      process.exit(0);
    }
  }

  const createAdmin = (await ask('هل تريد إنشاء حساب super_admin جديد بعد التصفير؟ [Y/n]: ')).toLowerCase() !== 'n';

  let admin = null;
  if (createAdmin) {
    admin = {
      name: (await ask('اسم الأدمن: ')) || 'Admin',
      email: await ask('البريد الإلكتروني: '),
      phone: await ask('رقم الجوال (اختياري): '),
      password: await ask('كلمة المرور: '),
    };
    if (!admin.email || !admin.password) {
      console.error('❌ البريد وكلمة المرور مطلوبان.');
      process.exit(1);
    }
  }
  rl.close();

  const conn = new Client();
  conn.on('ready', async () => {
    console.log('✅ تم الاتصال بالسيرفر.');
    try {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');

      if (!NO_BACKUP) {
        console.log('💾 أخذ نسخة احتياطية...');
        const backup = `
cd ${APP_DIR}
getenv() { grep -E "^$1=" .env | head -n1 | cut -d= -f2- | tr -d '\\r' | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"; }
DRV=$(getenv DB_CONNECTION); DRV=\${DRV:-sqlite}
if [ "$DRV" = "sqlite" ]; then
  DBF=$(getenv DB_DATABASE); DBF=\${DBF:-database/database.sqlite}
  case "$DBF" in /*) ;; *) DBF="${APP_DIR}/$DBF";; esac
  cp "$DBF" /root/db_backup_${ts}.sqlite && echo "نسخة sqlite: /root/db_backup_${ts}.sqlite"
else
  MYSQL_PWD="$(getenv DB_PASSWORD)" mysqldump -h "$(getenv DB_HOST)" -P "$(getenv DB_PORT)" -u "$(getenv DB_USERNAME)" "$(getenv DB_DATABASE)" > /root/db_backup_${ts}.sql && echo "نسخة mysql: /root/db_backup_${ts}.sql"
fi`;
        await run(conn, backup);
      }

      console.log('⏸️  إيقاف الخدمات ووضع الصيانة...');
      await run(conn, `cd ${APP_DIR} && (php artisan down || true) && (pm2 stop backend reverb || true)`);

      console.log('🗑️  حذف جميع الجداول وإعادة إنشائها...');
      await run(conn, `cd ${APP_DIR} && php artisan migrate:fresh --force`);

      console.log('🧹 حذف الملفات المرفوعة...');
      await run(conn, `mkdir -p ${APP_DIR}/storage/app/public && cd ${APP_DIR}/storage/app/public && find . -mindepth 1 -not -name '.gitignore' -delete`);

      if (admin) {
        console.log('👤 إنشاء حساب الأدمن...');
        const php = `
$d = json_decode(base64_decode('${b64(JSON.stringify(admin))}'), true);
\\App\\Models\\User::forceCreate([
  'name' => $d['name'],
  'email' => $d['email'],
  'phone' => $d['phone'] ?: null,
  'role' => 'super_admin',
  'password' => \\Illuminate\\Support\\Facades\\Hash::make($d['password']),
]);
echo 'Admin created: ' . $d['email'] . PHP_EOL;`;
        await run(conn, `cd ${APP_DIR} && php artisan tinker --execute="$(echo '${b64(php)}' | base64 -d)"`);
      }

      console.log('🔄 مسح الكاش وتشغيل الخدمات...');
      await run(conn, `cd ${APP_DIR} && php artisan optimize:clear && php artisan up && (pm2 restart backend reverb || true) && pm2 save`);

      console.log('🎉 تم تصفير قاعدة البيانات بنجاح. المنصة جاهزة للبيانات الحقيقية.');
    } catch (e) {
      console.error('❌ ' + e.message);
      console.error('⚠️ التطبيق قد يكون في وضع الصيانة؛ للتراجع شغّل على السيرفر: cd ' + APP_DIR + ' && php artisan up');
      process.exitCode = 1;
    } finally {
      conn.end();
    }
  }).on('error', (e) => {
    console.error('❌ فشل الاتصال: ' + e.message);
    process.exit(1);
  }).connect({ host: '95.217.43.157', port: 2224, username: 'root', password: sshPassword });
}

main();
