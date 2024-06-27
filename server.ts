import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 4000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();


app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  async function onConnection(socket: any) {
    console.log('user disconnected');

    socket.on('news', (message:any) => {
        console.log(message,'mess')
        io.emit('news', message);
    });
  }
         
  io.on('connection', await onConnection);

  httpServer.once('error', (err) => {
    console.error(err);
    process.exit(1);
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
