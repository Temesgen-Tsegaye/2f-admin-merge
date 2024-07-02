import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 4000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
import  {ChannelRealtime} from './src/utils/realtime/channel'

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  async function onConnection(socket: any) {
    console.log('user disconnected');
    await ChannelRealtime(io, socket);
   
  }
         
  io.on('connection', await onConnection);

  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
