const { Client } = require('ssh2');
const fs = require('fs');

let sshPassword = process.env.SSH_PASSWORD;
try {
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/^SSH_PASSWORD=(.*)$/m);
    if (match) sshPassword = match[1].trim().replace(/['"]/g, '');
  }
} catch (e) {}

if (!sshPassword) process.exit(1);

const conn = new Client();
conn.on('ready', () => {
  const commands = `cd /var/www/backend && php artisan tinker << 'EOF'
$user = \\App\\Models\\User::where('phone', '785592169')->first(); 

if ($user) {
    echo "--- 🕵️ الفحص النهائي والدقيق ---\n";
    $cards = \\App\\Models\\Card::join('card_categories', 'cards.card_category_id', '=', 'card_categories.id')
                    ->where('cards.sold_by', $user->id)
                    ->select('cards.*', 'card_categories.name as category_name', 'card_categories.pos_price', 'card_categories.price')
                    ->orderBy('cards.purchased_at', 'asc')
                    ->get();
                    
    $count1000 = 0;
    $count100 = 0;
    foreach ($cards as $c) {
        if (strpos($c->category_name, '1000') !== false) {
            $count1000++;
        } else if (strpos($c->category_name, '100') !== false) {
            $count100++;
        }
    }
    
    echo "إجمالي الكروت 1000: " . $count1000 . "\n";
    echo "إجمالي الكروت 100: " . $count100 . "\n";
    echo "إجمالي جميع الكروت: " . $cards->count() . "\n";
}
EOF`;

  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', (data) => process.stdout.write(data))
          .stderr.on('data', (data) => process.stderr.write(data));
  });
}).connect({ host: '95.217.43.157', port: 2224, username: 'root', password: sshPassword });
