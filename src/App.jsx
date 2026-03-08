import { useState, useEffect, useCallback } from 'react';
import { Users, FileText, Dumbbell, Save, ChevronLeft, UserPlus, Activity, Target, Plus, Trash2, LogOut, Home, Utensils, Loader2, Flame, Trophy, CheckCircle2, TrendingUp, TrendingDown, Minus, User, ChevronDown, ChevronUp, BarChart2, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import axios from 'axios';
import SeriesInput from './components/SeriesInput';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CHART_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#A78BFA', '#EC4899', '#14B8A6', '#F97316'];

// ── Datos de pago — editar acá si cambia el precio o los datos bancarios ──
const PAGO = {
  precio: '$50.000',
  alias: 'IMPERA.SURCOS.FOCA',
  cbu: '3840200500000018952467',
  titular: 'Agustin Lopez',
  banco: 'Wilobank',
  waNro: '5493794293284',
};

export default function App() {
  // ===== AUTH STATE =====
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ===== PROFESSOR STATE =====
  const [currentView, setCurrentView] = useState('ListaAlumnos');
  const [challenges, setChallenges] = useState([]);
  const [challengeForm, setChallengeForm] = useState({ name: '', duration_days: 30, price: '', description: '', emoji: '🏆', routine_hombre: '', routine_mujer: '', nutrition_hombre: '', nutrition_mujer: '' });
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [challengeEnrollments, setChallengeEnrollments] = useState({});
  const [savingChallenge, setSavingChallenge] = useState(false);
  const [challengesLoading, setChallengesLoading] = useState(false);
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
  const [pendingStudents, setPendingStudents] = useState([]);
  const [activatingId, setActivatingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
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

  // ===== PROFESSOR NUTRITION FORM =====
  const EMPTY_NUTRITION = { ayuno: '', desayuno: '', media_manana: '', almuerzo: '', merienda: '', pre_entrenamiento: '', post_entrenamiento: '', cena: '', antes_de_dormir: '', suplementacion: '' };
  const MEAL_META = [
    { key: 'ayuno',              name: 'Ayuno intermitente',  emoji: '🌅', placeholder: 'Ej: Tomar solo agua o café negro hasta las 12hs' },
    { key: 'desayuno',           name: 'Desayuno',            emoji: '🌄', placeholder: 'Ej: 2 huevos revueltos + 1 tostada integral + café' },
    { key: 'media_manana',       name: 'Media mañana',        emoji: '🍎', placeholder: 'Ej: 1 fruta + 10 almendras' },
    { key: 'almuerzo',           name: 'Almuerzo',            emoji: '🍽️', placeholder: 'Ej: 150g pollo a la plancha + arroz integral + ensalada' },
    { key: 'merienda',           name: 'Merienda',            emoji: '☕', placeholder: 'Ej: Yogur griego + granola' },
    { key: 'pre_entrenamiento',  name: 'Pre-entrenamiento',   emoji: '⚡', placeholder: 'Ej: 1 banana + 1 cuchara de mantequilla de maní' },
    { key: 'post_entrenamiento', name: 'Post-entrenamiento',  emoji: '💪', placeholder: 'Ej: Proteína whey con agua o leche descremada' },
    { key: 'cena',               name: 'Cena',                emoji: '🌙', placeholder: 'Ej: 200g pescado + verduras al vapor' },
    { key: 'antes_de_dormir',    name: 'Antes de dormir',     emoji: '😴', placeholder: 'Ej: Caseína o yogur griego' },
    { key: 'suplementacion',     name: 'Suplementación',      emoji: '💊', placeholder: 'Ej: Creatina 5g post-entrenamiento / Vitamina D 1 comprimido con almuerzo' },
  ];
  const [profNutritionForm, setProfNutritionForm] = useState(EMPTY_NUTRITION);
  const [profNutritionSaving, setProfNutritionSaving] = useState(false);
  const [profNutritionSaved, setProfNutritionSaved] = useState(false);

  // ===== STUDENT PROFILE EDITING =====
  const [stProfileEditing, setStProfileEditing] = useState(false);
  const [stProfileForm, setStProfileForm] = useState({});
  const [stProfileSaving, setStProfileSaving] = useState(false);
  const [stPhotos, setStPhotos] = useState([]);
  const [stPhotosLoading, setStPhotosLoading] = useState(false);
  const [stPhotoUploading, setStPhotoUploading] = useState(false);
  const [stMetrics, setStMetrics] = useState([]);
  const [stMetricsLoading, setStMetricsLoading] = useState(false);
  const [stMetricForm, setStMetricForm] = useState({ fecha: '', peso: '', masa_muscular: '', masa_grasa: '', cintura: '', cadera: '' });
  const [stMetricSaving, setStMetricSaving] = useState(false);
  const [stActivePhotoMonth, setStActivePhotoMonth] = useState(null);
  const [stPhotoTipo, setStPhotoTipo] = useState('frente');

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
    window.location.href = '/elizondo-fitness.html';
  };

  // Check stored session or URL auth param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get('auth');
    if (authParam) {
      try {
        const user = JSON.parse(decodeURIComponent(escape(atob(authParam))));
        localStorage.setItem('fitpro_user', JSON.stringify(user));
        setLoggedInUser(user);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      } catch { }
    }
    const stored = localStorage.getItem('fitpro_user');
    if (stored) {
      try { setLoggedInUser(JSON.parse(stored)); } catch { localStorage.removeItem('fitpro_user'); }
    }
  }, []);

  // ===== PROFESSOR FETCHES =====
  const fetchChallenges = useCallback(async () => {
    setChallengesLoading(true);
    try { const r = await axios.get(`${API_URL}/challenges/`); setChallenges(r.data || []); }
    catch (e) { console.error(e); }
    finally { setChallengesLoading(false); }
  }, []);

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

  const fetchPendingStudents = useCallback(async () => {
    try {
      const professorId = loggedInUser?.id;
      const url = professorId ? `${API_URL}/students/pending?professor_id=${professorId}` : `${API_URL}/students/pending`;
      const res = await axios.get(url);
      setPendingStudents(res.data || []);
    } catch (e) { console.error(e); }
  }, [loggedInUser]);

  const handleActivateStudent = async (studentId) => {
    setActivatingId(studentId);
    try {
      await axios.post(`${API_URL}/students/${studentId}/activate`, { professor_id: loggedInUser?.id });
      await fetchPendingStudents();
      await fetchStudents();
    } catch { alert('Error al activar el alumno.'); }
    finally { setActivatingId(null); }
  };

  const handleRejectStudent = async (studentId) => {
    if (!window.confirm('Rechazar este alumno?')) return;
    setRejectingId(studentId);
    try {
      await axios.post(`${API_URL}/students/${studentId}/reject`);
      await fetchPendingStudents();
    } catch { alert('Error al rechazar el alumno.'); }
    finally { setRejectingId(null); }
  };

  useEffect(() => {
    if (loggedInUser?.role === 'professor') { fetchStudents(); fetchStagnantAlerts(); fetchPendingStudents(); }
  }, [loggedInUser, fetchStudents, fetchPendingStudents]);

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
  const fetchNutritionPlan = async (sid) => {
    try {
      const r = await axios.get(`${API_URL}/nutrition/${sid}`);
      setNutritionPlan(r.data);
      const raw = r.data?.raw || {};
      setProfNutritionForm({
        ayuno:              raw.ayuno || '',
        desayuno:           raw.desayuno || '',
        media_manana:       raw.media_manana || '',
        almuerzo:           raw.almuerzo || '',
        merienda:           raw.merienda || '',
        pre_entrenamiento:  raw.pre_entrenamiento || '',
        post_entrenamiento: raw.post_entrenamiento || '',
        cena:               raw.cena || '',
        antes_de_dormir:    raw.antes_de_dormir || '',
        suplementacion:     raw.suplementacion || '',
      });
    } catch { setNutritionPlan(null); }
  };

  const handleDeleteStudent = async (sid, name) => {
    if (!confirm(`¿Eliminar a "${name}"?`)) return;
    setDeletingStudentId(sid);
    try { await axios.delete(`${API_URL}/students/${sid}`); setStudents(p => p.filter(s => s.id !== sid)); if (selectedStudent?.id === sid) { setSelectedStudent(null); setCurrentView('ListaAlumnos'); } }
    catch (e) { alert('Error: ' + (e.response?.data?.detail || e.message)); }
    finally { setDeletingStudentId(null); }
  };

  const createExercise = (exId) => {
    const ex = exerciseLibrary.find(e => e.id === exId);
    return { id: crypto.randomUUID(), exerciseId: ex?.id || '', exerciseName: ex?.name || '?', muscleGroup: ex?.muscle_group || '', sets: 3, progressionModel: 'autoregulation', targetRir: 'rir2', repMin: 8, repMax: 12, repsPerSet: '' };
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
          let rir = 2; if (ex.targetRir === 'rir3') rir = 3; if (ex.targetRir === 'rir1') rir = 1; if (ex.targetRir === 'rir0') rir = 0;
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
            target_rir: rir,
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
            targetRir: ex.target_rir ?? 2,
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
  const stFetchNutrition = async () => { setStLoadingNutrition(true); try { const r = await axios.get(`${API_URL}/nutrition/${studentId}`); setStNutrition(r.data); } catch { } finally { setStLoadingNutrition(false); } };

  // ===== STUDENT DATA =====
  const [stStudentData, setStStudentData] = useState(null);
  const [stStudentDataLoading, setStStudentDataLoading] = useState(false);

  // ===== RETOS STATE (STUDENT) =====
  const [stChallenges, setStChallenges] = useState([]);
  const [stMyEnrollments, setStMyEnrollments] = useState([]);
  const [stEnrolling, setStEnrolling] = useState(null);
  const [stEnrollGender, setStEnrollGender] = useState('hombre');

  // ===== STREAK STATE =====
  const [stStreak, setStStreak] = useState({ streak: 0, at_risk: false, last_training_date: null, longest_streak: 0, milestone_100: false });

  const stFetchStreak = async () => {
    if (!studentId) return;
    try { const r = await axios.get(`${API_URL}/students/${studentId}/streak`); setStStreak(r.data || { streak: 0, at_risk: false, last_training_date: null, longest_streak: 0, milestone_100: false }); } catch { }
  };

  const stFetchChallenges = async (sid) => {
    const id = sid || studentId;
    if (!id) return;
    try {
      const [allR, myR] = await Promise.all([
        axios.get(`${API_URL}/challenges/`),
        axios.get(`${API_URL}/student/${id}/challenges`),
      ]);
      setStChallenges(allR.data || []);
      setStMyEnrollments(myR.data || []);
    } catch { }
  };

  const stFetchStudentData = async () => {
    if (!studentId) return;
    setStStudentDataLoading(true);
    try { const r = await axios.get(`${API_URL}/students/${studentId}`); setStStudentData(r.data); } catch { } finally { setStStudentDataLoading(false); }
  };

  const stFetchPhotos = async () => {
    if (!studentId) return;
    setStPhotosLoading(true);
    try { const r = await axios.get(`${API_URL}/student/${studentId}/photos`); setStPhotos(r.data || []); } catch { }
    finally { setStPhotosLoading(false); }
  };

  const stFetchMetrics = async () => {
    if (!studentId) return;
    setStMetricsLoading(true);
    try { const r = await axios.get(`${API_URL}/student/${studentId}/metrics`); setStMetrics(r.data || []); } catch { }
    finally { setStMetricsLoading(false); }
  };

  const stUpdateProfile = async () => {
    setStProfileSaving(true);
    try {
      const payload = {};
      if (stProfileForm.weight_kg !== '') payload.weight_kg = parseFloat(stProfileForm.weight_kg) || null;
      if (stProfileForm.height_cm !== '') payload.height_cm = parseFloat(stProfileForm.height_cm) || null;
      if (stProfileForm.whatsapp !== '') payload.whatsapp = stProfileForm.whatsapp || null;
      if (stProfileForm.nivel_experiencia) payload.nivel_experiencia = stProfileForm.nivel_experiencia;
      if (stProfileForm.dias_disponibles !== '') payload.dias_disponibles = parseInt(stProfileForm.dias_disponibles) || null;
      if (stProfileForm.lugar_entrenamiento) payload.lugar_entrenamiento = stProfileForm.lugar_entrenamiento;
      await axios.patch(`${API_URL}/students/${studentId}/profile`, payload);
      await stFetchStudentData();
      setStProfileEditing(false);
    } catch { alert('Error al guardar los datos.'); }
    finally { setStProfileSaving(false); }
  };

  const stUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStPhotoUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('tipo', stPhotoTipo);
      await axios.post(`${API_URL}/student/${studentId}/photos`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      await stFetchPhotos();
    } catch { alert('Error al subir la foto. Verificá que el bucket esté configurado en Supabase.'); }
    finally { setStPhotoUploading(false); e.target.value = ''; }
  };

  const stSaveMetric = async () => {
    setStMetricSaving(true);
    try {
      const payload = {};
      if (stMetricForm.fecha) payload.fecha = stMetricForm.fecha;
      if (stMetricForm.peso !== '') payload.peso = parseFloat(stMetricForm.peso) || null;
      if (stMetricForm.masa_muscular !== '') payload.masa_muscular = parseFloat(stMetricForm.masa_muscular) || null;
      if (stMetricForm.masa_grasa !== '') payload.masa_grasa = parseFloat(stMetricForm.masa_grasa) || null;
      if (stMetricForm.cintura !== '') payload.cintura = parseFloat(stMetricForm.cintura) || null;
      if (stMetricForm.cadera !== '') payload.cadera = parseFloat(stMetricForm.cadera) || null;
      await axios.post(`${API_URL}/student/${studentId}/metrics`, payload);
      await stFetchMetrics();
      setStMetricForm({ fecha: '', peso: '', masa_muscular: '', masa_grasa: '', cintura: '', cadera: '' });
    } catch { alert('Error al guardar las métricas.'); }
    finally { setStMetricSaving(false); }
  };

  useEffect(() => {
    if (loggedInUser?.role === 'student') { stFetchExercises(); stFetchNutrition(); stFetchStreak(); stFetchStudentData(); stFetchPhotos(); stFetchMetrics(); stFetchChallenges(); }
  }, [loggedInUser]);

  // setsData: [{ set_number, actual_weight, actual_reps, actual_rir }]
  const stHandleSave = async (exerciseId, setsData) => {
    setStLoading(true);
    try {
      for (const s of setsData) {
        const payload = { workout_id: stSession?.routine_id || 'unknown', exercise_id: exerciseId, set_number: s.set_number, actual_weight: s.actual_weight, actual_reps: s.actual_reps, actual_rir: s.actual_rir };
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
          <p className="login-footer">Agustin Elizondo Team © 2026</p>
        </div>
      </div>
    );
  }

  // ======================================================================
  // RENDER: STUDENT VIEW
  // ======================================================================
  if (loggedInUser.role === 'student') {

    // Esperar datos de suscripción antes de mostrar cualquier pantalla
    if (stStudentDataLoading || (!stStudentData && studentId)) {
      return (
        <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={40} color="#7C3AED" className="spin-icon" />
        </div>
      );
    }

    const subStatus = stStudentData?.subscription_status;
    const subDays = stStudentData?.days_remaining ?? 0;
    const studentStatus = stStudentData?.status;

    // PENDIENTE: el alumno se registró pero Agustin todavía no lo activó
    if (stStudentData && studentStatus === 'PENDIENTE') {
      return (
        <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'spin 3s linear infinite' }}>🔥</div>
          <h1 style={{ color: '#FAFAFA', fontSize: '1.5rem', fontWeight: 800 }}>Tu plan esta siendo preparado</h1>
          <p style={{ color: '#A1A1AA', marginTop: '12px', maxWidth: '300px', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Agustin está revisando tu información y en breve te asigna tu plan personalizado. Te avisamos por WhatsApp cuando esté listo.
          </p>
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
            <a
              href={`https://wa.me/5493794293284?text=${encodeURIComponent('Hola Agustin! Me registré en la app y estoy esperando que actives mi cuenta. Soy ' + loggedInUser.name)}`}
              target="_blank" rel="noopener"
              style={{ background: '#25D366', color: '#fff', padding: '14px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}
            >
              Escribirle a Agustin por WA
            </a>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '0.85rem', padding: '6px' }}>
              Cerrar sesion
            </button>
          </div>
          <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
        </div>
      );
    }

    // BLOCKED: suscripción vencida
    if (stStudentData && subStatus === 'blocked') {
      const waMsg = encodeURIComponent(
        `Hola Agustin! Soy ${loggedInUser.name}. Te mando el comprobante del pago de mi cuota (${PAGO.precio}). 🏋️`
      );
      const copy = (txt) => navigator.clipboard.writeText(txt);
      return (
        <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', textAlign: 'center' }}>
          <Dumbbell size={44} color="#7C3AED" style={{ marginBottom: '14px' }} />
          <h1 style={{ color: '#FAFAFA', fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>Renovar suscripción</h1>
          <p style={{ color: '#A1A1AA', fontSize: '0.88rem', maxWidth: '300px', lineHeight: 1.5, marginBottom: '20px' }}>
            Tu acceso está bloqueado. Realizá la transferencia y enviá el comprobante por WhatsApp.
          </p>

          {/* Monto */}
          <div style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '14px', padding: '18px 24px', width: '100%', maxWidth: '320px', marginBottom: '12px' }}>
            <div style={{ color: '#71717A', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Cuota mensual</div>
            <div style={{ color: '#A78BFA', fontSize: '2rem', fontWeight: 900 }}>{PAGO.precio}</div>
          </div>

          {/* Datos bancarios */}
          <div style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '14px', padding: '16px 20px', width: '100%', maxWidth: '320px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ color: '#71717A', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Datos de transferencia</div>

            {[
              { label: 'Alias', value: PAGO.alias },
              { label: 'CBU', value: PAGO.cbu },
              { label: 'Titular', value: PAGO.titular },
              { label: 'Banco', value: PAGO.banco },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ color: '#71717A', fontSize: '0.7rem' }}>{label}</div>
                  <div style={{ color: '#FAFAFA', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'monospace', marginTop: '1px' }}>{value}</div>
                </div>
                <button
                  onClick={() => copy(value)}
                  style={{ background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#A78BFA', fontSize: '0.72rem', padding: '5px 10px', cursor: 'pointer', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}
                >
                  Copiar
                </button>
              </div>
            ))}
          </div>

          {/* Botón WA */}
          <a
            href={`https://wa.me/${PAGO.waNro}?text=${waMsg}`}
            target="_blank" rel="noopener"
            style={{ background: '#25D366', color: '#fff', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '320px', justifyContent: 'center', marginBottom: '12px' }}
          >
            💬 Enviar comprobante por WhatsApp
          </a>

          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '0.82rem', marginTop: '4px' }}>
            Cerrar sesión
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
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#27272A', border: '2px solid #7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#A78BFA', flexShrink: 0, cursor: 'pointer' }} onClick={() => setStudentScreen('profile')}>
              {stStudentData?.foto_perfil_url
                ? <img src={stStudentData.foto_perfil_url} alt="perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : loggedInUser?.name?.charAt(0)?.toUpperCase()}
            </div>
            <button className="btn-icon-sm" onClick={handleLogout} title="Cerrar sesión"><LogOut size={18} /></button>
          </div>
        </div>

        {/* GRACE PERIOD BANNER */}
        {subStatus === 'grace' && (
          <div style={{ background: '#78350F', borderBottom: '1px solid #D97706', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ color: '#FDE68A', fontSize: '0.85rem', fontWeight: 600 }}>
              Tu suscripcion vence en {subDays === 0 ? 'menos de 1 dia' : `${subDays} dia${subDays !== 1 ? 's' : ''}`}. Renova para no perder el acceso.
            </span>
            <a href="/elizondo-fitness.html" style={{ background: '#D97706', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Abonar
            </a>
          </div>
        )}

        {/* STUDENT NAV */}
        <div className="student-nav">
          {[{ key: 'home', icon: Home, label: 'Inicio' }, { key: 'workout', icon: Dumbbell, label: 'Entreno' }, { key: 'retos', icon: Trophy, label: 'Retos' }, { key: 'nutrition', icon: Utensils, label: 'Nutrición' }, { key: 'profile', icon: User, label: 'Perfil' }].map(tab => (
            <button key={tab.key} className={`student-nav-item ${studentScreen === tab.key ? 'active' : ''}`} onClick={() => {
              setStudentScreen(tab.key);
              if (tab.key === 'ranking') stFetchRankings();
              if (tab.key === 'workout') setStSelectedDay(null);
            }}>
              <tab.icon size={22} />
              <span>{tab.label}</span>
            </button>
          ))}
          <button className={`student-nav-item ${studentScreen === 'fotos' ? 'active' : ''}`} onClick={() => setStudentScreen('fotos')}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>📷</span>
            <span>Mis Fotos</span>
          </button>
          <button className={`student-nav-item ${studentScreen === 'metricas' ? 'active' : ''}`} onClick={() => setStudentScreen('metricas')}>
            <span style={{ fontSize: '22px', lineHeight: 1 }}>📊</span>
            <span>Mis Métricas</span>
          </button>
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
              {stStreak.milestone_100 && (
                <div style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '16px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🏆</div>
                  <strong style={{ color: '#FBBF24', fontSize: '1rem', display: 'block' }}>¡100 días seguidos!</strong>
                  <p style={{ color: '#D4D4D8', fontSize: '0.85rem', marginTop: '6px' }}>Ganaste un <strong style={{ color: '#4ADE80' }}>25% de descuento</strong> para tu próximo mes.<br />Mostráselo a Agustin 🎉</p>
                </div>
              )}
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

              {/* Aviso de pagos — Punto 13 */}
              {(() => {
                const now = new Date();
                const day = now.getDate();
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const daysLeft = lastDay - day;
                const isLate = day > 5;
                const propPct = Math.round((daysLeft / lastDay) * 100);
                const totalPct = Math.round(propPct * 1.1);
                return (
                  <div style={{ marginTop: '16px', background: isLate ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)', border: `1px solid ${isLate ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`, borderRadius: '14px', padding: '14px 16px', fontSize: '0.83rem', lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', color: '#FDE68A' }}>⚠️ Info sobre tu cuota mensual</div>
                    <div style={{ color: '#D4D4D8' }}>La cuota se abona del <strong style={{ color: '#FAFAFA' }}>1 al 5 de cada mes</strong>.</div>
                    {isLate ? (
                      <div style={{ marginTop: '8px', color: '#FCA5A5' }}>
                        Hoy es día {day} — estás fuera del período.<br />
                        Te quedan <strong>{daysLeft} días</strong> del mes ({propPct}% de la cuota) + 10% de recargo.<br />
                        <strong>Total a pagar: ~{totalPct}% de tu cuota mensual.</strong>
                      </div>
                    ) : (
                      <div style={{ marginTop: '6px', color: '#6EE7B7' }}>Estás en el período normal de pago ✓ (día {day} de {lastDay})</div>
                    )}
                  </div>
                );
              })()}

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
                              <div><span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>RIR:</span> <strong style={{ color: exercise.lastLog.actual_rir <= 1 ? '#EF4444' : exercise.lastLog.actual_rir >= 3 ? '#10B981' : '#F59E0B' }}>{exercise.lastLog.actual_rir}</strong></div>
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
                            rirTarget={exercise.targetRir}
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
                <h2 className="st-section-title">Mi Nutrición</h2>
                {stLoadingNutrition ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#52525B' }}><Loader2 size={32} className="spin-icon" /></div>
                ) : stNutrition?.meals?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stNutrition.meals.map(meal => {
                      const isSupp = meal.is_supplement;
                      const accentColor = isSupp ? '#A78BFA' : '#10B981';
                      const iconBg = isSupp ? 'rgba(124,58,237,0.15)' : 'rgba(16,185,129,0.1)';
                      const borderColor = isSupp ? 'rgba(124,58,237,0.3)' : 'rgba(16,185,129,0.2)';
                      return (
                        <div key={meal.key} style={{ background: '#0D0B14', border: `1px solid ${borderColor}`, borderRadius: '14px', padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{meal.emoji}</div>
                            <strong style={{ fontSize: '0.92rem', color: accentColor }}>{meal.name}</strong>
                          </div>
                          <p style={{ color: '#D4D4D8', fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', paddingLeft: '46px' }}>{meal.text}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: '#52525B' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🥗</div>
                    <p style={{ fontWeight: 700, color: '#A1A1AA', marginBottom: '6px' }}>Tu profesor aún no cargó tu plan nutricional.</p>
                    <p style={{ fontSize: '0.85rem' }}>Consultale a Agustin o Oriana 💬</p>
                  </div>
                )}
              </div>
            )
          }

          {/* RACHA */}
          {studentScreen === 'ranking' && (
            <div className="view-fade-in">
              <h2 className="st-section-title">🔥 Tu Racha</h2>

              {/* Streak hero */}
              <div className="streak-hero">
                <span style={{ fontSize: '2.5rem' }}>{stStreak.milestone_100 ? '🏆' : '🔥'}</span>
                <span className="streak-hero-num">{stStreak.streak}</span>
                <span className="streak-hero-label">días seguidos entrenando</span>
                {stStreak.milestone_100 && (
                  <div style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '12px', padding: '12px 20px', marginTop: '12px', textAlign: 'center' }}>
                    <strong style={{ color: '#FBBF24', fontSize: '0.95rem' }}>🏆 ¡Hito de {stStreak.streak} días!</strong>
                    <p style={{ color: '#D4D4D8', fontSize: '0.82rem', marginTop: '4px' }}>Ganaste un 25% de descuento para tu próximo mes. Mostráselo a Agustin.</p>
                  </div>
                )}
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

          {/* RETOS */}
          {studentScreen === 'retos' && (
            <div className="view-fade-in">
              <h2 className="st-section-title">🏆 Retos</h2>
              <p style={{ color: '#71717A', fontSize: '0.88rem', marginBottom: '20px' }}>Programas intensivos con rutina y nutrición ya cargados. Elegí el tuyo.</p>
              {stChallenges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#52525B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
                  <p style={{ fontSize: '0.88rem' }}>Todavía no hay retos disponibles.</p>
                </div>
              ) : stChallenges.map(ch => {
                const myEnrollment = stMyEnrollments.find(e => e.challenge_id === ch.id || e.challenges?.id === ch.id);
                const isEnrolled = !!myEnrollment;
                return (
                  <div key={ch.id} className="st-exercise-card" style={{ marginBottom: '12px', border: isEnrolled ? '1px solid rgba(124,58,237,0.5)' : undefined }}>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '1.4rem' }}>{ch.emoji}</span>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>{ch.name}</h4>
                          <p style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>{ch.duration_days} días · {ch.price ? `$${Number(ch.price).toLocaleString('es-AR')}` : 'Consultá precio'}</p>
                        </div>
                        {isEnrolled && <span style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '999px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 800 }}>✓ Anotado{myEnrollment.gender === 'mujer' ? ' ♀' : ' ♂'}</span>}
                      </div>
                      {ch.description && <p style={{ color: '#71717A', fontSize: '0.82rem', marginBottom: '12px' }}>{ch.description}</p>}
                      {!isEnrolled ? (
                        stEnrolling === ch.id ? (
                          <div style={{ background: '#18181B', borderRadius: '10px', padding: '12px', marginTop: '8px' }}>
                            <p style={{ fontSize: '0.82rem', color: '#A1A1AA', marginBottom: '8px' }}>¿Qué versión del reto querés?</p>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                              {['hombre', 'mujer'].map(g => (
                                <button key={g} type="button" onClick={() => setStEnrollGender(g)}
                                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: stEnrollGender === g ? '2px solid #7C3AED' : '2px solid transparent', background: stEnrollGender === g ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)', color: stEnrollGender === g ? '#A78BFA' : '#71717A', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                                  {g === 'hombre' ? '♂ Hombre' : '♀ Mujer'}
                                </button>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStEnrolling(null)}>Cancelar</button>
                              <button className="btn-primary" style={{ flex: 2 }} onClick={async () => {
                                try {
                                  await axios.post(`${API_URL}/challenges/${ch.id}/enroll`, { student_id: studentId, gender: stEnrollGender });
                                  await stFetchChallenges();
                                  setStEnrolling(null);
                                } catch { alert('Error al anotarte. Intentá de nuevo.'); }
                              }}>Anotarme en este reto</button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setStEnrolling(ch.id); setStEnrollGender('hombre'); }}>
                            Quiero este reto
                          </button>
                        )
                      ) : (
                        <div style={{ background: '#18181B', borderRadius: '10px', padding: '12px', marginTop: '8px' }}>
                          {(myEnrollment.gender === 'hombre' ? ch.routine_hombre : ch.routine_mujer) ? (
                            <>
                              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A78BFA', marginBottom: '6px' }}>Tu rutina:</p>
                              <p style={{ fontSize: '0.82rem', color: '#D4D4D8', whiteSpace: 'pre-wrap' }}>{myEnrollment.gender === 'hombre' ? ch.routine_hombre : ch.routine_mujer}</p>
                            </>
                          ) : (
                            <p style={{ fontSize: '0.82rem', color: '#71717A', textAlign: 'center' }}>⏳ Agustin está preparando tu plan. Te avisamos cuando esté listo.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PROFILE */}
          {studentScreen === 'profile' && (
            <div className="view-fade-in">
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="st-section-title" style={{ margin: 0 }}>Mi Perfil</h2>
                <button className="btn-icon-sm" onClick={handleLogout} style={{ color: '#EF4444' }}><LogOut size={20} /></button>
              </div>

              {/* Avatar + nombre */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div className="st-profile-avatar">
                  {stStudentData?.foto_perfil_url
                    ? <img src={stStudentData.foto_perfil_url} alt="perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : <span style={{ fontSize: '2rem', fontWeight: 800 }}>{loggedInUser.name?.charAt(0).toUpperCase()}</span>}
                </div>
                <h2 style={{ marginTop: '14px', fontSize: '1.4rem' }}>{loggedInUser.name}</h2>
                <p style={{ color: '#A1A1AA', marginTop: '4px' }}>{loggedInUser.email}</p>
                {stStudentData?.goal && (
                  <span style={{ display: 'inline-block', marginTop: '8px', background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '999px', padding: '4px 14px', fontSize: '0.82rem', fontWeight: 700 }}>
                    🎯 {stStudentData.goal}
                  </span>
                )}
              </div>

              {/* Streak */}
              <div className="streak-hero" style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '2rem' }}>{stStreak.milestone_100 ? '🏆' : '🔥'}</span>
                <span className="streak-hero-num">{stStreak.streak}</span>
                <span className="streak-hero-label">días de racha</span>
                {stStreak.milestone_100 && <span style={{ display: 'inline-block', marginTop: '8px', background: 'rgba(234,179,8,0.15)', color: '#FBBF24', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '999px', padding: '4px 14px', fontSize: '0.82rem', fontWeight: 800 }}>🏆 100 días · 25% de descuento</span>}
                {stStreak.at_risk && <p style={{ color: '#EF4444', marginTop: '8px', fontSize: '0.85rem', fontWeight: 600 }}>⚠️ ¡Entrená hoy para no perder tu racha!</p>}
                {stStreak.longest_streak > 0 && <p style={{ color: '#A1A1AA', marginTop: '8px', fontSize: '0.8rem' }}>Mejor racha: {stStreak.longest_streak} días</p>}
              </div>

              {/* ── MIS DATOS ── */}
              {!stProfileEditing ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '0.8rem', color: '#71717A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mis datos</h3>
                    <button
                      onClick={() => { setStProfileForm({ weight_kg: stStudentData?.weight_kg ?? '', height_cm: stStudentData?.height_cm ?? '', whatsapp: stStudentData?.whatsapp ?? '', nivel_experiencia: stStudentData?.nivel_experiencia ?? '', dias_disponibles: stStudentData?.dias_disponibles ?? '', lugar_entrenamiento: stStudentData?.lugar_entrenamiento ?? '' }); setStProfileEditing(true); }}
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', borderRadius: '8px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                      Editar
                    </button>
                  </div>
                  <div className="st-stats-row">
                    {stStudentData?.weight_kg && <div className="st-stat"><Activity color="#10B981" size={20} /><strong>{stStudentData.weight_kg} kg</strong><span>Peso</span></div>}
                    {stStudentData?.height_cm && <div className="st-stat"><TrendingUp color="#F59E0B" size={20} /><strong>{stStudentData.height_cm} cm</strong><span>Altura</span></div>}
                    {stStudentData?.dias_disponibles && <div className="st-stat"><Target color="#7C3AED" size={20} /><strong>{stStudentData.dias_disponibles}</strong><span>Días/sem</span></div>}
                  </div>
                  {[{ label: 'Nivel', val: stStudentData?.nivel_experiencia }, { label: 'Entrena en', val: stStudentData?.lugar_entrenamiento }, { label: 'WhatsApp', val: stStudentData?.whatsapp }].filter(r => r.val).map(r => (
                    <div key={r.label} style={{ marginTop: '8px', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#71717A', fontSize: '0.85rem' }}>{r.label}</span>
                      <span style={{ color: '#FAFAFA', fontWeight: 700, fontSize: '0.85rem' }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '0.8rem', color: '#71717A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Actualizar datos</h3>
                    <button onClick={() => setStProfileEditing(false)} style={{ background: 'none', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
                  </div>
                  {[{ label: 'Peso actual (kg)', key: 'weight_kg', type: 'number', ph: 'Ej: 75' }, { label: 'Altura (cm)', key: 'height_cm', type: 'number', ph: 'Ej: 175' }, { label: 'WhatsApp', key: 'whatsapp', type: 'tel', ph: '+54 9 11 0000 0000' }, { label: 'Días disponibles por semana', key: 'dias_disponibles', type: 'number', ph: '3' }].map(f => (
                    <div key={f.key} style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#71717A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                      <input type={f.type} placeholder={f.ph} value={stProfileForm[f.key]} onChange={e => setStProfileForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', background: '#1a1730', border: '1px solid #2a2640', borderRadius: '12px', padding: '12px 14px', color: '#fff', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#71717A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nivel de experiencia</label>
                    <select value={stProfileForm.nivel_experiencia} onChange={e => setStProfileForm(p => ({ ...p, nivel_experiencia: e.target.value }))} style={{ width: '100%', background: '#1a1730', border: '1px solid #2a2640', borderRadius: '12px', padding: '12px 14px', color: stProfileForm.nivel_experiencia ? '#fff' : '#52525B', fontSize: '0.92rem', outline: 'none' }}>
                      <option value="">Seleccionar</option>
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#71717A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lugar de entrenamiento</label>
                    <select value={stProfileForm.lugar_entrenamiento} onChange={e => setStProfileForm(p => ({ ...p, lugar_entrenamiento: e.target.value }))} style={{ width: '100%', background: '#1a1730', border: '1px solid #2a2640', borderRadius: '12px', padding: '12px 14px', color: stProfileForm.lugar_entrenamiento ? '#fff' : '#52525B', fontSize: '0.92rem', outline: 'none' }}>
                      <option value="">Seleccionar</option>
                      <option value="Gimnasio completo">Gimnasio completo</option>
                      <option value="Gimnasio en casa">Gimnasio en casa</option>
                      <option value="Sin equipamiento">Sin equipamiento</option>
                    </select>
                  </div>
                  <button className="btn-primary w-full" disabled={stProfileSaving} onClick={stUpdateProfile}>
                    {stProfileSaving ? <Loader2 size={18} className="spin-icon" /> : <><Save size={16} /> Guardar cambios</>}
                  </button>
                </div>
              )}

              {/* ── FOTO DEL MES ── */}
              <div style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '0.8rem', color: '#71717A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>📸 Foto del mes</h3>
                  <label style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: stPhotoUploading ? '#52525B' : '#A78BFA', borderRadius: '8px', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: stPhotoUploading ? 'default' : 'pointer' }}>
                    {stPhotoUploading ? <><Loader2 size={12} className="spin-icon" /> Subiendo...</> : '+ Subir foto'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={stUploadPhoto} disabled={stPhotoUploading} />
                  </label>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#52525B', marginBottom: '14px' }}>Documentá tu progreso mes a mes. Agustin puede ver tus fotos para hacer ajustes en tu plan.</p>
                {stPhotosLoading
                  ? <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 size={24} className="spin-icon" color="#7C3AED" /></div>
                  : stPhotos.length === 0
                  ? <div style={{ textAlign: 'center', padding: '28px', border: '1px dashed rgba(124,58,237,0.25)', borderRadius: '16px', color: '#52525B', fontSize: '0.85rem' }}>
                      Aún no subiste ninguna foto.<br />Tu primera foto es el punto de partida. 💪
                    </div>
                  : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {stPhotos.map(p => (
                        <div key={p.id} style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', border: '1px solid rgba(124,58,237,0.2)' }}>
                          <img src={p.photo_url} alt="Progreso" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.65)', padding: '4px 6px', fontSize: '0.6rem', color: '#A1A1AA', textAlign: 'center' }}>
                            {new Date(p.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </div>
            </div>
          )}

          {studentScreen === 'fotos' && (
            <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>📷 Mis Fotos de Progreso</h3>
              <p style={{ fontSize: '0.82rem', color: '#71717A', marginBottom: '20px' }}>Subí fotos mensuales para documentar tu transformación.</p>

              <div style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A1A1AA', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subir foto del mes</p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {['frente', 'perfil', 'espalda'].map(t => (
                    <button key={t} onClick={() => setStPhotoTipo(t)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: stPhotoTipo === t ? '2px solid #7C3AED' : '2px solid #3F3F46', background: stPhotoTipo === t ? 'rgba(124,58,237,0.15)' : 'transparent', color: stPhotoTipo === t ? '#A78BFA' : '#71717A', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#7C3AED', color: '#fff', borderRadius: '10px', padding: '12px', fontWeight: 700, cursor: 'pointer', opacity: stPhotoUploading ? 0.6 : 1 }}>
                  {stPhotoUploading ? 'Subiendo...' : `📷 Subir foto (${stPhotoTipo})`}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={stUploadPhoto} disabled={stPhotoUploading} />
                </label>
              </div>

              {stPhotosLoading ? (
                <p style={{ textAlign: 'center', color: '#71717A', fontSize: '0.88rem' }}>Cargando...</p>
              ) : stPhotos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#52525B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div>
                  <p style={{ fontSize: '0.88rem' }}>Todavía no subiste ninguna foto.</p>
                </div>
              ) : (
                stPhotos.map(month => (
                  <div key={month.fecha} style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A78BFA', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{month.fecha}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {['frente', 'perfil', 'espalda'].map(tipo => (
                        <div key={tipo} style={{ aspectRatio: '3/4', borderRadius: '10px', overflow: 'hidden', background: '#18181B', border: '1px solid #3F3F46', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {month[tipo] ? (
                            <img src={month[tipo]} alt={tipo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>📷</span>
                          )}
                          <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>{tipo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {studentScreen === 'metricas' && (
            <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>📊 Mis Métricas</h3>
              <p style={{ fontSize: '0.82rem', color: '#71717A', marginBottom: '20px' }}>Registrá tus medidas mensuales para ver tu evolución.</p>

              <div style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '14px', padding: '16px', marginBottom: '24px' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A1A1AA', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registrar nueva medición</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Fecha</label><input type="date" value={stMetricForm.fecha} onChange={e => setStMetricForm(f => ({...f, fecha: e.target.value}))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Peso (kg)</label><input type="number" inputMode="decimal" step="0.1" placeholder="75.5" value={stMetricForm.peso} onChange={e => setStMetricForm(f => ({...f, peso: e.target.value}))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Masa muscular (kg)</label><input type="number" inputMode="decimal" step="0.1" placeholder="35.0" value={stMetricForm.masa_muscular} onChange={e => setStMetricForm(f => ({...f, masa_muscular: e.target.value}))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Masa grasa (kg)</label><input type="number" inputMode="decimal" step="0.1" placeholder="20.0" value={stMetricForm.masa_grasa} onChange={e => setStMetricForm(f => ({...f, masa_grasa: e.target.value}))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Cintura (cm)</label><input type="number" inputMode="decimal" step="0.5" placeholder="80" value={stMetricForm.cintura} onChange={e => setStMetricForm(f => ({...f, cintura: e.target.value}))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Cadera (cm)</label><input type="number" inputMode="decimal" step="0.5" placeholder="95" value={stMetricForm.cadera} onChange={e => setStMetricForm(f => ({...f, cadera: e.target.value}))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                </div>
                <button onClick={stSaveMetric} disabled={stMetricSaving} style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 700, cursor: stMetricSaving ? 'default' : 'pointer', opacity: stMetricSaving ? 0.7 : 1 }}>{stMetricSaving ? 'Guardando...' : '💾 Guardar métricas'}</button>
              </div>

              {stMetricsLoading ? (
                <p style={{ textAlign: 'center', color: '#71717A', fontSize: '0.88rem' }}>Cargando...</p>
              ) : stMetrics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#52525B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📊</div>
                  <p style={{ fontSize: '0.88rem' }}>Todavía no registraste métricas.</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A1A1AA', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Historial</p>
                  {[...stMetrics].reverse().map((m, i) => (
                    <div key={m.id || i} style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A78BFA', marginBottom: '10px' }}>{m.fecha}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {m.peso != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{m.peso}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Peso kg</div></div>}
                        {m.masa_muscular != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10B981' }}>{m.masa_muscular}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Músculo kg</div></div>}
                        {m.masa_grasa != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#F59E0B' }}>{m.masa_grasa}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Grasa kg</div></div>}
                        {m.cintura != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#A78BFA' }}>{m.cintura}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Cintura cm</div></div>}
                        {m.cadera != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#EC4899' }}>{m.cadera}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Cadera cm</div></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          <button className={`nav-item ${currentView === 'ListaAlumnos' ? 'active' : ''}`} onClick={() => { setSelectedStudent(null); setCurrentView('ListaAlumnos'); }} style={{ position: 'relative' }}>
            <Users size={20} /><span>Mis Alumnos</span>
            {pendingStudents.length > 0 && (
              <span style={{ position: 'absolute', top: '6px', right: '10px', background: '#EF4444', color: '#fff', fontSize: '0.65rem', fontWeight: 800, borderRadius: '99px', padding: '1px 6px', minWidth: '18px', textAlign: 'center' }}>{pendingStudents.length}</span>
            )}
          </button>
          <button className="nav-item"><FileText size={20} /><span>Plantillas</span></button>
          <button className="nav-item"><Dumbbell size={20} /><span>Biblioteca</span></button>
          <button className={`nav-item ${currentView === 'Retos' ? 'active' : ''}`} onClick={() => { setCurrentView('Retos'); fetchChallenges(); }}><Trophy size={20} /><span>Retos</span></button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar avatar-prof" style={{ backgroundColor: '#7C3AED', color: '#fff', borderRadius: '10px' }}>{loggedInUser.name?.charAt(0).toUpperCase()}</div>
            <div><p className="user-name">{loggedInUser.name}</p><p className="user-role">Profesor</p></div>
          </div>
          <button className="btn-back" style={{ marginTop: '12px' }} onClick={handleLogout}><LogOut size={16} /> Cerrar Sesión</button>
        </div>
      </aside>

      {/* BOTTOM NAV (mobile) */}
      <nav className="prof-bottom-nav">
        <button className={`prof-bottom-nav-item ${currentView === 'ListaAlumnos' ? 'active' : ''}`} onClick={() => { setSelectedStudent(null); setCurrentView('ListaAlumnos'); }} style={{ position: 'relative' }}>
          <Users size={22} /><span>Alumnos</span>
          {pendingStudents.length > 0 && (
            <span style={{ position: 'absolute', top: '4px', right: 'calc(50% - 18px)', background: '#EF4444', color: '#fff', fontSize: '0.62rem', fontWeight: 800, borderRadius: '99px', padding: '1px 5px', minWidth: '16px', textAlign: 'center' }}>{pendingStudents.length}</span>
          )}
        </button>
        <button className={`prof-bottom-nav-item ${currentView === 'Retos' ? 'active' : ''}`} onClick={() => { setCurrentView('Retos'); fetchChallenges(); }}>
          <Trophy size={22} /><span>Retos</span>
        </button>
        <button className="prof-bottom-nav-item" onClick={handleLogout} style={{ color: '#EF4444' }}>
          <LogOut size={22} /><span>Salir</span>
        </button>
      </nav>

      <main className="main-content">

        {/* RETOS VIEW */}
        {currentView === 'Retos' && (
          <div className="view-fade-in">
            <header className="main-header flex-between">
              <div><h1>Retos</h1><p className="subtitle">Programas intensivos con rutina y nutrición pre-cargada</p></div>
              <button className="btn-primary" onClick={() => { setEditingChallenge(null); setChallengeForm({ name: '', duration_days: 30, price: '', description: '', emoji: '🏆', routine_hombre: '', routine_mujer: '', nutrition_hombre: '', nutrition_mujer: '', _open: true }); }}><Plus size={18} /><span>Nuevo Reto</span></button>
            </header>

            {(editingChallenge !== null || challengeForm._open) && (
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header"><Trophy size={20} className="icon-accent" /><h2>{editingChallenge ? 'Editar Reto' : 'Nuevo Reto'}</h2></div>
                <div className="form-grid">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}><label className="form-label">Emoji</label><input className="form-input" style={{ width: '60px' }} value={challengeForm.emoji} onChange={e => setChallengeForm(f => ({ ...f, emoji: e.target.value }))} /></div>
                    <div style={{ flex: 4 }}><label className="form-label">Nombre *</label><input className="form-input" placeholder="Ej: Reto 45 días Pérdida de Peso" value={challengeForm.name} onChange={e => setChallengeForm(f => ({ ...f, name: e.target.value }))} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}><label className="form-label">Duración (días)</label><input className="form-input" type="number" value={challengeForm.duration_days} onChange={e => setChallengeForm(f => ({ ...f, duration_days: e.target.value }))} /></div>
                    <div style={{ flex: 1 }}><label className="form-label">Precio ($) — vacío = Consultá</label><input className="form-input" type="number" placeholder="90000" value={challengeForm.price} onChange={e => setChallengeForm(f => ({ ...f, price: e.target.value }))} /></div>
                  </div>
                  <div><label className="form-label">Descripción</label><input className="form-input" placeholder="Descripción del reto" value={challengeForm.description} onChange={e => setChallengeForm(f => ({ ...f, description: e.target.value }))} /></div>
                  <div><label className="form-label">Rutina — Hombre</label><textarea className="form-input" rows={3} placeholder="Describí la rutina para hombre..." value={challengeForm.routine_hombre} onChange={e => setChallengeForm(f => ({ ...f, routine_hombre: e.target.value }))} /></div>
                  <div><label className="form-label">Rutina — Mujer</label><textarea className="form-input" rows={3} placeholder="Describí la rutina para mujer..." value={challengeForm.routine_mujer} onChange={e => setChallengeForm(f => ({ ...f, routine_mujer: e.target.value }))} /></div>
                  <div><label className="form-label">Nutrición — Hombre</label><textarea className="form-input" rows={3} placeholder="Plan nutricional para hombre..." value={challengeForm.nutrition_hombre} onChange={e => setChallengeForm(f => ({ ...f, nutrition_hombre: e.target.value }))} /></div>
                  <div><label className="form-label">Nutrición — Mujer</label><textarea className="form-input" rows={3} placeholder="Plan nutricional para mujer..." value={challengeForm.nutrition_mujer} onChange={e => setChallengeForm(f => ({ ...f, nutrition_mujer: e.target.value }))} /></div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setEditingChallenge(null); setChallengeForm({ name: '', duration_days: 30, price: '', description: '', emoji: '🏆', routine_hombre: '', routine_mujer: '', nutrition_hombre: '', nutrition_mujer: '' }); }}>Cancelar</button>
                  <button className="btn-primary" style={{ flex: 2 }} disabled={!challengeForm.name || savingChallenge} onClick={async () => {
                    setSavingChallenge(true);
                    try {
                      const body = { ...challengeForm, duration_days: Number(challengeForm.duration_days), price: challengeForm.price ? Number(challengeForm.price) : null, professor_id: loggedInUser?.id };
                      if (editingChallenge) { await axios.put(`${API_URL}/challenges/${editingChallenge}`, body); }
                      else { await axios.post(`${API_URL}/challenges/`, body); }
                      await fetchChallenges();
                      setEditingChallenge(null);
                      setChallengeForm({ name: '', duration_days: 30, price: '', description: '', emoji: '🏆', routine_hombre: '', routine_mujer: '', nutrition_hombre: '', nutrition_mujer: '' });
                    } catch { alert('Error al guardar reto.'); }
                    finally { setSavingChallenge(false); }
                  }}><Save size={18} /><span>{savingChallenge ? 'Guardando...' : (editingChallenge ? 'Actualizar Reto' : 'Crear Reto')}</span></button>
                </div>
              </div>
            )}

            {challengesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 size={32} className="spin-icon" color="#7C3AED" /></div>
            ) : challenges.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}><Trophy size={48} color="#52525B" /><h3 style={{ color: '#A1A1AA', marginTop: '12px' }}>Sin retos todavía</h3><p style={{ color: '#71717A', marginTop: '6px', fontSize: '0.88rem' }}>Creá el primer reto con el botón de arriba</p></div>
            ) : (
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {challenges.map(ch => (
                  <div key={ch.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '1.5rem' }}>{ch.emoji}</span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>{ch.name}</h3>
                        <p style={{ color: '#A1A1AA', fontSize: '0.82rem' }}>{ch.duration_days} días · {ch.price ? `$${Number(ch.price).toLocaleString('es-AR')}` : 'Consultá precio'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-icon-sm" onClick={() => { setEditingChallenge(ch.id); setChallengeForm({ name: ch.name, duration_days: ch.duration_days, price: ch.price || '', description: ch.description || '', emoji: ch.emoji || '🏆', routine_hombre: ch.routine_hombre || '', routine_mujer: ch.routine_mujer || '', nutrition_hombre: ch.nutrition_hombre || '', nutrition_mujer: ch.nutrition_mujer || '', _open: true }); }}><Save size={15} /></button>
                        <button className="btn-icon-danger" onClick={async () => { if (!window.confirm(`Eliminar reto "${ch.name}"?`)) return; await axios.delete(`${API_URL}/challenges/${ch.id}`); fetchChallenges(); }}><Trash2 size={15} /></button>
                      </div>
                    </div>
                    {ch.description && <p style={{ color: '#71717A', fontSize: '0.82rem', marginBottom: '12px' }}>{ch.description}</p>}
                    <button style={{ width: '100%', background: '#7C3AED22', border: '1px solid #7C3AED', color: '#A78BFA', borderRadius: '8px', padding: '7px 0', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      onClick={async () => {
                        try { const r = await axios.get(`${API_URL}/challenges/${ch.id}/enrollments`); setChallengeEnrollments(prev => ({ ...prev, [ch.id]: r.data || [] })); }
                        catch { alert('Error al cargar inscriptos.'); }
                      }}>
                      Ver inscriptos {challengeEnrollments[ch.id] ? `(${challengeEnrollments[ch.id].length})` : ''}
                    </button>
                    {challengeEnrollments[ch.id] && (
                      <div style={{ marginTop: '10px' }}>
                        {challengeEnrollments[ch.id].length === 0 ? (
                          <p style={{ color: '#71717A', fontSize: '0.82rem', textAlign: 'center', padding: '8px 0' }}>Sin inscriptos aún</p>
                        ) : challengeEnrollments[ch.id].map(en => (
                          <div key={en.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderTop: '1px solid #27272A' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3F3F46', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{en.students?.name?.charAt(0).toUpperCase()}</div>
                            <div style={{ flex: 1 }}><p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{en.students?.name}</p><p style={{ fontSize: '0.72rem', color: '#A1A1AA' }}>{en.gender === 'hombre' ? '♂ Hombre' : '♀ Mujer'}</p></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIST */}
        {currentView === 'ListaAlumnos' && (
          <div className="view-fade-in">
            <header className="main-header flex-between">
              <div><h1>Panel de {loggedInUser?.name?.split(' ')[0]}</h1><p className="subtitle">Gestiona el progreso y asigna rutinas</p></div>
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
                  try { await axios.post(`${API_URL}/students/`, { name: newStudent.name, email: newStudent.email || null, age: newStudent.age ? Number(newStudent.age) : null, weight_kg: newStudent.weight_kg ? Number(newStudent.weight_kg) : null, height_cm: newStudent.height_cm ? Number(newStudent.height_cm) : null, goal: newStudent.goal, professor_id: loggedInUser?.id || null }); fetchStudents(); setNewStudent({ name: '', email: '', age: '', weight_kg: '', height_cm: '', goal: 'Hipertrofia' }); setShowNewStudentForm(false); } catch (e) { alert('Error: ' + e.message); } finally { setSavingStudent(false); }
                }}><Save size={18} /><span>{savingStudent ? 'Guardando...' : 'Guardar Alumno'}</span></button>
              </div>
            )}
            {/* PENDING STUDENTS SECTION */}
            {pendingStudents.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span style={{ background: '#EF4444', color: '#fff', borderRadius: '99px', padding: '2px 10px', fontWeight: 800, fontSize: '0.8rem' }}>{pendingStudents.length} nuevo{pendingStudents.length !== 1 ? 's' : ''}</span>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Alumnos Pendientes de Activacion</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingStudents.map(p => (
                    <div key={p.id} style={{ background: '#0f0d18', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a1726', border: '2px solid #EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, flexShrink: 0 }}>{p.name?.charAt(0).toUpperCase()}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 800, fontSize: '1rem' }}>{p.name}</p>
                          <p style={{ color: '#A1A1AA', fontSize: '0.82rem', marginTop: '1px' }}>{p.email}</p>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#FCA5A5', background: '#1F0000', border: '1px solid #7F1D1D', borderRadius: '8px', padding: '3px 8px', fontWeight: 700, flexShrink: 0 }}>PENDIENTE</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px', fontSize: '0.8rem' }}>
                        {p.goal && <div style={{ color: '#A1A1AA' }}><span style={{ color: '#71717A' }}>Objetivo: </span><strong style={{ color: '#FAFAFA' }}>{p.goal}</strong></div>}
                        {p.nivel_experiencia && <div style={{ color: '#A1A1AA' }}><span style={{ color: '#71717A' }}>Nivel: </span><strong style={{ color: '#FAFAFA' }}>{p.nivel_experiencia}</strong></div>}
                        {p.dias_disponibles && <div style={{ color: '#A1A1AA' }}><span style={{ color: '#71717A' }}>Dias/sem: </span><strong style={{ color: '#FAFAFA' }}>{p.dias_disponibles}</strong></div>}
                        {p.lugar_entrenamiento && <div style={{ color: '#A1A1AA' }}><span style={{ color: '#71717A' }}>Lugar: </span><strong style={{ color: '#FAFAFA' }}>{p.lugar_entrenamiento}</strong></div>}
                        {p.weight_kg && <div style={{ color: '#A1A1AA' }}><span style={{ color: '#71717A' }}>Peso: </span><strong style={{ color: '#FAFAFA' }}>{p.weight_kg} kg</strong></div>}
                        {p.height_cm && <div style={{ color: '#A1A1AA' }}><span style={{ color: '#71717A' }}>Altura: </span><strong style={{ color: '#FAFAFA' }}>{p.height_cm} cm</strong></div>}
                        {p.whatsapp && <div style={{ color: '#A1A1AA' }}><span style={{ color: '#71717A' }}>WA: </span><strong style={{ color: '#25D366' }}>{p.whatsapp}</strong></div>}
                        {p.created_at && <div style={{ color: '#A1A1AA' }}><span style={{ color: '#71717A' }}>Registro: </span><strong style={{ color: '#FAFAFA' }}>{new Date(p.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</strong></div>}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          style={{ flex: 2, background: '#052E16', border: '1px solid #166534', color: '#4ADE80', borderRadius: '10px', padding: '9px 0', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                          disabled={activatingId === p.id}
                          onClick={() => handleActivateStudent(p.id)}
                        >
                          {activatingId === p.id ? 'Activando...' : 'Activar alumno'}
                        </button>
                        {p.whatsapp && (
                          <a
                            href={`https://wa.me/${p.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${p.name.split(' ')[0]}! Tu cuenta en AE Personal Training ya esta lista. Ingresa en ${window.location.origin}`)}`}
                            target="_blank" rel="noopener"
                            style={{ flex: 1, background: '#052E16', border: '1px solid #25D366', color: '#25D366', borderRadius: '10px', padding: '9px 0', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            WA
                          </a>
                        )}
                        <button
                          style={{ flex: 1, background: '#1F0000', border: '1px solid #7F1D1D', color: '#F87171', borderRadius: '10px', padding: '9px 0', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                          disabled={rejectingId === p.id}
                          onClick={() => handleRejectStudent(p.id)}
                        >
                          {rejectingId === p.id ? '...' : 'Rechazar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                        {s.discount_available && <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FBBF24', background: 'rgba(234,179,8,0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(234,179,8,0.4)' }}>🏆 Descuento 25%</span>}
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
                  {selectedStudent.discount_available && (
                    <button
                      style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.5)', color: '#FBBF24', borderRadius: '8px', padding: '3px 12px', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                      onClick={async () => {
                        if (!window.confirm(`Marcar descuento del 25% de ${selectedStudent.name} como aplicado?`)) return;
                        try {
                          await axios.post(`${API_URL}/students/${selectedStudent.id}/discount/apply`);
                          fetchStudents();
                          setSelectedStudent({ ...selectedStudent, discount_available: false });
                        } catch { alert('Error al aplicar descuento.'); }
                      }}
                    >
                      🏆 Descuento 25% · Aplicar
                    </button>
                  )}
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
                                    <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '3px' }}>{sets} series · {repsLabel} · RIR {e.target_rir}</p>
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
                <p style={{ color: '#71717A', fontSize: '0.82rem', marginBottom: '16px' }}>Completá las comidas del alumno. Los campos vacíos no se muestran al alumno.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                  {MEAL_META.map(meta => {
                    const val = profNutritionForm[meta.key] || '';
                    const filled = val.trim().length > 0;
                    return (
                      <div key={meta.key} style={{ background: '#0D0B14', border: `1.5px solid ${filled ? 'rgba(16,185,129,0.4)' : '#2a2640'}`, borderRadius: '12px', padding: '12px 14px', transition: 'border-color 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '1.1rem' }}>{meta.emoji}</span>
                          <strong style={{ fontSize: '0.88rem', color: '#FAFAFA' }}>{meta.name}</strong>
                          <span style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: filled ? '#10B981' : '#3F3F46', flexShrink: 0 }} />
                        </div>
                        <textarea
                          rows={2}
                          placeholder={meta.placeholder}
                          value={val}
                          onChange={e => setProfNutritionForm(f => ({ ...f, [meta.key]: e.target.value }))}
                          style={{ width: '100%', background: 'transparent', border: 'none', color: '#D4D4D8', fontSize: '0.85rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, padding: 0 }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, fontSize: '0.82rem' }}
                    onClick={() => { setProfNutritionForm(EMPTY_NUTRITION); setProfNutritionSaved(false); }}
                  >
                    Limpiar todo
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 2 }}
                    disabled={profNutritionSaving}
                    onClick={async () => {
                      setProfNutritionSaving(true);
                      try {
                        await axios.post(`${API_URL}/nutrition/${selectedStudent.id}`, {
                          ...profNutritionForm,
                          professor_id: loggedInUser?.id || null,
                        });
                        setProfNutritionSaved(true);
                        setTimeout(() => setProfNutritionSaved(false), 3000);
                        fetchNutritionPlan(selectedStudent.id);
                      } catch { alert('Error al guardar el plan nutricional.'); }
                      finally { setProfNutritionSaving(false); }
                    }}
                  >
                    {profNutritionSaving ? 'Guardando...' : profNutritionSaved ? '✓ Plan guardado' : 'Guardar Plan Nutricional'}
                  </button>
                </div>
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
                      <div className="input-group"><label>RIR</label><select value={ex.targetRir} onChange={e => handleExerciseChange(day.id, ex.id, 'targetRir', e.target.value)}><option value="rir3">RIR 3 — Fácil</option><option value="rir2">RIR 2 — Moderado</option><option value="rir1">RIR 1 — Exigente</option><option value="rir0">RIR 0 — Al fallo</option></select></div>
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
