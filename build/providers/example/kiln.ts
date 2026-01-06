import BaseProvider from '../BaseProvider';

const KILN_EMAIL = 'your-kiln.domain';

class KilnExample extends BaseProvider {
    mode: 'KILN' = 'KILN';

    getAddress() {
        const emailPart = Math.random().toString(36).substring(2, 10);
        return Promise.resolve(emailPart + '@' + KILN_EMAIL);
    }
};

export default KilnExample;