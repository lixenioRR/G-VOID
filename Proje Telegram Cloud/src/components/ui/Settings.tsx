'use client';

import { useTranslations } from 'next-intl';
import { useGameStore } from '@/store/gameStore';

interface SettingsProps {
    onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
    const t = useTranslations('settings');
    const { soundEnabled, hapticEnabled, language, toggleSound, toggleHaptic, setLanguage } =
        useGameStore();

    const ToggleRow = ({
        label,
        value,
        onToggle,
        id,
    }: {
        label: string;
        value: boolean;
        onToggle: () => void;
        id: string;
    }) => (
        <div className="flex items-center justify-between py-4 border-b border-void-green/10">
            <span className="font-orbitron text-white/70 text-xs tracking-widest uppercase">
                {label}
            </span>
            <button
                id={id}
                onClick={onToggle}
                className={`
          relative w-12 h-6 rounded-full transition-all duration-200
          ${value ? 'bg-void-green' : 'bg-void-black border border-void-green/30'}
        `}
                style={value ? { boxShadow: '0 0 8px #36E27B' } : {}}
            >
                <div
                    className={`
            absolute top-1 w-4 h-4 rounded-full bg-void-black transition-transform duration-200
            ${value ? 'translate-x-7' : 'translate-x-1'}
          `}
                    style={value ? { background: '#050505' } : { background: '#36E27B26' }}
                />
            </button>
        </div>
    );

    return (
        <div className="relative flex flex-col w-full h-full bg-void-black/95 px-5 py-8">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-void-green/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-void-green/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-void-green/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-void-green/40" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    id="btn-settings-back"
                    onClick={onBack}
                    className="w-8 h-8 flex items-center justify-center rounded border border-void-green/30 text-void-green"
                >
                    ←
                </button>
                <h2
                    className="font-orbitron font-black text-void-green text-xl tracking-widest"
                    style={{ textShadow: '0 0 10px #36E27B' }}
                >
                    {t('title')}
                </h2>
            </div>

            {/* Settings list */}
            <div className="flex flex-col flex-1">
                <ToggleRow label={t('sound')} value={soundEnabled} onToggle={toggleSound} id="toggle-sound" />
                <ToggleRow
                    label={t('haptic')}
                    value={hapticEnabled}
                    onToggle={toggleHaptic}
                    id="toggle-haptic"
                />

                {/* Language selector */}
                <div className="flex items-center justify-between py-4 border-b border-void-green/10">
                    <span className="font-orbitron text-white/70 text-xs tracking-widest uppercase">
                        {t('language')}
                    </span>
                    <div className="flex gap-2">
                        {(['en', 'tr'] as const).map((lang) => (
                            <button
                                key={lang}
                                id={`btn-lang-${lang}`}
                                onClick={() => {
                                    setLanguage(lang);
                                    // Write cookie so next-intl (i18n.ts) picks up the locale
                                    document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=31536000`;
                                    // Reload to re-render with new locale
                                    window.location.reload();
                                }}
                                className={`
                  px-3 py-1.5 rounded font-orbitron text-[10px] font-bold tracking-widest uppercase
                  transition-all duration-150
                  ${language === lang
                                        ? 'bg-void-green text-void-black'
                                        : 'border border-void-green/20 text-void-green/50'}
                `}
                            >
                                {lang.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Version */}
            <p className="font-orbitron text-void-green/20 text-[8px] text-center tracking-widest mt-auto pb-2">
                G-VOID v0.1.0 — CYBER TACTICAL RUNNER
            </p>
        </div>
    );
}
