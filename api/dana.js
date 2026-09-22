export default async function handler(req, res) {
  // Hanya terima permintaan ber-method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { secret, title, message } = req.body;

    // Kunci rahasia sesuai permintaanmu
    const SECRET_KEY = "nansmp@jshyea_$server";

    if (secret !== SECRET_KEY) {
      return res.status(401).json({ message: 'Unauthorized: Secret key salah!' });
    }

    console.log("Notifikasi DANA Masuk:", message);

    // Filter pesan notifikasi dari DANA
    if (message && (message.includes('menerima') || message.includes('pembayaran') || message.includes('saldo'))) {
      
      // Ambil angka nominal (misal: Rp 10.000 -> 10000)
      const match = message.match(/Rp\s?([0-9\.]+)/);
      if (match) {
        const nominal = parseInt(match[1].replace(/\./g, ''), 10);
        
        console.log(`[SUKSES] Pembayaran DANA sebesar Rp ${nominal} terverifikasi!`);
        
        // Logika eksekusi perintah Minecraft RCON bisa ditaruh di sini
      }
    }

    return res.status(200).json({ status: 'success', message: 'Notifikasi berhasil diterima' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
