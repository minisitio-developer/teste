const hostname = window.location.hostname;
const apiProtocol = window.location.protocol;
const port = 3032;
const envApiUrl = import.meta.env.VITE_API_URL;
const envDomain = import.meta.env.VITE_DOMAIN;

let apiDomain;
let portalDomain;

if (envApiUrl) {
  apiDomain = envApiUrl.replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
  portalDomain = (envDomain || envApiUrl).replace(/^https?:\/\//, '').replace(/\/api\/?$/, '');
} else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    apiDomain = `${hostname}:${port}`;
    portalDomain = `${hostname}:3000`;
} else {
    apiDomain = hostname;
    portalDomain = hostname;
}

const apiUrl = envApiUrl || `${apiProtocol}//${apiDomain}/api`;
const ioUrl  = envApiUrl || `${apiProtocol}//${apiDomain}`;
const domain = envDomain || `${apiProtocol}//${portalDomain}`;

export const masterPath = {
    url: apiUrl,
    domain: domain,
    ioUrl: ioUrl,
    accessToken: sessionStorage.getItem('userTokenAccess'),
};

export const version = {
    version: '2.1.29',
};
