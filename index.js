const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const sessions = {}; // Almacenará las sesiones activas

app.use(express.static('public'));
app.use(express.json());

app.get('/hello', async(req, res) => {
    res.send('hola mundo')
}) 
// Generar QR
app.post('/generate-qr', async (req, res) => {
  const sessionId = uuidv4();
  const qrData = {
    sessionId,
    site: 'QR Login Site',
    user: 'UsuarioLogeado',
  };

  sessions[sessionId] = { loggedIn: false };

  const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
  res.json({ qrCode });
});

// Validar QR
app.post('/validate-qr', (req, res) => {
  const { sessionId } = req.body;

  if (sessions[sessionId]) {
    sessions[sessionId].loggedIn = true;
    return res.json({ success: true });
  }

  res.status(400).json({ success: false, message: 'Invalid QR Code' });
});

// WebSocket para notificaciones
io.on('connection', (socket) => {
  console.log('New WebSocket connection');
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
