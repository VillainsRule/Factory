if (Bun.env.GEN_YOLO === '1') {
    process.on('uncaughtException', (err) => console.log('🚨 uncaught exception:', err));
    process.on('unhandledRejection', (reason, promise) => console.log('🚨 unhandled rejection at:', promise, reason));
}

import fs from 'node:fs';
import path from 'node:path';

import { API } from 'yolkbot/api';

import getProvider from './providers/getProvider';

const dataDir = path.join(import.meta.dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const accPath = path.join(dataDir, 'acc.txt');
const redPath = path.join(dataDir, 'redact.txt');

let i = 1;

const commonPasswordReq = await fetch('https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Common-Credentials/100k-most-used-passwords-NCSC.txt');
const commonPasswordRes = await commonPasswordReq.text();
const commonPasswordList = commonPasswordRes.split('\n').map(p => p.trim()).filter((p, i) => i > 10000 && p.length >= 8);

let accounts = fs.existsSync(accPath) ? fs.readFileSync(accPath, 'utf8') : '';
let redactedAccounts = fs.existsSync(redPath) ? fs.readFileSync(redPath, 'utf8') : '';

setInterval(async () => {
    console.log('starting email verify', i);
    i++;

    let id: string = 'unknown';

    try {
        const firebase = new API({ proxy: process.env.SOCKS_PROXY });
        const email = getProvider(firebase);

        id = email.constructor.name;

        const address = await email.getAddress();
        if (!address) return;

        const password = commonPasswordList[Math.floor(Math.random() * commonPasswordList.length)];
        if (email.mode === 'TEMPMAIL') console.log(`Generated "${address}". Creating account...`);

        const emailCreate = await firebase.createAccount(address, password);
        if (!emailCreate.ok) return console.log(`🚨 failed to create account for "${address}" via Firebase API`, emailCreate);

        console.log(`Created Firebase account for "${address}"! ${email.mode === 'TEMPMAIL' ? 'Verifying...' : 'Kiln will verify this soon.'}`);

        if (email.mode === 'TEMPMAIL') {
            const sendVerifyEmail = await firebase.sendEmailVerification();
            if (!sendVerifyEmail.ok) return console.log(`🚨 failed to send verification email for "${address}" via Firebase API`, sendVerifyEmail);

            console.log(`Sent verification email to "${address}". Waiting for email...`);

            const didVerify = await email.waitAndVerify(address);
            if (!didVerify) return;

            console.log(`Verified email "${address}"!`);
        }

        accounts += `${address} ${password}\n`;
        fs.writeFileSync(accPath, accounts, 'utf8');

        const addressSafe = address.replace(/@.*/, '@*****');

        redactedAccounts += `${addressSafe} ${password.replace(/./g, '*')}\n`;
        fs.writeFileSync(redPath, redactedAccounts, 'utf8');
    } catch (e: any) {
        console.log('🚨 failed to verify using provider', id, e.message);
    }
}, 100);