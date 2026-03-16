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

  const allowedOrigin = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const io = new SocketIOServer(httpServer, {
    path: '/api/voice',
    cors: { origin: allowedOrigin, methods: ['GET', 'POST'] },
  });

  // Auth middleware — validates the per-request socket secret (not the Azure API key)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || token !== process.env.VOICELIVE_SOCKET_SECRET) {
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