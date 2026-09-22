import { Rcon } from 'rcon-client';

export default async function handler(req, res) {
  let rcon = null;

  try {
    const host = process.env.RCON_HOST;
    const port = parseInt(process.env.RCON_PORT || '25575', 10);
    const password = process.env.RCON_PASSWORD;

    // Cek apakah Environment Variables sudah terisi
    if (!host || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Environment Variables (RCON_HOST / RCON_PASSWORD) belum diisi di Vercel!'
      });
    }

    // Sambungkan ke RCON dengan timeout 4 detik
    rcon = await Rcon.connect({
      host: host,
      port: port,
      password: password,
      timeout: 4000
    });

    const response = await rcon.send('list');
    await rcon.end();

    return res.status(200).json({
      status: 'SUKSES',
      message: 'RCON Berhasil terhubung ke server NanSMP!',
      serverResponse: response
    });

  } catch (error) {
    if (rcon) {
      try { await rcon.end(); } catch (e) {}
    }

    return res.status(200).json({
      status: 'GAGAL',
      errorName: error.name,
      errorMessage: error.message,
      hint: 'Cek apakah IP/Port RCON di server.properties sudah benar & server sedang online.'
    });
  }
}
