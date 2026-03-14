import { useState, useEffect, useCallback } from 'react';
import { Users, FileText, Dumbbell, Save, ChevronLeft, UserPlus, Activity, Target, Plus, Trash2, LogOut, Home, Utensils, Loader2, Flame, Trophy, CheckCircle2, TrendingUp, TrendingDown, Minus, User, ChevronDown, ChevronUp, BarChart2, X, Settings, Bell, Edit3, CreditCard, Camera } from 'lucide-react';
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
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'registered'
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regObjetivo, setRegObjetivo] = useState('');
  const [regNivel, setRegNivel] = useState('');
  const [regDias, setRegDias] = useState('');
  const [regLugar, setRegLugar] = useState('');
  const [regPeso, setRegPeso] = useState('');
  const [regAltura, setRegAltura] = useState('');
  const [regLesion, setRegLesion] = useState(false);
  const [regDescLesion, setRegDescLesion] = useState('');
  const [regAlimentacion, setRegAlimentacion] = useState('');
  const [regRestricciones, setRegRestricciones] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

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
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null);
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
  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  const [editingDayId, setEditingDayId] = useState(null);
  const [exSearch, setExSearch] = useState('');
  const [exFilterGrupo, setExFilterGrupo] = useState('Todos');
  const [showExBottomSheet, setShowExBottomSheet] = useState(false);
  const [bottomSheetDayId, setBottomSheetDayId] = useState(null);
  const [pendingExConfig, setPendingExConfig] = useState(null);
  const [showAddDayForm, setShowAddDayForm] = useState(false);
  const [newDayNameInput, setNewDayNameInput] = useState('');
  const [savingRoutine, setSavingRoutine] = useState(false);

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
    { key: 'ayuno', name: 'Ayuno intermitente', emoji: '🌅', placeholder: 'Ej: Tomar solo agua o café negro hasta las 12hs' },
    { key: 'desayuno', name: 'Desayuno', emoji: '🌄', placeholder: 'Ej: 2 huevos revueltos + 1 tostada integral + café' },
    { key: 'media_manana', name: 'Media mañana', emoji: '🍎', placeholder: 'Ej: 1 fruta + 10 almendras' },
    { key: 'almuerzo', name: 'Almuerzo', emoji: '🍽️', placeholder: 'Ej: 150g pollo a la plancha + arroz integral + ensalada' },
    { key: 'merienda', name: 'Merienda', emoji: '☕', placeholder: 'Ej: Yogur griego + granola' },
    { key: 'pre_entrenamiento', name: 'Pre-entrenamiento', emoji: '⚡', placeholder: 'Ej: 1 banana + 1 cuchara de mantequilla de maní' },
    { key: 'post_entrenamiento', name: 'Post-entrenamiento', emoji: '💪', placeholder: 'Ej: Proteína whey con agua o leche descremada' },
    { key: 'cena', name: 'Cena', emoji: '🌙', placeholder: 'Ej: 200g pescado + verduras al vapor' },
    { key: 'antes_de_dormir', name: 'Antes de dormir', emoji: '😴', placeholder: 'Ej: Caseína o yogur griego' },
    { key: 'suplementacion', name: 'Suplementación', emoji: '💊', placeholder: 'Ej: Creatina 5g post-entrenamiento / Vitamina D 1 comprimido con almuerzo' },
  ];
  const [profNutritionForm, setProfNutritionForm] = useState(EMPTY_NUTRITION);
  const [profNutritionSaving, setProfNutritionSaving] = useState(false);
  const [profNutritionSaved, setProfNutritionSaved] = useState(false);

  // ===== BIBLIOTECA STATE =====
  const [biblioteca, setBiblioteca] = useState([]);
  const [bibliotecaLoading, setBibliotecaLoading] = useState(false);
  const [bibliotecaFilter, setBibliotecaFilter] = useState('todos');
  const [bibliotecaSearch, setBibliotecaSearch] = useState('');
  const [bibliotecaModal, setBibliotecaModal] = useState(null); // null | 'new' | exercise obj
  const EMPTY_BIBLIO_FORM = { nombre: '', nombre_alternativo: '', grupo_muscular: 'gluteos', subgrupo: '', equipamiento: 'barra', es_unilateral: false, es_bilateral: true, youtube_url: '', notas: '', tipo_medicion: 'reps' };
  const [bibliotecaForm, setBibliotecaForm] = useState(EMPTY_BIBLIO_FORM);
  const [bibliotecaSaving, setBibliotecaSaving] = useState(false);

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
  const [stShowMetricHistory, setStShowMetricHistory] = useState(false);
  const [stVideoModal, setStVideoModal] = useState(null); // null | youtube_url string

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

  const handleRegister = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Nombre, email y contraseña son obligatorios.');
      return;
    }
    setRegLoading(true);
    setRegError('');
    try {
      await axios.post(`${API_URL}/auth/student-register`, {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        whatsapp: regWhatsapp.trim() || null,
        objetivo: regObjetivo || null,
        nivel_experiencia: regNivel || null,
        dias_disponibles: regDias ? parseInt(regDias) : null,
        lugar_entrenamiento: regLugar || null,
        weight_kg: regPeso ? parseFloat(regPeso) : null,
        height_cm: regAltura ? parseFloat(regAltura) : null,
        tiene_lesion: regLesion,
        descripcion_lesion: regLesion ? regDescLesion.trim() || null : null,
        alimentacion_actual: regAlimentacion.trim() || null,
        restricciones_alimentarias: regRestricciones.trim() || null,
      });
      setAuthMode('registered');
    } catch (err) {
      setRegError(err.response?.data?.detail || 'Error al registrarse. Intentá de nuevo.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogout = () => {
    if (!window.confirm('¿Estás seguro que querés cerrar sesión?')) return;
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
  const fetchBiblioteca = useCallback(async (grupo = 'todos') => {
    setBibliotecaLoading(true);
    try {
      const params = grupo && grupo !== 'todos' ? `?grupo_muscular=${grupo}` : '';
      const res = await axios.get(`${API_URL}/exercises${params}`);
      setBiblioteca(res.data || []);
    } catch (e) { console.error(e); }
    finally { setBibliotecaLoading(false); }
  }, []);

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
        ayuno: raw.ayuno || '',
        desayuno: raw.desayuno || '',
        media_manana: raw.media_manana || '',
        almuerzo: raw.almuerzo || '',
        merienda: raw.merienda || '',
        pre_entrenamiento: raw.pre_entrenamiento || '',
        post_entrenamiento: raw.post_entrenamiento || '',
        cena: raw.cena || '',
        antes_de_dormir: raw.antes_de_dormir || '',
        suplementacion: raw.suplementacion || '',
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
    return {
      id: crypto.randomUUID(),
      exerciseId: ex?.id || '',
      exerciseName: ex?.nombre || ex?.name || '?',
      muscleGroup: ex?.grupo_muscular || ex?.muscle_group || '',
      tipoMedicion: ex?.tipo_medicion || 'reps',
      sets: 3,
      progressionModel: 'autoregulation',
      targetRir: 'rir2',
      repMin: 8, repMax: 12,
      repsPerSet: '',
      duracionSegundos: 60,
      descansoEntreSeries: 90,
      tempoSubida: '', tempoPausa: '', tempoBajada: '',
      showTempo: false,
      tecnicaEspecial: '',
      notasProfesor: '',
    };
  };

  const handleStudentClick = (s) => { setSelectedStudent(s); fetchPerformance(s.id); fetchPhotos(s.id); fetchActiveRoutine(s.id); fetchNutritionPlan(s.id); setCurrentView('PerfilAlumno'); setShowAllExercises(false); setSelectedExerciseChart(null); setSelectedPlanDay(null); };
  const handleCreateRoutineClick = () => {
    setRoutineName('');
    setDays([{ id: crypto.randomUUID(), dayNumber: 1, dayName: '', exercises: [] }]);
    setWizardStep(1);
    setEditingDayId(null);
    setExSearch('');
    setExFilterGrupo('Todos');
    setShowExBottomSheet(false);
    setPendingExConfig(null);
    setShowAddDayForm(false);
    setNewDayNameInput('');
    setCurrentView('CrearRutina');
  };

  const handleEditRoutineClick = async () => {
    if (!selectedStudent) return;
    try {
      const r = await axios.get(`${API_URL}/v2/routines/student/${selectedStudent.id}`);
      const routine = r.data;
      if (!routine) { handleCreateRoutineClick(); return; }
      setRoutineName(routine.nombre || '');
      const rirKeys = ['rir0', 'rir1', 'rir2', 'rir3'];
      const mappedDays = (routine.days || []).map((day, di) => ({
        id: day.id || crypto.randomUUID(),
        dayNumber: day.numero_dia || day.orden || di + 1,
        dayName: day.nombre || '',
        exercises: (day.exercises || []).map(ex => ({
          id: crypto.randomUUID(),
          exerciseId: ex.exercise_id,
          exerciseName: ex.exercise?.nombre || ex.exercise?.name || '?',
          muscleGroup: ex.exercise?.grupo_muscular || ex.exercise?.muscle_group || '',
          tipoMedicion: ex.exercise?.tipo_medicion || 'reps',
          sets: ex.series || 3,
          repMin: ex.reps_min || 8, repMax: ex.reps_max || 12,
          repsPerSet: '',
          duracionSegundos: ex.duracion_segundos || 60,
          targetRir: rirKeys[ex.rir_objetivo] || 'rir2',
          tempoSubida: ex.tempo_subida || '', tempoPausa: ex.tempo_pausa || '', tempoBajada: ex.tempo_bajada || '',
          showTempo: !!(ex.tempo_subida || ex.tempo_pausa || ex.tempo_bajada),
          descansoEntreSeries: ex.descanso_entre_series || 90,
          progressionModel: 'autoregulation',
          tecnicaEspecial: ex.tecnica_especial || '',
          notasProfesor: ex.notas_profesor || '',
        })),
      }));
      setDays(mappedDays.length ? mappedDays : [{ id: crypto.randomUUID(), dayNumber: 1, dayName: '', exercises: [] }]);
      setWizardStep(2); setEditingDayId(null); setExSearch(''); setExFilterGrupo('Todos');
      setShowExBottomSheet(false); setPendingExConfig(null); setShowAddDayForm(false); setNewDayNameInput('');
      setCurrentView('CrearRutina');
    } catch { handleCreateRoutineClick(); }
  };
  const handleAddDay = () => setDays([...days, { id: crypto.randomUUID(), dayNumber: days.length + 1, dayName: '', exercises: [] }]);
  const handleAddExerciseToDay = (dayId) => { if (!selectedExerciseId) return; setDays(days.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, createExercise(selectedExerciseId)] } : d)); };
  const handleRemoveExercise = (dayId, exId) => setDays(days.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d));
  const handleExerciseChange = (dayId, exId, field, val) => setDays(days.map(d => d.id === dayId ? { ...d, exercises: d.exercises.map(e => e.id === exId ? { ...e, [field]: val } : e) } : d));
  const handleDayNameChange = (dayId, name) => setDays(days.map(d => d.id === dayId ? { ...d, dayName: name } : d));

  const handleSaveRoutine = async () => {
    const total = days.reduce((a, d) => a + d.exercises.length, 0);
    if (total === 0) { alert('Agregá al menos un ejercicio.'); return; }
    if (!routineName.trim()) { alert('Poné un nombre a la rutina.'); return; }
    setSavingRoutine(true);
    try {
      // Si hay rutina activa preguntar si reemplazar
      if (activeRoutine?.routine_id) {
        const replace = window.confirm(`Este alumno ya tiene una rutina activa.\n¿Querés reemplazarla?\n\n[Aceptar] = Reemplazar\n[Cancelar] = Agregar como nueva`);
        if (replace) {
          await axios.patch(`${API_URL}/v2/routines/${activeRoutine.routine_id}`, { activa: false });
        }
      }

      const payload = {
        nombre: routineName.trim(),
        student_id: selectedStudent.id,
        days: days.map((day, idx) => ({
          nombre: day.dayName || `Día ${idx + 1}`,
          orden: idx + 1,
          exercises: day.exercises.map((ex, ei) => {
            const rirMap = { rir3: 3, rir2: 2, rir1: 1, rir0: 0 };
            return {
              exercise_id: ex.exerciseId,
              orden: ei + 1,
              series: Number(ex.sets) || 3,
              reps_min: ex.tipoMedicion === 'tiempo' ? null : (Number(ex.repMin) || null),
              reps_max: ex.tipoMedicion === 'tiempo' ? null : (Number(ex.repMax) || null),
              duracion_segundos: ex.tipoMedicion === 'tiempo' ? (Number(ex.duracionSegundos) || null) : null,
              rir_objetivo: rirMap[ex.targetRir] ?? 2,
              tempo_subida: ex.tempoSubida ? Number(ex.tempoSubida) : null,
              tempo_pausa: ex.tempoPausa ? Number(ex.tempoPausa) : null,
              tempo_bajada: ex.tempoBajada ? Number(ex.tempoBajada) : null,
              descanso_entre_series: Number(ex.descansoEntreSeries) || 90,
              tecnica_especial: ex.tecnicaEspecial || null,
              notas_profesor: ex.notasProfesor || null,
              reps_per_set: Array.isArray(ex.repsPerSet) && ex.repsPerSet.some(r => r !== '') ? ex.repsPerSet.filter((_, i) => i < ex.sets).map(r => r || '0').join(',') : null
            };
          }),
        })),
      };

      await axios.post(`${API_URL}/v2/routines`, payload);
      alert(`✅ Rutina "${routineName}" guardada correctamente!`);
      fetchActiveRoutine(selectedStudent.id);
      setCurrentView('PerfilAlumno');
    } catch (e) { alert('Error: ' + (e.response?.data?.detail || e.message)); }
    finally { setSavingRoutine(false); }
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
            name: ex.exercises?.nombre || ex.exercises?.name || '?',
            nombreAlternativo: ex.exercises?.nombre_alternativo || null,
            muscleGroup: ex.exercises?.grupo_muscular || ex.exercises?.muscle_group || '',
            esUnilateral: ex.exercises?.es_unilateral || false,
            youtubeUrl: ex.exercises?.youtube_url || null,
            tipoMedicion: ex.exercises?.tipo_medicion || 'reps',
            targetSets: ex.sets || 3,
            targetRepsText: repsPerSet ? repsPerSet.join('-') : (ex.rep_range_min ? `${ex.rep_range_min}-${ex.rep_range_max}` : '10'),
            repsPerSet,
            targetRir: ex.target_rir ?? 2,
            duracionSegundos: ex.duracion_segundos || null,
            tempoSubida: ex.tempo_subida || null,
            tempoPausa: ex.tempo_pausa || null,
            tempoBajada: ex.tempo_bajada || null,
            descansoEntreSeries: ex.descanso_entre_series || null,
            tecnicaEspecial: ex.tecnica_especial || null,
            notasProfesor: ex.notas_profesor || null,
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

  const getDayName = (dayNum) => {
    const ex = stExercises.find(e => e.day_number === dayNum && e.day_name);
    return ex?.day_name || `Día ${dayNum}`;
  };

  // ======================================================================
  // RENDER: LOGIN
  // ======================================================================
  if (!loggedInUser) {
    // ── REGISTRO EXITOSO: pantalla de espera ──
    if (authMode === 'registered') {
      const copy = (txt) => navigator.clipboard.writeText(txt);
      const waMsg = encodeURIComponent(`Hola Agustin! Me acabo de registrar en AE Personal Training y quiero empezar un plan. Te mando el comprobante del pago (${PAGO.precio}). 🏋️`);
      return (
        <div style={{ minHeight: '100vh', background: '#09090B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ color: '#FAFAFA', fontSize: '1.5rem', fontWeight: 800 }}>¡Cuenta creada!</h1>
          <p style={{ color: '#A1A1AA', marginTop: '10px', maxWidth: '320px', lineHeight: 1.6, fontSize: '0.92rem' }}>
            Tu solicitud fue enviada. Agustín va a revisar tu información y cuando apruebe tu ingreso te avisa por WhatsApp.
          </p>

          {/* Datos bancarios */}
          <div style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '16px', padding: '20px 24px', width: '100%', maxWidth: '340px', marginTop: '24px', textAlign: 'left' }}>
            <div style={{ color: '#A78BFA', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Datos para el pago</div>
            <div style={{ color: '#71717A', fontSize: '0.75rem', marginBottom: '8px' }}>Cuota mensual</div>
            <div style={{ color: '#FAFAFA', fontSize: '1.8rem', fontWeight: 900, marginBottom: '16px' }}>{PAGO.precio}</div>
            {[
              { label: 'Alias', value: PAGO.alias },
              { label: 'CBU', value: PAGO.cbu },
              { label: 'Titular', value: PAGO.titular },
              { label: 'Banco', value: PAGO.banco },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #27272A' }}>
                <div>
                  <div style={{ color: '#71717A', fontSize: '0.72rem', fontWeight: 600 }}>{label}</div>
                  <div style={{ color: '#FAFAFA', fontSize: '0.88rem', fontWeight: 600, marginTop: '2px' }}>{value}</div>
                </div>
                <button onClick={() => copy(value)} style={{ background: '#27272A', border: 'none', color: '#A1A1AA', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem' }}>
                  Copiar
                </button>
              </div>
            ))}
          </div>

          {/* Botón WA */}
          <a
            href={`https://wa.me/${PAGO.waNro}?text=${waMsg}`}
            target="_blank" rel="noopener"
            style={{ display: 'block', marginTop: '20px', background: '#25D366', color: '#fff', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', width: '100%', maxWidth: '340px', textAlign: 'center' }}
          >
            Enviar comprobante por WhatsApp
          </a>
          <button onClick={() => setAuthMode('login')} style={{ marginTop: '14px', background: 'transparent', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '0.82rem' }}>
            Ya tengo cuenta — Iniciar sesión
          </button>
        </div>
      );
    }

    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <Dumbbell size={40} color="#7C3AED" />
            <h1>AE Personal Training</h1>
            <p>Plataforma de Entrenamiento Inteligente</p>
          </div>

          {authMode === 'login' && (
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
              <a href="/registro.html" style={{ display: 'block', marginTop: '14px', background: 'transparent', border: 'none', color: '#A78BFA', cursor: 'pointer', fontSize: '0.85rem', width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                ¿Sos nuevo? Crear mi cuenta
              </a>
            </div>
          )}

          <p className="login-footer" style={{ marginTop: '24px' }}>Agustin Elizondo Team © 2026</p>
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
          {[{ key: 'home', icon: Home, label: 'Inicio' }, { key: 'workout', icon: Dumbbell, label: 'Entreno' }, { key: 'nutrition', icon: Utensils, label: 'Nutrición' }, { key: 'profile', icon: User, label: 'Perfil' }].map(tab => (
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
            <div className="view-fade-in" style={{ paddingBottom: '100px' }}>

              {/* GREETING HEADER */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(124,58,237,0.2)', border: '2px solid rgba(124,58,237,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#A78BFA', flexShrink: 0 }}>
                    {stStudentData?.foto_perfil_url
                      ? <img src={stStudentData.foto_perfil_url} alt="perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : loggedInUser?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color: '#71717A', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Bienvenido</p>
                    <h2 style={{ color: '#FAFAFA', fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>Hola, {loggedInUser.name.split(' ')[0]}</h2>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#121217', border: '1px solid rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '999px' }}>
                  <Flame size={16} color="#F97316" style={{ fill: '#F97316' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FAFAFA' }}>{stStreak.streak} días</span>
                </div>
              </div>

              {/* MILESTONE 100 banner */}
              {stStreak.milestone_100 && (
                <div style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(234,179,8,0.4)', borderRadius: '16px', padding: '14px 16px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🏆</div>
                  <strong style={{ color: '#FBBF24', fontSize: '0.95rem', display: 'block' }}>¡{stStreak.streak} días seguidos!</strong>
                  <p style={{ color: '#D4D4D8', fontSize: '0.82rem', marginTop: '4px' }}>Ganaste un <strong style={{ color: '#4ADE80' }}>25% de descuento</strong> 🎉</p>
                </div>
              )}

              {/* METRICS GRID */}
              {(() => {
                const sorted = [...stMetrics].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                const latest = sorted[0];
                const prev = sorted[1];
                // Peso: usar el último registro de métricas, o el peso de registro si no hay historial
                const displayPeso = latest?.peso || stStudentData?.weight_kg;
                const pesoDelta = latest?.peso && prev?.peso ? (latest.peso - prev.peso).toFixed(1) : null;
                const pesoTrend = pesoDelta > 0 ? 'up' : pesoDelta < 0 ? 'down' : null;
                const grasaDeltaHome = latest?.masa_grasa != null && prev?.masa_grasa != null ? parseFloat((latest.masa_grasa - prev.masa_grasa).toFixed(1)) : null;

                // Volumen: sum of best weights from all exercises
                const totalVolumen = stExercises.reduce((acc, ex) => acc + ((ex.suggested_weight || 0) * (ex.rep_range_min || 10)), 0);

                // Comidas cargadas en el plan nutricional
                const mealKeys = ['ayuno', 'desayuno', 'media_manana', 'almuerzo', 'merienda', 'pre_entrenamiento', 'post_entrenamiento', 'cena', 'antes_de_dormir'];
                const comidasCount = nutritionPlan ? mealKeys.filter(k => nutritionPlan[k]?.trim()).length : 0;

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                    {/* Peso corporal - full width */}
                    <div style={{ gridColumn: '1 / -1', background: '#121217', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, padding: '14px', opacity: 0.08, fontSize: '3.5rem', lineHeight: 1 }}>⚖️</div>
                      <p style={{ color: '#71717A', fontSize: '0.82rem', fontWeight: 500, marginBottom: '6px' }}>Peso Corporal</p>
                      {displayPeso ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FAFAFA' }}>{displayPeso} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#71717A' }}>kg</span></p>
                          {pesoDelta !== null && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px', background: pesoTrend === 'down' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: pesoTrend === 'down' ? '#F87171' : '#4ADE80', padding: '2px 8px', borderRadius: '6px' }}>
                              {pesoTrend === 'down' ? '↘' : '↗'} {Math.abs(pesoDelta)}kg
                            </span>
                          )}
                          {!latest?.peso && <span style={{ fontSize: '0.72rem', color: '#52525B' }}>al registrarse</span>}
                        </div>
                      ) : (
                        <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#52525B' }}>Sin datos</p>
                      )}
                    </div>
                    {/* Racha */}
                    <div style={{ background: '#121217', border: `1px solid ${stStreak.at_risk ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '16px', padding: '16px' }}>
                      <p style={{ color: '#71717A', fontSize: '0.75rem', fontWeight: 500, marginBottom: '6px' }}>Racha Actual</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FAFAFA' }}>{stStreak.streak} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#71717A' }}>días</span></p>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: stStreak.at_risk ? '#F87171' : '#A78BFA', marginTop: '4px', display: 'block' }}>
                        {stStreak.at_risk ? '⚠️ ¡En riesgo!' : `Mejor: ${stStreak.longest_streak}d`}
                      </span>
                    </div>
                    {/* Plan nutricional */}
                    <div style={{ background: '#121217', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px' }}>
                      <p style={{ color: '#71717A', fontSize: '0.75rem', fontWeight: 500, marginBottom: '6px' }}>Comidas del Plan</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FAFAFA' }}>{comidasCount} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#71717A' }}>/ 9</span></p>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: comidasCount > 0 ? '#4ADE80' : '#52525B', marginTop: '4px', display: 'block' }}>
                        {comidasCount > 0 ? 'Plan activo ✓' : 'Sin plan aún'}
                      </span>
                    </div>
                    {/* Grasa Corporal */}
                    <div style={{ background: '#121217', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px' }}>
                      <p style={{ color: '#71717A', fontSize: '0.75rem', fontWeight: 500, marginBottom: '6px' }}>Grasa Corporal</p>
                      {latest?.masa_grasa != null ? (
                        <>
                          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FAFAFA' }}>{latest.masa_grasa} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#71717A' }}>%</span></p>
                          {grasaDeltaHome !== null && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: grasaDeltaHome <= 0 ? '#4ADE80' : '#F87171', marginTop: '4px', display: 'block' }}>
                              {grasaDeltaHome > 0 ? '↗' : '↘'} {Math.abs(grasaDeltaHome)}% este mes
                            </span>
                          )}
                        </>
                      ) : (
                        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#52525B' }}>Sin datos</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TODAY'S WORKOUT CARD */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FAFAFA' }}>Tu entrenamiento de hoy</h3>
                  {stSession && <button onClick={() => setStudentScreen('workout')} style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Ver todo</button>}
                </div>
                {stSession ? (() => {
                  const todayExs = stExercises.filter(e => e.day_number === stSession.current_day);
                  const dayName = getDayName(stSession.current_day);
                  return (
                    <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#121217', border: '1px solid rgba(124,58,237,0.2)' }}>
                      {/* image/gradient banner */}
                      <div style={{ height: '140px', background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #1a1030 100%)', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 60%, rgba(124,58,237,0.3) 0%, transparent 70%)' }} />
                        <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '3rem', opacity: 0.15 }}>🏋️</div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, #121217, transparent)' }} />
                      </div>
                      <div style={{ padding: '16px 20px 20px', marginTop: '-8px', position: 'relative' }}>
                        {stStudentData?.objetivo && (
                          <span style={{ color: '#7C3AED', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{stStudentData.objetivo}</span>
                        )}
                        <h4 style={{ color: '#FAFAFA', fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>
                          Día {stSession.current_day}{dayName ? ` - ${dayName}` : ''}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#71717A', fontSize: '0.82rem', marginBottom: '18px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Dumbbell size={14} /> {todayExs.length} ejercicios
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Target size={14} /> Día {stSession.current_day} de {stSession.total_days}
                          </span>
                        </div>
                        <button
                          onClick={() => { setStSelectedDay(stSession.current_day); setStudentScreen('workout'); }}
                          style={{ width: '100%', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
                        >
                          Empezar entrenamiento <span style={{ fontSize: '1rem' }}>→</span>
                        </button>
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ borderRadius: '16px', background: '#121217', border: '1px solid rgba(255,255,255,0.05)', padding: '28px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⏳</div>
                    <h4 style={{ color: '#FAFAFA', fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Tu plan está siendo preparado</h4>
                    <p style={{ color: '#71717A', fontSize: '0.85rem', lineHeight: 1.5 }}>Agustín está revisando tu información y en breve te asigna tu plan personalizado.</p>
                  </div>
                )}
              </div>

              {/* ACTIVIDAD SEMANAL */}
              {(() => {
                const now = new Date();
                const dayOfWeek = now.getDay(); // 0=dom, 1=lun...
                const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
                // Map JS day (0=Sun) to index in our L-D array
                const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const streak = stStreak.streak;
                return (
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FAFAFA', marginBottom: '14px' }}>Actividad semanal</h3>
                    <div style={{ background: '#121217', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '18px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px', height: '80px', marginBottom: '10px' }}>
                        {days.map((d, i) => {
                          const isToday = i === todayIdx;
                          const isPast = i < todayIdx;
                          // If streak covers this day, show it as active
                          const daysAgo = todayIdx - i;
                          const isActive = daysAgo >= 0 && daysAgo < streak;
                          const h = isActive ? (isToday ? '90%' : `${40 + Math.floor(Math.random() * 50)}%`) : '15%';
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                              <div style={{
                                width: '100%', borderRadius: '6px 6px 0 0',
                                height: h,
                                background: isActive ? (isToday ? '#7C3AED' : 'rgba(124,58,237,0.4)') : 'rgba(255,255,255,0.05)',
                                border: (!isActive && isPast) ? '1px dashed rgba(255,255,255,0.1)' : 'none',
                                transition: 'height 0.3s ease'
                              }} />
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {days.map((d, i) => (
                          <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1) ? '#A78BFA' : '#52525B' }}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                        <div>
                          <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {exercise.name}
                            {exercise.esUnilateral && <span style={{ fontSize: '0.65rem', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', borderRadius: '6px', padding: '1px 6px', fontWeight: 700, flexShrink: 0 }}>1 pierna / 1 brazo</span>}
                          </h4>
                          <p>{done ? `✅ Completado (${exercise.setsCompleted}/${exercise.targetSets})` : exercise.setsCompleted > 0 ? `${exercise.setsCompleted}/${exercise.targetSets} sets` : `${exercise.targetSets} sets de ${exercise.targetRepsText} reps`}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {exercise.youtubeUrl && (
                          <button onClick={e => { e.stopPropagation(); setStVideoModal(exercise.youtubeUrl); }} style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', padding: '4px 8px', color: '#F87171', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                            ▶ Tutorial
                          </button>
                        )}
                        {done ? <CheckCircle2 color="#10B981" size={20} /> : isExp ? <ChevronUp color="#7C3AED" size={20} /> : <ChevronDown color="#52525B" size={20} />}
                      </div>
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
                        {/* Tempo del ejercicio */}
                        {(exercise.tempoSubida || exercise.tempoPausa || exercise.tempoBajada) && (
                          <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(124,58,237,0.07)', borderRadius: '10px', border: '1px solid rgba(124,58,237,0.15)', fontSize: '0.82rem', color: '#A78BFA' }}>
                            ⏱ Tempo: {exercise.tempoSubida || '_'}"-{exercise.tempoPausa || '_'}"-{exercise.tempoBajada || '_'}" <span style={{ color: '#52525B' }}>(subida-pausa-bajada)</span>
                          </div>
                        )}
                        {/* Técnica especial */}
                        {exercise.tecnicaEspecial && (
                          <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(249,115,22,0.07)', borderRadius: '10px', border: '1px solid rgba(249,115,22,0.2)', fontSize: '0.82rem', color: '#FB923C', fontWeight: 600 }}>
                            ⚡ {exercise.tecnicaEspecial.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            {(exercise.tecnicaEspecial === 'drop_set' || exercise.tecnicaEspecial === 'myo_reps') && <span style={{ color: '#A16207', fontWeight: 400, marginLeft: '6px' }}>— aplicar en la última serie</span>}
                          </div>
                        )}
                        {/* Nota del profesor */}
                        {exercise.notasProfesor && (
                          <div style={{ marginBottom: '12px', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.83rem', color: '#A1A1AA', lineHeight: 1.5 }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' }}>📝 Nota del profesor</span>
                            "{exercise.notasProfesor}"
                          </div>
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
                            tipoMedicion={exercise.tipoMedicion}
                            duracionSegundos={exercise.duracionSegundos}
                            tempoSubida={exercise.tempoSubida}
                            tempoPausa={exercise.tempoPausa}
                            tempoBajada={exercise.tempoBajada}
                            descansoEntreSeries={exercise.descansoEntreSeries}
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

          {/* MODAL VIDEO TUTORIAL */}
          {stVideoModal && (() => {
            // Extraer video ID de YouTube para embed
            const getEmbedId = (url) => {
              const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\s]+)/);
              return m ? m[1] : null;
            };
            const embedId = getEmbedId(stVideoModal);
            return (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setStVideoModal(null)}>
                <div style={{ width: '100%', maxWidth: '560px', background: '#0f0d18', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Tutorial</span>
                    <button onClick={() => setStVideoModal(null)} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer' }}><X size={20} /></button>
                  </div>
                  {embedId ? (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${embedId}?autoplay=1`}
                        title="Tutorial"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                      <a href={stVideoModal} target="_blank" rel="noreferrer" style={{ color: '#A78BFA', fontWeight: 700 }}>Abrir en YouTube</a>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

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
                    <p style={{ fontWeight: 700, color: '#A1A1AA', marginBottom: '6px' }}>Todavía no se cargó tu plan nutricional.</p>
                    <p style={{ fontSize: '0.85rem' }}>Estará disponible pronto. ¡Cualquier duda consultanos! 💬</p>
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
          {studentScreen === 'profile' && (() => {
            const latestM = stMetrics.length > 0 ? stMetrics[stMetrics.length - 1] : null;
            const prevM = stMetrics.length > 1 ? stMetrics[stMetrics.length - 2] : null;
            const pesoDelta = latestM?.peso != null && prevM?.peso != null ? parseFloat((latestM.peso - prevM.peso).toFixed(1)) : null;
            const grasaDelta = latestM?.masa_grasa != null && prevM?.masa_grasa != null ? parseFloat((latestM.masa_grasa - prevM.masa_grasa).toFixed(1)) : null;
            return (
              <div className="view-fade-in" style={{ paddingBottom: '100px' }}>

                {/* Top bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 20px', position: 'sticky', top: 0, background: 'rgba(6,6,8,0.88)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                  <button style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: '4px', display: 'flex' }}><Settings size={22} /></button>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Mi Perfil</h2>
                  <button style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: '4px', display: 'flex' }}><Bell size={22} /></button>
                </div>

                {/* Avatar + nombre */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', paddingBottom: '28px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '112px', height: '112px', borderRadius: '50%', border: '2px solid #7C3AED', padding: '3px', boxSizing: 'border-box' }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {stStudentData?.foto_perfil_url
                          ? <img src={stStudentData.foto_perfil_url} alt="perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#A78BFA' }}>{loggedInUser.name?.charAt(0).toUpperCase()}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => { setStProfileForm({ weight_kg: stStudentData?.weight_kg ?? '', height_cm: stStudentData?.height_cm ?? '', whatsapp: stStudentData?.whatsapp ?? '', nivel_experiencia: stStudentData?.nivel_experiencia ?? '', dias_disponibles: stStudentData?.dias_disponibles ?? '', lugar_entrenamiento: stStudentData?.lugar_entrenamiento ?? '' }); setStProfileEditing(true); }}
                      style={{ position: 'absolute', bottom: 0, right: 0, background: '#7C3AED', borderRadius: '50%', width: '32px', height: '32px', border: '3px solid #060608', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Edit3 size={14} color="#fff" />
                    </button>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{loggedInUser.name}</h1>
                    <p style={{ color: '#71717A', fontSize: '0.85rem', marginTop: '4px' }}>
                      Socio #{stStudentData?.id?.slice(-4)?.toUpperCase() ?? '----'}{stStudentData?.nivel_experiencia ? ` · Nivel ${stStudentData.nivel_experiencia}` : ''}
                    </p>
                  </div>
                </div>

                {/* Mi Plan */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', marginLeft: '4px' }}>Mi Plan</h3>
                  <div style={{ background: 'rgba(24,24,27,0.5)', border: '1px solid #27272A', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ background: 'rgba(124,58,237,0.2)', borderRadius: '10px', padding: '12px', display: 'flex' }}>
                        <Trophy size={22} color="#A78BFA" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{stStudentData?.goal || 'Plan Mensual'}</p>
                        <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '2px', marginBottom: 0 }}>Plan activo</p>
                      </div>
                    </div>
                    <button style={{ background: 'rgba(124,58,237,0.1)', border: 'none', color: '#A78BFA', borderRadius: '10px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                      Gestionar
                    </button>
                  </div>
                </div>

                {/* Mi Cuota */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', marginLeft: '4px' }}>Mi Cuota</h3>
                  <div style={{
                    background: subStatus === 'blocked' ? 'rgba(127,29,29,0.25)' : subStatus === 'grace' ? 'rgba(120,53,15,0.25)' : 'rgba(5,46,22,0.25)',
                    border: `1px solid ${subStatus === 'blocked' ? '#7F1D1D' : subStatus === 'grace' ? '#92400E' : '#166534'}`,
                    borderRadius: '14px', padding: '16px 18px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={20} color={subStatus === 'blocked' ? '#F87171' : subStatus === 'grace' ? '#FBBF24' : '#4ADE80'} />
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FAFAFA' }}>Cuota mensual</span>
                      </div>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                        background: subStatus === 'blocked' ? 'rgba(239,68,68,0.15)' : subStatus === 'grace' ? 'rgba(251,191,36,0.15)' : 'rgba(74,222,128,0.15)',
                        color: subStatus === 'blocked' ? '#F87171' : subStatus === 'grace' ? '#FBBF24' : '#4ADE80',
                      }}>
                        {subStatus === 'blocked' ? 'Vencida' : subStatus === 'grace' ? 'Por vencer' : 'Al día'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#A1A1AA', lineHeight: 1.6 }}>
                      {subStatus === 'blocked'
                        ? 'Tu suscripción venció. Contactá a tu entrenador para renovar.'
                        : subStatus === 'grace'
                          ? `Te quedan ${subDays} día${subDays !== 1 ? 's' : ''} antes de quedar bloqueado.`
                          : `Próximo vencimiento en ${subDays} día${subDays !== 1 ? 's' : ''}.`}
                    </div>
                    {(subStatus === 'blocked' || subStatus === 'grace') && (
                      <a
                        href={`https://wa.me/${PAGO.waNro}?text=${encodeURIComponent(`Hola Agustin! Soy ${loggedInUser.name}. Te mando el comprobante de mi cuota (${PAGO.precio}).`)}`}
                        target="_blank" rel="noreferrer"
                        style={{ display: 'inline-block', marginTop: '12px', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '0.82rem', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }}
                      >
                        Enviar comprobante por WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Mis Métricas */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', marginLeft: '4px' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>Mis Métricas</h3>
                    <button onClick={() => setStShowMetricHistory(v => !v)} style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                      {stShowMetricHistory ? 'Ocultar' : 'Ver Historial'}
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: stShowMetricHistory ? '20px' : 0 }}>
                    <div style={{ background: 'rgba(24,24,27,0.5)', border: '1px solid #27272A', borderRadius: '14px', padding: '16px' }}>
                      <p style={{ fontSize: '0.75rem', color: '#71717A', marginBottom: '6px', marginTop: 0 }}>Peso Actual</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{latestM?.peso ?? stStudentData?.weight_kg ?? '--'}</span>
                        <span style={{ fontSize: '0.75rem', color: '#71717A' }}>kg</span>
                      </div>
                      {pesoDelta != null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: pesoDelta <= 0 ? '#10B981' : '#EF4444', fontSize: '0.75rem' }}>
                          {pesoDelta <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                          <span>{pesoDelta > 0 ? '+' : ''}{pesoDelta}kg este mes</span>
                        </div>
                      )}
                    </div>
                    <div style={{ background: 'rgba(24,24,27,0.5)', border: '1px solid #27272A', borderRadius: '14px', padding: '16px' }}>
                      <p style={{ fontSize: '0.75rem', color: '#71717A', marginBottom: '6px', marginTop: 0 }}>Grasa Corporal</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{latestM?.masa_grasa ?? '--'}</span>
                        <span style={{ fontSize: '0.75rem', color: '#71717A' }}>%</span>
                      </div>
                      {grasaDelta != null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: grasaDelta <= 0 ? '#10B981' : '#EF4444', fontSize: '0.75rem' }}>
                          {grasaDelta <= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                          <span>{grasaDelta > 0 ? '+' : ''}{grasaDelta}% este mes</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {stShowMetricHistory && (
                    <div>
                      <div style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A1A1AA', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registrar nueva medición</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                          <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Fecha</label><input type="date" value={stMetricForm.fecha} onChange={e => setStMetricForm(f => ({ ...f, fecha: e.target.value }))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                          <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Peso (kg)</label><input type="number" inputMode="decimal" step="0.1" placeholder="75.5" value={stMetricForm.peso} onChange={e => setStMetricForm(f => ({ ...f, peso: e.target.value }))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                          <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Masa muscular (kg)</label><input type="number" inputMode="decimal" step="0.1" placeholder="35.0" value={stMetricForm.masa_muscular} onChange={e => setStMetricForm(f => ({ ...f, masa_muscular: e.target.value }))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                          <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Masa grasa (%)</label><input type="number" inputMode="decimal" step="0.1" placeholder="20.0" value={stMetricForm.masa_grasa} onChange={e => setStMetricForm(f => ({ ...f, masa_grasa: e.target.value }))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                          <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Cintura (cm)</label><input type="number" inputMode="decimal" step="0.5" placeholder="80" value={stMetricForm.cintura} onChange={e => setStMetricForm(f => ({ ...f, cintura: e.target.value }))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                          <div><label style={{ display: 'block', fontSize: '0.72rem', color: '#71717A', marginBottom: '4px', fontWeight: 700 }}>Cadera (cm)</label><input type="number" inputMode="decimal" step="0.5" placeholder="95" value={stMetricForm.cadera} onChange={e => setStMetricForm(f => ({ ...f, cadera: e.target.value }))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '0.88rem' }} /></div>
                        </div>
                        <button onClick={stSaveMetric} disabled={stMetricSaving} style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 700, cursor: stMetricSaving ? 'default' : 'pointer', opacity: stMetricSaving ? 0.7 : 1 }}>{stMetricSaving ? 'Guardando...' : '💾 Guardar métricas'}</button>
                      </div>
                      {stMetricsLoading ? (
                        <p style={{ textAlign: 'center', color: '#71717A', fontSize: '0.88rem' }}>Cargando...</p>
                      ) : stMetrics.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px 20px', color: '#52525B' }}><p style={{ fontSize: '0.88rem' }}>Todavía no registraste métricas.</p></div>
                      ) : [...stMetrics].reverse().map((m, i) => (
                        <div key={m.id || i} style={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#A78BFA', marginBottom: '10px' }}>{m.fecha}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {m.peso != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{m.peso}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Peso kg</div></div>}
                            {m.masa_muscular != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10B981' }}>{m.masa_muscular}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Músculo kg</div></div>}
                            {m.masa_grasa != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#F59E0B' }}>{m.masa_grasa}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Grasa %</div></div>}
                            {m.cintura != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#A78BFA' }}>{m.cintura}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Cintura cm</div></div>}
                            {m.cadera != null && <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#EC4899' }}>{m.cadera}</div><div style={{ fontSize: '0.65rem', color: '#71717A', textTransform: 'uppercase' }}>Cadera cm</div></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fotos de Progreso */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginLeft: '4px' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>Fotos de Progreso</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#7C3AED', color: '#fff', borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: stPhotoUploading ? 'default' : 'pointer', opacity: stPhotoUploading ? 0.6 : 1 }}>
                      <span style={{ fontSize: '14px' }}>📷</span> {stPhotoUploading ? 'Subiendo...' : 'Subir'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={stUploadPhoto} disabled={stPhotoUploading} />
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {stPhotosLoading ? (
                      <div style={{ padding: '20px', color: '#71717A', fontSize: '0.85rem' }}>Cargando...</div>
                    ) : (
                      <>
                        {stPhotos.map(month => {
                          const url = month.frente || month.perfil || month.espalda;
                          return url ? (
                            <div key={month.fecha} style={{ flexShrink: 0, width: '128px' }}>
                              <div style={{ height: '160px', borderRadius: '14px', overflow: 'hidden', background: '#18181B' }}>
                                <img src={url} alt={month.fecha} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <p style={{ fontSize: '0.65rem', textAlign: 'center', color: '#71717A', marginTop: '6px', fontWeight: 500 }}>{month.fecha}</p>
                            </div>
                          ) : null;
                        })}
                        <div style={{ flexShrink: 0, width: '128px' }}>
                          <label style={{ cursor: 'pointer' }}>
                            <div style={{ height: '160px', borderRadius: '14px', border: '2px dashed #27272A', background: 'rgba(24,24,27,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Plus size={28} color="#3F3F46" />
                            </div>
                            <p style={{ fontSize: '0.65rem', textAlign: 'center', color: '#52525B', marginTop: '6px' }}>Nueva Foto</p>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={stUploadPhoto} disabled={stPhotoUploading} />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Mis Datos */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', marginLeft: '4px' }}>Mis Datos</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Información Personal */}
                    <div>
                      <button onClick={() => { if (!stProfileEditing) { setStProfileForm({ weight_kg: stStudentData?.weight_kg ?? '', height_cm: stStudentData?.height_cm ?? '', whatsapp: stStudentData?.whatsapp ?? '', nivel_experiencia: stStudentData?.nivel_experiencia ?? '', dias_disponibles: stStudentData?.dias_disponibles ?? '', lugar_entrenamiento: stStudentData?.lugar_entrenamiento ?? '' }); } setStProfileEditing(v => !v); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: stProfileEditing ? '14px 14px 0 0' : '14px', background: 'rgba(24,24,27,0.3)', border: '1px solid #27272A', cursor: 'pointer', color: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <User size={18} color="#71717A" />
                          <span style={{ fontSize: '0.9rem' }}>Información Personal</span>
                        </div>
                        {stProfileEditing ? <ChevronUp size={16} color="#71717A" /> : <ChevronDown size={16} color="#71717A" />}
                      </button>
                      {stProfileEditing && (
                        <div style={{ background: '#18181B', border: '1px solid #27272A', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '16px' }}>
                          {[{ label: 'Peso actual (kg)', key: 'weight_kg', type: 'number', ph: 'Ej: 75' }, { label: 'Altura (cm)', key: 'height_cm', type: 'number', ph: 'Ej: 175' }, { label: 'WhatsApp', key: 'whatsapp', type: 'tel', ph: '+54 9 11 0000 0000' }, { label: 'Días disponibles por semana', key: 'dias_disponibles', type: 'number', ph: '3' }].map(f => (
                            <div key={f.key} style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#71717A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                              <input type={f.type} placeholder={f.ph} value={stProfileForm[f.key]} onChange={e => setStProfileForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                          ))}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#71717A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nivel de experiencia</label>
                            <select value={stProfileForm.nivel_experiencia} onChange={e => setStProfileForm(p => ({ ...p, nivel_experiencia: e.target.value }))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '10px', padding: '10px 14px', color: stProfileForm.nivel_experiencia ? '#fff' : '#52525B', fontSize: '0.92rem', outline: 'none' }}>
                              <option value="">Seleccionar</option>
                              <option value="Principiante">Principiante</option>
                              <option value="Intermedio">Intermedio</option>
                              <option value="Avanzado">Avanzado</option>
                            </select>
                          </div>
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#71717A', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lugar de entrenamiento</label>
                            <select value={stProfileForm.lugar_entrenamiento} onChange={e => setStProfileForm(p => ({ ...p, lugar_entrenamiento: e.target.value }))} style={{ width: '100%', background: '#27272A', border: '1px solid #3F3F46', borderRadius: '10px', padding: '10px 14px', color: stProfileForm.lugar_entrenamiento ? '#fff' : '#52525B', fontSize: '0.92rem', outline: 'none' }}>
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
                    </div>
                    {/* Email */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '14px', background: 'rgba(24,24,27,0.3)', border: '1px solid #27272A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#71717A', fontSize: '18px' }}>✉️</span>
                        <span style={{ fontSize: '0.88rem', color: '#A1A1AA' }}>{loggedInUser.email}</span>
                      </div>
                      <ChevronDown size={16} color="#52525B" />
                    </div>
                  </div>

                  {/* Cerrar Sesión */}
                  <button onClick={handleLogout} style={{ width: '100%', marginTop: '24px', padding: '16px', color: '#EF4444', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', background: 'rgba(239,68,68,0.05)', cursor: 'pointer' }}>
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>

              </div>
            );
          })()}

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
          <button className={`nav-item ${currentView === 'Biblioteca' ? 'active' : ''}`} onClick={() => { setCurrentView('Biblioteca'); fetchBiblioteca(bibliotecaFilter); }}><Dumbbell size={20} /><span>Biblioteca</span></button>
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
        <button className={`prof-bottom-nav-item ${currentView === 'Biblioteca' ? 'active' : ''}`} onClick={() => { setCurrentView('Biblioteca'); fetchBiblioteca(bibliotecaFilter); }}>
          <Dumbbell size={22} /><span>Biblioteca</span>
        </button>
        <button className={`prof-bottom-nav-item ${currentView === 'Retos' ? 'active' : ''}`} onClick={() => { setCurrentView('Retos'); fetchChallenges(); }}>
          <Trophy size={22} /><span>Retos</span>
        </button>
        <button className="prof-bottom-nav-item" onClick={handleLogout} style={{ color: '#EF4444' }}>
          <LogOut size={22} /><span>Salir</span>
        </button>
      </nav>

      <main className="main-content">

        {/* STICKY TOP BAR */}
        <div className="prof-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#A78BFA', flexShrink: 0 }}>{loggedInUser.name?.charAt(0).toUpperCase()}</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#A1A1AA' }}>{currentView === 'ListaAlumnos' ? 'Panel' : currentView === 'PerfilAlumno' && selectedStudent ? selectedStudent.name : currentView === 'Biblioteca' ? 'Biblioteca' : currentView === 'Retos' ? 'Retos' : currentView === 'CrearRutina' ? 'Nueva Rutina' : 'Dashboard'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {pendingStudents.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: '#F87171', cursor: 'pointer' }} onClick={() => { setSelectedStudent(null); setCurrentView('ListaAlumnos'); }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                {pendingStudents.length} pendiente{pendingStudents.length !== 1 ? 's' : ''}
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: '#52525B', fontWeight: 500 }}>{loggedInUser.name}</div>
          </div>
        </div>

        {/* BIBLIOTECA VIEW */}
        {currentView === 'Biblioteca' && (() => {
          const GRUPO_COLORS = { gluteos: '#7C3AED', femoral: '#5B21B6', cuadriceps: '#2563EB', pantorrilla: '#0891B2', espalda: '#059669', hombro: '#D97706', pecho: '#DC2626', biceps: '#A855F7', triceps: '#6D28D9', core: '#475569', calentamiento: '#64748B', full_body: '#0EA5E9' };
          const GRUPOS = ['todos', 'gluteos', 'femoral', 'cuadriceps', 'pantorrilla', 'espalda', 'hombro', 'pecho', 'biceps', 'triceps', 'core', 'calentamiento'];
          const EQUIP_LABELS = { barra: 'Barra', mancuernas: 'Mancuernas', polea: 'Polea', máquina: 'Máquina', multifuerza: 'Multifuerza', peso_corporal: 'Peso corporal', banda: 'Banda', disco: 'Disco' };

          const filtered = biblioteca.filter(ex => {
            const q = bibliotecaSearch.toLowerCase();
            const matchNombre = (ex.nombre || '').toLowerCase().includes(q) || (ex.nombre_alternativo || '').toLowerCase().includes(q);
            const matchGrupo = bibliotecaFilter === 'todos' || ex.grupo_muscular === bibliotecaFilter;
            return matchNombre && matchGrupo;
          });

          const openNew = () => { setBibliotecaForm(EMPTY_BIBLIO_FORM); setBibliotecaModal('new'); };
          const openEdit = (ex) => { setBibliotecaForm({ nombre: ex.nombre || '', nombre_alternativo: ex.nombre_alternativo || '', grupo_muscular: ex.grupo_muscular || 'gluteos', subgrupo: ex.subgrupo || '', equipamiento: ex.equipamiento || 'barra', es_unilateral: ex.es_unilateral || false, es_bilateral: ex.es_bilateral !== false, youtube_url: ex.youtube_url || '', notas: ex.notas || '', tipo_medicion: ex.tipo_medicion || 'reps' }); setBibliotecaModal(ex); };
          const closeModal = () => setBibliotecaModal(null);

          const handleSave = async () => {
            setBibliotecaSaving(true);
            try {
              if (bibliotecaModal === 'new') {
                await axios.post(`${API_URL}/exercises/biblioteca`, bibliotecaForm);
              } else {
                // update via youtube only if url changed, otherwise PATCH the full exercise
                await axios.patch(`${API_URL}/exercises/${bibliotecaModal.id}/youtube`, { youtube_url: bibliotecaForm.youtube_url });
              }
              closeModal();
              fetchBiblioteca(bibliotecaFilter);
            } catch (e) { alert(e.response?.data?.detail || 'Error al guardar'); }
            finally { setBibliotecaSaving(false); }
          };

          return (
            <div className="view-fade-in">
              <header className="main-header flex-between">
                <div><h1>Biblioteca de Ejercicios</h1><p className="subtitle">{biblioteca.length} ejercicios cargados</p></div>
                <button className="btn-primary" onClick={openNew}><Plus size={18} /><span>Nuevo Ejercicio</span></button>
              </header>

              {/* Buscador */}
              <div style={{ marginBottom: '16px' }}>
                <input
                  className="form-input"
                  placeholder="Buscar por nombre..."
                  value={bibliotecaSearch}
                  onChange={e => setBibliotecaSearch(e.target.value)}
                  style={{ width: '100%', maxWidth: '360px' }}
                />
              </div>

              {/* Filtros por grupo muscular */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {GRUPOS.map(g => (
                  <button
                    key={g}
                    onClick={() => { setBibliotecaFilter(g); fetchBiblioteca(g); }}
                    style={{
                      padding: '5px 14px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: bibliotecaFilter === g ? (GRUPO_COLORS[g] || '#7C3AED') : 'rgba(255,255,255,0.06)',
                      color: bibliotecaFilter === g ? '#fff' : '#A1A1AA',
                      textTransform: 'capitalize',
                    }}
                  >{g === 'todos' ? 'Todos' : g}</button>
                ))}
              </div>

              {/* Lista de ejercicios */}
              {bibliotecaLoading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#71717A' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} /></div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#52525B' }}>
                  <Dumbbell size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <p>No hay ejercicios.{' '}<button style={{ color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick={() => axios.post(`${API_URL}/exercises/biblioteca/seed`).then(() => fetchBiblioteca())}>Cargar biblioteca AE</button></p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filtered.map(ex => {
                    const color = GRUPO_COLORS[ex.grupo_muscular] || '#7C3AED';
                    return (
                      <div key={ex.id} style={{ background: '#0f0d18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        {/* Nombre */}
                        <div style={{ flex: 1, minWidth: '180px' }}>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FAFAFA' }}>{ex.nombre || ex.name}</p>
                          {ex.nombre_alternativo && <p style={{ fontSize: '0.78rem', color: '#71717A', marginTop: '2px' }}>{ex.nombre_alternativo}</p>}
                        </div>
                        {/* Chips */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {ex.grupo_muscular && (
                            <span style={{ background: color + '22', color, border: `1px solid ${color}55`, borderRadius: '8px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>{ex.grupo_muscular}</span>
                          )}
                          {ex.equipamiento && (
                            <span style={{ background: 'rgba(255,255,255,0.05)', color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600 }}>{EQUIP_LABELS[ex.equipamiento] || ex.equipamiento}</span>
                          )}
                          {ex.es_unilateral && (
                            <span style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>Unilateral</span>
                          )}
                          {ex.tipo_medicion === 'tiempo' && (
                            <span style={{ background: 'rgba(6,182,212,0.12)', color: '#22D3EE', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '8px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>⏱ TIEMPO</span>
                          )}
                          {ex.tipo_medicion === 'reps_y_tiempo' && (
                            <span style={{ background: 'rgba(249,115,22,0.12)', color: '#FB923C', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '8px', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>⏱+🔢 MIXTO</span>
                          )}
                        </div>
                        {/* Acciones */}
                        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                          {ex.youtube_url && (
                            <a href={ex.youtube_url} target="_blank" rel="noreferrer" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px', padding: '5px 10px', color: '#F87171', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              ▶ Tutorial
                            </a>
                          )}
                          <button onClick={() => openEdit(ex)} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px', padding: '5px 10px', color: '#A78BFA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Edit3 size={13} /> Editar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODAL CREAR / EDITAR */}
              {bibliotecaModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                  <div style={{ background: '#0f0d18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{bibliotecaModal === 'new' ? 'Nuevo Ejercicio' : 'Editar Ejercicio'}</h2>
                      <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div><label className="form-label">Nombre *</label><input className="form-input" value={bibliotecaForm.nombre} onChange={e => setBibliotecaForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Femoral sentada 1 pierna" /></div>
                      <div><label className="form-label">Nombre alternativo</label><input className="form-input" value={bibliotecaForm.nombre_alternativo} onChange={e => setBibliotecaForm(f => ({ ...f, nombre_alternativo: e.target.value }))} placeholder="Ej: Curl femoral unilateral" /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label className="form-label">Grupo muscular</label>
                          <select className="form-input" value={bibliotecaForm.grupo_muscular} onChange={e => setBibliotecaForm(f => ({ ...f, grupo_muscular: e.target.value }))}>
                            {['gluteos', 'femoral', 'cuadriceps', 'pantorrilla', 'espalda', 'hombro', 'pecho', 'biceps', 'triceps', 'core', 'calentamiento', 'full_body'].map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Equipamiento</label>
                          <select className="form-input" value={bibliotecaForm.equipamiento} onChange={e => setBibliotecaForm(f => ({ ...f, equipamiento: e.target.value }))}>
                            {['barra', 'mancuernas', 'polea', 'máquina', 'multifuerza', 'peso_corporal', 'banda', 'disco'].map(e => <option key={e} value={e}>{EQUIP_LABELS[e]}</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '24px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#A1A1AA' }}>
                          <input type="checkbox" checked={bibliotecaForm.es_unilateral} onChange={e => setBibliotecaForm(f => ({ ...f, es_unilateral: e.target.checked }))} />
                          Unilateral (1 pierna / 1 brazo)
                        </label>
                      </div>
                      <div>
                        <label className="form-label">Tipo de medición</label>
                        <select className="form-input" value={bibliotecaForm.tipo_medicion} onChange={e => setBibliotecaForm(f => ({ ...f, tipo_medicion: e.target.value }))}>
                          <option value="reps">🔢 Reps — Series por repeticiones</option>
                          <option value="tiempo">⏱ Tiempo — Duración en segundos</option>
                          <option value="reps_y_tiempo">⏱+🔢 Mixto — Reps con pausa isométrica</option>
                        </select>
                      </div>
                      <div><label className="form-label">URL YouTube tutorial</label><input className="form-input" value={bibliotecaForm.youtube_url} onChange={e => setBibliotecaForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." /></div>
                      <div><label className="form-label">Notas técnicas</label><textarea className="form-input" rows={3} value={bibliotecaForm.notas} onChange={e => setBibliotecaForm(f => ({ ...f, notas: e.target.value }))} placeholder="Indicaciones técnicas generales..." style={{ resize: 'vertical' }} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button className="btn-primary" style={{ flex: 1 }} disabled={!bibliotecaForm.nombre || bibliotecaSaving} onClick={handleSave}>
                        <Save size={16} /><span>{bibliotecaSaving ? 'Guardando...' : 'Guardar'}</span>
                      </button>
                      <button onClick={closeModal} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#A1A1AA', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a1726', border: '2px solid #EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, flexShrink: 0, overflow: 'hidden' }}>
                          {p.profile_photo_url ? <img src={p.profile_photo_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.name?.charAt(0).toUpperCase()}
                        </div>
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
                            href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${p.name.split(' ')[0]}! Tu cuenta en AE Personal Training ya esta lista. Ingresa en ${window.location.origin}`)}`}
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
                        } catch (err) { alert('Error al registrar pago: ' + (err.response?.data?.detail || err.message)); }
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
                        setSelectedStudent(r.data.student ?? r.data);
                      } catch (err) { alert('Error al registrar pago: ' + (err.response?.data?.detail || err.message)); }
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
              <section className="card flex-col" style={{ gridColumn: '1 / -1' }}>
                <div className="card-header" style={{ marginBottom: '16px' }}>
                  <User size={20} className="icon-accent" /><h2>Información del alumno</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {[
                    { label: 'Email', value: selectedStudent.email },
                    { label: 'WhatsApp', value: selectedStudent.whatsapp, link: selectedStudent.whatsapp ? `https://wa.me/${selectedStudent.whatsapp.replace(/\D/g, '')}` : null },
                    { label: 'Edad', value: selectedStudent.age ? `${selectedStudent.age} años` : null },
                    { label: 'Objetivo', value: selectedStudent.goal || selectedStudent.objetivo },
                    { label: 'Nivel', value: selectedStudent.nivel_experiencia },
                    { label: 'Días/semana', value: selectedStudent.dias_disponibles ? `${selectedStudent.dias_disponibles} días` : null },
                    { label: 'Lugar', value: selectedStudent.lugar_entrenamiento },
                    { label: 'Peso', value: selectedStudent.weight_kg ? `${selectedStudent.weight_kg} kg` : null },
                    { label: 'Altura', value: selectedStudent.height_cm ? `${selectedStudent.height_cm} cm` : null },
                    { label: 'Lesión', value: selectedStudent.tiene_lesion ? (selectedStudent.descripcion_lesion || 'Sí') : 'No' },
                    { label: 'Alimentación', value: selectedStudent.alimentacion_actual },
                    { label: 'Restricciones', value: selectedStudent.restricciones_alimentarias },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} style={{ background: '#0D0B14', borderRadius: '10px', padding: '10px 14px', border: '1px solid #2a2640' }}>
                      <p style={{ fontSize: '0.7rem', color: '#52525B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{f.label}</p>
                      {f.link
                        ? <a href={f.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.88rem', color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>{f.value}</a>
                        : <p style={{ fontSize: '0.88rem', color: '#FAFAFA', fontWeight: 600 }}>{f.value}</p>
                      }
                    </div>
                  ))}
                </div>
              </section>
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
                              const last = ex.history?.length ? [...ex.history].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
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
                                      <div className="prog-ex-num" style={{ background: CHART_COLORS[i % CHART_COLORS.length] + '22', color: CHART_COLORS[i % CHART_COLORS.length] }}>{i + 1}</div>
                                      <div style={{ minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.exercise_name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '2px' }}>{ex.history?.length || 0} sesiones · {last ? `${new Date(last.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}` : '—'}</p>
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
                              <Bar dataKey="peso" radius={[6, 6, 0, 0]}>
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
                ) : <div className="empty-state"><Activity size={40} className="empty-icon" /><h3>Sin datos de progreso</h3><p style={{ color: '#52525B', fontSize: '0.85rem', marginTop: '8px' }}>El alumno aún no registró sesiones</p></div>}
              </section>
              <section className="card flex-col">
                <div className="card-header"><Target size={20} className="icon-accent" /><h2>Plan Actual</h2></div>
                {activeRoutine ? (() => {
                  // Build day list
                  const days = [1, 2, 3, 4, 5].map(d => {
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
                            const repsLabel = rpsArr ? rpsArr.map((r, i) => `${i + 1}×${r}`).join(' · ') : (e.rep_range_min ? `${e.rep_range_min}–${e.rep_range_max} reps` : '?');
                            // Look up performance for this exercise
                            const perfEx = performanceData?.exercises?.find(px => px.exercise_id === e.exercise_id);
                            const lastPerf = perfEx?.history?.length ? [...perfEx.history].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
                            return (
                              <div key={e.id || i} style={{ background: '#0D0B14', borderRadius: '12px', padding: '14px', border: '1px solid #2a2640' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                  <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FAFAFA' }}>{e.exercises?.nombre || e.exercises?.name}</p>
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
                                  {Array.from({ length: sets }).map((_, si) => (
                                    <div key={si} style={{
                                      minWidth: '36px', height: '36px', borderRadius: '8px',
                                      border: '1.5px solid #3730A3', background: 'rgba(55,48,163,0.15)',
                                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.62rem', fontWeight: 700, color: '#818CF8', lineHeight: 1.2, padding: '2px 4px',
                                    }}>
                                      <span style={{ fontSize: '0.58rem', color: '#52525B' }}>S{si + 1}</span>
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
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  {activeRoutine && <button style={{ flex: 1, padding: '10px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', color: '#A78BFA', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }} onClick={handleEditRoutineClick}>✏️ Editar rutina</button>}
                  <button className="btn-primary massive-btn" style={{ flex: 1 }} onClick={handleCreateRoutineClick}>+ Nueva Rutina</button>
                </div>
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
              <section className="card flex-col" style={{ gridColumn: '1 / -1' }}>
                <div className="card-header"><Camera size={20} className="icon-accent" /><h2>Fotos de Progreso</h2></div>
                {studentPhotos && studentPhotos.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
                    {studentPhotos.map(photo => (
                      <div key={photo.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a2640', background: '#0D0B14', cursor: 'pointer' }} onClick={() => setSelectedPhotoUrl(photo.photo_url)}>
                        <img src={photo.photo_url} alt="Progreso" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                        <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.75rem', color: '#A1A1AA', fontWeight: 'bold' }}>
                          {new Date(photo.created_at).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ marginTop: '16px' }}>
                    <Camera size={40} className="empty-icon" />
                    <h3>Sin fotos de progreso</h3>
                    <p style={{ color: '#52525B', fontSize: '0.85rem', marginTop: '8px' }}>El alumno aún no subió fotos.</p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* PHOTO LIGHTBOX MODAL */}
        {selectedPhotoUrl && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedPhotoUrl(null)}>
            <button style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: '#FAFAFA', padding: '10px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedPhotoUrl(null); }}>
              <X size={24} />
            </button>
            <img src={selectedPhotoUrl} alt="Progreso" style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px' }} onClick={e => e.stopPropagation()} />
          </div>
        )}

        {/* CREATE ROUTINE — WIZARD */}
        {currentView === 'CrearRutina' && selectedStudent && (() => {
          const DAY_SUGGESTIONS = ['Femoral y Glúteos', 'Cuádriceps', 'Tren Superior', 'Tren Inferior', 'Glúteos', 'Full Body', 'Descanso activo'];
          const GRUPOS = ['Todos', 'Glúteos', 'Femoral', 'Cuádriceps', 'Espalda', 'Hombro', 'Pecho', 'Bíceps', 'Tríceps', 'Core'];
          const DESCANSO_PRESETS = [20, 30, 60, 90, 120];
          const TECNICAS = [
            { key: '', label: 'Ninguna' },
            { key: 'drop_set', label: 'Drop Set' },
            { key: 'myo_reps', label: 'Myo Reps' },
            { key: 'al_fallo', label: 'Al Fallo' },
            { key: 'isometria', label: 'Isometría' },
            { key: 'superserie', label: 'Superserie' },
          ];

          const editingDay = days.find(d => d.id === editingDayId);
          const filteredExs = exerciseLibrary.filter(ex => {
            const n = (ex.nombre || ex.name || '').toLowerCase();
            const g = (ex.grupo_muscular || ex.muscle_group || '').toLowerCase();
            // Normalize accents for comparison
            const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return (!exSearch || normalize(n).includes(normalize(exSearch.toLowerCase()))) &&
              (exFilterGrupo === 'Todos' || normalize(g).includes(normalize(exFilterGrupo.toLowerCase())));
          });

          const openAddSheet = (dayId, libEx) => {
            setBottomSheetDayId(dayId);
            setPendingExConfig({ _isNew: true, exerciseId: libEx.id, exerciseName: libEx.nombre || libEx.name || '?', muscleGroup: libEx.grupo_muscular || libEx.muscle_group || '', tipoMedicion: libEx.tipo_medicion || 'reps', esUnilateral: libEx.es_unilateral || false, sets: 3, repMin: 8, repMax: 12, repsPerSet: [], duracionSegundos: 60, rirObjetivo: 2, tempoSubida: '', tempoPausa: '', tempoBajada: '', showTempo: false, descansoEntreSeries: 90, tecnicaEspecial: '', notasProfesor: '' });
            setShowExBottomSheet(true);
          };

          const openEditSheet = (dayId, ex) => {
            setBottomSheetDayId(dayId);
            const r = ex.targetRir === 'rir3' ? 3 : ex.targetRir === 'rir1' ? 1 : ex.targetRir === 'rir0' ? 0 : 2;
            const rps = Array.isArray(ex.repsPerSet) ? ex.repsPerSet : (typeof ex.repsPerSet === 'string' && ex.repsPerSet ? ex.repsPerSet.split(',') : []);
            setPendingExConfig({ _isNew: false, _exId: ex.id, exerciseId: ex.exerciseId, exerciseName: ex.exerciseName, muscleGroup: ex.muscleGroup, tipoMedicion: ex.tipoMedicion || 'reps', sets: ex.sets, repMin: ex.repMin, repMax: ex.repMax, repsPerSet: rps, duracionSegundos: ex.duracionSegundos || 60, rirObjetivo: r, tempoSubida: ex.tempoSubida || '', tempoPausa: ex.tempoPausa || '', tempoBajada: ex.tempoBajada || '', showTempo: !!(ex.tempoSubida || ex.tempoPausa || ex.tempoBajada), descansoEntreSeries: ex.descansoEntreSeries || 90, tecnicaEspecial: ex.tecnicaEspecial || '', notasProfesor: ex.notasProfesor || '' });
            setShowExBottomSheet(true);
          };

          const confirmSheet = () => {
            if (!pendingExConfig) return;
            const rirKey = ['rir0', 'rir1', 'rir2', 'rir3'][pendingExConfig.rirObjetivo] ?? 'rir2';
            const newEx = { id: pendingExConfig._isNew ? crypto.randomUUID() : pendingExConfig._exId, exerciseId: pendingExConfig.exerciseId, exerciseName: pendingExConfig.exerciseName, muscleGroup: pendingExConfig.muscleGroup, tipoMedicion: pendingExConfig.tipoMedicion, sets: pendingExConfig.sets, repMin: pendingExConfig.repMin, repMax: pendingExConfig.repMax, repsPerSet: pendingExConfig.repsPerSet, duracionSegundos: pendingExConfig.duracionSegundos, targetRir: rirKey, tempoSubida: pendingExConfig.tempoSubida, tempoPausa: pendingExConfig.tempoPausa, tempoBajada: pendingExConfig.tempoBajada, showTempo: pendingExConfig.showTempo, descansoEntreSeries: pendingExConfig.descansoEntreSeries, progressionModel: 'autoregulation', tecnicaEspecial: pendingExConfig.tecnicaEspecial, notasProfesor: pendingExConfig.notasProfesor };
            setDays(prev => prev.map(d => {
              if (d.id !== bottomSheetDayId) return d;
              if (pendingExConfig._isNew) return { ...d, exercises: [...d.exercises, newEx] };
              return { ...d, exercises: d.exercises.map(e => e.id === pendingExConfig._exId ? newEx : e) };
            }));
            setShowExBottomSheet(false); setPendingExConfig(null);
          };

          const moveDay = (idx, dir) => { const a = [...days]; const b = idx + dir; if (b < 0 || b >= a.length) return;[a[idx], a[b]] = [a[b], a[idx]]; setDays(a.map((d, i) => ({ ...d, dayNumber: i + 1 }))); };
          const moveEx = (dayId, ei, dir) => setDays(prev => prev.map(d => { if (d.id !== dayId) return d; const a = [...d.exercises]; const b = ei + dir; if (b < 0 || b >= a.length) return d;[a[ei], a[b]] = [a[b], a[ei]]; return { ...d, exercises: a }; }));

          const sCard = { background: 'rgba(18,18,26,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px' };
          const sChip = (on) => ({ padding: '6px 14px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: '1px solid', background: on ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)', borderColor: on ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)', color: on ? '#A78BFA' : '#71717A', whiteSpace: 'nowrap', fontFamily: 'inherit' });
          const sLabel = { fontSize: '0.62rem', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block' };
          const sInput = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', color: '#FAFAFA', fontSize: '0.9rem', padding: '10px 14px', fontFamily: 'inherit' };
          const sBtnPrimary = { background: '#7C3AED', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '12px 24px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' };
          const sBtnGhost = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', color: '#A1A1AA', fontWeight: 600, fontSize: '0.85rem', padding: '10px 18px', cursor: 'pointer', fontFamily: 'inherit' };

          const ProgressBar = ({ step }) => (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
              {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i <= step ? '#7C3AED' : 'rgba(255,255,255,0.1)' }} />)}
            </div>
          );

          const BackBtn = ({ onClick }) => (
            <button onClick={onClick} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A1A1AA', flexShrink: 0 }}>
              <ChevronLeft size={18} />
            </button>
          );

          return (
            <div className="view-fade-in" style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '120px' }}>

              {/* ── PASO 1: NOMBRE ── */}
              {wizardStep === 1 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <BackBtn onClick={() => setCurrentView('PerfilAlumno')} />
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nueva Rutina · Paso 1 de 4</p>
                      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FAFAFA', margin: 0 }}>Nombre de la rutina</h1>
                    </div>
                  </div>
                  <ProgressBar step={1} />
                  <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={18} color="#A78BFA" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Alumno</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FAFAFA', margin: 0 }}>{selectedStudent.name}</p>
                    </div>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={sLabel}>Nombre de la rutina</label>
                    <input style={{ ...sInput, fontSize: '1.1rem', fontWeight: 600 }} placeholder="ej: Rutina Glúteos y Piernas - Marzo" value={routineName} onChange={e => setRoutineName(e.target.value)} onKeyDown={e => e.key === 'Enter' && routineName.trim() && days[0]?.dayName.trim() && setWizardStep(2)} autoFocus />
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <label style={sLabel}>Nombre del primer día (Día 1)</label>
                    <input
                      style={sInput}
                      placeholder="Ej: Empuje / Tren Superior / Fullbody"
                      value={days[0]?.dayName || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setDays(prev => prev.map((d, i) => i === 0 ? { ...d, dayName: val } : d));
                      }}
                      onKeyDown={e => e.key === 'Enter' && routineName.trim() && days[0]?.dayName.trim() && setWizardStep(2)}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {DAY_SUGGESTIONS.map(s => (
                        <button
                          key={s}
                          onClick={() => setDays(prev => prev.map((d, i) => i === 0 ? { ...d, dayName: s } : d))}
                          style={sChip(days[0]?.dayName === s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    style={{ ...sBtnPrimary, width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', opacity: (routineName.trim() && days[0]?.dayName.trim()) ? 1 : 0.4 }}
                    onClick={() => routineName.trim() && days[0]?.dayName.trim() && setWizardStep(2)}
                  >
                    Continuar → Armar días
                  </button>
                </div>
              )}

              {/* ── PASO 2: DÍAS ── */}
              {wizardStep === 2 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <BackBtn onClick={() => setWizardStep(1)} />
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Paso 2 de 4</p>
                      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FAFAFA', margin: 0 }}>Armá los días</h1>
                    </div>
                  </div>
                  <ProgressBar step={2} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {days.map((day, idx) => (
                      <div key={day.id} style={sCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#A78BFA', flexShrink: 0 }}>{day.dayNumber}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input
                              value={day.dayName}
                              onChange={e => {
                                const val = e.target.value;
                                setDays(prev => prev.map(d => d.id === day.id ? { ...d, dayName: val } : d));
                              }}
                              placeholder={`Nombre del Día ${day.dayNumber}...`}
                              style={{
                                background: 'none', border: 'none', borderBottom: day.dayName ? '1px dashed transparent' : '1px dashed rgba(124,58,237,0.5)',
                                borderRadius: 0, padding: '2px 0', fontSize: '0.95rem', fontWeight: 700,
                                color: day.dayName ? '#FAFAFA' : '#7C3AED', outline: 'none', width: '100%',
                                fontFamily: 'inherit', cursor: 'text'
                              }}
                              onFocus={e => e.target.style.borderBottomColor = 'rgba(124,58,237,0.5)'}
                              onBlur={e => e.target.style.borderBottomColor = day.dayName ? 'transparent' : 'rgba(124,58,237,0.5)'}
                            />
                            <p style={{ fontSize: '0.75rem', color: '#52525B', margin: '2px 0 0' }}>{day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}</p>
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center' }}>
                            <button onClick={() => moveDay(idx, -1)} disabled={idx === 0} style={{ background: 'none', border: 'none', color: idx === 0 ? '#3F3F46' : '#71717A', cursor: idx === 0 ? 'default' : 'pointer', padding: '4px' }}><ChevronUp size={16} /></button>
                            <button onClick={() => moveDay(idx, 1)} disabled={idx === days.length - 1} style={{ background: 'none', border: 'none', color: idx === days.length - 1 ? '#3F3F46' : '#71717A', cursor: idx === days.length - 1 ? 'default' : 'pointer', padding: '4px' }}><ChevronDown size={16} /></button>
                            <button onClick={() => { setEditingDayId(day.id); setExSearch(''); setExFilterGrupo('Todos'); setWizardStep(3); }} style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', color: '#A78BFA', fontWeight: 700, fontSize: '0.75rem', padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>+ Ejercicios</button>
                            {days.length > 1 && <button onClick={() => setDays(days.filter(d => d.id !== day.id).map((d, i) => ({ ...d, dayNumber: i + 1 })))} style={{ background: 'none', border: 'none', color: '#52525B', cursor: 'pointer', padding: '4px' }} onMouseEnter={e => e.currentTarget.style.color = '#F87171'} onMouseLeave={e => e.currentTarget.style.color = '#52525B'}><Trash2 size={15} /></button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {showAddDayForm ? (
                    <div style={{ ...sCard, marginBottom: '16px', border: '1px solid rgba(124,58,237,0.3)' }}>
                      <p style={{ ...sLabel, color: '#7C3AED' }}>Día {days.length + 1} — Nombre</p>
                      <input style={sInput} placeholder="Ej: Femoral y Glúteos" value={newDayNameInput} onChange={e => setNewDayNameInput(e.target.value)} autoFocus />
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', marginBottom: '14px' }}>
                        {DAY_SUGGESTIONS.map(s => <button key={s} onClick={() => setNewDayNameInput(s)} style={sChip(newDayNameInput === s)}>{s}</button>)}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { if (!newDayNameInput.trim()) return; setDays([...days, { id: crypto.randomUUID(), dayNumber: days.length + 1, dayName: newDayNameInput.trim(), exercises: [] }]); setNewDayNameInput(''); setShowAddDayForm(false); }} style={{ ...sBtnPrimary, flex: 1, justifyContent: 'center', opacity: newDayNameInput.trim() ? 1 : 0.4 }}>Crear día</button>
                        <button onClick={() => { setShowAddDayForm(false); setNewDayNameInput(''); }} style={sBtnGhost}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setShowAddDayForm(true); setNewDayNameInput(`Día ${days.length + 1}`); }} style={{ width: '100%', padding: '14px', background: 'transparent', border: '2px dashed rgba(124,58,237,0.3)', borderRadius: '14px', color: '#7C3AED', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit', marginBottom: '24px' }}>
                      <Plus size={18} /> Agregar día
                    </button>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setWizardStep(1)} style={sBtnGhost}>← Atrás</button>
                    <button onClick={() => setWizardStep(4)} style={{ ...sBtnPrimary, flex: 1, justifyContent: 'center', opacity: days.some(d => d.exercises.length > 0) ? 1 : 0.5 }}>Ver resumen →</button>
                  </div>
                </div>
              )}

              {/* ── PASO 3: EJERCICIOS DEL DÍA ── */}
              {wizardStep === 3 && editingDay && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <BackBtn onClick={() => setWizardStep(2)} />
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Día {editingDay.dayNumber}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          style={{ ...sInput, background: 'none', border: 'none', borderBottom: '1px dashed rgba(124,58,237,0.4)', borderRadius: 0, padding: '2px 0', fontSize: '1.1rem', fontWeight: 800, width: 'auto', minWidth: '180px', color: '#FAFAFA' }}
                          value={editingDay.dayName}
                          onChange={e => {
                            const val = e.target.value;
                            setDays(prev => prev.map(d => d.id === editingDay.id ? { ...d, dayName: val } : d));
                          }}
                          placeholder={`Día ${editingDay.dayNumber}`}
                        />
                        <Edit3 size={16} color="#52525B" />
                      </div>
                    </div>
                  </div>
                  <ProgressBar step={3} />
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <input style={{ ...sInput, paddingLeft: '38px' }} placeholder="Buscar ejercicio..." value={exSearch} onChange={e => setExSearch(e.target.value)} />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#52525B' }}>🔍</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px' }}>
                    {GRUPOS.map(g => <button key={g} onClick={() => setExFilterGrupo(g)} style={sChip(exFilterGrupo === g)}>{g}</button>)}
                  </div>
                  {exerciseLibrary.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: '10px' }}>
                      <p style={{ color: '#52525B', fontSize: '0.875rem', marginBottom: '10px' }}>No se cargaron los ejercicios.</p>
                      <button onClick={async () => { try { const r = await axios.get(`${API_URL}/exercises`); setExerciseLibrary(r.data || []); } catch (e) { console.error(e); } }} style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', color: '#A78BFA', fontWeight: 700, fontSize: '0.85rem', padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>Reintentar carga</button>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', maxHeight: '280px', overflowY: 'auto' }}>
                    {filteredExs.length === 0 && exerciseLibrary.length > 0 && <p style={{ color: '#52525B', textAlign: 'center', padding: '20px 0', fontSize: '0.875rem' }}>No se encontraron ejercicios</p>}
                    {filteredExs.map(ex => {
                      const nombre = ex.nombre || ex.name || '?';
                      const grupo = ex.grupo_muscular || ex.muscle_group || '';
                      return (
                        <div key={ex.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FAFAFA', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</p>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                              {grupo && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#A78BFA', background: 'rgba(124,58,237,0.12)', borderRadius: '9999px', padding: '1px 8px' }}>{grupo}</span>}
                              {ex.es_unilateral && <span style={{ fontSize: '0.68rem', color: '#71717A', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', padding: '1px 8px' }}>↔️ Unilateral</span>}
                              {ex.tipo_medicion === 'tiempo' && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#22D3EE', background: 'rgba(6,182,212,0.1)', borderRadius: '9999px', padding: '1px 8px' }}>⏱ Tiempo</span>}
                              {ex.tipo_medicion === 'reps_y_tiempo' && <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#FB923C', background: 'rgba(249,115,22,0.1)', borderRadius: '9999px', padding: '1px 8px' }}>⏱+🔢 Mixto</span>}
                              {ex.youtube_url && <span style={{ fontSize: '0.68rem', color: '#71717A' }}>▶️</span>}
                            </div>
                          </div>
                          <button onClick={() => openAddSheet(editingDay.id, ex)} style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px', color: '#A78BFA', fontWeight: 700, fontSize: '0.8rem', padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>+ Agregar</button>
                        </div>
                      );
                    })}
                  </div>
                  {editingDay.exercises.length > 0 && (
                    <div>
                      <p style={{ ...sLabel, color: '#7C3AED', marginBottom: '10px' }}>✓ Ejercicios en este día ({editingDay.exercises.length})</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {editingDay.exercises.map((ex, exIdx) => {
                          const rirNum = ex.targetRir === 'rir3' ? 3 : ex.targetRir === 'rir1' ? 1 : ex.targetRir === 'rir0' ? 0 : 2;
                          const summary = ex.tipoMedicion === 'tiempo' ? `${ex.sets} series · ${ex.duracionSegundos || '?'}" · ${ex.descansoEntreSeries || 90}" desc` : `${ex.sets} series · ${ex.repMin}-${ex.repMax} reps · RIR ${rirNum} · ${ex.descansoEntreSeries || 90}" desc`;
                          return (
                            <div key={ex.id} style={{ ...sCard, padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#52525B', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, minWidth: '20px' }}>{exIdx + 1}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FAFAFA', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.exerciseName}</p>
                                  <p style={{ fontSize: '0.72rem', color: '#71717A', margin: 0 }}>{summary}</p>
                                  <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                                    {(ex.tempoSubida || ex.tempoPausa || ex.tempoBajada) && <span style={{ fontSize: '0.65rem', color: '#A78BFA', background: 'rgba(124,58,237,0.1)', borderRadius: '6px', padding: '1px 6px' }}>Tempo {ex.tempoSubida || '_'}-{ex.tempoPausa || '_'}-{ex.tempoBajada || '_'}</span>}
                                    {ex.tecnicaEspecial && <span style={{ fontSize: '0.65rem', color: '#FB923C', background: 'rgba(249,115,22,0.1)', borderRadius: '6px', padding: '1px 6px' }}>⚡ {ex.tecnicaEspecial.replace(/_/g, ' ')}</span>}
                                    {ex.notasProfesor && <span style={{ fontSize: '0.65rem', color: '#71717A' }}>📝</span>}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                  <button onClick={() => moveEx(editingDay.id, exIdx, -1)} disabled={exIdx === 0} style={{ background: 'none', border: 'none', color: exIdx === 0 ? '#3F3F46' : '#71717A', cursor: exIdx === 0 ? 'default' : 'pointer', padding: '3px' }}><ChevronUp size={14} /></button>
                                  <button onClick={() => moveEx(editingDay.id, exIdx, 1)} disabled={exIdx === editingDay.exercises.length - 1} style={{ background: 'none', border: 'none', color: exIdx === editingDay.exercises.length - 1 ? '#3F3F46' : '#71717A', cursor: exIdx === editingDay.exercises.length - 1 ? 'default' : 'pointer', padding: '3px' }}><ChevronDown size={14} /></button>
                                  <button onClick={() => openEditSheet(editingDay.id, ex)} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: '3px' }}><Edit3 size={14} /></button>
                                  <button onClick={() => setDays(prev => prev.map(d => d.id === editingDay.id ? { ...d, exercises: d.exercises.filter(e => e.id !== ex.id) } : d))} style={{ background: 'none', border: 'none', color: '#52525B', cursor: 'pointer', padding: '3px' }} onMouseEnter={e2 => e2.currentTarget.style.color = '#F87171'} onMouseLeave={e2 => e2.currentTarget.style.color = '#52525B'}><Trash2 size={14} /></button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setWizardStep(2)} style={{ ...sBtnGhost, width: '100%', justifyContent: 'center', marginTop: '20px', display: 'flex' }}>← Volver a días</button>
                </div>
              )}

              {/* ── PASO 4: RESUMEN ── */}
              {wizardStep === 4 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <BackBtn onClick={() => setWizardStep(2)} />
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Paso 4 de 4</p>
                      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FAFAFA', margin: 0 }}>Resumen y guardar</h1>
                    </div>
                  </div>
                  <ProgressBar step={4} />
                  <div style={{ ...sCard, marginBottom: '16px' }}>
                    <p style={sLabel}>Rutina</p>
                    <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FAFAFA', margin: '0 0 4px' }}>{routineName}</p>
                    <p style={{ fontSize: '0.78rem', color: '#71717A', margin: 0 }}>Para: {selectedStudent.name}</p>
                  </div>
                  {days.map((day, idx) => (
                    <div key={day.id} style={{ ...sCard, marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#A78BFA', fontSize: '0.9rem', flexShrink: 0 }}>{day.dayNumber}</div>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FAFAFA', margin: 0, flex: 1 }}>{day.dayName || `Día ${idx + 1}`}</p>
                        <button onClick={() => { setEditingDayId(day.id); setExSearch(''); setExFilterGrupo('Todos'); setWizardStep(3); }} style={{ background: 'none', border: 'none', color: '#52525B', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>✏️ Editar</button>
                      </div>
                      {day.exercises.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#52525B', fontStyle: 'italic', margin: 0 }}>Sin ejercicios cargados</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {day.exercises.map((ex, ei) => {
                            const rirNum = ex.targetRir === 'rir3' ? 3 : ex.targetRir === 'rir1' ? 1 : ex.targetRir === 'rir0' ? 0 : 2;
                            const actualReps = Array.isArray(ex.repsPerSet) && ex.repsPerSet.some(r => r !== '')
                              ? ex.repsPerSet.filter((_, i) => i < ex.sets).map(r => r || (ex.repMin || '8')).join('-')
                              : `${ex.repMin}-${ex.repMax}`;
                            const summary = ex.tipoMedicion === 'tiempo'
                              ? `${ex.sets}×${ex.duracionSegundos || '?'}" · ${ex.descansoEntreSeries || 90}" desc`
                              : `${ex.sets}×${actualReps} · RIR${rirNum} · ${ex.descansoEntreSeries || 90}" desc`;
                            return (
                              <div key={ex.id} style={{ display: 'flex', gap: '8px', padding: '5px 0', borderBottom: ei < day.exercises.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <span style={{ color: '#52525B', fontSize: '0.78rem', minWidth: '18px' }}>{ei + 1}.</span>
                                <div>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FAFAFA' }}>{ex.exerciseName}</span>
                                  <span style={{ fontSize: '0.75rem', color: '#71717A', marginLeft: '8px' }}>{summary}</span>
                                  {ex.tempoSubida && <span style={{ fontSize: '0.7rem', color: '#A78BFA', marginLeft: '6px' }}>· Tempo {ex.tempoSubida}-{ex.tempoPausa || '0'}-{ex.tempoBajada || '0'}</span>}
                                  {ex.tecnicaEspecial && <span style={{ fontSize: '0.7rem', color: '#FB923C', marginLeft: '6px' }}>· ⚡{ex.tecnicaEspecial.replace(/_/g, ' ')}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button onClick={() => setWizardStep(2)} style={sBtnGhost}>← Editar</button>
                    <button onClick={handleSaveRoutine} disabled={savingRoutine} style={{ ...sBtnPrimary, flex: 1, justifyContent: 'center', opacity: savingRoutine ? 0.7 : 1 }}>
                      {savingRoutine ? <><Loader2 size={16} /> Guardando...</> : <><CheckCircle2 size={16} /> Guardar rutina</>}
                    </button>
                  </div>
                </div>
              )}

              {/* ── BOTTOM SHEET: CONFIGURAR EJERCICIO ── */}
              {showExBottomSheet && pendingExConfig && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div onClick={() => { setShowExBottomSheet(false); setPendingExConfig(null); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
                  <div style={{ position: 'relative', background: '#12121A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '90vh', overflowY: 'auto', zIndex: 1 }}>
                    <div style={{ width: '40px', height: '4px', borderRadius: '9999px', background: 'rgba(255,255,255,0.1)', margin: '0 auto 20px' }} />
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{pendingExConfig.muscleGroup}</p>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FAFAFA', margin: '4px 0 12px' }}>{pendingExConfig.exerciseName}</h2>
                    {pendingExConfig.tipoMedicion === 'tiempo' && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#22D3EE', background: 'rgba(6,182,212,0.1)', borderRadius: '6px', padding: '2px 8px', display: 'inline-block', marginBottom: '16px' }}>⏱ Ejercicio de tiempo</span>}
                    {pendingExConfig.tipoMedicion === 'reps_y_tiempo' && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FB923C', background: 'rgba(249,115,22,0.1)', borderRadius: '6px', padding: '2px 8px', display: 'inline-block', marginBottom: '16px' }}>⏱+🔢 Mixto</span>}

                    <div style={{ marginBottom: '20px' }}>
                      <label style={sLabel}>Series</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                        <button onClick={() => setPendingExConfig(p => ({ ...p, sets: Math.max(1, p.sets - 1), repsPerSet: p.repsPerSet.length > Math.max(1, p.sets - 1) ? p.repsPerSet.slice(0, Math.max(1, p.sets - 1)) : p.repsPerSet }))} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>−</button>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#FAFAFA', minWidth: '48px', textAlign: 'center' }}>{pendingExConfig.sets}</span>
                        <button onClick={() => setPendingExConfig(p => ({ ...p, sets: Math.min(10, p.sets + 1) }))} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>+</button>
                      </div>
                    </div>

                    {/* ── REPS POR SERIE (visible inmediatamente tras las series) ── */}
                    {pendingExConfig.tipoMedicion !== 'tiempo' && (
                      <div style={{ marginBottom: '20px', background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '14px', padding: '14px' }}>
                        <p style={{ ...sLabel, color: '#A78BFA', marginBottom: '12px' }}>🔢 Repeticiones por serie</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {Array.from({ length: pendingExConfig.sets }).map((_, i) => (
                            <div key={i} style={{ flex: 1, minWidth: '48px', maxWidth: '80px' }}>
                              <p style={{ fontSize: '0.6rem', color: '#71717A', textAlign: 'center', marginBottom: '4px', fontWeight: 700 }}>S{i + 1}</p>
                              <input
                                type="number"
                                style={{ ...sInput, padding: '8px 4px', textAlign: 'center', fontWeight: 800, fontSize: '1rem', borderColor: pendingExConfig.repsPerSet[i] ? 'rgba(124,58,237,0.5)' : undefined }}
                                placeholder={String(pendingExConfig.repMin || 8)}
                                value={pendingExConfig.repsPerSet[i] || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setPendingExConfig(p => {
                                    const newRps = Array.from({ length: p.sets }, (_, idx) => p.repsPerSet[idx] || '');
                                    newRps[i] = val;
                                    return { ...p, repsPerSet: newRps };
                                  });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pendingExConfig.tipoMedicion === 'tiempo' ? (
                      <div style={{ marginBottom: '20px' }}>
                        <label style={sLabel}>Duración por serie</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                          <button onClick={() => setPendingExConfig(p => ({ ...p, duracionSegundos: Math.max(5, p.duracionSegundos - 5) }))} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22D3EE', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>−</button>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#22D3EE' }}>{pendingExConfig.duracionSegundos}</span>
                            <span style={{ fontSize: '0.85rem', color: '#71717A', marginLeft: '4px' }}>seg</span>
                            <p style={{ fontSize: '0.75rem', color: '#71717A', margin: '2px 0 0' }}>{Math.floor(pendingExConfig.duracionSegundos / 60)}:{String(pendingExConfig.duracionSegundos % 60).padStart(2, '0')} min</p>
                          </div>
                          <button onClick={() => setPendingExConfig(p => ({ ...p, duracionSegundos: p.duracionSegundos + 5 }))} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22D3EE', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>+</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '20px' }}>
                        <label style={sLabel}>Rango de repeticiones</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                          <div><p style={{ fontSize: '0.6rem', color: '#52525B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Mínimo</p><input type="number" value={pendingExConfig.repMin} onChange={e => setPendingExConfig(p => ({ ...p, repMin: Number(e.target.value) }))} style={{ ...sInput, textAlign: 'center', fontWeight: 700 }} /></div>
                          <span style={{ color: '#52525B', fontWeight: 700, textAlign: 'center' }}>–</span>
                          <div><p style={{ fontSize: '0.6rem', color: '#52525B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Máximo</p><input type="number" value={pendingExConfig.repMax} onChange={e => setPendingExConfig(p => ({ ...p, repMax: Number(e.target.value) }))} style={{ ...sInput, textAlign: 'center', fontWeight: 700 }} /></div>
                        </div>

                        <label style={sLabel}>RIR Objetivo</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[0, 1, 2, 3, 4].map(r => (
                            <button key={r} onClick={() => setPendingExConfig(p => ({ ...p, rirObjetivo: r }))} style={{ flex: 1, padding: '8px 0', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', border: '1px solid', fontFamily: 'inherit', background: pendingExConfig.rirObjetivo === r ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', borderColor: pendingExConfig.rirObjetivo === r ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)', color: pendingExConfig.rirObjetivo === r ? '#A78BFA' : '#71717A' }}>RIR {r}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                      <label style={sLabel}>Descanso entre series</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {DESCANSO_PRESETS.map(d => <button key={d} onClick={() => setPendingExConfig(p => ({ ...p, descansoEntreSeries: d }))} style={{ padding: '7px 14px', borderRadius: '9999px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid', fontFamily: 'inherit', background: pendingExConfig.descansoEntreSeries === d ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', borderColor: pendingExConfig.descansoEntreSeries === d ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.07)', color: pendingExConfig.descansoEntreSeries === d ? '#A78BFA' : '#71717A' }}>{d}"</button>)}
                        <input type="number" value={pendingExConfig.descansoEntreSeries} onChange={e => setPendingExConfig(p => ({ ...p, descansoEntreSeries: Number(e.target.value) }))} style={{ width: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '9999px', color: '#FAFAFA', fontSize: '0.8rem', fontWeight: 700, padding: '7px 10px', textAlign: 'center', fontFamily: 'inherit' }} />
                      </div>
                      {Number(pendingExConfig.descansoEntreSeries) > 0 && Number(pendingExConfig.descansoEntreSeries) < 30 && <p style={{ fontSize: '0.75rem', color: '#FDE047', marginTop: '8px', background: 'rgba(234,179,8,0.08)', borderRadius: '8px', padding: '6px 10px' }}>⚡ Descanso corto — se mostrará temporizador automático al alumno</p>}
                    </div>

                    {pendingExConfig.tipoMedicion !== 'tiempo' && (
                      <div style={{ marginBottom: '20px' }}>
                        <button type="button" onClick={() => setPendingExConfig(p => ({ ...p, showTempo: !p.showTempo }))} style={{ background: 'none', border: 'none', color: pendingExConfig.showTempo ? '#A78BFA' : '#52525B', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0, fontFamily: 'inherit' }}>
                          ⚙️ Tempo de ejecución {pendingExConfig.showTempo ? '▲' : '▼'}
                          {(pendingExConfig.tempoSubida || pendingExConfig.tempoPausa || pendingExConfig.tempoBajada) && !pendingExConfig.showTempo && <span style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', borderRadius: '6px', padding: '1px 8px', fontFamily: 'monospace', fontSize: '0.75rem' }}>{pendingExConfig.tempoSubida || '_'}-{pendingExConfig.tempoPausa || '_'}-{pendingExConfig.tempoBajada || '_'}</span>}
                        </button>
                        {pendingExConfig.showTempo && (
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                              {[['tempoSubida', 'Subida (s)'], ['tempoPausa', 'Pausa (s)'], ['tempoBajada', 'Bajada (s)']].map(([field, lbl]) => (
                                <div key={field}><p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{lbl}</p><input type="number" placeholder="—" value={pendingExConfig[field]} onChange={e => setPendingExConfig(p => ({ ...p, [field]: e.target.value }))} style={{ width: '100%', background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px', color: '#A78BFA', fontSize: '0.9rem', fontWeight: 600, padding: '6px 8px', textAlign: 'center', fontFamily: 'inherit' }} /></div>
                              ))}
                            </div>
                            {(pendingExConfig.tempoSubida || pendingExConfig.tempoPausa || pendingExConfig.tempoBajada) && <div style={{ marginTop: '8px', background: 'rgba(124,58,237,0.08)', borderRadius: '6px', padding: '6px 12px', textAlign: 'center', fontFamily: 'monospace', color: '#A78BFA', fontSize: '0.85rem' }}>Tempo: {pendingExConfig.tempoSubida || '_'}"-{pendingExConfig.tempoPausa || '_'}"-{pendingExConfig.tempoBajada || '_'}"</div>}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                      <label style={sLabel}>⚡ Técnica especial</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {TECNICAS.map(t => <button key={t.key} onClick={() => setPendingExConfig(p => ({ ...p, tecnicaEspecial: t.key }))} style={sChip(pendingExConfig.tecnicaEspecial === t.key)}>{t.label}</button>)}
                      </div>
                      {(pendingExConfig.tecnicaEspecial === 'drop_set' || pendingExConfig.tecnicaEspecial === 'myo_reps') && <p style={{ fontSize: '0.75rem', color: '#FB923C', marginTop: '8px', background: 'rgba(249,115,22,0.07)', borderRadius: '8px', padding: '6px 10px' }}>⚡ En la última serie el alumno verá instrucción de esta técnica</p>}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={sLabel}>📝 Nota para el alumno (opcional)</label>
                      <textarea value={pendingExConfig.notasProfesor} onChange={e => setPendingExConfig(p => ({ ...p, notasProfesor: e.target.value }))} placeholder='ej: "Controlá la negativa, bajá en 3 segundos"' rows={2} style={{ ...sInput, resize: 'none', lineHeight: 1.5 }} />
                    </div>

                    <button onClick={confirmSheet} style={{ ...sBtnPrimary, width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
                      <CheckCircle2 size={18} /> {pendingExConfig._isNew ? 'Agregar ejercicio' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })()}
      </main>
    </div>
  );
}
