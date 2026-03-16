import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { createVoiceLiveProxy } from './src/app/lib/voicelive-proxy.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: '/api/voice',
    cors: { origin: '*' },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token !== process.env.NEXT_PUBLIC_VOICELIVE_API_KEY_1) {
      return next(new Error('Unauthorized'));
    }
    next();
  });

  io.on('connection', async (socket) => {
    console.log('Voice client connected:', socket.id);
    try {
      await createVoiceLiveProxy(socket);
    } catch (err) {
      console.error('VoiceLive proxy error:', err);
      socket.emit('voice_error', { message: 'Failed to connect to Azure' });
      socket.disconnect();
    }

    socket.on('disconnect', () => {
      console.log('Voice client disconnected:', socket.id);
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});