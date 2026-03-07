import { useState, useEffect, useCallback } from 'react';
import { Users, FileText, Dumbbell, Save, ChevronLeft, UserPlus, Activity, Target, Plus, Trash2, LogOut, Home, Utensils, Loader2, Flame, Trophy, CheckCircle2, TrendingUp, TrendingDown, Minus, User, ChevronDown, ChevronUp, BarChart2, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import axios from 'axios';
import SeriesInput from './components/SeriesInput';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CHART_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#A78BFA', '#EC4899', '#14B8A6', '#F97316'];

export default function App() {
  // ===== AUTH STATE =====
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ===== PROFESSOR STATE =====
  const [currentView, setCurrentView] = useState('ListaAlumnos');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', age: '', weight_kg: '', height_cm: '', goal: 'Hipertrofia' });
  const [savingStudent, setSavingStudent] = useState(false);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [performanceData, setPerformanceData] = useState(null);
  const [studentPhotos, setStudentPhotos] = useState([]);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [routineExercises, setRoutineExercises] = useState([]);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [stagnantAlerts, setStagnantAlerts] = useState({});
  const [routineName, setRoutineName] = useState('');
  const [days, setDays] = useState([{ id: crypto.randomUUID(), dayNumber: 1, dayName: '', exercises: [] }]);

  // ===== STUDENT STATE =====
  const [studentScreen, setStudentScreen] = useState('home');
  const [stExercises, setStExercises] = useState([]);
  const [stSession, setStSession] = useState(null);
  const [stSelectedDay, setStSelectedDay] = useState(null);
  const [stExpandedId, setStExpandedId] = useState(null);
  const [stLoading, setStLoading] = useState(false);
  const [stSuccess, setStSuccess] = useState(false);
  const [stNextTarget, setStNextTarget] = useState(null);
  const [stRankings, setStRankings] = useState([]);
  const [stLoadingRankings, setStLoadingRankings] = useState(false);
  const [stNutrition, setStNutrition] = useState(null);
  const [stLoadingNutrition, setStLoadingNutrition] = useState(false);
  const [stExpandedMeal, setStExpandedMeal] = useState(null);
  const [stIsFinishing, setStIsFinishing] = useState(false);

  // ===== LOGIN =====
  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email: loginEmail, password: loginPassword });
      setLoggedInUser(res.data);
      localStorage.setItem('fitpro_user', JSON.stringify(res.data));
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Error de conexión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('fitpro_user');
    window.location.href = 'http://localhost:3000/elizondo-fitness.html';
  };

  // Check stored session
  useEffect(() => {
    const stored = localStorage.getItem('fitpro_user');
    if (stored) {
      try { setLoggedInUser(JSON.parse(stored)); } catch { localStorage.removeItem('fitpro_user'); }
    }
  }, []);

  // ===== PROFESSOR FETCHES =====
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const professorId = loggedInUser?.id;
      const url = professorId ? `${API_URL}/students/?professor_id=${professorId}` : `${API_URL}/students/`;
      const res = await axios.get(url);
      setStudents(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingStudents(false); }
  }, [loggedInUser]);

  const fetchStagnantAlerts = async () => {
    try {
      const res = await axios.get(`${API_URL}/analytics/stagnant-students`);
      setStagnantAlerts(res.data || {});
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (loggedInUser?.role === 'professor') { fetchStudents(); fetchStagnantAlerts(); }
  }, [loggedInUser, fetchStudents]);

  useEffect(() => {
    if (loggedInUser?.role === 'professor') {
      const f = async () => {
        try { const r = await axios.get(`${API_URL}/exercises`); setExerciseLibrary(r.data || []); if (r.data?.length) setSelectedExerciseId(r.data[0].id); } catch (e) { console.error(e); }
      };
      f();
    }
  }, [loggedInUser]);

  const fetchPerformance = async (sid) => { try { const r = await axios.get(`${API_URL}/student/${sid}/performance`); setPerformanceData(r.data); } catch { setPerformanceData(null); } };
  const fetchPhotos = async (sid) => { try { const r = await axios.get(`${API_URL}/student/${sid}/photos`); setStudentPhotos(r.data || []); } catch { setStudentPhotos([]); } };
  const fetchActiveRoutine = async (sid) => {
    try {
      const r = await axios.get(`${API_URL}/student/${sid}/next-workout`);
      setActiveRoutine({ routine_id: r.data.routine_id, routine_name: r.data.routine_name, current_day: r.data.current_day, total_days: r.data.total_days });
      const all = await axios.get(`${API_URL}/routines/${r.data.routine_id}/exercises`);
      setRoutineExercises(all.data || []);
    } catch { setActiveRoutine(null); setRoutineExercises([]); }
  };
  const fetchNutritionPlan = async (sid) => { try { const r = await axios.get(`${API_URL}/student/${sid}/nutrition`); setNutritionPlan(r.data); } catch { setNutritionPlan(null); } };

  const handleDeleteStudent = async (sid, name) => {
    if (!confirm(`¿Eliminar a "${name}"?`)) return;
    setDeletingStudentId(sid);
    try { await axios.delete(`${API_URL}/students/${sid}`); setStudents(p => p.filter(s => s.id !== sid)); if (selectedStudent?.id === sid) { setSelectedStudent(null); setCurrentView('ListaAlumnos'); } }
    catch (e) { alert('Error: ' + (e.response?.data?.detail || e.message)); }
    finally { setDeletingStudentId(null); }
  };

  const createExercise = (exId) => {
    const ex = exerciseLibrary.find(e => e.id === exId);
    return { id: crypto.randomUUID(), exerciseId: ex?.id || '', exerciseName: ex?.name || '?', muscleGroup: ex?.muscle_group || '', sets: 3, progressionModel: 'autoregulation', targetRpe: 'rpe8', repMin: 8, repMax: 12, repsPerSet: '' };
  };

  const handleStudentClick = (s) => { setSelectedStudent(s); fetchPerformance(s.id); fetchPhotos(s.id); fetchActiveRoutine(s.id); fetchNutritionPlan(s.id); setCurrentView('PerfilAlumno'); setShowAllExercises(false); setSelectedExerciseChart(null); setSelectedPlanDay(null); };
  const handleCreateRoutineClick = () => { setRoutineName(''); setDays([{ id: crypto.randomUUID(), dayNumber: 1, dayName: '', exercises: [] }]); setCurrentView('CrearRutina'); };
  const handleAddDay = () => setDays([...days, { id: crypto.randomUUID(), dayNumber: days.length + 1, dayName: '', exercises: [] }]);
  const handleAddExerciseToDay = (dayId) => { if (!selectedExerciseId) return; setDays(days.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, createExercise(selectedExerciseId)] } : d)); };
  const handleRemoveExercise = (dayId, exId) => setDays(days.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d));
  const handleExerciseChange = (dayId, exId, field, val) => setDays(days.map(d => d.id === dayId ? { ...d, exercises: d.exercises.map(e => e.id === exId ? { ...e, [field]: val } : e) } : d));
  const handleDayNameChange = (dayId, name) => setDays(days.map(d => d.id === dayId ? { ...d, dayName: name } : d));

  const handleSaveRoutine = async () => {
    const total = days.reduce((a, d) => a + d.exercises.length, 0);
    if (total === 0) { alert('Agregá al menos un ejercicio.'); return; }
    try {
      const rr = await axios.post(`${API_URL}/routines/`, { name: routineName, student_id: selectedStudent.id, current_day: 1 });
      const rid = rr.data.id;
      for (const day of days) {
        for (const ex of day.exercises) {
          let rpe = 8; if (ex.targetRpe === 'rpe7') rpe = 7; if (ex.targetRpe === 'rpe9') rpe = 9; if (ex.targetRpe === 'rpe10') rpe = 10;
          // Detect repsPerSet format: "20,15,10,8" or "20-15-10-8"
          const rpsRaw = (ex.repsPerSet || '').trim();
          const rpsNorm = rpsRaw.replace(/-/g, ',');
          const hasRps = rpsNorm.includes(',');
          await axios.post(`${API_URL}/workout-exercises/`, {
            routine_id: rid,
            exercise_id: ex.exerciseId,
            day_number: day.dayNumber,
            day_name: day.dayName || null,
            sets: Number(ex.sets),
            progression_model: ex.progressionModel,
            rep_range_min: hasRps ? null : Number(ex.repMin),
            rep_range_max: hasRps ? null : Number(ex.repMax),
            target_rpe: rpe,
            reps_per_set: hasRps ? rpsNorm : null,
          });
        }
      }
      alert(`✅ Rutina "${routineName}" guardada!`);
      setCurrentView('PerfilAlumno');
    } catch (e) { alert('Error: ' + (e.response?.data?.detail || e.message)); }
  };

  const [selectedExerciseChart, setSelectedExerciseChart] = useState(null);
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [selectedPlanDay, setSelectedPlanDay] = useState(null);
  const EXERCISES_PREVIEW = 5;

  const analyzeProgress = () => {
    if (!performanceData?.exercises?.length) return [];
    return performanceData.exercises.map(ex => {
      let status = 'neutral';
      let pct = 0;
      if (ex.history && ex.history.length >= 2) {
        const sorted = [...ex.history].sort((a, b) => new Date(a.date) - new Date(b.date));
        const first = sorted[0].e1rm;
        const last = sorted[sorted.length - 1].e1rm;
        pct = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
        if (last > first) status = 'progressing';
        else if (last < first) status = 'regressing';
        else status = 'stagnant';
      }
      return { ...ex, status, pct };
    });
  };

  const buildExerciseBarData = (ex) => {
    if (!ex?.history?.length) return [];
    return [...ex.history]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-8)
      .map(h => ({
        date: new Date(h.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        peso: Math.round(h.e1rm * 10) / 10,
        realPeso: h.actual_weight,
      }));
  };

  // ===== STUDENT FETCHES =====
  const studentId = loggedInUser?.student_id;

  const stFetchExercises = async () => {
    if (!studentId) return;
    try {
      const r = await axios.get(`${API_URL}/student/${studentId}/next-workout`);
      if (r.data?.exercises) {
        setStSession({ routine_id: r.data.routine_id, routine_name: r.data.routine_name, current_day: r.data.current_day, total_days: r.data.total_days });
        const all = await axios.get(`${API_URL}/routines/${r.data.routine_id}/exercises`);
        setStExercises((all.data || []).map(ex => {
          const rpsRaw = ex.reps_per_set;
          const repsPerSet = rpsRaw ? rpsRaw.split(',').map(s => s.trim()) : null;
          return {
            id: ex.exercise_id,
            routine_id: ex.routine_id,
            name: ex.exercises?.name || '?',
            muscleGroup: ex.exercises?.muscle_group || '',
            targetSets: ex.sets || 3,
            targetRepsText: repsPerSet ? repsPerSet.join('-') : (ex.rep_range_min ? `${ex.rep_range_min}-${ex.rep_range_max}` : '10'),
            repsPerSet,
            targetRpe: ex.target_rpe || 8,
            setsCompleted: 0,
            day_number: ex.day_number,
            day_name: ex.day_name || null,
            lastLog: ex.last_log,
            suggestedWeight: ex.suggested_weight,
            suggestedReps: ex.suggested_reps,
          };
        }).sort((a, b) => a.day_number - b.day_number));
      }
    } catch (e) { console.error(e); }
  };
  const stFetchRankings = async () => { setStLoadingRankings(true); try { const r = await axios.get(`${API_URL}/rankings`); setStRankings(r.data?.rankings || []); } catch { } finally { setStLoadingRankings(false); } };
  const stFetchNutrition = async () => { setStLoadingNutrition(true); try { const r = await axios.get(`${API_URL}/student/${studentId}/nutrition`); setStNutrition(r.data); } catch { } finally { setStLoadingNutrition(false); } };

  // ===== STUDENT DATA =====
  const [stStudentData, setStStudentData] = useState(null);

  // ===== STREAK STATE =====
  const [stStreak, setStStreak] = useState({ streak: 0, at_risk: false, last_training_date: null, longest_streak: 0 });

  const stFetchStreak = async () => {
    if (!studentId) return;
    try { const r = await axios.get(`${API_URL}/students/${studentId}/streak`); setStStreak(r.data); } catch { }
  };

  const stFetchStudentData = async () => {
    if (!studentId) return;
    try { const r = await axios.get(`${API_URL}/students/${studentId}`); setStStudentData(r.data); } catch { }
  };

  useEffect(() => {
    if (loggedInUser?.role === 'student') { stFetchExercises(); stFetchNutrition(); stFetchStreak(); stFetchStudentData(); }
  }, [loggedInUser]);

  // setsData: [{ set_number, actual_weight, actual_reps, actual_rpe }]
  const stHandleSave = async (exerciseId, setsData) => {
    setStLoading(true);
    try {
      for (const s of setsData) {
        const payload = { workout_id: stSession?.routine_id || 'unknown', exercise_id: exerciseId, set_number: s.set_number, actual_weight: s.actual_weight, actual_reps: s.actual_reps, actual_rpe: s.actual_rpe };
        const r = await axios.post(`${API_URL}/logs/`, payload);
        if (r.data?.next_target) setStNextTarget(r.data.next_target);
      }
      setStExercises(stExercises.map(e => e.id === exerciseId ? { ...e, setsCompleted: e.setsCompleted + setsData.length } : e));
      setStSuccess(true);
      setTimeout(() => { setStSuccess(false); setStExpandedId(null); setStNextTarget(null); stFetchStreak(); }, 2500);
    } catch { alert('Error al guardar.'); }
    finally { setStLoading(false); }
  };

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'; };

  // Returns the name of a day: prefers day_name from DB, falls back to hardcoded map
  const defaultDayNames = { 1: 'Pecho + Hombros + Bíceps', 2: 'Piernas (isquios) + Pantorrillas', 3: 'Espalda + Deltoides + Tríceps', 4: 'Piernas (cuádriceps) + Pantorrillas', 5: 'Hombros + Pectorales + Brazos' };
  const getDayName = (dayNum) => {
    const ex = stExercises.find(e => e.day_number === dayNum && e.day_name);
    return ex?.day_name || defaultDayNames[dayNum] || `Día ${dayNum}`;
  };

  // ======================================================================
  // RENDER: LOGIN
  // ======================================================================
  if (!loggedInUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <Dumbbell size={40} color="#7C3AED" />
            <h1>AE Personal Training</h1>
            <p>Plataforma de Entrenamiento Inteligente</p>
          </div>
          <div className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input type="email" placeholder="tu@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="input-group">
              <label>Contraseña</label>
              <input type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button className="btn-primary w-full" onClick={handleLogin} disabled={loginLoading} style={{ marginTop: '8px' }}>
              {loginLoading ? <Loader2 size={20} className="spin-icon" /> : <><LogOut size={18} /> <span>Ingresar</span></>}
            </button>
          </div>
          <p className="login-footer">Team Pato Coaching © 2026</p>
        </div>
      </div>
    );
  }

  // ======================================================================
  // RENDER: STUDENT VIEW
  // ======================================================================
  if (loggedInUser.role === 'student') {

    const subStatus = stStudentData?.subscription_status;
    const subDays = stStudentData?.days_remaining ?? 0;

    // BLOCKED: suscripción vencida
    if (stStudentData && subStatus === 'blocked') {
      return (
        <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <Dumbbell size={48} color="#7C3AED" style={{ marginBottom: '16px' }} />
          <h1 style={{ color: '#FAFAFA', fontSize: '1.5rem', fontWeight: 800 }}>Acceso bloqueado</h1>
          <p style={{ color: '#A1A1AA', marginTop: '8px', maxWidth: '320px', lineHeight: 1.5 }}>
            Tu suscripción ha vencido. Realizá el pago para volver a acceder a tu plan de entrenamiento.
          </p>
          <a
            href="http://localhost:3000/elizondo-fitness.html"
            style={{ marginTop: '24px', background: '#7C3AED', color: '#fff', padding: '14px 32px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-block' }}
          >
            Abonar suscripcion
          </a>
          <button onClick={handleLogout} style={{ marginTop: '16px', background: 'transparent', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '0.85rem' }}>
            Cerrar sesion
          </button>
        </div>
      );
    }

    return (
      <div className="student-app">
        {/* STUDENT TOP BAR */}
        <div className="student-topbar">
          <div className="student-topbar-left">
            <Dumbbell size={22} color="#7C3AED" />
            <span className="student-topbar-brand">AE Personal Training</span>
          </div>
          <div className="student-topbar-right">
            <div className="student-streak-badge"><Flame size={14} color="#F59E0B" /> {stStreak.streak} días</div>
            <button className="btn-icon-sm" onClick={handleLogout} title="Cerrar sesión"><LogOut size={18} /></button>
          </div>
        </div>

        {/* GRACE PERIOD BANNER */}
        {subStatus === 'grace' && (
          <div style={{ background: '#78350F', borderBottom: '1px solid #D97706', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ color: '#FDE68A', fontSize: '0.85rem', fontWeight: 600 }}>
              Tu suscripcion vence en {subDays === 0 ? 'menos de 1 dia' : `${subDays} dia${subDays !== 1 ? 's' : ''}`}. Renova para no perder el acceso.
            </span>
            <a href="http://localhost:3000/elizondo-fitness.html" style={{ background: '#D97706', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Abonar
            </a>
          </div>
        )}

        {/* STUDENT NAV */}
        <div className="student-nav">
          {[{ key: 'home', icon: Home, label: 'Inicio' }, { key: 'workout', icon: Dumbbell, label: 'Entreno' }, { key: 'ranking', icon: Trophy, label: 'Racha' }, { key: 'nutrition', icon: Utensils, label: 'Nutrición' }, { key: 'profile', icon: User, label: 'Perfil' }].map(tab => (
            <button key={tab.key} className={`student-nav-item ${studentScreen === tab.key ? 'active' : ''}`} onClick={() => {
              setStudentScreen(tab.key);
              if (tab.key === 'ranking') stFetchRankings();
              if (tab.key === 'workout') setStSelectedDay(null);
            }}>
              <tab.icon size={22} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* STUDENT CONTENT */}
        <div className="student-content">

          {/* HOME */}
          {studentScreen === 'home' && (
            <div className="view-fade-in">
              <div className="st-greeting">
                <h2>{greeting()} 👋</h2>
                <p className="st-name">{loggedInUser.name}</p>
              </div>
              <div className="st-banner">
                <div><h3>No hay excusas.</h3><p>Solo resultados.</p><span className="st-date">{today.charAt(0).toUpperCase() + today.slice(1)}</span></div>
                <Flame color="#F59E0B" size={40} />
              </div>
              <div className="st-stats-row">
                <div className={`st-stat ${stStreak.at_risk ? 'at-risk' : ''}`}>
                  <Flame color="#F59E0B" size={20} />
                  <strong style={{ fontSize: '1.4rem' }}>🔥 {stStreak.streak}</strong>
                  <span>{stStreak.at_risk ? '⚠️ ¡En riesgo!' : 'días seguidos'}</span>
                </div>
                <div className="st-stat">
                  <Target color="#7C3AED" size={20} />
                  <strong>{stSession ? `Día ${stSession.current_day}` : '—'}</strong>
                  <span>Entreno actual</span>
                </div>
                <div className="st-stat">
                  <Trophy color="#A78BFA" size={20} />
                  <strong>{stStreak.longest_streak || '—'}</strong>
                  <span>Mejor racha</span>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1rem', color: '#FAFAFA', marginBottom: '16px' }}>Tu entrenamiento de hoy</h3>
                {stSession ? (
                  <button className="st-main-card" onClick={() => { setStSelectedDay(stSession.current_day); setStudentScreen('workout'); }} style={{ border: '1px solid rgba(124, 58, 237, 0.3)', background: 'linear-gradient(145deg, rgba(30,30,36,1) 0%, rgba(39,39,46,1) 100%)' }}>
                    <div className="st-card-icon" style={{ background: '#7C3AED' }}><Dumbbell color="#fff" size={24} /></div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h4 style={{ color: '#FAFAFA', fontSize: '1.05rem', marginBottom: '4px' }}>Día {stSession.current_day} - {getDayName(stSession.current_day) || 'Entrenamiento'}</h4>
                      <p style={{ color: '#A1A1AA', fontSize: '0.85rem' }}>
                        {stExercises.filter(e => e.day_number === stSession.current_day).length} ejercicios asignados
                      </p>
                    </div>
                    <ChevronDown color="#7C3AED" size={20} style={{ transform: 'rotate(-90deg)' }} />
                  </button>
                ) : (
                  <div className="st-main-card" style={{ opacity: 0.7 }}>
                    <div className="st-card-icon"><Target color="#A1A1AA" size={24} /></div>
                    <div><h4>Día libre</h4><p>No tienes rutinas activas hoy.</p></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WORKOUT */}
          {studentScreen === 'workout' && !stSelectedDay && (
            <div className="view-fade-in">
              <h2 className="st-section-title">{stSession?.routine_name || 'Rutina'}</h2>
              <p style={{ color: '#A1A1AA', marginBottom: '16px' }}>Seleccioná el día para comenzar</p>
              {[1, 2, 3, 4, 5].map(day => {
                const count = stExercises.filter(e => e.day_number === day).length;
                return (
                  <button key={day} className="st-main-card" onClick={() => setStSelectedDay(day)}>
                    <div className={`st-card-icon ${stSession?.current_day === day ? 'today' : ''}`}><Dumbbell color={stSession?.current_day === day ? '#7C3AED' : '#fff'} size={22} /></div>
                    <div style={{ flex: 1 }}>
                      <h4>DÍA {day} – {getDayName(day)}</h4>
                      <p>{count} ejercicios {stSession?.current_day === day ? '🔥 Toca hoy' : ''}</p>
                    </div>
                    <ChevronDown color="#52525B" size={18} style={{ transform: 'rotate(-90deg)' }} />
                  </button>
                );
              })}
            </div>
          )}

          {studentScreen === 'workout' && stSelectedDay && (
            <div className="view-fade-in">
              <button className="btn-back" onClick={() => setStSelectedDay(null)}><ChevronLeft size={20} /> Volver</button>
              <h2 className="st-section-title">Día {stSelectedDay} – {getDayName(stSelectedDay)}</h2>
              {stExercises.filter(e => e.day_number === stSelectedDay).map(exercise => {
                const isExp = stExpandedId === exercise.id;
                const done = exercise.setsCompleted >= exercise.targetSets;
                return (
                  <div key={exercise.id} className="st-exercise-card">
                    <button className={`st-exercise-header ${isExp ? 'expanded' : ''}`} onClick={() => { if (done) return; setStExpandedId(isExp ? null : exercise.id); setStNextTarget(null); setStSuccess(false); }}>
                      <div className="st-exercise-left">
                        <div className="st-exercise-icon"><Dumbbell color="#fff" size={20} /></div>
                        <div><h4>{exercise.name}</h4><p>{done ? `✅ Completado (${exercise.setsCompleted}/${exercise.targetSets})` : exercise.setsCompleted > 0 ? `${exercise.setsCompleted}/${exercise.targetSets} sets` : `${exercise.targetSets} sets de ${exercise.targetRepsText} reps`}</p></div>
                      </div>
                      {done ? <CheckCircle2 color="#10B981" size={20} /> : isExp ? <ChevronUp color="#7C3AED" size={20} /> : <ChevronDown color="#52525B" size={20} />}
                    </button>
                    {isExp && (
                      <div className="st-exercise-body">
                        {exercise.lastLog && (
                          <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '12px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#A78BFA', fontWeight: 700, textTransform: 'uppercase' }}>Sesión Anterior</span>
                              <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{new Date(exercise.lastLog.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                              <div><span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>Peso:</span> <strong style={{ color: '#FAFAFA' }}>{exercise.lastLog.actual_weight} kg</strong></div>
                              <div><span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>Reps:</span> <strong style={{ color: '#FAFAFA' }}>{exercise.lastLog.actual_reps}</strong></div>
                              <div><span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>RPE:</span> <strong style={{ color: exercise.lastLog.actual_rpe >= 9 ? '#EF4444' : exercise.lastLog.actual_rpe <= 7 ? '#10B981' : '#F59E0B' }}>{exercise.lastLog.actual_rpe}</strong></div>
                            </div>
                          </div>
                        )}
                        {exercise.suggestedWeight !== null && !stSuccess && (
                          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                            <Target size={16} /> <span>Peso sugerido: {exercise.suggestedWeight} kg (basado en tu última sesión)</span>
                          </div>
                        )}
                        {stNextTarget && (
                          <div className="st-suggestion"><Trophy color="#F59E0B" size={20} /><div><small>Próximo Objetivo</small><strong>{stNextTarget.suggested_weight} kg × {stNextTarget.suggested_reps} reps</strong></div></div>
                        )}
                        {stSuccess && stExpandedId === exercise.id ? (
                          <div className="st-success"><CheckCircle2 color="#10B981" size={48} /><h3>¡Series Guardadas!</h3>{stNextTarget && <span className="st-next-target-badge">Próximo objetivo: {stNextTarget.suggested_weight} kg</span>}</div>
                        ) : (
                          <SeriesInput
                            name={exercise.name}
                            sets={exercise.targetSets}
                            repsRange={exercise.targetRepsText}
                            repsPerSet={exercise.repsPerSet}
                            rpeTarget={exercise.targetRpe}
                            onSave={(setsData) => stHandleSave(exercise.id, setsData)}
                            onCancel={() => setStExpandedId(null)}
                          />
                        )
                        }
                      </div>
                    )}
                  </div>
                );
              })}
              {stExercises.filter(e => e.day_number === stSelectedDay).length > 0 && (
                <button className="btn-primary w-full" style={{ marginTop: '20px', background: '#10B981' }} disabled={stIsFinishing}
                  onClick={async () => {
                    if (!stSession) return;
                    setStIsFinishing(true);
                    try {
                      await axios.post(`${API_URL}/routines/${stSession.routine_id}/complete-day`);
                      alert('¡Día Completado! 🎉'); stFetchExercises(); setStSelectedDay(null);
                    } catch { alert('Error al finalizar.'); }
                    finally { setStIsFinishing(false); }
                  }}>
                  {stIsFinishing ? <Loader2 size={18} className="spin-icon" /> : `Terminar Día ${stSelectedDay}`}
                </button>
              )}
            </div>
          )
          }

          {/* NUTRITION */}
          {
            studentScreen === 'nutrition' && (
              <div className="view-fade-in">
                <h2 className="st-section-title">Plan Nutricional</h2>
                {stNutrition ? (
                  <>
                    <p style={{ color: '#71717A', marginBottom: '16px' }}>🔥 Objetivo: Recomposición corporal</p>
                    <div className="st-macros">
                      <div className="st-macro"><strong>{stNutrition.objectives?.calories}</strong><span>Calorías</span></div>
                      <div className="st-macro"><strong style={{ color: '#EF4444' }}>{stNutrition.objectives?.protein}</strong><span>Proteínas</span></div>
                      <div className="st-macro"><strong style={{ color: '#F59E0B' }}>{stNutrition.objectives?.carbs}</strong><span>Carbos</span></div>
                      <div className="st-macro"><strong style={{ color: '#7C3AED' }}>{stNutrition.objectives?.fats}</strong><span>Grasas</span></div>
                    </div>
                    <h3 style={{ color: '#FAFAFA', margin: '20px 0 12px', fontSize: '1.1rem' }}>🍽 Comidas del Día</h3>
                    {stNutrition.meals?.map(meal => (
                      <div key={meal.id} className="st-exercise-card">
                        <button className="st-exercise-header" onClick={() => setStExpandedMeal(stExpandedMeal === meal.id ? null : meal.id)}>
                          <div className="st-exercise-left"><div className="st-exercise-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><span style={{ fontSize: '18px' }}>{meal.emoji}</span></div><div><h4>{meal.name}</h4><p>{meal.time}</p></div></div>
                          {stExpandedMeal === meal.id ? <ChevronUp color="#10B981" size={18} /> : <ChevronDown color="#52525B" size={18} />}
                        </button>
                        {stExpandedMeal === meal.id && (
                          <div className="st-exercise-body">
                            {meal.options?.map((opt, i) => (
                              <div key={i} style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#10B981', fontSize: '13px' }}>{opt.title}</strong>
                                <ul style={{ color: '#D4D4D8', fontSize: '14px', paddingLeft: '20px', marginTop: '6px' }}>
                                  {opt.items?.map((item, j) => <li key={j} style={{ marginBottom: '4px' }}>{item}</li>)}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : <div style={{ textAlign: 'center', padding: '40px', color: '#52525B' }}><Loader2 size={32} className="spin-icon" /></div>}
              </div>
            )
          }

          {/* RACHA */}
          {studentScreen === 'ranking' && (
            <div className="view-fade-in">
              <h2 className="st-section-title">🔥 Tu Racha</h2>

              {/* Streak hero */}
              <div className="streak-hero">
                <span style={{ fontSize: '2.5rem' }}>🔥</span>
                <span className="streak-hero-num">{stStreak.streak}</span>
                <span className="streak-hero-label">días seguidos entrenando</span>
                {stStreak.at_risk && <p style={{ color: '#EF4444', marginTop: '10px', fontSize: '0.88rem', fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: '8px 16px', borderRadius: '10px' }}>⚠️ ¡Entrená hoy para no perder tu racha!</p>}
                {stStreak.longest_streak > 0 && <p style={{ color: '#A1A1AA', marginTop: '10px', fontSize: '0.82rem' }}>Mejor racha histórica: <strong style={{ color: '#A78BFA' }}>{stStreak.longest_streak} días</strong></p>}
              </div>

              {/* Ranking por series */}
              <h3 style={{ marginBottom: '10px', fontSize: '0.95rem', color: '#A1A1AA', fontWeight: 600 }}>Ranking del equipo</h3>
              {stLoadingRankings
                ? <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 size={32} className="spin-icon" color="#7C3AED" /></div>
                : stRankings.map(r => {
                    const isMe = r.student_id === studentId;
                    const medals = ['', '🥇', '🥈', '🥉'];
                    const emoji = medals[r.position] || `#${r.position}`;
                    return (
                      <div key={r.student_id} className={`st-ranking-row ${isMe ? 'me' : ''} ${r.position === 1 ? 'first' : ''}`}>
                        <span className="st-rank-pos">{emoji}</span>
                        <div className="st-rank-avatar" style={isMe ? { borderColor: '#7C3AED' } : {}}>{r.name?.charAt(0).toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <strong style={isMe ? { color: '#A78BFA' } : {}}>{r.name}{isMe ? ' (Vos)' : ''}</strong>
                          <br /><small style={{ color: '#71717A' }}>{r.total_sets} series registradas</small>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          )}

          {/* PROFILE */}
          {studentScreen === 'profile' && (
            <div className="view-fade-in" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="st-section-title" style={{ margin: 0 }}>Mi Perfil</h2>
                <button className="btn-icon-sm" onClick={handleLogout} style={{ color: '#EF4444' }}><LogOut size={20} /></button>
              </div>
              <div className="st-profile-avatar">
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>{loggedInUser.name?.charAt(0).toUpperCase()}</span>
              </div>
              <h2 style={{ marginTop: '14px', fontSize: '1.4rem' }}>{loggedInUser.name}</h2>
              <p style={{ color: '#A1A1AA', marginTop: '4px' }}>{loggedInUser.email}</p>
              {stStudentData?.goal && (
                <span style={{ display: 'inline-block', marginTop: '8px', background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '999px', padding: '4px 14px', fontSize: '0.82rem', fontWeight: 700 }}>
                  🎯 {stStudentData.goal}
                </span>
              )}
              <div className="streak-hero" style={{ marginTop: '20px' }}>
                <span style={{ fontSize: '2rem' }}>🔥</span>
                <span className="streak-hero-num">{stStreak.streak}</span>
                <span className="streak-hero-label">días de racha</span>
                {stStreak.at_risk && <p style={{ color: '#EF4444', marginTop: '8px', fontSize: '0.85rem', fontWeight: 600 }}>⚠️ ¡Entrená hoy para no perder tu racha!</p>}
                {stStreak.longest_streak > 0 && <p style={{ color: '#A1A1AA', marginTop: '8px', fontSize: '0.8rem' }}>Mejor racha: {stStreak.longest_streak} días</p>}
              </div>
              {stStudentData && (
                <div className="st-stats-row" style={{ marginTop: '16px' }}>
                  {stStudentData.age && <div className="st-stat"><User color="#7C3AED" size={20} /><strong>{stStudentData.age} años</strong><span>Edad</span></div>}
                  {stStudentData.weight_kg && <div className="st-stat"><Activity color="#10B981" size={20} /><strong>{stStudentData.weight_kg} kg</strong><span>Peso</span></div>}
                  {stStudentData.height_cm && <div className="st-stat"><TrendingUp color="#F59E0B" size={20} /><strong>{stStudentData.height_cm} cm</strong><span>Altura</span></div>}
                </div>
              )}
              <div className="st-stats-row" style={{ marginTop: '12px' }}>
                <div className="st-stat"><Target color="#7C3AED" size={20} /><strong>{stSession ? `Día ${stSession.current_day}` : '—'}</strong><span>Entreno actual</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ======================================================================
  // RENDER: PROFESSOR DASHBOARD
  // ======================================================================
  return (
    <div className="layout">
      {/* SIDEBAR (desktop) */}
      <aside className="sidebar">
        <div className="sidebar-brand"><Dumbbell className="brand-icon" /><h2>AE Personal Training</h2></div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${currentView === 'ListaAlumnos' ? 'active' : ''}`} onClick={() => { setSelectedStudent(null); setCurrentView('ListaAlumnos'); }}><Users size={20} /><span>Mis Alumnos</span></button>
          <button className="nav-item"><FileText size={20} /><span>Plantillas</span></button>
          <button className="nav-item"><Dumbbell size={20} /><span>Biblioteca</span></button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar avatar-prof" style={{ backgroundColor: '#7C3AED', color: '#fff', borderRadius: '10px' }}>{loggedInUser.name?.charAt(0).toUpperCase()}</div>
            <div><p className="user-name">{loggedInUser.name}</p><p className="user-role">Profesor · AE</p></div>
          </div>
          <button className="btn-back" style={{ marginTop: '12px' }} onClick={handleLogout}><LogOut size={16} /> Cerrar Sesión</button>
        </div>
      </aside>

      {/* BOTTOM NAV (mobile) */}
      <nav className="prof-bottom-nav">
        <button className={`prof-bottom-nav-item ${currentView === 'ListaAlumnos' ? 'active' : ''}`} onClick={() => { setSelectedStudent(null); setCurrentView('ListaAlumnos'); }}>
          <Users size={22} /><span>Alumnos</span>
        </button>
        <button className="prof-bottom-nav-item" onClick={handleLogout} style={{ color: '#EF4444' }}>
          <LogOut size={22} /><span>Salir</span>
        </button>
      </nav>

      <main className="main-content">
        {/* LIST */}
        {currentView === 'ListaAlumnos' && (
          <div className="view-fade-in">
            <header className="main-header flex-between">
              <div><h1>Mis Alumnos</h1><p className="subtitle">Gestiona el progreso y asigna rutinas</p></div>
              <button className="btn-primary" onClick={() => setShowNewStudentForm(true)}><UserPlus size={18} /><span>Nuevo Alumno</span></button>
            </header>
            {showNewStudentForm && (
              <div className="card" style={{ marginBottom: '24px', position: 'relative' }}>
                <button style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowNewStudentForm(false)}><X size={20} color="#71717A" /></button>
                <div className="card-header"><UserPlus size={20} className="icon-accent" /><h2>Registrar Nuevo Alumno</h2></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div><label className="form-label">Nombre *</label><input className="form-input" placeholder="Juan Pérez" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} /></div>
                  <div><label className="form-label">Email</label><input className="form-input" placeholder="juan@email.com" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} /></div>
                  <div><label className="form-label">Edad</label><input className="form-input" type="number" value={newStudent.age} onChange={e => setNewStudent({ ...newStudent, age: e.target.value })} /></div>
                  <div><label className="form-label">Peso (kg)</label><input className="form-input" type="number" value={newStudent.weight_kg} onChange={e => setNewStudent({ ...newStudent, weight_kg: e.target.value })} /></div>
                  <div><label className="form-label">Altura (cm)</label><input className="form-input" type="number" value={newStudent.height_cm} onChange={e => setNewStudent({ ...newStudent, height_cm: e.target.value })} /></div>
                  <div><label className="form-label">Objetivo</label><select className="form-input" value={newStudent.goal} onChange={e => setNewStudent({ ...newStudent, goal: e.target.value })}><option>Hipertrofia</option><option>Fuerza</option><option>Pérdida de grasa</option><option>Recomposición</option></select></div>
                </div>
                <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }} disabled={!newStudent.name || savingStudent} onClick={async () => {
                  setSavingStudent(true);
                  try { await axios.post(`${API_URL}/students/`, { name: newStudent.name, email: newStudent.email || null, age: newStudent.age ? Number(newStudent.age) : null, weight_kg: newStudent.weight_kg ? Number(newStudent.weight_kg) : null, height_cm: newStudent.height_cm ? Number(newStudent.height_cm) : null, goal: newStudent.goal }); fetchStudents(); setNewStudent({ name: '', email: '', age: '', weight_kg: '', height_cm: '', goal: 'Hipertrofia' }); setShowNewStudentForm(false); } catch (e) { alert('Error: ' + e.message); } finally { setSavingStudent(false); }
                }}><Save size={18} /><span>{savingStudent ? 'Guardando...' : 'Guardar Alumno'}</span></button>
              </div>
            )}
            {/* SUBSCRIPTION SUMMARY */}
            {students.length > 0 && (() => {
              const activos = students.filter(s => s.subscription_status === 'active').length;
              const grace = students.filter(s => s.subscription_status === 'grace').length;
              const bloqueados = students.filter(s => s.subscription_status === 'blocked').length;
              return (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '120px', background: '#052E16', border: '1px solid #166534', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ADE80' }}>{activos}</div>
                    <div style={{ fontSize: '0.75rem', color: '#86EFAC', marginTop: '2px' }}>Al dia</div>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px', background: '#431407', border: '1px solid #9A3412', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24' }}>{grace}</div>
                    <div style={{ fontSize: '0.75rem', color: '#FDE68A', marginTop: '2px' }}>Por vencer</div>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px', background: '#1F0000', border: '1px solid #7F1D1D', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F87171' }}>{bloqueados}</div>
                    <div style={{ fontSize: '0.75rem', color: '#FCA5A5', marginTop: '2px' }}>Bloqueados</div>
                  </div>
                </div>
              );
            })()}

            <div className="students-grid">
              {loadingStudents ? <div className="card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}><Loader2 size={48} color="#7C3AED" className="spin-icon" /></div> : students.length === 0 ? <div className="card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}><Users size={48} color="#52525B" /><h3 style={{ color: '#A1A1AA', marginTop: '12px' }}>No hay alumnos</h3></div> : null}
              {students.map(s => {
                const subColor = s.subscription_status === 'active' ? '#4ADE80' : s.subscription_status === 'grace' ? '#FBBF24' : '#F87171';
                const subBg = s.subscription_status === 'active' ? '#052E16' : s.subscription_status === 'grace' ? '#431407' : '#1F0000';
                const subLabel = s.subscription_status === 'active' ? `Al dia · ${s.days_remaining}d` : s.subscription_status === 'grace' ? `Vence en ${s.days_remaining}d` : 'Vencido';
                return (
                <div key={s.id} className="card student-card interactive" onClick={() => handleStudentClick(s)}>
                  <div className="student-card-header">
                    <div className="avatar avatar-student" style={{ backgroundColor: '#7C3AED', color: '#fff', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>{s.name?.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 className="student-name">{s.name}</h3>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: subColor, background: subBg, padding: '2px 8px', borderRadius: '6px', border: `1px solid ${subColor}44` }}>{subLabel}</span>
                      </div>
                    </div>
                    <button className="btn-icon-danger" onClick={e => { e.stopPropagation(); handleDeleteStudent(s.id, s.name); }}>{deletingStudentId === s.id ? <Loader2 size={18} className="spin-icon" /> : <Trash2 size={18} />}</button>
                  </div>
                  <div className="student-card-stats">
                    {stagnantAlerts[s.id] > 0 ? (
                      <div className="stat"><span className="stat-label">Alerta</span><span className="stat-value" style={{ color: '#EF4444', fontSize: '13px' }}><Activity size={12} /> {stagnantAlerts[s.id]} estancados</span></div>
                    ) : (
                      s.goal && <div className="stat"><span className="stat-label">Objetivo</span><span className="stat-value">{s.goal}</span></div>
                    )}
                    {s.weight_kg && <div className="stat"><span className="stat-label">Peso</span><span className="stat-value">{s.weight_kg} kg</span></div>}
                  </div>
                  <button
                    style={{ marginTop: '10px', width: '100%', background: '#7C3AED22', border: '1px solid #7C3AED', color: '#A78BFA', borderRadius: '8px', padding: '7px 0', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                    onClick={async e => {
                      e.stopPropagation();
                      if (!window.confirm(`Registrar pago de ${s.name}? Se habilitaran 30 dias desde hoy.`)) return;
                      try {
                        await axios.post(`${API_URL}/students/${s.id}/payment`);
                        fetchStudents();
                      } catch { alert('Error al registrar pago.'); }
                    }}
                  >
                    Registrar Pago
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {currentView === 'PerfilAlumno' && selectedStudent && (
          <div className="view-fade-in">
            <button className="btn-back" onClick={() => setCurrentView('ListaAlumnos')}><ChevronLeft size={20} /> Volver</button>
            <header className="profile-header">
              <div className="avatar avatar-student" style={{ width: 64, height: 64, backgroundColor: '#7C3AED', color: '#fff', fontSize: '28px', fontWeight: 700, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selectedStudent.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h1>{selectedStudent.name}</h1>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                  {(() => {
                    const sc = selectedStudent.subscription_status;
                    const color = sc === 'active' ? '#4ADE80' : sc === 'grace' ? '#FBBF24' : '#F87171';
                    const bg = sc === 'active' ? '#052E16' : sc === 'grace' ? '#431407' : '#1F0000';
                    const label = sc === 'active' ? `Al dia · ${selectedStudent.days_remaining}d restantes` : sc === 'grace' ? `Vence en ${selectedStudent.days_remaining}d` : 'Suscripcion vencida';
                    return <span style={{ fontSize: '0.75rem', fontWeight: 700, color, background: bg, padding: '3px 10px', borderRadius: '8px', border: `1px solid ${color}44` }}>{label}</span>;
                  })()}
                  <button
                    style={{ background: '#7C3AED22', border: '1px solid #7C3AED', color: '#A78BFA', borderRadius: '8px', padding: '3px 12px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                    onClick={async () => {
                      if (!window.confirm(`Registrar pago de ${selectedStudent.name}? Se habilitaran 30 dias desde hoy.`)) return;
                      try {
                        const r = await axios.post(`${API_URL}/students/${selectedStudent.id}/payment`);
                        fetchStudents();
                        setSelectedStudent(r.data);
                      } catch { alert('Error al registrar pago.'); }
                    }}
                  >
                    Registrar Pago
                  </button>
                </div>
              </div>
            </header>
            <div className="profile-grid">
              <section className="card">
                <div className="card-header" style={{ marginBottom: '16px' }}>
                  <BarChart2 size={20} className="icon-accent" /><h2>Progreso por ejercicio</h2>
                </div>
                {performanceData?.exercises?.length > 0 ? (
                  <>
                    {/* Cards de progreso por ejercicio */}
                    {(() => {
                      const all = analyzeProgress();
                      const visible = showAllExercises ? all : all.slice(0, EXERCISES_PREVIEW);
                      return (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '0' }}>
                            {visible.map((ex, i) => {
                              const last = ex.history?.length ? [...ex.history].sort((a,b) => new Date(b.date)-new Date(a.date))[0] : null;
                              const statusColor = ex.status === 'progressing' ? '#10B981' : ex.status === 'regressing' ? '#EF4444' : '#F59E0B';
                              const StatusIcon = ex.status === 'progressing' ? TrendingUp : ex.status === 'regressing' ? TrendingDown : Minus;
                              const isSelected = selectedExerciseChart?.exercise_id === ex.exercise_id;
                              return (
                                <div key={ex.exercise_id}
                                  className="prog-ex-card"
                                  style={{ borderColor: isSelected ? '#7C3AED' : undefined, background: isSelected ? 'rgba(124,58,237,0.08)' : undefined }}
                                  onClick={() => setSelectedExerciseChart(isSelected ? null : ex)}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                      <div className="prog-ex-num" style={{ background: CHART_COLORS[i % CHART_COLORS.length] + '22', color: CHART_COLORS[i % CHART_COLORS.length] }}>{i+1}</div>
                                      <div style={{ minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.exercise_name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '2px' }}>{ex.history?.length || 0} sesiones · {last ? `${new Date(last.date).toLocaleDateString('es-ES', {day:'2-digit',month:'short'})}` : '—'}</p>
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '8px' }}>
                                      <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 800, fontSize: '1rem', color: '#FAFAFA' }}>{last ? `${Math.round(last.e1rm)} kg` : '—'}</p>
                                        <p style={{ fontSize: '0.72rem', color: '#71717A' }}>e1RM actual</p>
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: statusColor + '18', borderRadius: '10px', padding: '6px 10px', minWidth: '52px' }}>
                                        <StatusIcon size={16} color={statusColor} />
                                        <span style={{ color: statusColor, fontWeight: 800, fontSize: '0.8rem' }}>{ex.pct > 0 ? '+' : ''}{ex.pct}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {all.length > EXERCISES_PREVIEW && (
                            <button
                              onClick={() => { setShowAllExercises(v => !v); setSelectedExerciseChart(null); }}
                              style={{ marginTop: '10px', width: '100%', background: 'none', border: '1px solid #2a2640', borderRadius: '10px', padding: '9px', color: '#A78BFA', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'border-color 0.2s' }}
                            >
                              {showAllExercises
                                ? <><ChevronUp size={15} /> Ver menos</>
                                : <><ChevronDown size={15} /> Ver todos los ejercicios ({all.length - EXERCISES_PREVIEW} más)</>}
                            </button>
                          )}
                        </>
                      );
                    })()}

                    {/* Gráfico de barras del ejercicio seleccionado */}
                    {selectedExerciseChart && (
                      <div style={{ marginTop: '12px', padding: '16px', background: '#0D0B14', borderRadius: '14px', border: '1px solid #2a2640' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '0.9rem', color: '#A78BFA', fontWeight: 700 }}>{selectedExerciseChart.exercise_name} — Historial e1RM</h4>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525B', padding: '4px' }} onClick={() => setSelectedExerciseChart(null)}><X size={16} /></button>
                        </div>
                        <div style={{ width: '100%', height: 200 }}>
                          <ResponsiveContainer>
                            <BarChart data={buildExerciseBarData(selectedExerciseChart)} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                              <XAxis dataKey="date" stroke="#52525B" fontSize={11} />
                              <YAxis stroke="#52525B" fontSize={11} unit="kg" />
                              <Tooltip contentStyle={{ backgroundColor: '#13111A', border: '1px solid #2a2640', borderRadius: 10, color: '#fafafa', fontSize: 12 }} formatter={(v) => [`${v} kg`, 'e1RM']} />
                              <Bar dataKey="peso" radius={[6,6,0,0]}>
                                {buildExerciseBarData(selectedExerciseChart).map((_, idx, arr) => (
                                  <Cell key={idx} fill={idx === arr.length - 1 ? '#7C3AED' : '#3730A3'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#52525B', marginTop: '8px' }}>Barra violeta = sesión más reciente · Tocá otro ejercicio para comparar</p>
                      </div>
                    )}
                  </>
                ) : <div className="empty-state"><Activity size={40} className="empty-icon" /><h3>Sin datos de progreso</h3><p style={{color:'#52525B',fontSize:'0.85rem',marginTop:'8px'}}>El alumno aún no registró sesiones</p></div>}
              </section>
              <section className="card flex-col">
                <div className="card-header"><Target size={20} className="icon-accent" /><h2>Plan Actual</h2></div>
                {activeRoutine ? (() => {
                  // Build day list
                  const days = [1,2,3,4,5].map(d => {
                    const exs = routineExercises.filter(e => e.day_number === d);
                    if (!exs.length) return null;
                    const dname = exs.find(e => e.day_name)?.day_name || null;
                    return { d, exs, dname };
                  }).filter(Boolean);
                  const dayExs = selectedPlanDay ? days.find(x => x.d === selectedPlanDay) : null;
                  return (
                    <>
                      <p style={{ color: '#A1A1AA', fontSize: '0.82rem', marginBottom: '14px' }}>
                        {activeRoutine.routine_name} · En día <strong style={{ color: '#A78BFA' }}>{activeRoutine.current_day}</strong>
                      </p>
                      {/* Day tabs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: selectedPlanDay ? '16px' : '0' }}>
                        {days.map(({ d, exs, dname }) => {
                          const isActive = selectedPlanDay === d;
                          const isCurrentDay = activeRoutine.current_day === d;
                          return (
                            <button key={d}
                              onClick={() => setSelectedPlanDay(isActive ? null : d)}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: isActive ? 'rgba(124,58,237,0.12)' : '#13111A',
                                border: `1.5px solid ${isActive ? '#7C3AED' : '#2a2640'}`,
                                borderRadius: '12px', padding: '12px 16px', cursor: 'pointer',
                                transition: 'all 0.18s', textAlign: 'left', width: '100%',
                              }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <div style={{
                                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                                  background: isCurrentDay ? 'rgba(124,58,237,0.25)' : 'rgba(55,48,163,0.18)',
                                  border: `1.5px solid ${isCurrentDay ? '#7C3AED' : '#3730A3'}`,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.75rem', fontWeight: 800, color: isCurrentDay ? '#A78BFA' : '#818CF8',
                                }}>{d}</div>
                                <div style={{ minWidth: 0 }}>
                                  <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {dname || `Día ${d}`}
                                    {isCurrentDay && <span style={{ marginLeft: '8px', fontSize: '0.68rem', color: '#A78BFA', background: 'rgba(124,58,237,0.15)', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>Hoy</span>}
                                  </p>
                                  <p style={{ fontSize: '0.72rem', color: '#52525B', marginTop: '2px' }}>{exs.length} ejercicios</p>
                                </div>
                              </div>
                              {isActive ? <ChevronUp size={16} color="#7C3AED" /> : <ChevronDown size={16} color="#52525B" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Expanded day exercises */}
                      {dayExs && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                          {dayExs.exs.map((e, i) => {
                            const sets = e.sets || 3;
                            const rpsArr = e.reps_per_set ? e.reps_per_set.split(',') : null;
                            const repsLabel = rpsArr ? rpsArr.map((r,i) => `${i+1}×${r}`).join(' · ') : (e.rep_range_min ? `${e.rep_range_min}–${e.rep_range_max} reps` : '?');
                            // Look up performance for this exercise
                            const perfEx = performanceData?.exercises?.find(px => px.exercise_id === e.exercise_id);
                            const lastPerf = perfEx?.history?.length ? [...perfEx.history].sort((a,b) => new Date(b.date)-new Date(a.date))[0] : null;
                            return (
                              <div key={e.id || i} style={{ background: '#0D0B14', borderRadius: '12px', padding: '14px', border: '1px solid #2a2640' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                  <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FAFAFA' }}>{e.exercises?.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '3px' }}>{sets} series · {repsLabel} · RPE {e.target_rpe}</p>
                                  </div>
                                  {lastPerf && (
                                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                                      <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#A78BFA' }}>{Math.round(lastPerf.e1rm)} kg</p>
                                      <p style={{ fontSize: '0.68rem', color: '#52525B' }}>e1RM actual</p>
                                    </div>
                                  )}
                                </div>
                                {/* Set squares */}
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                  {Array.from({length: sets}).map((_, si) => (
                                    <div key={si} style={{
                                      minWidth: '36px', height: '36px', borderRadius: '8px',
                                      border: '1.5px solid #3730A3', background: 'rgba(55,48,163,0.15)',
                                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.62rem', fontWeight: 700, color: '#818CF8', lineHeight: 1.2, padding: '2px 4px',
                                    }}>
                                      <span style={{ fontSize: '0.58rem', color: '#52525B' }}>S{si+1}</span>
                                      <span>{rpsArr ? (rpsArr[si] || '?') : (e.rep_range_min || '?')}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  );
                })() : <div className="empty-state"><Dumbbell size={48} className="empty-icon" /><h3>Sin rutina</h3></div>}
                <div className="mt-auto" style={{ marginTop: '16px' }}><button className="btn-primary w-full massive-btn" onClick={handleCreateRoutineClick}>+ Asignar Rutina</button></div>
              </section>
              <section className="card flex-col">
                <div className="card-header"><Flame size={20} className="icon-accent" /><h2>Plan Nutricional</h2></div>
                {nutritionPlan ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{nutritionPlan.plan_name}</h3>
                    <p style={{ color: '#10B981', fontWeight: 600, marginBottom: '12px', background: 'rgba(16,185,129,0.15)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', fontSize: '0.85rem' }}>{nutritionPlan.objectives?.calories} | P: {nutritionPlan.objectives?.protein} | C: {nutritionPlan.objectives?.carbs}</p>
                    {(nutritionPlan.meals || []).map(m => <div key={m.id} style={{ backgroundColor: '#27272A', padding: '10px', borderRadius: '8px', marginBottom: '6px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><strong style={{ fontSize: '0.9rem' }}>{m.emoji} {m.name}</strong><span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>{m.time}</span></div>{m.options?.[0] && <p style={{ color: '#D4D4D8', fontSize: '0.8rem', marginTop: '4px' }}>{m.options[0].items?.join(', ')}</p>}</div>)}
                  </div>
                ) : <div className="empty-state"><Flame size={48} className="empty-icon" /><h3>Sin plan</h3></div>}
              </section>
            </div>
          </div>
        )}

        {/* CREATE ROUTINE */}
        {currentView === 'CrearRutina' && selectedStudent && (
          <div className="view-fade-in builder-view">
            <div className="flex-between mb-6">
              <button className="btn-back no-margin" onClick={() => setCurrentView('PerfilAlumno')}><ChevronLeft size={20} /> Atrás</button>
              <button className="btn-primary" onClick={handleSaveRoutine}><Save size={18} /><span>Guardar</span></button>
            </div>
            <header className="builder-header mb-6">
              <h1>Rutina de <span className="text-accent">{selectedStudent.name}</span></h1>
              <input className="routine-title-input w-full" placeholder="Nombre de la Rutina" value={routineName} onChange={e => setRoutineName(e.target.value)} />
            </header>
            <div className="card add-exercise-card mb-6">
              <div className="flex-col gap-sm">
                <label>Biblioteca de Ejercicios</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select style={{ flex: 1 }} value={selectedExerciseId} onChange={e => setSelectedExerciseId(e.target.value)}>
                    {exerciseLibrary.map(ex => <option key={ex.id} value={ex.id}>{ex.name} — {ex.muscle_group}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {days.map(day => (
              <div key={day.id} className="card mb-6" style={{ padding: '20px' }}>
                <div className="flex-between mb-4">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <h2 style={{ minWidth: 'fit-content' }}>Día {day.dayNumber}</h2>
                    <input
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      placeholder="Nombre del día (ej: Pecho + Hombros + Bíceps)"
                      value={day.dayName || ''}
                      onChange={e => handleDayNameChange(day.id, e.target.value)}
                    />
                  </div>
                  <button className="btn-secondary" style={{ marginLeft: '8px' }} onClick={() => handleAddExerciseToDay(day.id)}><Plus size={18} /> Agregar</button>
                </div>
                {day.exercises.map((ex, i) => (
                  <div key={ex.id} className="exercise-row" style={{ marginTop: '10px' }}>
                    <div className="exercise-row-header">
                      <div className="exercise-number">{i + 1}</div>
                      <h3 className="exercise-name-display">{ex.exerciseName}</h3>
                      <button className="btn-icon-danger" style={{ marginLeft: 'auto' }} onClick={() => handleRemoveExercise(day.id, ex.id)}><Trash2 size={20} /></button>
                    </div>
                    <div className="exercise-inputs-grid">
                      <div className="input-group"><label>Progresión</label><select value={ex.progressionModel} onChange={e => handleExerciseChange(day.id, ex.id, 'progressionModel', e.target.value)}><option value="autoregulation">Auto-regulación</option><option value="linear">Lineal</option><option value="maintenance">Mantenimiento</option></select></div>
                      <div className="input-group"><label>Series</label><input type="number" value={ex.sets} onChange={e => handleExerciseChange(day.id, ex.id, 'sets', e.target.value)} /></div>
                      <div className="input-group">
                        <label>Reps por serie <span style={{ color: '#52525B', fontWeight: 400, fontSize: '0.75rem' }}>(o rango)</span></label>
                        <input
                          type="text"
                          placeholder={`${ex.repMin}-${ex.repMax} o 20,15,10,8`}
                          value={ex.repsPerSet}
                          onChange={e => handleExerciseChange(day.id, ex.id, 'repsPerSet', e.target.value)}
                          style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}
                        />
                        {!ex.repsPerSet && (
                          <div className="input-double" style={{ marginTop: '6px' }}>
                            <input type="number" value={ex.repMin} onChange={e => handleExerciseChange(day.id, ex.id, 'repMin', e.target.value)} />
                            <span className="separator">-</span>
                            <input type="number" value={ex.repMax} onChange={e => handleExerciseChange(day.id, ex.id, 'repMax', e.target.value)} />
                          </div>
                        )}
                      </div>
                      <div className="input-group"><label>RPE</label><select value={ex.targetRpe} onChange={e => handleExerciseChange(day.id, ex.id, 'targetRpe', e.target.value)}><option value="rpe7">RPE 7</option><option value="rpe8">RPE 8</option><option value="rpe9">RPE 9</option><option value="rpe10">RPE 10</option></select></div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button className="btn-secondary w-full" onClick={handleAddDay} style={{ padding: '15px' }}><Plus size={20} /> + Nuevo Día</button>
          </div>
        )}
      </main>
    </div>
  );
}
