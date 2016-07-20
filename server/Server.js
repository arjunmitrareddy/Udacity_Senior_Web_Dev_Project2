import express from 'express';
import zlib from 'zlib';
import compression from 'compression';
import http from 'http'; //for http server
import indexTemplate from './templates/index';
import infoPanelTemplate from './templates/infoPanel';


const compressor = compression({
   flush: zlib.Z_PARTIAL_FLUSH
});

export default class Server {

    constructor(port) {
        this._app = express();
        this._port = port;
        this._appServerUp = false;
        this._appServer = http.createServer(this._app);

        const staticOptions = {
            maxAge: 0
        };

        this._app.use('/js', express.static('../public/js', staticOptions));
        this._app.use('/css', express.static('../public/css', staticOptions));
        this._app.use('/imgs', express.static('../public/imgs', staticOptions));
        this._app.use('/avatars', express.static('../public/avatars', staticOptions));
        this._app.use('/fonts', express.static('../public/fonts', staticOptions));
        this._app.use('/gtfs', express.static('../public/gtfs', staticOptions));
        this._app.use('/serviceWorker.js', express.static('../public/serviceWorker.js', staticOptions));
        this._app.use('/serviceWorker.js.map', express.static('../public/serviceWorker.js.map', staticOptions));

        this._app.get('/', (req, res) => {
            res.send(indexTemplate({
                extraCss: '<link rel="stylesheet" href="/css/lib.css"/>',
                scripts: [
                    '<script src="/js/main.js" defer></script>',
                    '<script src="/js/lib.js"></script>'
                ],
                content : infoPanelTemplate()
            }))
        });

    }

    _listen() {
        if (!this._appServerUp) {
            this._appServer.listen(process.env.PORT || this._port, _ => {
                console.log("Server Listening on localhost:" + this._port);
            });
            this._appServerUp = true;
        }

    }
}
