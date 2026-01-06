import { API } from 'yolkbot/api';

import BaseProvider from '../BaseProvider';

const malqRoot = 'http://localhost:4400';

export default class malq extends BaseProvider {
    mode: 'TEMPMAIL' = 'TEMPMAIL';

    token: string | null = null;
    provider: string | null = null;

    constructor(firebase: API) {
        super(firebase);
    }

    async getAddress(): Promise<string> {
        const addressReq = await fetch(malqRoot + '/api/v1/mail/session');
        const addressRes = await addressReq.json();

        this.token = addressRes.token;
        this.provider = addressRes.provider;

        if (!addressRes.address) console.error(`\x1b[31m[malq] Failed to get address from malq ${addressRes.provider}\x1b[0m`);

        return addressRes.address;
    };

    waitAndVerify = (_address: string) => new Promise<boolean>(async (resolve) => {
        const check = async () => {
            const emailReq = await fetch(malqRoot + '/api/v1/mail/inbox/' + this.token);

            let emailRes: any;

            try {
                emailRes = await emailReq.json();
            } catch {
                console.log(`\x1b[31m[malq] Failed to parse email response from malq\x1b[0m`);
                console.log(emailReq, this.provider);
                console.log(await (emailReq.clone()).text());
                return resolve(false);
            }

            if (emailRes.mail.length > 0) {
                let email = emailRes.mail[0] as { from: string; subject: string; body: string; };
                if (email.from !== 'noreply@shellshock.io') return setTimeout(async () => await check(), 1000);

                let oobCode: string | null = null;

                try {
                    const grabPatterns = [
                        email.body.match(/>https:\/\/(.*?)<\/a/),
                        email.body.match(/"https:\/\/(.*?)"/),
                        email.body.match(/\n\s*https:\/\/(.*?)\s*\n/),
                    ].filter(Boolean) as RegExpMatchArray[];

                    if (grabPatterns.length > 0) {
                        const urlStr = grabPatterns[0][1].replaceAll('&amp;', '&');
                        const url = new URL('https://' + urlStr);
                        oobCode = url.searchParams.get('oobCode');
                    } else console.log(grabPatterns);
                } catch (e) {
                    console.error(e);

                    oobCode = email.body.match(/http(.*?)\&en/)?.[0].match(/oobCode=(.*?)&/)?.[1] || null;
                    if (!oobCode) oobCode = email.body.match(/oobCode=(.*?)/)?.[1] || null;
                }

                if (!oobCode) {
                    console.log(`\x1b[31m[malq] Failed to extract oobCode from email body (p: ${this.provider})\x1b[0m`);
                    console.log(email.body);
                    return resolve(false);
                }

                const didVerify = await this.verifyOobCode(oobCode);
                if (!didVerify) console.log(email.body);

                resolve(didVerify);
            } else setTimeout(async () => await check(), 2500);
        };

        await check();
    });
};