import { Rcon } from 'rcon-client';

export default async function handler(req, res) {
  // Hanya terima permintaan ber-method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { secret, title, message } = req.body;

    // Kunci rahasia MacroDroid
    const SECRET_KEY = "nansmp@jshyea_$server";

    if (secret !== SECRET_KEY) {
      return res.status(401).json({ message: 'Unauthorized: Secret key salah!' });
    }

    console.log("Notifikasi DANA Masuk:", message);

    // Filter pesan notifikasi dari DANA
    if (message && (message.includes('menerima') || message.includes('pembayaran') || message.includes('saldo'))) {
      
      // 1. Ekstrak Nominal Angka (contoh: Rp 15.000 -> 15000)
      const matchNominal = message.match(/Rp\s?([0-9\.]+)/);
      if (!matchNominal) {
        return res.status(200).json({ status: 'ignored', message: 'Nominal tidak ditemukan dalam pesan.' });
      }

      const nominal = parseInt(matchNominal[1].replace(/\./g, ''), 10);
      console.log(`[PEMBAYARAN] Sebesar Rp ${nominal} terverifikasi!`);

      // 2. Ekstrak Username Minecraft dari Catatan Transaksi
      // Mendukung username Java (Player) maupun Bedrock (.Player)
      const matchPlayer = message.match(/(\.?[a-zA-Z0-9_]{3,16})/);
      const playerName = matchPlayer ? matchPlayer[0] : null;

      if (!playerName) {
        return res.status(200).json({ status: 'failed', message: 'Username player tidak ditemukan di catatan DANA.' });
      }

      // 3. Pemetaan Nominal ke Command LuckPerms (Beli Baru & Upgrade)
      let command = '';

      switch (nominal) {
        // --- PEMBELIAN BARU ---
        case 15000:
          // Bisa Beli VIP Baru ATAU Upgrade VIP -> VIP+ (Selisih 15k)
          // Menggunakan 'parent add' agar VIP+ ditambahkan tanpa bentrok
          command = `lp user ${playerName} parent add vipplus`;
          break;
        case 30000:
          command = `lp user ${playerName} parent add vipplus`;
          break;
        case 50000:
          command = `lp user ${playerName} parent add mvp`;
          break;
        case 80000:
          command = `lp user ${playerName} parent add mvpplus`;
          break;
        case 120000:
          command = `lp user ${playerName} parent add yongsun`;
          break;
        case 170000:
          command = `lp user ${playerName} parent add yongsunplus`;
          break;
        case 200000:
          command = `lp user ${playerName} parent add nightmare`;
          break;
        case 300000:
          command = `lp user ${playerName} parent add nightmareplus`;
          break;
        default:
          return res.status(200).json({ status: 'ignored', message: `Nominal Rp ${nominal} tidak terdaftar di sistem store.` });
      }

      // 4. Hubungkan ke RCON Server Minecraft & Eksekusi Perintah
      const rcon = await Rcon.connect({
        host: process.env.RCON_HOST,
        port: parseInt(process.env.RCON_PORT || '25575'),
        password: process.env.RCON_PASSWORD
      });

      const rconResponse = await rcon.send(command);
      
      // Pengumuman broadcast di server (Opsional)
      await rcon.send(`say §a[NanStore] §fTerima kasih §e${playerName} §ftelah membeli/upgrade rank!`);
      
      await rcon.end();

      console.log(`[RCON SUKSES] Command executed: ${command} | Response: ${rconResponse}`);

      return res.status(200).json({
        status: 'success',
        player: playerName,
        nominal: nominal,
        rconResponse: rconResponse
      });
    }

    return res.status(200).json({ status: 'success', message: 'Notifikasi non-pembayaran diterima' });

  } catch (error) {
    console.error('[ERROR BACKEND]:', error);
    return res.status(500).json({ error: error.message });
  }
}
