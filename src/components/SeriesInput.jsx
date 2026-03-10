import { useState, useEffect } from 'react';
import { Check, CheckCircle2, Timer } from 'lucide-react';
import TimerBar from './TimerBar';

const RIR_OPTS = [
  { value: 3, emoji: '😌', label: 'Fácil' },
  { value: 1, emoji: '💪', label: 'Exigente' },
  { value: 0, emoji: '🥵', label: 'Al fallo' },
];

/**
 * SeriesInput — cuadraditos dinámicos de series
 * Props:
 *   name               {string}   Nombre del ejercicio
 *   sets               {number}   Cantidad de series
 *   repsRange          {string}   Ej: "8-12"
 *   repsPerSet         {string[]} Opcional: ["20","15","10","8"] — objetivo por serie
 *   rirTarget          {number}   RIR objetivo (0=fallo, 1=exigente, 2=moderado, 3=fácil)
 *   tipoMedicion       {string}   'reps' | 'tiempo' | 'reps_y_tiempo'
 *   duracionSegundos   {number}   Duración para tipo 'tiempo'
 *   tempoSubida        {number}   Segundos fase concéntrica
 *   tempoPausa         {number}   Segundos isometría arriba
 *   tempoBajada        {number}   Segundos fase excéntrica
 *   descansoEntreSeries {number}  Segundos de descanso entre series
 *   onSave             {fn}       Recibe array de { set_number, actual_weight, actual_reps, actual_rir }
 *   onCancel           {fn}       Opcional: volver atrás
 */
