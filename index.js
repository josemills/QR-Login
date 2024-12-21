required('dotenv').config();
const base = process.env.BASE_URL;
const port = process.env.PORT;

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

const users = [{ email: 'test@test.cl', password: '1234' }];

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ success: true });
});

app.get('/hello', async(req, res) => {
    res.send('hola mundo')
}) 
// Generar QR
app.post('/generate-qr', async (req, res) => {
  const token = uuidv4();
  const qrContent = JSON.stringify({ 
    userName: users[0].email, 
    token, 
    redirectUrl: 'https://www.instagram.com/' // Cambia 'http://yourdomain.com' por tu dominio real
  });
  const qrCode = await QRCode.toDataURL(qrContent);
  res.json({ qrCode, token });
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

server.listen(port, () => {
  console.log(`Server running at ${base}:${port}`);
});
