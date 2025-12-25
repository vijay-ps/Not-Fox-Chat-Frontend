const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const session = localStorage.getItem('sb-uwozatbfcstgrqhenvjq-auth-token');
    const token = session ? JSON.parse(session).access_token : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const api = {
    auth: {
        register: (data: any) => fetch(`${API_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(res => res.json()),
        login: (data: any) => fetch(`${API_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(res => res.json()),
        logout: () => fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: getHeaders() }).then(res => res.json()),
        getMe: () => fetch(`${API_URL}/auth/me`, { headers: getHeaders() }).then(res => res.json()),
    },
    servers: {
        list: () => fetch(`${API_URL}/servers`, { headers: getHeaders() }).then(res => res.json()),
        create: (data: any) => fetch(`${API_URL}/servers`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(res => res.json()),
        join: (inviteCode: string) => fetch(`${API_URL}/servers/join`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ inviteCode }) }).then(res => res.json()),
        getChannels: (serverId: string) => fetch(`${API_URL}/servers/${serverId}/channels`, { headers: getHeaders() }).then(res => res.json()),
    },
    channels: {
        create: (data: any) => fetch(`${API_URL}/channels`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(res => res.json()),
        delete: (channelId: string) => fetch(`${API_URL}/channels/${channelId}`, { method: 'DELETE', headers: getHeaders() }).then(res => res.json()),
    },
    messages: {
        list: (channelId: string) => fetch(`${API_URL}/messages/${channelId}`, { headers: getHeaders() }).then(res => res.json()),
        send: (data: any) => fetch(`${API_URL}/messages`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(res => res.json()),
        delete: (messageId: string) => fetch(`${API_URL}/messages/${messageId}`, { method: 'DELETE', headers: getHeaders() }).then(res => res.json()),
    },
    friends: {
        list: () => fetch(`${API_URL}/friends`, { headers: getHeaders() }).then(res => res.json()),
        pending: () => fetch(`${API_URL}/friends/pending`, { headers: getHeaders() }).then(res => res.json()),
        request: (targetUserId: string) => fetch(`${API_URL}/friends/request`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ targetUserId }) }).then(res => res.json()),
        accept: (requestId: string) => fetch(`${API_URL}/friends/accept`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ requestId }) }).then(res => res.json()),
    },
    users: {
        search: (query: string) => fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, { headers: getHeaders() }).then(res => res.json()),
    },
    health: () => fetch(`${API_URL}/health`).then(res => res.json()),
    storage: {
        upload: (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            return fetch(`${API_URL}/storage/upload`, {
                method: 'POST',
                headers: {
                    ...(localStorage.getItem('sb-uwozatbfcstgrqhenvjq-auth-token')
                        ? { Authorization: `Bearer ${JSON.parse(localStorage.getItem('sb-uwozatbfcstgrqhenvjq-auth-token')!).access_token}` }
                        : {})
                },
                body: formData
            }).then(res => res.json());
        }
    }
};

export const fetchHealth = api.health;
