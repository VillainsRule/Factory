import { API } from 'yolkbot/api';

import malq from './impl/malq';

const getProvider = (firebase: API): malq => {
    // instantiate one or more providers here
    // if you don't, your program won't work
    // make sure to pass firebase to them
    return new malq(firebase);
};

export default getProvider;