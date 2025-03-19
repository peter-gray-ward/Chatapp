import { RequestOptions } from './types';

export const xhr = async (options: RequestOptions): Promise<any> => {
    const { url, method = 'GET', headers = {}, body } = options;

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}