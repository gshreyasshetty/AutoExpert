const normalizeBaseUrl = (url) => (url || '').replace(/\/+$/, '');

const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL) || 'http://localhost:5000';
const WS_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_WS_BASE_URL) || API_BASE_URL.replace(/^http/, 'ws');

export { API_BASE_URL, WS_BASE_URL };
