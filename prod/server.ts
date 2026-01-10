import fs from 'fs';
import path from 'path';

import type { Key } from './types';

const defaultHeaders = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
}

const dataDir = path.join(import.meta.dirname, '..', 'data');
const accData = path.join(dataDir, 'acc.txt');
const usdData = path.join(dataDir, 'usd.txt');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(accData)) fs.writeFileSync(accData, '');
if (!fs.existsSync(usdData)) fs.writeFileSync(usdData, '');

const keyPath = path.join(dataDir, 'key.json');

Bun.serve({
    port: 2074,

    routes: {
        '/v3/account': (req) => {
            const url = new URL(req.url, 'http://localhost');

            const key = url.searchParams.get('key');
            if (!key) return new Response(JSON.stringify({ success: false, error: Bun.env.ERROR_INVALID_KEY }), defaultHeaders);

            const keys = JSON.parse(fs.readFileSync(keyPath, 'utf8')) as Key[];
            if (!keys.some(k => k.token === key)) return new Response(JSON.stringify({ success: false, error: Bun.env.ERROR_INVALID_KEY }), defaultHeaders);

            const accounts = fs.readFileSync(accData, 'utf8').split('\n').filter((a) => a);
            const account = accounts.shift();
            if (!account) return new Response(JSON.stringify({ success: false, error: Bun.env.ERROR_NO_ACCOUNTS }), defaultHeaders);

            fs.writeFileSync(accData, accounts.join('\n'));

            const used = fs.readFileSync(usdData, 'utf8');
            fs.writeFileSync(usdData, (used + account + '\n'));

            const [email, password] = account.split(' ');
            if (email && password) return new Response(JSON.stringify({ success: true, email, password }), defaultHeaders);
            else return new Response(JSON.stringify({ success: false, error: Bun.env.ERROR_NO_ACCOUNTS }), defaultHeaders);
        },
        '/v4/bulkAccounts': (req) => {
            const url = new URL(req.url, 'http://localhost');

            const key = url.searchParams.get('key');
            if (!key) return new Response(JSON.stringify({ success: false, error: Bun.env.ERROR_INVALID_KEY }), defaultHeaders);

            const countParam = url.searchParams.get('count');
            if (!countParam) return new Response(JSON.stringify({ success: false, error: 'add a ?count parameter with the # of accounts to gen' }), defaultHeaders);

            const count = parseInt(countParam, 10);
            if (isNaN(count) || count < 1 || count > 100 || (Math.round(count) !== count))
                return new Response(JSON.stringify({ success: false, error: 'count must be a whole number between 1 and 100' }), defaultHeaders);

            const keys = JSON.parse(fs.readFileSync(keyPath, 'utf8')) as Key[];
            if (!keys.some(k => k.token === key)) return new Response(JSON.stringify({ success: false, error: Bun.env.ERROR_INVALID_KEY }), defaultHeaders);

            const accounts = fs.readFileSync(accData, 'utf8').split('\n').filter((a) => a);
            if (accounts.length < count) return new Response(JSON.stringify({ success: false, error: Bun.env.ERROR_NO_ACCOUNTS }), defaultHeaders);

            const allocatedAccounts = accounts.splice(0, count);
            fs.writeFileSync(accData, accounts.join('\n'));

            const used = fs.readFileSync(usdData, 'utf8');
            fs.writeFileSync(usdData, (used + allocatedAccounts.join('\n') + '\n'));

            const responseAccounts = allocatedAccounts.map(acc => {
                const [email, password] = acc.split(' ');
                return { email, password };
            });

            return new Response(JSON.stringify({ success: true, accounts: responseAccounts }), defaultHeaders);
        }
    },

    fetch: (request) => {
        return new Response('invalid endpoint; endpoints include:\n- /v3/account?key={KEY}\n- /v4/bulkAccounts?key={KEY}&count={1-100}', defaultHeaders);
    }
});