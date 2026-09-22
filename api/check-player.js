import { Rcon } from 'rcon-client';

export default async function handler(req, res) {
  // Hanya terima method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { player } = req.query;

  if (!player || player.trim() === '') {
    return res.status(400).json({ error: 'Parameter username player wajib diisi!' });
  }

  let rcon;

  try {
    // 1. Hubungkan ke RCON Server Minecraft
    rcon = await Rcon.connect({
      host: process.env.RCON_HOST,
      port: parseInt(process.env.RCON_PORT || '25575'),
      password: process.env.RCON_PASSWORD,
      timeout: 3000 // Limit waktu tunggu RCON (3 detik)
    });

    // 2. Eksekusi perintah LuckPerms Info secara live
    const lpInfo = await rcon.send(`lp user ${player} info`);
    await rcon.end();

    // 3. Cek apakah Player pernah join ke server
    // Jika tidak ditemukan di database LuckPerms
    if (lpInfo.includes('could not be found') || lpInfo.includes('No data found') || lpInfo.includes('User null')) {
      return res.status(200).json({
        exists: false,
        player: player,
        message: 'Player belum pernah join ke server NanSMP!'
      });
    }

    // 4. Parse Primary Group (Rank Utama) dari output LP Info
    let currentRank = 'default';
    const primaryGroupMatch = lpInfo.match(/Primary Group:\s*([a-zA-Z0-9_-]+)/i);

    if (primaryGroupMatch && primaryGroupMatch[1]) {
      currentRank = primaryGroupMatch[1].toLowerCase();
    }

    // 5. Kirim data live ke frontend
    return res.status(200).json({
      exists: true,
      player: player,
      rank: currentRank,
      isVip: currentRank !== 'default'
    });

  } catch (error) {
    if (rcon) await rcon.end();
    console.error('[CHECK PLAYER ERROR]:', error);
    return res.status(500).json({ 
      error: 'Gagal terhubung ke server Minecraft.', 
      details: error.message 
    });
  }
}