export default function SeriesInput({
  name, sets, repsRange, repsPerSet, rirTarget,
  tipoMedicion = 'reps',
  duracionSegundos, tempoSubida, tempoPausa, tempoBajada,
  descansoEntreSeries,
  onSave, onCancel,
}) {
  const [rows, setRows] = useState(
    Array.from({ length: sets }, (_, i) => ({
      id: i + 1,
      peso: '',
      reps: '',
      rir: '',
      tiempo: duracionSegundos ? String(duracionSegundos) : '',
      pausaIso: tempoPausa ? String(tempoPausa) : '',
      done: false,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null); // null | { type: 'set'|'rest', setId, seconds }

  const update = (id, field, value) =>
    setRows(r => r.map(row => (row.id === id ? { ...row, [field]: value } : row)));

  const canToggle = (row) => {
    if (tipoMedicion === 'tiempo') return !!row.tiempo;
    if (tipoMedicion === 'reps_y_tiempo') return !!row.reps && row.rir !== '';
    return !!row.peso && !!row.reps && row.rir !== '';
  };

  const toggleDone = (id) => {
    const row = rows.find(r => r.id === id);
    if (!row.done && !canToggle(row)) return;
    const newDone = !row.done;
    setRows(r => r.map(r2 => (r2.id === id ? { ...r2, done: newDone } : r2)));
    // Si se marca como hecha y hay descanso, mostrar temporizador
    if (newDone && descansoEntreSeries && descansoEntreSeries > 0) {
      setActiveTimer({ type: 'rest', setId: id, seconds: descansoEntreSeries });
    }
  };

  const doneCount = rows.filter(r => r.done).length;
  const allDone = doneCount === sets;

  const handleSave = async () => {
    const completed = rows.filter(r => r.done).map(r => ({
      set_number: r.id,
      actual_weight: parseFloat(r.peso) || 0,
      actual_reps: tipoMedicion === 'tiempo' ? Math.round(parseFloat(r.tiempo) || 0) : parseInt(r.reps) || 0,
      actual_rir: parseFloat(r.rir) || 0,
    }));
    setSaving(true);
    await onSave(completed);
    setSaving(false);
  };

  const hasTempo = tempoSubida || tempoBajada || (tipoMedicion === 'reps' && tempoPausa);
  const tempoStr = hasTempo
    ? `${tempoSubida || '_'}"-${tempoPausa || '_'}"-${tempoBajada || '_'}"`
    : null;

  // ── CASO B: TIEMPO ──────────────────────────────────────────────────────────
  if (tipoMedicion === 'tiempo') {
    return (
      <div className="si-wrapper">
        <div className="si-header">
          <h4 className="si-name">{name}</h4>
          <span className="si-badge" style={{ background: 'rgba(6,182,212,0.12)', color: '#22D3EE', borderColor: 'rgba(6,182,212,0.25)' }}>
            ⏱ TIEMPO · {sets} series
          </span>
        </div>

        {/* Columnas */}
        <div className="si-col-labels">
          <span className="si-col-label" style={{ width: 28 }}>#</span>
          <span className="si-col-label">Duración (seg)</span>
          <span className="si-col-label" style={{ width: 44 }}></span>
        </div>

        <div className="si-rows">
          {rows.map(row => (
            <div key={row.id} className={`si-row ${row.done ? 'si-row--done' : ''}`} style={{ flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="si-num">{row.id}</div>
                <div className="si-field" style={{ flex: 1 }}>
                  <input
                    type="number" inputMode="numeric" placeholder={String(duracionSegundos || 60)}
                    value={row.tiempo} disabled={row.done}
                    onChange={e => update(row.id, 'tiempo', e.target.value)}
                    className="si-input"
                    style={{ background: 'rgba(6,182,212,0.07)', color: '#22D3EE' }}
                  />
                </div>
                {/* Botón iniciar temporizador */}
                {!row.done && row.tiempo && (
                  <button
                    type="button"
                    onClick={() => setActiveTimer({ type: 'set', setId: row.id, seconds: Number(row.tiempo) })}
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', padding: '6px 10px', color: '#A78BFA', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Timer size={14} /> ▶
                  </button>
                )}
                <button
                  className={`si-check ${row.done ? 'si-check--done' : ''}`}
                  onClick={() => toggleDone(row.id)}
                  title={row.done ? 'Desmarcar' : 'Marcar como completada'}
                >
                  <Check size={18} />
                </button>
              </div>

              {/* Temporizador activo para esta serie */}
              {activeTimer?.type === 'set' && activeTimer.setId === row.id && (
                <TimerBar
                  seconds={activeTimer.seconds}
                  label={`Serie ${row.id} — ${activeTimer.seconds}"`}
                  autoStart
                  onComplete={() => {
                    setActiveTimer(null);
                    update(row.id, 'tiempo', String(activeTimer.seconds));
                    toggleDone(row.id);
                  }}
                />
              )}

              {/* Temporizador de descanso */}
              {activeTimer?.type === 'rest' && activeTimer.setId === row.id && (
                <TimerBar
                  seconds={activeTimer.seconds}
                  label={`Descansá ${activeTimer.seconds}"`}
                  autoStart
                  onComplete={() => setActiveTimer(null)}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          {onCancel && <button className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Volver</button>}
          <button
            className={`btn-primary si-save-btn ${allDone ? 'si-save-btn--green' : ''}`}
            onClick={handleSave} disabled={doneCount === 0 || saving}
            style={{ flex: 2 }}
          >
            {saving ? 'Guardando...' : allDone
              ? <><CheckCircle2 size={18} /> Guardar Todas las Series</>
              : `Guardar ${doneCount}/${sets} Series`}
          </button>
        </div>
      </div>
    );
  }

  // ── CASO C: REPS + TIEMPO (isométrico) ──────────────────────────────────────
  if (tipoMedicion === 'reps_y_tiempo') {
    return (
      <div className="si-wrapper">
        <div className="si-header">
          <h4 className="si-name">{name}</h4>
          <span className="si-badge" style={{ background: 'rgba(249,115,22,0.12)', color: '#FB923C', borderColor: 'rgba(249,115,22,0.25)' }}>
            ⏱+🔢 MIXTO · {RIR_OPTS.find(o => o.value === rirTarget)?.emoji} RIR {rirTarget} · {repsPerSet ? repsPerSet.join('-') : repsRange} reps
          </span>
        </div>

        <div className="si-col-labels">
          <span className="si-col-label" style={{ width: 28 }}>#</span>
          <span className="si-col-label">Peso kg</span>
          <span className="si-col-label">Reps</span>
          <span className="si-col-label">Pausa"</span>
          <span className="si-col-label" style={{ width: 44 }}></span>
        </div>

        <div className="si-rows">
          {rows.map(row => (
            <div key={row.id} className={`si-row ${row.done ? 'si-row--done' : ''}`} style={{ flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="si-num">{row.id}</div>
                <div className="si-field">
                  <input type="number" inputMode="decimal" placeholder="0" value={row.peso} disabled={row.done} onChange={e => update(row.id, 'peso', e.target.value)} className="si-input" />
                </div>
                <div className="si-field">
                  {repsPerSet?.[row.id - 1] && (
                    <span style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', color: '#A78BFA', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      obj: {repsPerSet[row.id - 1]}
                    </span>
                  )}
                  <input type="number" inputMode="numeric" placeholder={repsPerSet?.[row.id - 1] || repsRange?.split('-')[0] || '0'} value={row.reps} disabled={row.done} onChange={e => update(row.id, 'reps', e.target.value)} className="si-input si-reps-square" style={{ position: 'relative' }} />
                </div>
                {/* Pausa isométrica */}
                <div className="si-field">
                  <input
                    type="number" inputMode="numeric"
                    placeholder={tempoPausa ? String(tempoPausa) : '0'}
                    value={row.pausaIso} disabled={row.done}
                    onChange={e => update(row.id, 'pausaIso', e.target.value)}
                    className="si-input"
                    style={{ background: 'rgba(249,115,22,0.07)', color: '#FB923C' }}
                  />
                </div>
                <button className={`si-check ${row.done ? 'si-check--done' : ''}`} onClick={() => toggleDone(row.id)} title={row.done ? 'Desmarcar' : 'Marcar'}>
                  <Check size={18} />
                </button>
              </div>

              {/* Selector de esfuerzo */}
              <div style={{ display: 'flex', gap: '8px', paddingLeft: '36px' }}>
                {RIR_OPTS.map(opt => (
                  <button key={opt.value} type="button" disabled={row.done}
                    onClick={() => update(row.id, 'rir', String(opt.value))}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '1.5rem', lineHeight: 1, background: row.rir === String(opt.value) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)', border: row.rir === String(opt.value) ? '2px solid #7C3AED' : '2px solid transparent', borderRadius: '10px', padding: '6px 4px', cursor: row.done ? 'default' : 'pointer', opacity: row.done ? 0.5 : 1, transition: 'background 0.15s, border 0.15s' }}
                  >
                    {opt.emoji}
                    <span style={{ fontSize: '0.6rem', color: row.rir === String(opt.value) ? '#A78BFA' : '#71717A', fontWeight: 600 }}>{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Descanso */}
              {activeTimer?.type === 'rest' && activeTimer.setId === row.id && (
                <TimerBar seconds={activeTimer.seconds} label={`Descansá ${activeTimer.seconds}"`} autoStart onComplete={() => setActiveTimer(null)} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          {onCancel && <button className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Volver</button>}
          <button className={`btn-primary si-save-btn ${allDone ? 'si-save-btn--green' : ''}`} onClick={handleSave} disabled={doneCount === 0 || saving} style={{ flex: 2 }}>
            {saving ? 'Guardando...' : allDone ? <><CheckCircle2 size={18} /> Guardar Todas las Series</> : `Guardar ${doneCount}/${sets} Series`}
          </button>
        </div>
      </div>
    );
  }

  // ── CASO A: REPS (default) ──────────────────────────────────────────────────
  return (
    <div className="si-wrapper">
      <div className="si-header">
        <h4 className="si-name">{name}</h4>
        <span className="si-badge">{RIR_OPTS.find(o => o.value === rirTarget)?.emoji ?? '💪'} RIR {rirTarget} · {repsPerSet ? repsPerSet.join('-') : repsRange} reps</span>
      </div>

      {/* Guía de tempo si está configurado */}
      {tempoStr && (
        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '8px', padding: '6px 12px', marginBottom: '10px', fontSize: '0.78rem', color: '#A78BFA', textAlign: 'center' }}>
          ⏱ Tempo: {tempoStr} (subida-pausa-bajada)
        </div>
      )}

      {descansoEntreSeries && descansoEntreSeries < 30 && (
        <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '8px', padding: '6px 12px', marginBottom: '10px', fontSize: '0.78rem', color: '#FDE047' }}>
          ⚡ Series cortas con {descansoEntreSeries}" de descanso — temporizador automático
        </div>
      )}

      <div className="si-col-labels">
        <span className="si-col-label" style={{ width: 28 }}>#</span>
        <span className="si-col-label">Peso kg</span>
        <span className="si-col-label reps-col-label">Reps</span>
        <span className="si-col-label" style={{ width: 44 }}></span>
      </div>

      <div className="si-rows">
        {rows.map(row => (
          <div key={row.id} className={`si-row ${row.done ? 'si-row--done' : ''}`} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="si-num">{row.id}</div>
              <div className="si-field">
                <input type="number" inputMode="decimal" placeholder="0" value={row.peso} disabled={row.done} onChange={e => update(row.id, 'peso', e.target.value)} className="si-input" />
              </div>
              <div className="si-field" style={{ position: 'relative' }}>
                {repsPerSet?.[row.id - 1] && (
                  <span style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', color: '#A78BFA', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    obj: {repsPerSet[row.id - 1]}
                  </span>
                )}
                <input type="number" inputMode="numeric" placeholder={repsPerSet?.[row.id - 1] || repsRange?.split('-')[0] || '0'} value={row.reps} disabled={row.done} onChange={e => update(row.id, 'reps', e.target.value)} className="si-input si-reps-square" />
              </div>
              <button className={`si-check ${row.done ? 'si-check--done' : ''}`} onClick={() => toggleDone(row.id)} title={row.done ? 'Desmarcar' : 'Marcar como completada'}>
                <Check size={18} />
              </button>
            </div>

            {/* Selector de esfuerzo */}
            <div style={{ display: 'flex', gap: '8px', paddingLeft: '36px' }}>
              {RIR_OPTS.map(opt => (
                <button key={opt.value} type="button" disabled={row.done}
                  onClick={() => update(row.id, 'rir', String(opt.value))}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: '1.5rem', lineHeight: 1, background: row.rir === String(opt.value) ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)', border: row.rir === String(opt.value) ? '2px solid #7C3AED' : '2px solid transparent', borderRadius: '10px', padding: '6px 4px', cursor: row.done ? 'default' : 'pointer', opacity: row.done ? 0.5 : 1, transition: 'background 0.15s, border 0.15s' }}
                >
                  {opt.emoji}
                  <span style={{ fontSize: '0.6rem', color: row.rir === String(opt.value) ? '#A78BFA' : '#71717A', fontWeight: 600 }}>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* Temporizador de descanso automático */}
            {activeTimer?.type === 'rest' && activeTimer.setId === row.id && (
              <TimerBar
                seconds={activeTimer.seconds}
                label={`Descansá ${activeTimer.seconds}"`}
                autoStart
                onComplete={() => setActiveTimer(null)}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        {onCancel && <button className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Volver</button>}
        <button
          className={`btn-primary si-save-btn ${allDone ? 'si-save-btn--green' : ''}`}
          onClick={handleSave} disabled={doneCount === 0 || saving}
          style={{ flex: 2 }}
        >
          {saving ? 'Guardando...'
            : allDone
            ? <><CheckCircle2 size={18} /> Guardar Todas las Series</>
            : `Guardar ${doneCount}/${sets} Series`}
        </button>
      </div>
    </div>
  );
}
