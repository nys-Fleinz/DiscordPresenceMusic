import net from 'net';
import crypto from 'crypto';

const CLIENT_ID = '1226273189785501786';
const PIPE_PATH = '\\\\.\\pipe\\discord-ipc-0';

export default class ClientRPC {
    constructor() {
        this.client = net.createConnection(PIPE_PATH);
        this.authenticated = false;
        this.#setupListeners();
    }

    #setupListeners() {
        this.client.on('connect', () => {
            this.#sendPacket(0, {v: 1, client_id: CLIENT_ID});
        });

        this.client.on('data', (data) => {
            if (!this.authenticated) {
                this.authenticated = true;
            }
        });

        this.client.on('error', (err) => {
            console.error('❌ Erreur:', err.message);
        });
    }

    #sendPacket(op, data) {
        const payload = JSON.stringify(data);
        const len = Buffer.byteLength(payload);
        const packet = Buffer.allocUnsafe(8 + len);

        packet.writeInt32LE(op, 0);
        packet.writeInt32LE(len, 4);
        packet.write(payload, 8);

        this.client.write(packet);
    }

    updateActivity(data) {
        const { track, trackDuration, currentTime } = data;
        const { author, title, avatar, url, album } = track;
        console.log(author );

        if (!this.authenticated) return;

        const now = Math.floor(Date.now() / 1000);
        const activity = {
            cmd: 'SET_ACTIVITY',
            args: {
                pid: process.pid,
                activity: {
                    name: author,
                    type: 2,
                    details: title,
                    state: author,
                    timestamps: {
                        start: now - (currentTime + 1),
                        end: now + (trackDuration - currentTime)-1,
                    },
                    assets: {
                        large_image: avatar,
                        large_text: album ? album : title,
                    },
                    buttons: [
                        {label: 'Écouter', url: url},
                        {label: 'Github', url: 'https://github.com/nys-Fleinz/DiscordPresenceMusic'},
                    ]
                }
            },
            nonce: crypto.randomBytes(16).toString('hex')
        };

        this.#sendPacket(1, activity);
    }

    clearActivity() {
        if (!this.authenticated) return;

        const payload = {
            cmd: 'SET_ACTIVITY',
            args: {
                pid: process.pid,
                activity: null
            },
            nonce: crypto.randomBytes(16).toString('hex')
        };
        this.#sendPacket(1, payload);
    }
}