import React, { useMemo, useRef, useState } from 'react';

function getSpeechRecognition() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function VoiceSearchButton({ onTranscript, disabled = false }) {
    const recognitionRef = useRef(null);
    const [listening, setListening] = useState(false);
    const SpeechRecognition = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return getSpeechRecognition();
    }, []);

    const supported = Boolean(SpeechRecognition);

    function startListening() {
        if (!supported || disabled || listening) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = event.results?.[0]?.[0]?.transcript || '';
            if (transcript.trim()) {
                onTranscript(transcript.trim());
            }
        };

        recognition.onerror = () => {
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
            recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        setListening(true);
        recognition.start();
    }

    function stopListening() {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setListening(false);
    }

    if (!supported) {
        return null;
    }

    return (
        <button
            type="button"
            className={`btn ${listening ? 'btn-danger' : 'btn-outline-secondary'} ms-2`}
            title={listening ? 'Parar busca por voz' : 'Buscar por voz'}
            aria-label={listening ? 'Parar busca por voz' : 'Buscar por voz'}
            aria-pressed={listening}
            disabled={disabled}
            onClick={listening ? stopListening : startListening}
            style={{ minWidth: 44 }}
        >
            <i className={`fa ${listening ? 'fa-stop' : 'fa-microphone'}`}></i>
        </button>
    );
}
