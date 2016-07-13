import Server from './Server';
import minimist from 'minimist';

const argv = minimist(process.argv, {
   'default' : {
       'server-port' : 8080
   }
});

const server = new Server(argv['server-port']);
server._listen();
