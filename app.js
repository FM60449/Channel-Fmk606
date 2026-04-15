const os = require('os');
const http = require('http');
const { execSync } = require('child_process');
function ensureModule(name) {
    try {
        require.resolve(name);
    } catch (e) {
        console.log(`Module '${name}' not found. Installing...`);
        execSync(`npm install ${name}`, { stdio: 'inherit' });
    }
}
ensureModule('ws');
const { WebSocket, createWebSocketStream } = require('ws');

const NAME = process.env.NAME || 'US-Central-Iowa';  // ← Personnalisé pour Iowa

console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
console.log("Serveur VLESS-WS-TLS - US Central (Iowa)");
console.log("Nom du nœud :", NAME);
console.log("Version personnalisée pour Iowa, US");
console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

async function getVariableValue(variableName, defaultValue) {
    const envValue = process.env[variableName];
    if (envValue) return envValue;
    if (defaultValue) return defaultValue;

    let input = '';
    while (!input) {
        input = await ask(`Entrez ${variableName} : `);
        if (!input) console.log(`${variableName} ne peut pas être vide !`);
    }
    return input;
}

function ask(question) {
    const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
    const UUID = await getVariableValue('UUID', '1b1ae757-d4ce-4d42-8b7a-9101e8d7b8ef');
    console.log('Votre UUID :', UUID);

    const PORT = await getVariableValue('PORT', '443');
    console.log('Port :', PORT);

    const DOMAIN = await getVariableValue('DOMAIN', 'votre-domaine.example.com');  // ← Changez par votre vrai domaine
    console.log('Domaine :', DOMAIN);

    const httpServer = http.createServer((req, res) => {
        if (req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Hello from US-Central Iowa Server\nNode: ${NAME}\n`);
        } else if (req.url === `/${UUID}`) {
            // Liens optimisés pour US-Central (Iowa) + IPs Cloudflare courantes
            const vlessURL = `vless://\( {UUID}@ \){DOMAIN}:443?encryption=none&security=tls&sni=\( {DOMAIN}&fp=chrome&type=ws&host= \){DOMAIN}&path=%2F#Vl-ws-tls-${NAME}

vless://\( {UUID}@104.16.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-104.16
vless://\( {UUID}@104.17.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-104.17
vless://\( {UUID}@104.18.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-104.18
vless://\( {UUID}@104.19.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-104.19
vless://\( {UUID}@104.20.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-104.20
vless://\( {UUID}@104.21.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-104.21
vless://\( {UUID}@104.22.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-104.22
vless://\( {UUID}@104.24.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-104.24
vless://\( {UUID}@104.26.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-104.26
vless://\( {UUID}@172.64.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-172.64
vless://\( {UUID}@172.65.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-172.65
vless://\( {UUID}@172.66.0.0:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-172.66

# IPv6 (Cloudflare)
vless://\( {UUID}@[2606:4700::]:443?encryption=none&security=tls&sni= \){DOMAIN}&fp=chrome&type=ws&host=${DOMAIN}&path=%2F#Vl-WS-TLS-US-Iowa-IPv6
`;

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(vlessURL);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found\n');
        }
    });

    httpServer.listen(PORT, () => {
        console.log(`✅ Serveur HTTP + WebSocket démarré sur le port ${PORT} (US-Central Iowa)`);
    });

    const wss = new WebSocket.Server({ server: httpServer });
    const uuid = UUID.replace(/-/g, "");

    wss.on('connection', ws => {
        ws.once('message', msg => {
            const [VERSION] = msg;
            const id = msg.slice(1, 17);
            if (!id.every((v, i) => v === parseInt(uuid.substr(i * 2, 2), 16))) return;

            let i = msg.slice(17, 18).readUInt8() + 19;
            const port = msg.slice(i, i += 2).readUInt16BE(0);
            const ATYP = msg.slice(i, i += 1).readUInt8();

            const host = ATYP === 1 ? msg.slice(i, i += 4).join('.') :
                (ATYP === 2 ? new TextDecoder().decode(msg.slice(i + 1, i += 1 + msg.slice(i, i + 1).readUInt8())) :
                    (ATYP === 3 ? msg.slice(i, i += 16).reduce((s, b, idx, a) => (idx % 2 ? s.concat(a.slice(idx - 1, idx + 1)) : s), []).map(b => b.readUInt16BE(0).toString(16)).join(':') : ''));

            ws.send(new Uint8Array([VERSION, 0]));
            const duplex = createWebSocketStream(ws);

            net.connect({ host, port }, function () {
                this.write(msg.slice(i));
                duplex.on('error', () => {}).pipe(this).on('error', () => {}).pipe(duplex);
            }).on('error', () => {});
        }).on('error', () => {});
    });

    console.log(`🔗 Lien principal : vless://\( {UUID}@ \){DOMAIN}:443?encryption=none&security=tls&sni=\( {DOMAIN}&fp=chrome&type=ws&host= \){DOMAIN}&path=%2F#Vl-ws-tls-${NAME}`);
}

main().catch(console.error);
