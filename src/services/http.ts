/**
 * fetchWithTimeout — wrapper sobre `fetch` que rechaza con Error('Request timeout')
 * si el server no responde en `ms` milisegundos. Usar para todos los endpoints
 * donde un timeout colgado dejaría la UI bloqueada.
 */
import { API_CONFIG } from '../constants/api';

export async function fetchWithTimeout(
    url: string,
    init?: RequestInit,
    ms: number = API_CONFIG.requestTimeout
): Promise<Response> {
    return Promise.race([
        fetch(url, init),
        new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), ms)
        ),
    ]);
}
