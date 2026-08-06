import React, { useMemo, useState } from 'react';

function clean(value) {
    if (!value || value === '0' || value === 'null' || value === 'undefined') return '';
    return String(value).replace(/\s+/g, ' ').trim();
}

function buildProfileText(profile) {
    const parts = [
        clean(profile?.descAnuncio),
        clean(profile?.descDescricao),
        clean(profile?.descPromocao) ? `Promocao: ${clean(profile.descPromocao)}.` : '',
        clean(profile?.descEndereco) ? `Endereco: ${clean(profile.descEndereco)}.` : '',
        clean(profile?.descTelefone) ? `Telefone: ${clean(profile.descTelefone)}.` : '',
        clean(profile?.descWhatsApp) ? `WhatsApp: ${clean(profile.descWhatsApp)}.` : '',
    ].filter(Boolean);

    return parts.join('. ');
}

export default function SpeakProfileButton({ profile }) {
    const [speaking, setSpeaking] = useState(false);
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const text = useMemo(() => buildProfileText(profile), [profile]);

    function toggleSpeech() {
        if (!supported || !text) return;

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);

        setSpeaking(true);
        window.speechSynthesis.speak(utterance);
    }

    if (!supported || !text) {
        return null;
    }

    return (
        <button
            type="button"
            className={`btn btn-sm ${speaking ? 'btn-danger' : 'btn-outline-primary'}`}
            onClick={toggleSpeech}
            title={speaking ? 'Parar leitura do perfil' : 'Ouvir resumo do perfil'}
            aria-label={speaking ? 'Parar leitura do perfil' : 'Ouvir resumo do perfil'}
            aria-pressed={speaking}
        >
            <i className={`fa ${speaking ? 'fa-stop' : 'fa-volume-up'} me-1`}></i>
            {speaking ? 'Parar' : 'Ouvir perfil'}
        </button>
    );
}
