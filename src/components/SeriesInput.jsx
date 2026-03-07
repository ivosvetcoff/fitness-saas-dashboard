import { useState } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';

/**
 * SeriesInput — cuadraditos dinámicos de series
 * Props:
 *   name        {string}   Nombre del ejercicio
 *   sets        {number}   Cantidad de series
 *   repsRange   {string}   Ej: "8-12"
 *   repsPerSet  {string[]} Opcional: ["20","15","10","8"] — objetivo por serie
 *   rpeTarget   {number}   RPE objetivo, ej: 8
 *   onSave      {fn}       Recibe array de { set_number, actual_weight, actual_reps, actual_rpe }
 *   onCancel    {fn}       Opcional: volver atrás
 */
export default function SeriesInput({ name, sets, repsRange, repsPerSet, rpeTarget, onSave, onCancel }) {
  const [rows, setRows] = useState(
    Array.from({ length: sets }, (_, i) => ({
      id: i + 1,
      peso: '',
      reps: '',
      rpe: '',
      done: false,
    }))
  );
  const [saving, setSaving] = useState(false);

  const update = (id, field, value) =>
    setRows(r => r.map(row => (row.id === id ? { ...row, [field]: value } : row)));

  const toggleDone = (id) => {
    const row = rows.find(r => r.id === id);
    if (!row.done && (!row.peso || !row.reps || !row.rpe)) return; // needs data
    setRows(r => r.map(row => (row.id === id ? { ...row, done: !row.done } : row)));
  };

  const doneCount = rows.filter(r => r.done).length;
  const allDone = doneCount === sets;

  const handleSave = async () => {
    const completed = rows.filter(r => r.done).map(r => ({
      set_number: r.id,
      actual_weight: parseFloat(r.peso),
      actual_reps: parseInt(r.reps),
      actual_rpe: parseFloat(r.rpe),
    }));
    setSaving(true);
    await onSave(completed);
    setSaving(false);
  };

  return (
    <div className="si-wrapper">
      <div className="si-header">
        <h4 className="si-name">{name}</h4>
        <span className="si-badge">RPE {rpeTarget} · {repsPerSet ? repsPerSet.join('-') : repsRange} reps</span>
      </div>

      <div className="si-col-labels">
        <span className="si-col-label" style={{ width: 28 }}>#</span>
        <span className="si-col-label">Peso kg</span>
        <span className="si-col-label reps-col-label">Reps</span>
        <span className="si-col-label">RPE</span>
        <span className="si-col-label" style={{ width: 44 }}></span>
      </div>

      <div className="si-rows">
        {rows.map(row => (
          <div key={row.id} className={`si-row ${row.done ? 'si-row--done' : ''}`}>
            {/* Número de serie */}
            <div className="si-num">{row.id}</div>

            {/* Peso */}
            <div className="si-field">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={row.peso}
                disabled={row.done}
                onChange={e => update(row.id, 'peso', e.target.value)}
                className="si-input"
              />
            </div>

            {/* Reps — cuadradito violeta destacado */}
            <div className="si-field" style={{ position: 'relative' }}>
              {repsPerSet?.[row.id - 1] && (
                <span style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', color: '#A78BFA', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  obj: {repsPerSet[row.id - 1]}
                </span>
              )}
              <input
                type="number"
                inputMode="numeric"
                placeholder={repsPerSet?.[row.id - 1] || repsRange?.split('-')[0] || '0'}
                value={row.reps}
                disabled={row.done}
                onChange={e => update(row.id, 'reps', e.target.value)}
                className="si-input si-reps-square"
              />
            </div>

            {/* RPE */}
            <div className="si-field">
              <select
                value={row.rpe}
                disabled={row.done}
                onChange={e => update(row.id, 'rpe', e.target.value)}
                className="si-input si-select"
              >
                <option value="">—</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>

            {/* Check */}
            <button
              className={`si-check ${row.done ? 'si-check--done' : ''}`}
              onClick={() => toggleDone(row.id)}
              title={row.done ? 'Desmarcar' : 'Marcar como completada'}
            >
              <Check size={18} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        {onCancel && (
          <button className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
            Volver
          </button>
        )}
        <button
          className={`btn-primary si-save-btn ${allDone ? 'si-save-btn--green' : ''}`}
          onClick={handleSave}
          disabled={doneCount === 0 || saving}
          style={{ flex: 2 }}
        >
          {saving
            ? 'Guardando...'
            : allDone
            ? <><CheckCircle2 size={18} /> Guardar Todas las Series</>
            : `Guardar ${doneCount}/${sets} Series`}
        </button>
      </div>
    </div>
  );
}
