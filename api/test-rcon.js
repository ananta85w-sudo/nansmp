import { Rcon } from 'rcon-client';

export default async function handler(req, res) {
  // Atur header agar output berupa JSON yang rapi
  res.setHeader('Content-Type', 'application/json');

  const host = process.env.RCON_HOST;
  const port = parseInt(process.env.RCON_PORT || '25575', 10);
  const password = process.env.RCON_PASSWORD;

  // 1. Cek ketersediaan Environment Variables
  if (!host || !password) {
    return res.status(200).json({
      status: 'GAGAL',
      message: 'Environment Variable RCON_HOST atau RCON_PASSWORD belum diisi di Settings Vercel!'
    });
  }

  let rcon = null;

  try {
    // 2. Coba koneksi ke server Minecraft dengan timeout 5 detik
    rcon = new Rcon({
      host: host,
      port: port,
      password: password,
      timeout: 5000
    });

    await rcon.connect();
    const response = await rcon.send('list');
    await rcon.end();

    return res.status(200).json({
      status: 'SUKSES',
      message: 'RCON terhubung ke server NanSMP!',
      serverResponse: response
    });

  } catch (error) {
    if (rcon) {
      try {
        await rcon.end();
      } catch (e) {
        // Abaikan error saat menutup koneksi
      }
    }

    return res.status(200).json({
      status: 'GAGAL',
      errorName: error.name || 'Error',
      errorMessage: error.message || 'Gagal terhubung ke RCON',
      detail: 'Pastikan port RCON di server.properties sudah sesuai dan IP/Port tidak diblokir firewall hosting.'
    });
  }
}
