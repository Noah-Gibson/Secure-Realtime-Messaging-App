import { useState } from "react";
import { useChat } from "./useChat";

export default function Chat() {
    const [username, setUsername] = useState('');
    const [passphrase, setPassphrase] = useState('');

    const [to, setTo] = useState('');
    const [text, setText] = useState('');
    const { messages, sendMessage } = useChat(username, passphrase);

    return (
        <div className="chat">
            <div className="your-info">
                <div className="header">
                    <strong>Your Info</strong>
                </div>
                <div className="controls">
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                    />
                    <input 
                        type="text" 
                        placeholder="Password" 
                        value={passphrase} 
                        onChange={e => setPassphrase(e.target.value)} 
                    />
                </div>
            </div>
            <div className="history" style={{ paddingTop: 100 }}>
                {messages.map((m, i) => (
                    <div key={i} className={m.from === username ? 'out' : 'in'}>
                        <strong>{m.from} to {m.to}</strong>
                        <div>Salt: {m.salt}</div>
                        <div>Ciphertext: {m.ct}</div>
                        <div style={{ paddingBottom: 15 }}>Plaintext: {m.plaintext}</div>
                    </div>
                ))}
            </div>
            <div className="send-message">
                <input style={{ display: 'block' }}
                    placeholder="Send to..." 
                    onChange={e => setTo(e.target.value)} 
                />
                <textarea 
                    value={text}
                    placeholder="Message"
                    onChange={e => setText(e.target.value)} 
                />
                <button onClick={() => { sendMessage(to, text); setText(''); }}>Send</button>
            </div>
        </div>
    );     
}