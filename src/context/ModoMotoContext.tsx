import React, { createContext, useContext } from 'react';
import { useModoMoto } from '../hooks/useModoMoto';
import { EmergencyOverlay } from '../components/EmergencyOverlay';

type ModoMotoCtx = ReturnType<typeof useModoMoto>;

const ModoMotoContext = createContext<ModoMotoCtx | null>(null);

export function ModoMotoProvider({ children }: { children: React.ReactNode }) {
    const moto = useModoMoto();

    return (
        <ModoMotoContext.Provider value={moto}>
            {children}
            <EmergencyOverlay
                visible={moto.phase === 'alert'}
                countdown={moto.countdown}
                onCancel={moto.cancelAlert}
            />
        </ModoMotoContext.Provider>
    );
}

export function useModoMotoContext(): ModoMotoCtx {
    const ctx = useContext(ModoMotoContext);
    if (!ctx) throw new Error('useModoMotoContext debe usarse dentro de ModoMotoProvider');
    return ctx;
}
