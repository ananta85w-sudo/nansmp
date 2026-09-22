import { Rcon } from 'rcon-client';

export default async function handler(req, res) {
  try {
    const rcon = await Rcon.connect({
      host: process.env.RCON_HOST,
      port: parseInt(process.env.RCON_PORT || '25575'),
      password: process.env.RCON_PASSWORD,
      timeout: 5000
    });

    // Coba kirim perintah list player
    const response = await rcon.send('list');
    await rcon.end();

    return res.status(200).json({
      status: 'SUKSES CONNECT RCON!',
      serverResponse: response
    });
  } catch (error) {
    return res.status(500).json({
      status: 'GAGAL CONNECT RCON',
      error: error.message
    });
  }
}
