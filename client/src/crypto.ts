export async function deriveKey(passphrase: string, salt: string): Promise<CryptoKey> {
    const enc = new TextEncoder(); // Binary encoded input
    // Convert to CryptoKey
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    // Return AES key
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: enc.encode(salt),
            iterations: 100_000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export function randomBytes(len: number) {
    const buf = new Uint8Array(len);
    window.crypto.getRandomValues(buf);
    return buf;
}