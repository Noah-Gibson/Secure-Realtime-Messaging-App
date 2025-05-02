import { useState, useEffect, useRef } from 'react';
import { deriveKey, randomBytes } from './crypto';

export function useChat(username: string, passphrase: string) {
    const [messages, setMessages] = useState<{ from: string; to: string; iv: string; ct: string; plaintext: string; salt: string }[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const passphraseRef = useRef(passphrase);

    useEffect(() => {
        passphraseRef.current = passphrase;
    }, [passphrase]);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/${username}`);
        wsRef.current = ws;

        ws.onmessage = async e => {
            const { from, to, iv, ct, salt } = JSON.parse(e.data);
            const ivBuf = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
            const ctBuf = Uint8Array.from(atob(ct), c => c.charCodeAt(0));
            const saltBuf = Uint8Array.from(atob(salt), c => c.charCodeAt(0));
            const saltB64 = btoa(String.fromCharCode(...saltBuf));
            const key = await deriveKey(passphraseRef.current, saltB64);

            try {
                const ptBuf = await window.crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv: ivBuf },
                    key,
                    ctBuf
                );
                const plaintext = new TextDecoder().decode(ptBuf);
                setMessages(m => [...m, { from, to, iv, ct, plaintext, salt }]);
            } catch (err) {
                console.warn("Failed to decrypt message", err);
            }
        };

        return () => {
            ws.close();
        };
    }, [username]);

    const sendMessage = async (to: string, text: string) => {
        const saltBytes = randomBytes(16);
        const salt = btoa(String.fromCharCode(...saltBytes));
        const key = await deriveKey(passphrase, salt);

        const iv = randomBytes(12);
        const enc = new TextEncoder();
        const ctBuf = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            enc.encode(text)
        );

        const payload = {
            from: username,
            to,
            iv: btoa(String.fromCharCode(...iv)),
            ct: btoa(String.fromCharCode(...new Uint8Array(ctBuf))),
            salt: salt
        };

        wsRef.current?.send(JSON.stringify(payload));
        setMessages(m => [...m, { ...payload, plaintext: text }]);
    };

    return { messages, sendMessage };
}
