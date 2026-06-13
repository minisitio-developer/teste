/**
 * config.js — Configuracao dinamica de URLs
 * Detecta automaticamente o ambiente (local, staging, producao)
 * Nenhuma URL hardcoded — tudo via logica de dominio
 */

const hostname = window.location.hostname;
const apiProtocol = window.location.protocol;
const port = 3032;

let apiDomain;
let portalDomain;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
    apiDomain = `${hostname}:${port}`;
    portalDomain = `${hostname}:3000`;
} else {
    // Producao: usa o proprio dominio para API e frontend
    apiDomain = hostname;
    portalDomain = hostname;
}

const apiUrl = `${apiProtocol}//${apiDomain}/api`;
const ioUrl  = `${apiProtocol}//${apiDomain}`;
const domain = `${apiProtocol}//${portalDomain}`;

export const masterPath = {
    url: apiUrl,
    domain: domain,
    ioUrl: ioUrl,
    accessToken: sessionStorage.getItem('userTokenAccess'),
};

export const version = {
    version: 'v2.1.29',
};
