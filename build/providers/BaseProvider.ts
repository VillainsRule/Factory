import { API } from 'yolkbot/api';

class BaseProvider {
    mode: 'KILN' | 'TEMPMAIL' = 'KILN';
    firebase: API;

    constructor(firebase: API) {
        this.firebase = firebase;
    }

    getAddress(): Promise<string> {
        throw new Error(this.constructor.name + ' has not implemented getAddress()');
    }

    waitAndVerify(address: string): Promise<boolean> {
        throw new Error(this.constructor.name + ' has not implemented waitAndVerify()');
    }

    async verifyOobCode(oobCode: string): Promise<boolean> {
        const verifyRes = await this.firebase.verifyOobCode(oobCode);
        if (!verifyRes.ok) {
            console.error('Failed to verify oobCode via Firebase API: ' + JSON.stringify(verifyRes));
            return false;
        } return verifyRes.ok;
    }
}

export default BaseProvider;