import scriptLoader from '../utils/scriptLoader';
import TransportController from './TrasnportController';

const polyfillsNeeded = [];

if (!('Promise' in self)) polyfillsNeeded.push('/js/polyfills/promise.js');

try {
    new URL('b', 'http://a');
}
catch(e) {
    polyfillsNeeded.push('/js/polyfills/url.js');
}

scriptLoader(polyfillsNeeded, () => {
    new TransportController(document.querySelector('.main'));
});