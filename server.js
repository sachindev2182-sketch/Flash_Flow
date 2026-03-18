const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3001;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: dev 
        ? ['http://localhost:3000', 'http://localhost:3001']
        : ['https://flash-flow-cyan.vercel.app'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  console.log(' Socket.IO server initialized on port', PORT);

  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(' New client connected:', socket.id);

    socket.emit('connected', { id: socket.id, message: 'Connected to server' });

    socket.on('user-authenticated', (userId) => {
      if (userId) {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`👤 User ${userId} connected`);
        socket.emit('authenticated', { success: true });
      }
    });

    socket.on('send-message', async (data) => {
      console.log(' Message received:', data.message?.substring(0, 30));
      
      try {
        const { message, userId, token } = data;
        
        if (!message) {
          socket.emit('error', { message: 'Message is required' });
          return;
        }

        // Call the API
        const apiResponse = await processChatMessage(message, userId, token);

        console.log(' API response received, sending to client');
        
        // Emit response back to the SAME socket
        socket.emit('receive-message', {
          id: Date.now().toString(),
          role: 'assistant',
          content: apiResponse.response,
          timestamp: Date.now(),
          products: apiResponse.data?.products || [],
        });

        console.log('Response sent to client:', apiResponse.response.substring(0, 50) + '...');

      } catch (error) {
        console.error(' Error:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Client ${socket.id} disconnected:`, reason);
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
    });
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(` Server ready on http://localhost:${PORT}`);
  });
});

async function processChatMessage(message, userId, token) {
  const url = `http://localhost:${PORT}/api/chat`;
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Cookie'] = `authToken=${token}`;
  }

  console.log(' Calling API:', url);
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, userId }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('API error:', res.status, text);
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  console.log('API response:', { 
    response: data.response?.substring(0, 50) + '...',
    hasData: !!data.data 
  });
  
  return data;
} 