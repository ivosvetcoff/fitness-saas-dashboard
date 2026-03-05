import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, FileText, Dumbbell, Save, ChevronLeft, UserPlus, Activity, Target, Plus, Trash2, Camera, X, Edit3, Loader2, Flame, Trophy, Image as ImageIcon, LogOut, Home, Utensils, TrendingUp, ChevronDown, ChevronUp, CheckCircle2, Zap, Calendar, User, Play, MessageCircle, Send, MoreHorizontal, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

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
  const [rankingsMap, setRankingsMap] = useState({});
  const [routineName, setRoutineName] = useState('');
  const [days, setDays] = useState([{ id: crypto.randomUUID(), dayNumber: 1, exercises: [] }]);

  // ===== STUDENT STATE =====
  const [studentScreen, setStudentScreen] = useState('home');
  const [stExercises, setStExercises] = useState([]);
  const [stSession, setStSession] = useState(null);
  const [stSelectedDay, setStSelectedDay] = useState(null);
  const [stExpandedId, setStExpandedId] = useState(null);
  const [stWeight, setStWeight] = useState('');
  const [stReps, setStReps] = useState('');
  const [stRpe, setStRpe] = useState(null);
  const [stLoading, setStLoading] = useState(false);
  const [stSuccess, setStSuccess] = useState(false);
  const [stNextTarget, setStNextTarget] = useState(null);
  const [stTotalXp, setStTotalXp] = useState(0);
  const [stLastXp, setStLastXp] = useState(0);
  const [stShowXpFlash, setStShowXpFlash] = useState(false);
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
    setLoginEmail('');
    setLoginPassword('');
    setStudentScreen('home');
    setCurrentView('ListaAlumnos');
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
    try { const res = await axios.get(`${API_URL}/students/`); setStudents(res.data || []); } catch (e) { console.error(e); }
    finally { setLoadingStudents(false); }
  }, []);

  const fetchRankings = async () => {
    try {
      const res = await axios.get(`${API_URL}/rankings`);
      const map = {};
      (res.data?.rankings || []).forEach(r => { map[r.student_id] = r; });
      setRankingsMap(map);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (loggedInUser?.role === 'professor') { fetchStudents(); fetchRankings(); }
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
    return { id: crypto.randomUUID(), exerciseId: ex?.id || '', exerciseName: ex?.name || '?', muscleGroup: ex?.muscle_group || '', sets: 3, progressionModel: 'autoregulation', targetRpe: 'rpe8', repMin: 8, repMax: 12 };
  };

  const handleStudentClick = (s) => { setSelectedStudent(s); fetchPerformance(s.id); fetchPhotos(s.id); fetchActiveRoutine(s.id); fetchNutritionPlan(s.id); setCurrentView('PerfilAlumno'); };
  const handleCreateRoutineClick = () => { setRoutineName(''); setDays([{ id: crypto.randomUUID(), dayNumber: 1, exercises: [] }]); setCurrentView('CrearRutina'); };
  const handleAddDay = () => setDays([...days, { id: crypto.randomUUID(), dayNumber: days.length + 1, exercises: [] }]);
  const handleAddExerciseToDay = (dayId) => { if (!selectedExerciseId) return; setDays(days.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, createExercise(selectedExerciseId)] } : d)); };
  const handleRemoveExercise = (dayId, exId) => setDays(days.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d));
  const handleExerciseChange = (dayId, exId, field, val) => setDays(days.map(d => d.id === dayId ? { ...d, exercises: d.exercises.map(e => e.id === exId ? { ...e, [field]: val } : e) } : d));

  const handleSaveRoutine = async () => {
    const total = days.reduce((a, d) => a + d.exercises.length, 0);
    if (total === 0) { alert('Agregá al menos un ejercicio.'); return; }
    try {
      const rr = await axios.post(`${API_URL}/routines/`, { name: routineName, student_id: selectedStudent.id, current_day: 1 });
      const rid = rr.data.id;
      for (const day of days) {
        for (const ex of day.exercises) {
          let rpe = 8; if (ex.targetRpe === 'rpe7') rpe = 7; if (ex.targetRpe === 'rpe9') rpe = 9; if (ex.targetRpe === 'rpe10') rpe = 10;
          await axios.post(`${API_URL}/workout-exercises/`, { routine_id: rid, exercise_id: ex.exerciseId, day_number: day.dayNumber, sets: Number(ex.sets), progression_model: ex.progressionModel, rep_range_min: Number(ex.repMin), rep_range_max: Number(ex.repMax), target_rpe: rpe });
        }
      }
      alert(`✅ Rutina "${routineName}" guardada!`);
      setCurrentView('PerfilAlumno');
    } catch (e) { alert('Error: ' + (e.response?.data?.detail || e.message)); }
  };

  const buildChartData = () => {
    if (!performanceData?.exercises?.length) return null;
    const allDates = new Set();
    performanceData.exercises.forEach(ex => ex.history.forEach(h => { allDates.add(new Date(h.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })); }));
    return [...allDates].map(date => {
      const point = { date };
      performanceData.exercises.forEach(ex => { const e = ex.history.find(h => new Date(h.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) === date); point[ex.exercise_name] = e ? e.e1rm : null; });
      return point;
    });
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
        setStExercises((all.data || []).map(ex => ({ id: ex.exercise_id, routine_id: ex.routine_id, name: ex.exercises?.name || '?', muscleGroup: ex.exercises?.muscle_group || '', targetSets: ex.sets || 3, targetRepsText: ex.rep_range_min ? `${ex.rep_range_min}-${ex.rep_range_max}` : '10', setsCompleted: 0, day_number: ex.day_number, lastLog: ex.last_log, suggestedWeight: ex.suggested_weight, suggestedReps: ex.suggested_reps })).sort((a, b) => a.day_number - b.day_number));
      }
    } catch (e) { console.error(e); }
  };
  const stFetchPoints = async () => { if (!studentId) return; try { const r = await axios.get(`${API_URL}/student/${studentId}/points`); setStTotalXp(r.data?.total_xp || 0); } catch { } };
  const stFetchRankings = async () => { setStLoadingRankings(true); try { const r = await axios.get(`${API_URL}/rankings`); setStRankings(r.data?.rankings || []); } catch { } finally { setStLoadingRankings(false); } };
  const stFetchNutrition = async () => { setStLoadingNutrition(true); try { const r = await axios.get(`${API_URL}/student/${studentId}/nutrition`); setStNutrition(r.data); } catch { } finally { setStLoadingNutrition(false); } };

  // ===== SOCIAL STATE & FETCHERS =====
  const [stFeed, setStFeed] = useState([]);
  const [stLoadingFeed, setStLoadingFeed] = useState(false);
  const [stSocialProfile, setStSocialProfile] = useState(null);
  const [stShowNewPostModal, setStShowNewPostModal] = useState(false);
  const [stNewPostCaption, setStNewPostCaption] = useState('');
  const [stShowCommentsFor, setStShowCommentsFor] = useState(null);
  const [stComments, setStComments] = useState([]);
  const [stNewComment, setStNewComment] = useState('');

  const stFetchFeed = async () => {
    setStLoadingFeed(true);
    try {
      const r = await axios.get(`${API_URL}/feed/${loggedInUser?.id}`);
      setStFeed(r.data || []);
    } catch { } finally { setStLoadingFeed(false); }
  };

  const stFetchProfile = async (targetUserId) => {
    try {
      const r = await axios.get(`${API_URL}/users/${targetUserId}/profile`);
      setStSocialProfile(r.data);
      const pr = await axios.get(`${API_URL}/users/${targetUserId}/posts?request_user_id=${loggedInUser?.id}`);
      setStSocialProfile(prev => ({ ...prev, posts: pr.data || [] }));
    } catch { }
  };

  const stToggleLike = async (postId) => {
    try {
      const r = await axios.post(`${API_URL}/posts/${postId}/toggle-like`, { user_id: loggedInUser.id });
      const liked = r.data.status === 'liked';
      const inc = liked ? 1 : -1;
      setStFeed(prev => prev.map(p => p.id === postId ? { ...p, has_liked: liked, likes_count: p.likes_count + inc } : p));
      if (stSocialProfile && stSocialProfile.posts) {
        setStSocialProfile(prev => ({ ...prev, posts: prev.posts.map(p => p.id === postId ? { ...p, has_liked: liked, likes_count: p.likes_count + inc } : p) }));
      }
    } catch { }
  };

  const stSubmitPost = async () => {
    if (!stNewPostCaption) return;
    try {
      await axios.post(`${API_URL}/posts/`, { user_id: loggedInUser.id, caption: stNewPostCaption, image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop' });
      setStShowNewPostModal(false);
      setStNewPostCaption('');
      if (studentScreen === 'community') stFetchFeed();
    } catch { alert('Error al crear post'); }
  };

  const stFetchComments = async (postId) => {
    try {
      const r = await axios.get(`${API_URL}/posts/${postId}/comments`);
      setStComments(r.data || []);
      setStShowCommentsFor(postId);
    } catch { }
  };

  const stSubmitComment = async () => {
    if (!stNewComment || !stShowCommentsFor) return;
    try {
      await axios.post(`${API_URL}/posts/${stShowCommentsFor}/comments`, { user_id: loggedInUser.id, content: stNewComment });
      setStNewComment('');
      stFetchComments(stShowCommentsFor);
      setStFeed(prev => prev.map(p => p.id === stShowCommentsFor ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch { }
  };

  useEffect(() => {
    if (loggedInUser?.role === 'student') { stFetchExercises(); stFetchPoints(); stFetchNutrition(); }
  }, [loggedInUser]);

  const stHandleSave = async (exerciseId) => {
    if (!stWeight || !stReps || !stRpe) { alert('Completá peso, reps y RPE.'); return; }
    setStLoading(true);
    try {
      const payload = { workout_id: stSession?.routine_id || 'unknown', exercise_id: exerciseId, set_number: (stExercises.find(e => e.id === exerciseId)?.setsCompleted || 0) + 1, actual_weight: parseFloat(stWeight), actual_reps: parseInt(stReps), actual_rpe: parseFloat(stRpe) };
      const r = await axios.post(`${API_URL}/logs/`, payload);
      if (r.data?.next_target) setStNextTarget(r.data.next_target);
      const xp = r.data?.xp_earned || 0;
      setStLastXp(xp); setStTotalXp(p => p + xp); setStShowXpFlash(true);
      setStExercises(stExercises.map(e => e.id === exerciseId ? { ...e, setsCompleted: e.setsCompleted + 1 } : e));
      setStSuccess(true);
      setTimeout(() => { setStSuccess(false); setStShowXpFlash(false); setStWeight(''); setStReps(''); setStRpe(null); setStNextTarget(null); }, 2500);
    } catch { alert('Error al guardar.'); }
    finally { setStLoading(false); }
  };

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'; };

  // ======================================================================
  // RENDER: LOGIN
  // ======================================================================
  if (!loggedInUser) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <Dumbbell size={40} color="#6366F1" />
            <h1>FitPro Hub</h1>
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
    const dayNames = { 1: 'Pecho + Hombros + Bíceps', 2: 'Piernas (isquios) + Pantorrillas', 3: 'Espalda + Deltoides + Tríceps', 4: 'Piernas (cuádriceps) + Pantorrillas', 5: 'Hombros + Pectorales + Brazos' };

    return (
      <div className="student-app">
        {/* STUDENT TOP BAR */}
        <div className="student-topbar">
          <div className="student-topbar-left">
            <Dumbbell size={22} color="#6366F1" />
            <span className="student-topbar-brand">FitPro</span>
          </div>
          <div className="student-topbar-right">
            <div className="student-xp-badge"><Zap size={14} color="#F59E0B" /> {stTotalXp.toLocaleString()} XP</div>
            <button className="btn-icon-sm" onClick={handleLogout} title="Cerrar sesión"><LogOut size={18} /></button>
          </div>
        </div>

        {/* STUDENT NAV */}
        <div className="student-nav">
          {[{ key: 'home', icon: Home, label: 'Inicio' }, { key: 'workout', icon: Dumbbell, label: 'Entreno' }, { key: 'community', icon: Users, label: 'Feed' }, { key: 'nutrition', icon: Utensils, label: 'Nutrición' }, { key: 'profile', icon: User, label: 'Perfil' }].map(tab => (
            <button key={tab.key} className={`student-nav-item ${studentScreen === tab.key ? 'active' : ''}`} onClick={() => { setStudentScreen(tab.key); if (tab.key === 'community') stFetchFeed(); if (tab.key === 'workout') setStSelectedDay(null); }}>
              <tab.icon size={20} />
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
                <div className="st-stat"><Zap color="#F59E0B" size={20} /><strong>{stTotalXp.toLocaleString()}</strong><span>XP Total</span></div>
                <div className="st-stat"><Target color="#6366F1" size={20} /><strong>{stSession ? `Día ${stSession.current_day}` : '—'}</strong><span>Entreno Actual</span></div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1rem', color: '#FAFAFA', marginBottom: '16px' }}>Tu entrenamiento de hoy</h3>
                {stSession ? (
                  <button className="st-main-card" onClick={() => { setStSelectedDay(stSession.current_day); setStudentScreen('workout'); }} style={{ border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(145deg, rgba(30,30,36,1) 0%, rgba(39,39,46,1) 100%)' }}>
                    <div className="st-card-icon" style={{ background: '#6366F1' }}><Dumbbell color="#fff" size={24} /></div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h4 style={{ color: '#FAFAFA', fontSize: '1.05rem', marginBottom: '4px' }}>Día {stSession.current_day} - {dayNames[stSession.current_day] || 'Entrenamiento'}</h4>
                      <p style={{ color: '#A1A1AA', fontSize: '0.85rem' }}>
                        {stExercises.filter(e => e.day_number === stSession.current_day).length} ejercicios asignados
                      </p>
                    </div>
                    <ChevronDown color="#6366F1" size={20} style={{ transform: 'rotate(-90deg)' }} />
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
                    <div className={`st-card-icon ${stSession?.current_day === day ? 'today' : ''}`}><Dumbbell color={stSession?.current_day === day ? '#6366F1' : '#fff'} size={22} /></div>
                    <div style={{ flex: 1 }}>
                      <h4>DÍA {day} – {dayNames[day]}</h4>
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
              <h2 className="st-section-title">Día {stSelectedDay} – {dayNames[stSelectedDay]}</h2>
              {stExercises.filter(e => e.day_number === stSelectedDay).map(exercise => {
                const isExp = stExpandedId === exercise.id;
                const done = exercise.setsCompleted >= exercise.targetSets;
                return (
                  <div key={exercise.id} className="st-exercise-card">
                    <button className={`st-exercise-header ${isExp ? 'expanded' : ''}`} onClick={() => { if (done) return; setStExpandedId(isExp ? null : exercise.id); setStWeight(''); setStReps(''); setStRpe(null); setStNextTarget(null); setStSuccess(false); }}>
                      <div className="st-exercise-left">
                        <div className="st-exercise-icon"><Dumbbell color="#fff" size={20} /></div>
                        <div><h4>{exercise.name}</h4><p>{done ? `✅ Completado (${exercise.setsCompleted}/${exercise.targetSets})` : exercise.setsCompleted > 0 ? `${exercise.setsCompleted}/${exercise.targetSets} sets` : `${exercise.targetSets} sets de ${exercise.targetRepsText} reps`}</p></div>
                      </div>
                      {done ? <CheckCircle2 color="#10B981" size={20} /> : isExp ? <ChevronUp color="#6366F1" size={20} /> : <ChevronDown color="#52525B" size={20} />}
                    </button>
                    {isExp && (
                      <div className="st-exercise-body">
                        {exercise.lastLog && (
                          <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#8B5CF6', fontWeight: 700, textTransform: 'uppercase' }}>Sesión Anterior</span>
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
                            <Zap size={16} /> <span>Objetivo Auto-regulado: {exercise.suggestedWeight} kg</span>
                          </div>
                        )}
                        {stNextTarget && (
                          <div className="st-suggestion"><Trophy color="#F59E0B" size={20} /><div><small>Próximo Objetivo</small><strong>{stNextTarget.suggested_weight} kg × {stNextTarget.suggested_reps} reps</strong></div></div>
                        )}
                        {stSuccess ? (
                          <div className="st-success"><CheckCircle2 color="#10B981" size={48} /><h3>¡Serie Guardada!</h3>{stShowXpFlash && stLastXp > 0 && <span className="st-xp-flash">+{stLastXp.toLocaleString()} XP</span>}</div>
                        ) : (
                          <div>
                            <div className="st-input-row">
                              <div className="input-group"><label>Peso (kg)</label><input type="number" placeholder="0" value={stWeight} onChange={e => setStWeight(e.target.value)} /></div>
                              <div className="input-group"><label>Reps</label><input type="number" placeholder="0" value={stReps} onChange={e => setStReps(e.target.value)} /></div>
                            </div>
                            <label style={{ marginTop: '12px' }}>¿Cómo te sentiste?</label>
                            <div className="st-rpe-row">
                              {[{ val: 7, emoji: '😊', label: 'Fácil', color: '#10B981' }, { val: 8, emoji: '😐', label: 'Moderado', color: '#3B82F6' }, { val: 9, emoji: '😤', label: 'Exigente', color: '#F59E0B' }, { val: 10, emoji: '😵', label: 'Al Fallo', color: '#EF4444' }].map(r => (
                                <button key={r.val} className={`st-rpe-btn ${stRpe === r.val ? 'active' : ''}`} style={stRpe === r.val ? { borderColor: r.color, background: `${r.color}22` } : {}} onClick={() => setStRpe(r.val)}>
                                  <span style={{ fontSize: '20px' }}>{r.emoji}</span><span style={{ fontSize: '11px', color: stRpe === r.val ? r.color : '#A1A1AA' }}>{r.label}</span>
                                </button>
                              ))}
                            </div>
                            <button className="btn-primary w-full" style={{ marginTop: '16px' }} onClick={() => stHandleSave(exercise.id)} disabled={stLoading}>
                              {stLoading ? <Loader2 size={18} className="spin-icon" /> : 'Guardar Serie'}
                            </button>
                          </div>
                        )}
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
                      alert('¡Día Completado! 🎉'); stFetchExercises(); stFetchPoints(); setStSelectedDay(null);
                    } catch { alert('Error al finalizar.'); }
                    finally { setStIsFinishing(false); }
                  }}>
                  {stIsFinishing ? <Loader2 size={18} className="spin-icon" /> : `Terminar Día ${stSelectedDay}`}
                </button>
              )}
            </div>
          )}

          {/* NUTRITION */}
          {studentScreen === 'nutrition' && (
            <div className="view-fade-in">
              <h2 className="st-section-title">Plan Nutricional</h2>
              {stNutrition ? (
                <>
                  <p style={{ color: '#71717A', marginBottom: '16px' }}>🔥 Objetivo: Recomposición corporal</p>
                  <div className="st-macros">
                    <div className="st-macro"><strong>{stNutrition.objectives?.calories}</strong><span>Calorías</span></div>
                    <div className="st-macro"><strong style={{ color: '#EF4444' }}>{stNutrition.objectives?.protein}</strong><span>Proteínas</span></div>
                    <div className="st-macro"><strong style={{ color: '#F59E0B' }}>{stNutrition.objectives?.carbs}</strong><span>Carbos</span></div>
                    <div className="st-macro"><strong style={{ color: '#6366F1' }}>{stNutrition.objectives?.fats}</strong><span>Grasas</span></div>
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
          )}

          {/* RANKING */}
          {studentScreen === 'ranking' && (
            <div className="view-fade-in">
              <h2 className="st-section-title">🏆 Ranking de Atletas</h2>
              <div className="st-xp-hero"><Flame color="#F59E0B" size={36} /><h2>{stTotalXp.toLocaleString()}</h2><span>XP TOTALES</span></div>
              {stLoadingRankings ? <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 size={32} className="spin-icon" color="#6366F1" /></div> :
                stRankings.map((r, i) => {
                  const isMe = r.student_id === studentId;
                  const emoji = ['', '🥇', '🥈', '🥉'][r.position] || `#${r.position}`;
                  return (
                    <div key={r.student_id} className={`st-ranking-row ${isMe ? 'me' : ''} ${r.position === 1 ? 'first' : ''}`}>
                      <span className="st-rank-pos">{emoji}</span>
                      <div className="st-rank-avatar" style={isMe ? { borderColor: '#6366F1' } : {}}>{r.name?.charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1 }}><strong style={isMe ? { color: '#6366F1' } : {}}>{r.name} {isMe ? '(Vos)' : ''}</strong><br /><small style={{ color: '#71717A' }}>{r.total_sets} series</small></div>
                      <div style={{ textAlign: 'right' }}><strong style={{ color: r.position === 1 ? '#F59E0B' : '#FAFAFA' }}>{r.total_xp.toLocaleString()}</strong><br /><small style={{ color: '#71717A' }}>XP</small></div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* COMMUNITY (FEED) */}
          {studentScreen === 'community' && (
            <div className="view-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="st-section-title" style={{ margin: 0 }}>FitGram</h2>
                <button className="btn-icon-sm" onClick={() => setStShowNewPostModal(true)} style={{ background: '#6366F1', color: '#fff' }}><Plus size={20} /></button>
              </div>
              {stLoadingFeed ? <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 size={32} className="spin-icon" color="#6366F1" /></div> :
                stFeed.map(post => (
                  <div key={post.id} className="st-post-card">
                    <div className="st-post-header" onClick={() => { stFetchProfile(post.user_id); setStudentScreen('socialProfile'); }}>
                      <img src={post.user_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'} alt="avatar" className="st-post-avatar" />
                      <div><strong style={{ color: '#FAFAFA' }}>{post.username || post.user_name}</strong><br /><small style={{ color: '#A1A1AA' }}>{new Date(post.created_at).toLocaleDateString()}</small></div>
                    </div>
                    {post.image_url && <img src={post.image_url} alt="post" className="st-post-image" />}
                    <div className="st-post-actions">
                      <button className={`st-post-action-btn ${post.has_liked ? 'liked' : ''}`} onClick={() => stToggleLike(post.id)}>
                        <Dumbbell size={24} color={post.has_liked ? '#10B981' : '#FAFAFA'} /> <span>{post.likes_count}</span>
                      </button>
                      <button className="st-post-action-btn" onClick={() => stFetchComments(post.id)}>
                        <MessageCircle size={24} color="#FAFAFA" /> <span>{post.comments_count}</span>
                      </button>
                      <button className="st-post-action-btn" style={{ marginLeft: 'auto' }}><Send size={24} color="#FAFAFA" /></button>
                    </div>
                    {post.caption && (
                      <div className="st-post-caption">
                        <strong>{post.username || post.user_name}</strong> {post.caption}
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          )}

          {/* SOCIAL PROFILE MODAL/VIEW */}
          {studentScreen === 'socialProfile' && stSocialProfile && (
            <div className="view-fade-in">
              <button className="btn-back" onClick={() => { setStudentScreen('community'); setStSocialProfile(null); }}><ChevronLeft size={20} /> Volver al Feed</button>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <img src={stSocialProfile.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366F1' }} />
                <h2 style={{ marginTop: '12px' }}>{stSocialProfile.name}</h2>
                <p style={{ color: '#A1A1AA' }}>@{stSocialProfile.username || stSocialProfile.name.toLowerCase().replace(' ', '')}</p>
                <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>{stSocialProfile.bio || 'Atleta de FitPro.'}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', margin: '20px 0' }}>
                  <div style={{ textAlign: 'center' }}><strong style={{ color: '#FAFAFA', fontSize: '1.2rem' }}>{stSocialProfile.posts_count || 0}</strong><br /><small style={{ color: '#A1A1AA' }}>Posts</small></div>
                  <div style={{ textAlign: 'center' }}><strong style={{ color: '#FAFAFA', fontSize: '1.2rem' }}>{stSocialProfile.followers_count || 0}</strong><br /><small style={{ color: '#A1A1AA' }}>Seguidores</small></div>
                  <div style={{ textAlign: 'center' }}><strong style={{ color: '#FAFAFA', fontSize: '1.2rem' }}>{stSocialProfile.following_count || 0}</strong><br /><small style={{ color: '#A1A1AA' }}>Seguidos</small></div>
                </div>

                <div className="st-profile-grid">
                  {stSocialProfile.posts && stSocialProfile.posts.map(p => (
                    <div key={p.id} className="st-grid-item">
                      {p.image_url ? <img src={p.image_url} alt="post" /> : <div className="placeholder-grid-item"></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {studentScreen === 'profile' && (
            <div className="view-fade-in" style={{ textAlign: 'center' }}>
              <div className="st-profile-avatar"><User color="#A1A1AA" size={40} /></div>
              <h2 style={{ marginTop: '16px' }}>{loggedInUser.name}</h2>
              <p style={{ color: '#71717A' }}>{stSession?.routine_name || 'Sin rutina activa'}</p>
              <div className="st-stats-row" style={{ marginTop: '24px' }}>
                <div className="st-stat"><Flame color="#F59E0B" size={20} /><strong>{stTotalXp.toLocaleString()}</strong><span>XP Total</span></div>
                <div className="st-stat"><Dumbbell color="#6366F1" size={20} /><strong>{stExercises.length}</strong><span>Ejercicios</span></div>
                <div className="st-stat"><Calendar color="#10B981" size={20} /><strong>{stSession?.total_days || 0}</strong><span>Días</span></div>
              </div>

              <div style={{ marginTop: '32px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={20} color="#6366F1" /> Progreso Corporal</h3>
                <p style={{ color: '#A1A1AA', fontSize: '0.85rem', marginBottom: '16px' }}>Sube tu foto de progreso físico mes a mes para que el profesor documente tus cambios.</p>
                <input type="file" id="photoUpload" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    alert('¡Foto seleccionada! Simulando subida a Supabase Storage...');
                    setTimeout(() => alert('Foto guardada correctamente en tu perfil.'), 1500);
                  }
                }} />
                <label htmlFor="photoUpload" className="btn-primary w-full" style={{ display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#3B82F6' }}>
                  <ImageIcon size={18} /> Subir Foto de Progreso
                </label>
              </div>

              <button className="btn-primary w-full" style={{ marginTop: '24px', background: '#EF4444' }} onClick={handleLogout}><LogOut size={18} /> Cerrar Sesión</button>
            </div>
          )}
        </div>

        {/* SOCIAL MODALS */}
        {stShowNewPostModal && (
          <div className="modal-overlay">
            <div className="modal" style={{ width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3>Nuevo Post</h3>
                <button className="btn-icon-sm" onClick={() => setStShowNewPostModal(false)}><X size={20} /></button>
              </div>
              <div style={{ height: '200px', background: '#27272E', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#A1A1AA' }}>
                <Camera size={32} />
                <span style={{ marginLeft: '12px' }}>Toca para subir foto</span>
              </div>
              <textarea className="form-input" style={{ minHeight: '80px', marginBottom: '16px', resize: 'none' }} placeholder="Escribe un pie de foto... #entrenamiento" value={stNewPostCaption} onChange={e => setStNewPostCaption(e.target.value)} />
              <button className="btn-primary w-full" style={{ background: '#6366F1' }} onClick={stSubmitPost}>Publicar</button>
            </div>
          </div>
        )}

        {stShowCommentsFor && (
          <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setStShowCommentsFor(null); }}>
            <div className="modal" style={{ width: '100%', maxWidth: '600px', height: '70vh', marginTop: 'auto', marginBottom: 0, borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272E', paddingBottom: '16px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, textAlign: 'center', flex: 1 }}>Comentarios</h3>
                <button className="btn-icon-sm" onClick={() => setStShowCommentsFor(null)}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stComments.length === 0 ? <p style={{ textAlign: 'center', color: '#52525B', margin: '40px 0' }}>Sé el primero en comentar.</p> :
                  stComments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                      <img src={c.user_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <strong>{c.username || c.user_name}</strong> <span style={{ color: '#D4D4D8', fontSize: '0.9rem' }}>{c.content}</span>
                        <br /><small style={{ color: '#71717A', fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #27272E', marginTop: '12px' }}>
                <input type="text" className="form-input" style={{ flex: 1, borderRadius: '24px' }} placeholder="Escribe un comentario..." value={stNewComment} onChange={e => setStNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && stSubmitComment()} />
                <button className="btn-icon-sm" style={{ background: '#6366F1', color: '#fff' }} onClick={stSubmitComment}><Send size={18} /></button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ======================================================================
  // RENDER: PROFESSOR DASHBOARD
  // ======================================================================
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand"><Dumbbell className="brand-icon" /><h2>FitPro Hub</h2></div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${currentView === 'ListaAlumnos' ? 'active' : ''}`} onClick={() => { setSelectedStudent(null); setCurrentView('ListaAlumnos'); }}><Users size={20} /><span>Mis Alumnos</span></button>
          <button className="nav-item"><FileText size={20} /><span>Plantillas</span></button>
          <button className="nav-item"><Dumbbell size={20} /><span>Biblioteca</span></button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar avatar-prof">P</div>
            <div><p className="user-name">{loggedInUser.name}</p><p className="user-role">Cuenta Pro</p></div>
          </div>
          <button className="btn-back" style={{ marginTop: '12px' }} onClick={handleLogout}><LogOut size={16} /> Cerrar Sesión</button>
        </div>
      </aside>

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
            <div className="students-grid">
              {loadingStudents ? <div className="card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}><Loader2 size={48} color="#3B82F6" className="spin-icon" /></div> : students.length === 0 ? <div className="card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}><Users size={48} color="#52525B" /><h3 style={{ color: '#A1A1AA', marginTop: '12px' }}>No hay alumnos</h3></div> : null}
              {students.map(s => (
                <div key={s.id} className="card student-card interactive" onClick={() => handleStudentClick(s)}>
                  <div className="student-card-header">
                    <div className="avatar avatar-student" style={{ backgroundColor: '#6366F1', color: '#fff', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>{s.name?.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}><h3 className="student-name">{s.name}</h3><span className="status-badge active">{s.status || 'Activo'}</span></div>
                    <button className="btn-icon-danger" onClick={e => { e.stopPropagation(); handleDeleteStudent(s.id, s.name); }}>{deletingStudentId === s.id ? <Loader2 size={18} className="spin-icon" /> : <Trash2 size={18} />}</button>
                  </div>
                  <div className="student-card-stats">
                    {s.goal && <div className="stat"><span className="stat-label">Objetivo</span><span className="stat-value">{s.goal}</span></div>}
                    {s.weight_kg && <div className="stat"><span className="stat-label">Peso</span><span className="stat-value">{s.weight_kg} kg</span></div>}
                    <div className="stat"><span className="stat-label"><Flame size={12} color="#F59E0B" /> XP</span><span className="stat-value" style={{ color: '#F59E0B' }}>{(rankingsMap[s.id]?.total_xp || 0).toLocaleString()}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {currentView === 'PerfilAlumno' && selectedStudent && (
          <div className="view-fade-in">
            <button className="btn-back" onClick={() => setCurrentView('ListaAlumnos')}><ChevronLeft size={20} /> Volver</button>
            <header className="profile-header">
              <div className="avatar avatar-student" style={{ width: 64, height: 64, backgroundColor: '#6366F1', color: '#fff', fontSize: '28px', fontWeight: 700, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{selectedStudent.name?.charAt(0).toUpperCase()}</div>
              <div><h1>{selectedStudent.name}</h1><span className="status-badge active">{selectedStudent.status || 'Activo'}</span></div>
            </header>
            <div className="profile-grid">
              <section className="card">
                <div className="card-header"><Activity size={20} className="icon-accent" /><h2>Progresión e1RM</h2></div>
                {performanceData?.exercises?.length > 0 ? (
                  <>
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer><LineChart data={buildChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" /><XAxis dataKey="date" stroke="#71717a" fontSize={12} /><YAxis stroke="#71717a" fontSize={12} unit="kg" />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, color: '#fafafa' }} />
                        <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
                        {performanceData.exercises.map((ex, i) => <Line key={ex.exercise_id} type="monotone" dataKey={ex.exercise_name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />)}
                      </LineChart></ResponsiveContainer>
                    </div>
                  </>
                ) : <div className="empty-state"><Activity size={40} className="empty-icon" /><h3>Sin datos</h3></div>}
              </section>
              <section className="card flex-col">
                <div className="card-header"><Target size={20} className="icon-accent" /><h2>Plan Actual</h2></div>
                {activeRoutine ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{activeRoutine.routine_name}</h3>
                    <p style={{ color: '#A1A1AA', fontSize: '0.9rem', marginBottom: '16px' }}>Día: <strong style={{ color: '#3B82F6' }}>{activeRoutine.current_day}</strong> de {activeRoutine.total_days}</p>
                    {[1, 2, 3, 4, 5].map(d => { const exs = routineExercises.filter(e => e.day_number === d); if (!exs.length) return null; return (<div key={d} style={{ marginBottom: '12px' }}><h4 style={{ color: '#FAFAFA', borderBottom: '1px solid #3F3F46', paddingBottom: '4px', marginBottom: '6px' }}>Día {d}</h4>{exs.map((e, i) => <div key={e.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#27272A', borderRadius: '8px', marginBottom: '4px', fontSize: '0.85rem' }}><span style={{ fontWeight: 600 }}>{e.exercises?.name}</span><span style={{ color: '#71717A' }}>{e.sets}s · {e.rep_range_min}-{e.rep_range_max}r</span></div>)}</div>); })}
                  </div>
                ) : <div className="empty-state"><Dumbbell size={48} className="empty-icon" /><h3>Sin rutina</h3></div>}
                <div className="mt-auto"><button className="btn-primary w-full massive-btn" onClick={handleCreateRoutineClick}>+ Asignar Rutina</button></div>
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
                <div className="flex-between mb-4"><h2>Día {day.dayNumber}</h2><button className="btn-secondary" onClick={() => handleAddExerciseToDay(day.id)}><Plus size={18} /> Agregar</button></div>
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
                      <div className="input-group"><label>Reps</label><div className="input-double"><input type="number" value={ex.repMin} onChange={e => handleExerciseChange(day.id, ex.id, 'repMin', e.target.value)} /><span className="separator">-</span><input type="number" value={ex.repMax} onChange={e => handleExerciseChange(day.id, ex.id, 'repMax', e.target.value)} /></div></div>
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
