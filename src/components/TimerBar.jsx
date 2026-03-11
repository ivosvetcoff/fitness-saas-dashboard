import { useState, useEffect, useRef } from 'react';

/**
 * TimerBar — temporizador visual de cuenta regresiva
 * Props:
 *   seconds      {number}   Total de segundos
 *   label        {string}   Etiqueta opcional (ej: "Descansá 90"")
 *   onComplete   {fn}       Se llama cuando llega a 0
 *   autoStart    {bool}     Si arranca automáticamente
 */
export default function TimerBar({ seconds, label, onComplete, autoStart = false }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Reiniciar si cambia `seconds`
  useEffect(() => {
    setRemaining(seconds);
    setRunning(autoStart);
  }, [seconds, autoStart]);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            playBeep();
            if (navigator.vibrate) navigator.vibrate([200]);
            onComplete?.();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* sin audio si el navegador no lo soporta */ }
  };

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0;
  const isUrgent = remaining <= 5 && remaining > 0;
  const barColor = isUrgent ? '#EF4444' : '#7C3AED';

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}"`;
  };

  return (
    <div style={{ background: 'rgba(18,18,26,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', marginTop: '10px' }}>
      {label && (
        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', textAlign: 'center' }}>{label}</p>
      )}

      {/* Número grande */}
      <div style={{ textAlign: 'center', fontSize: remaining > 99 ? '2.5rem' : '3.5rem', fontWeight: 800, color: isUrgent ? '#F87171' : '#FAFAFA', lineHeight: 1, marginBottom: '12px', transition: 'color 0.3s' }}>
        {fmt(remaining)}
      </div>

      {/* Barra de progreso */}
      <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '9999px', transition: 'width 0.9s linear, background 0.3s' }} />
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {remaining === 0 ? (
          <button
            onClick={() => { setRemaining(seconds); setRunning(false); }}
            style={{ flex: 1, padding: '8px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', color: '#A78BFA', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ↺ Reiniciar
          </button>
        ) : running ? (
          <>
            <button
              onClick={() => setRunning(false)}
              style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#A1A1AA', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ⏸ Pausar
            </button>
            <button
              onClick={() => { clearInterval(intervalRef.current); setRemaining(0); setRunning(false); onComplete?.(); }}
              style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', color: '#52525B', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Saltar →
            </button>
          </>
        ) : (
          <button
            onClick={() => setRunning(true)}
            style={{ flex: 1, padding: '10px', background: barColor, border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ▶ {remaining === seconds ? 'Iniciar' : 'Continuar'}
          </button>
        )}
      </div>
    </div>
  );
}
