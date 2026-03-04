import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, FileText, Dumbbell, Save, ChevronLeft, UserPlus, Activity, Target, Plus, Trash2, Camera, X, Edit3, Loader2, Flame, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import './index.css';

const API_URL = 'http://localhost:8000';

// Colores para las líneas del gráfico (hasta 8 ejercicios distintos)
const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];


export default function App() {
  const [currentView, setCurrentView] = useState('ListaAlumnos');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Alumnos reales desde el backend
  const [students, setStudents] = useState([]);
  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', age: '', weight_kg: '', height_cm: '', goal: 'Hipertrofia' });
  const [savingStudent, setSavingStudent] = useState(false);

  // Biblioteca de ejercicios desde el Backend
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');

  // Performance data para gráficos
  const [performanceData, setPerformanceData] = useState(null);

  // Fotos de progreso
  const [studentPhotos, setStudentPhotos] = useState([]);

  // Rutina activa del alumno seleccionado
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [routineExercises, setRoutineExercises] = useState([]);

  // Nutrición
  const [nutritionPlan, setNutritionPlan] = useState(null);

  // Loading states
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [deletingStudentId, setDeletingStudentId] = useState(null);

  // Rankings / XP data
  const [rankingsMap, setRankingsMap] = useState({});

  // Estados Formulario Rutina
  const [routineName, setRoutineName] = useState('');
  const [days, setDays] = useState([{ id: crypto.randomUUID(), dayNumber: 1, exercises: [] }]);

  // =========================================================
  // FETCH: Cargar alumnos al montar el componente
  // =========================================================
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await axios.get(`${API_URL}/students/`);
      setStudents(res.data || []);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchRankings();
  }, [fetchStudents]);

  // Fetch rankings for XP display
  const fetchRankings = async () => {
    try {
      const res = await axios.get(`${API_URL}/rankings`);
      const map = {};
      (res.data?.rankings || []).forEach(r => { map[r.student_id] = r; });
      setRankingsMap(map);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
  };

  // =========================================================
  // FETCH: Biblioteca de Ejercicios al montar el componente
  // =========================================================
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get(`${API_URL}/exercises`);
        const data = response.data;
        if (data && data.length > 0) {
          setExerciseLibrary(data);
          setSelectedExerciseId(data[0].id);
        }
      } catch (error) {
        console.error("Error al cargar la biblioteca de ejercicios:", error);
      }
    };
    fetchExercises();
  }, []);

  // =========================================================
  // FETCH: Performance data cuando se selecciona un alumno
  // =========================================================
  const fetchPerformance = async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/student/${studentId}/performance`);
      setPerformanceData(response.data);
    } catch (error) {
      console.error("Error al cargar rendimiento:", error);
      setPerformanceData(null);
    }
  };

  const fetchPhotos = async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/student/${studentId}/photos`);
      setStudentPhotos(response.data || []);
    } catch (error) {
      console.error("Error al cargar fotos:", error);
      setStudentPhotos([]);
    }
  };

  // =========================================================
  // FETCH: Rutina activa del alumno
  // =========================================================
  const fetchActiveRoutine = async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/student/${studentId}/next-workout`);
      const data = response.data;
      setActiveRoutine({
        routine_id: data.routine_id,
        routine_name: data.routine_name,
        current_day: data.current_day,
        total_days: data.total_days
      });
      // Try to fetch all exercises
      const allResp = await axios.get(`${API_URL}/routines/${data.routine_id}/exercises`);
      setRoutineExercises(allResp.data || []);
    } catch (error) {
      console.error("Error al cargar rutina activa:", error);
      setActiveRoutine(null);
      setRoutineExercises([]);
    }
  };

  const fetchNutritionPlan = async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/student/${studentId}/nutrition`);
      setNutritionPlan(response.data);
    } catch (error) {
      console.error("Error al cargar nutrición:", error);
      setNutritionPlan(null);
    }
  };

  // =========================================================
  // DELETE: Eliminar alumno
  // =========================================================
  const handleDeleteStudent = async (studentId, studentName) => {
    if (!confirm(`¿Estás seguro de que querés eliminar a "${studentName}"? Esta acción no se puede deshacer.`)) return;
    setDeletingStudentId(studentId);
    try {
      await axios.delete(`${API_URL}/students/${studentId}`);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
        setCurrentView('ListaAlumnos');
      }
    } catch (err) {
      alert('Error al eliminar alumno: ' + (err.response?.data?.detail || err.message));
    } finally {
      setDeletingStudentId(null);
    }
  };

  // Factory de un ejercicio usando datos reales de la biblioteca
  const createExercise = (exId) => {
    const exDef = exerciseLibrary.find(e => e.id === exId);
    return {
      id: crypto.randomUUID(),
      exerciseId: exDef ? exDef.id : 'unknown',
      exerciseName: exDef ? exDef.name : 'Desconocido',
      muscleGroup: exDef ? exDef.muscle_group : '',
      sets: 3,
      progressionModel: 'autoregulation',
      targetRpe: 'rpe8',
      repMin: 8,
      repMax: 12
    };
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    fetchPerformance(student.id);
    fetchPhotos(student.id);
    fetchActiveRoutine(student.id);
    fetchNutritionPlan(student.id);
    setCurrentView('PerfilAlumno');
  };

  const handleCreateRoutineClick = () => {
    setRoutineName('');
    setDays([{ id: crypto.randomUUID(), dayNumber: 1, exercises: [] }]);
    setCurrentView('CrearRutina');
  };

  const handleAddDay = () => {
    setDays([...days, { id: crypto.randomUUID(), dayNumber: days.length + 1, exercises: [] }]);
  };

  const handleAddExerciseToDay = (dayId) => {
    if (!selectedExerciseId) return;
    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, exercises: [...day.exercises, createExercise(selectedExerciseId)] }
        : day
    ));
  };

  const handleRemoveExercise = (dayId, exerciseIdToRemove) => {
    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseIdToRemove) }
        : day
    ));
  };

  const handleExerciseChange = (dayId, exerciseId, field, value) => {
    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, exercises: day.exercises.map(ex => ex.id === exerciseId ? { ...ex, [field]: value } : ex) }
        : day
    ));
  };

  const handleSaveRoutine = async () => {
    const totalExercises = days.reduce((acc, day) => acc + day.exercises.length, 0);
    if (totalExercises === 0) {
      alert("Agregá al menos un ejercicio a la rutina.");
      return;
    }

    try {
      // 1. Crear la rutina en el backend
      const routineResponse = await axios.post(`${API_URL}/routines/`, {
        name: routineName,
        student_id: selectedStudent.id,
        current_day: 1
      });
      const routineId = routineResponse.data.id;

      // 2. Crear los workout_exercises en el backend
      for (const day of days) {
        for (const ex of day.exercises) {
          let numericRpe = 8;
          if (ex.targetRpe === 'rpe7') numericRpe = 7;
          if (ex.targetRpe === 'rpe8') numericRpe = 8;
          if (ex.targetRpe === 'rpe9') numericRpe = 9;
          if (ex.targetRpe === 'rpe10') numericRpe = 10;

          await axios.post(`${API_URL}/workout-exercises/`, {
            routine_id: routineId,
            exercise_id: ex.exerciseId,
            day_number: day.dayNumber,
            sets: Number(ex.sets),
            progression_model: ex.progressionModel,
            rep_range_min: Number(ex.repMin),
            rep_range_max: Number(ex.repMax),
            target_rpe: numericRpe
          });
        }
      }

      alert(`✅ Rutina "${routineName}" guardada con ${totalExercises} ejercicios. ¡Ya está disponible para el alumno!`);
      setCurrentView('PerfilAlumno');
    } catch (error) {
      console.error("Error guardando rutina:", error);
      alert("❌ Error al guardar la rutina: " + (error.response?.data?.detail || error.message));
    }
  };

  // =========================================================
  // HELPER: Preparar datos para Recharts (e1RM over time)
  // =========================================================
  const buildChartData = () => {
    if (!performanceData || !performanceData.exercises || performanceData.exercises.length === 0) return null;

    // Consolidar todos los timestamps y e1RMs por ejercicio
    const allDates = new Set();
    performanceData.exercises.forEach(ex => {
      ex.history.forEach(h => {
        const dateLabel = new Date(h.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        allDates.add(dateLabel);
      });
    });

    const sortedDates = [...allDates];

    const chartData = sortedDates.map(date => {
      const point = { date };
      performanceData.exercises.forEach(ex => {
        const entry = ex.history.find(h =>
          new Date(h.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) === date
        );
        point[ex.exercise_name] = entry ? entry.e1rm : null;
      });
      return point;
    });

    return chartData;
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Dumbbell className="brand-icon" />
          <h2>FitPro Hub</h2>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${currentView === 'ListaAlumnos' ? 'active' : ''}`}
            onClick={() => {
              setSelectedStudent(null);
              setCurrentView('ListaAlumnos');
            }}
          >
            <Users size={20} />
            <span>Mis Alumnos</span>
          </button>
          <button className="nav-item">
            <FileText size={20} />
            <span>Plantillas de Rutinas</span>
          </button>
          <button className="nav-item">
            <Dumbbell size={20} />
            <span>Biblioteca</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar avatar-prof">P</div>
            <div>
              <p className="user-name">Profesor</p>
              <p className="user-role">Cuenta Pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* PANEL PRINCIPAL */}
      <main className="main-content">

        {/* VISTA 1: LISTA DE ALUMNOS */}
        {currentView === 'ListaAlumnos' && (
          <div className="view-fade-in">
            <header className="main-header flex-between">
              <div>
                <h1>Mis Alumnos</h1>
                <p className="subtitle">Gestiona el progreso y asigna rutinas</p>
              </div>
              <button className="btn-primary" onClick={() => setShowNewStudentForm(true)}>
                <UserPlus size={18} />
                <span>Nuevo Alumno</span>
              </button>
            </header>

            {/* MODAL: Nuevo Alumno */}
            {showNewStudentForm && (
              <div className="card" style={{ marginBottom: '24px', position: 'relative' }}>
                <button style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowNewStudentForm(false)}>
                  <X size={20} color="#71717A" />
                </button>
                <div className="card-header">
                  <UserPlus size={20} className="icon-accent" />
                  <h2>Registrar Nuevo Alumno</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <label className="form-label">Nombre completo *</label>
                    <input className="form-input" placeholder="Ej: Juan Pérez" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input className="form-input" placeholder="juan@email.com" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Edad</label>
                    <input className="form-input" type="number" placeholder="25" value={newStudent.age} onChange={e => setNewStudent({ ...newStudent, age: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Peso (kg)</label>
                    <input className="form-input" type="number" step="0.1" placeholder="75" value={newStudent.weight_kg} onChange={e => setNewStudent({ ...newStudent, weight_kg: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Altura (cm)</label>
                    <input className="form-input" type="number" placeholder="175" value={newStudent.height_cm} onChange={e => setNewStudent({ ...newStudent, height_cm: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Objetivo</label>
                    <select className="form-input" value={newStudent.goal} onChange={e => setNewStudent({ ...newStudent, goal: e.target.value })}>
                      <option value="Hipertrofia">Hipertrofia</option>
                      <option value="Fuerza">Fuerza</option>
                      <option value="Pérdida de grasa">Pérdida de grasa</option>
                      <option value="Recomposición">Recomposición corporal</option>
                      <option value="Salud general">Salud general</option>
                    </select>
                  </div>
                </div>
                <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }} disabled={!newStudent.name || savingStudent}
                  onClick={async () => {
                    setSavingStudent(true);
                    try {
                      await axios.post(`${API_URL}/students/`, {
                        name: newStudent.name,
                        email: newStudent.email || null,
                        age: newStudent.age ? Number(newStudent.age) : null,
                        weight_kg: newStudent.weight_kg ? Number(newStudent.weight_kg) : null,
                        height_cm: newStudent.height_cm ? Number(newStudent.height_cm) : null,
                        goal: newStudent.goal
                      });
                      const res = await axios.get(`${API_URL}/students/`);
                      setStudents(res.data);
                      setNewStudent({ name: '', email: '', age: '', weight_kg: '', height_cm: '', goal: 'Hipertrofia' });
                      setShowNewStudentForm(false);
                    } catch (err) {
                      alert('Error al crear alumno: ' + (err.response?.data?.detail || err.message));
                    } finally {
                      setSavingStudent(false);
                    }
                  }}
                >
                  <Save size={18} />
                  <span>{savingStudent ? 'Guardando...' : 'Guardar Alumno'}</span>
                </button>
              </div>
            )}

            <div className="students-grid">
              {loadingStudents ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  <Loader2 size={48} color="#3B82F6" className="spin-icon" />
                  <h3 style={{ color: '#A1A1AA', marginTop: '12px' }}>Cargando alumnos...</h3>
                </div>
              ) : students.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  <Users size={48} color="#52525B" />
                  <h3 style={{ color: '#A1A1AA', marginTop: '12px' }}>No hay alumnos registrados</h3>
                  <p style={{ color: '#52525B' }}>Hacé click en "Nuevo Alumno" para empezar.</p>
                </div>
              ) : null}
              {students.map(student => (
                <div
                  key={student.id}
                  className="card student-card interactive"
                  onClick={() => handleStudentClick(student)}
                >
                  <div className="student-card-header">
                    <div className="avatar avatar-student" style={{ backgroundColor: '#6366F1', color: '#fff', fontSize: '18px', fontWeight: 700 }}>
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 className="student-name">{student.name}</h3>
                      <span className={`status-badge ${student.status === 'Activo' ? 'active' : 'inactive'}`}>
                        {student.status || 'Activo'}
                      </span>
                    </div>
                    <button
                      className="btn-icon-danger"
                      title="Eliminar alumno"
                      onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id, student.name); }}
                    >
                      {deletingStudentId === student.id ? <Loader2 size={18} className="spin-icon" /> : <Trash2 size={18} />}
                    </button>
                  </div>

                  <div className="student-card-stats">
                    {student.goal && (
                      <div className="stat">
                        <span className="stat-label">Objetivo</span>
                        <span className="stat-value">{student.goal}</span>
                      </div>
                    )}
                    {student.weight_kg && (
                      <div className="stat">
                        <span className="stat-label">Peso</span>
                        <span className="stat-value">{student.weight_kg} kg</span>
                      </div>
                    )}
                    {student.height_cm && (
                      <div className="stat">
                        <span className="stat-label">Altura</span>
                        <span className="stat-value">{student.height_cm} cm</span>
                      </div>
                    )}
                    <div className="stat">
                      <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flame size={12} color="#F59E0B" /> XP
                      </span>
                      <span className="stat-value" style={{ color: '#F59E0B' }}>
                        {(rankingsMap[student.id]?.total_xp || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA 2: PERFIL DEL ALUMNO */}
        {currentView === 'PerfilAlumno' && selectedStudent && (
          <div className="view-fade-in">
            <button
              className="btn-back"
              onClick={() => setCurrentView('ListaAlumnos')}
            >
              <ChevronLeft size={20} />
              Volver a Alumnos
            </button>

            <header className="profile-header">
              <div className="avatar avatar-student" style={{ width: 64, height: 64, backgroundColor: '#6366F1', color: '#fff', fontSize: '28px', fontWeight: 700, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedStudent.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1>{selectedStudent.name}</h1>
                <span className={`status-badge ${selectedStudent.status === 'Activo' ? 'active' : 'inactive'}`}>
                  {selectedStudent.status || 'Activo'}
                </span>
              </div>
            </header>

            <div className="profile-grid">
              {/* IZQUIERDA: RENDIMIENTO CON GRÁFICO REAL */}
              <section className="card">
                <div className="card-header">
                  <Activity size={20} className="icon-accent" />
                  <h2>Progresión e1RM</h2>
                </div>

                {performanceData && performanceData.exercises && performanceData.exercises.length > 0 ? (
                  <>
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={buildChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                          <YAxis stroke="#71717a" fontSize={12} unit="kg" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 12, color: '#fafafa' }}
                            labelStyle={{ color: '#a1a1aa' }}
                          />
                          <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
                          {performanceData.exercises.map((ex, i) => (
                            <Line
                              key={ex.exercise_id}
                              type="monotone"
                              dataKey={ex.exercise_name}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              connectNulls
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Stats rápidos debajo del gráfico */}
                    <div className="stats-list" style={{ marginTop: '16px' }}>
                      {performanceData.exercises.map((ex, i) => {
                        const lastEntry = ex.history[ex.history.length - 1];
                        return (
                          <div className="stat-item" key={ex.exercise_id}>
                            <span className="stat-label">{ex.exercise_name} (e1RM)</span>
                            <span className="stat-value highlight" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                              {lastEntry ? `${lastEntry.e1rm} kg` : '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <Activity size={40} className="empty-icon" />
                    <h3>Sin datos de rendimiento</h3>
                    <p>Este alumno aún no tiene logs registrados.</p>
                  </div>
                )}
              </section>

              {/* DERECHA: PLAN ACTUAL */}
              <section className="card flex-col">
                <div className="card-header">
                  <Target size={20} className="icon-accent" />
                  <h2>Plan Actual</h2>
                </div>

                {activeRoutine ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>{activeRoutine.routine_name}</h3>
                      <p style={{ color: '#A1A1AA', fontSize: '0.9rem' }}>
                        Día actual del alumno: <strong style={{ color: '#3B82F6' }}>{activeRoutine.current_day}</strong> de {activeRoutine.total_days}
                      </p>
                    </div>

                    {/* Agrupamos por día */}
                    {[1, 2, 3, 4, 5].map(dayNum => {
                      const exDay = routineExercises.filter(e => e.day_number === dayNum);
                      if (exDay.length === 0) return null;

                      return (
                        <div key={dayNum} style={{ marginBottom: '16px' }}>
                          <h4 style={{ color: '#FAFAFA', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #3F3F46', paddingBottom: '4px' }}>Día {dayNum}</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {exDay.map((ex, i) => (
                              <div key={ex.id || i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px', backgroundColor: '#27272A', borderRadius: '10px', fontSize: '0.9rem'
                              }}>
                                <span style={{ fontWeight: 600 }}>{ex.exercises?.name || 'Ejercicio'}</span>
                                <span style={{ color: '#71717A', fontSize: '0.8rem' }}>
                                  {ex.sets} sets · {ex.rep_range_min}-{ex.rep_range_max} reps
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Dumbbell size={48} className="empty-icon" />
                    <h3>Sin rutina activa</h3>
                    <p>Este alumno no tiene una rutina asignada para este bloque.</p>
                  </div>
                )}

                <div className="mt-auto">
                  <button
                    className="btn-primary w-full massive-btn"
                    onClick={handleCreateRoutineClick}
                  >
                    + Asignar Nueva Rutina
                  </button>
                </div>
              </section>

              {/* PLAN NUTRICIONAL */}
              <section className="card flex-col">
                <div className="card-header">
                  <Flame size={20} className="icon-accent" />
                  <h2>Plan Nutricional</h2>
                </div>
                {nutritionPlan ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>{nutritionPlan.plan_name}</h3>
                    <p style={{ color: '#10B981', fontWeight: 600, marginBottom: '16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>
                      {nutritionPlan.objectives?.calories} kcal  |  P: {nutritionPlan.objectives?.protein}g  |  C: {nutritionPlan.objectives?.carbs}g
                    </p>

                    <h4 style={{ color: '#FAFAFA', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #3F3F46', paddingBottom: '4px' }}>Comidas</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {(nutritionPlan.meals || []).map(m => (
                        <div key={m.id} style={{ backgroundColor: '#27272A', padding: '12px', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 700, color: '#FAFAFA' }}>{m.emoji} {m.name}</span>
                            <span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>{m.time}</span>
                          </div>
                          {(m.options && m.options.length > 0) && (
                            <p style={{ color: '#D4D4D8', fontSize: '0.85rem' }}>{m.options[0].items?.join(', ')}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <h4 style={{ color: '#FAFAFA', fontSize: '1rem', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid #3F3F46', paddingBottom: '4px' }}>Suplementación</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(nutritionPlan.supplements || []).map(sup => (
                        <div key={sup.name} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#18181B', border: '1px solid #3F3F46', padding: '8px', borderRadius: '8px' }}>
                          <span style={{ color: '#D4D4D8', fontSize: '0.85rem' }}>{sup.name}</span>
                          <span style={{ color: '#A1A1AA', fontSize: '0.8rem' }}>{sup.when}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <Flame size={48} className="empty-icon" />
                    <h3>Sin Plan Nutricional</h3>
                    <p>No hay registro de nutrición para {selectedStudent.name}.</p>
                  </div>
                )}
              </section>
            </div>

            {/* SECCIÓN: FOTOS DE PROGRESO CORPORAL */}
            <section className="card" style={{ marginTop: '24px' }}>
              <div className="card-header">
                <Camera size={20} className="icon-accent" />
                <h2>Progreso Corporal</h2>
              </div>

              {studentPhotos.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px',
                  marginTop: '16px'
                }}>
                  {studentPhotos.map(photo => (
                    <div key={photo.id} style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid #27272a',
                      backgroundColor: '#18181b'
                    }}>
                      <img
                        src={photo.photo_url}
                        alt="Progreso"
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '8px', textAlign: 'center' }}>
                        <span style={{ color: '#71717a', fontSize: '11px' }}>
                          {new Date(photo.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Camera size={40} className="empty-icon" />
                  <h3>Sin fotos de progreso</h3>
                  <p>El alumno aún no subió fotos desde la app.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* VISTA 3: CREADOR DE RUTINAS */}
        {currentView === 'CrearRutina' && selectedStudent && (
          <div className="view-fade-in builder-view">
            <div className="flex-between mb-6 toolbar-mobile">
              <button
                className="btn-back no-margin shrink-0"
                onClick={() => setCurrentView('PerfilAlumno')}
              >
                <ChevronLeft size={20} />
                Atrás
              </button>

              <button className="btn-primary w-full-mobile shrink-0" onClick={handleSaveRoutine}>
                <Save size={18} />
                <span>Guardar Rutina</span>
              </button>
            </div>

            <header className="builder-header mb-6">
              <h1>Rutina de <span className="text-accent">{selectedStudent.name}</span></h1>
              <input
                className="routine-title-input w-full"
                type="text"
                placeholder="Nombre de la Rutina (ej. Fase 1: Fuerza)"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
              />
            </header>

            {/* SELECTOR GLOBAL DE BIBLIOTECA */}
            <div className="card add-exercise-card mb-6 mb-mobile-4">
              <div className="flex-col gap-sm">
                <label>Biblioteca de Ejercicios</label>
                <div className="flex-row-mobile-stack">
                  <select
                    className="flex-1 select-large"
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                  >
                    {exerciseLibrary.length === 0 ? (
                      <option value="">Cargando ejercicios...</option>
                    ) : (
                      exerciseLibrary.map(ex => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} — {ex.muscle_group} ({ex.equipment})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* LISTA DINÁMICA DE DÍAS Y EJERCICIOS */}
            <div className="days-list">
              {days.map((day) => (
                <div key={day.id} className="day-container mb-6 card" style={{ padding: '20px', border: '1px solid #27272a' }}>
                  <div className="flex-between mb-4">
                    <h2>Día {day.dayNumber}</h2>
                    <button className="btn-secondary" onClick={() => handleAddExerciseToDay(day.id)}>
                      <Plus size={18} />
                      <span>Agregar al Día {day.dayNumber}</span>
                    </button>
                  </div>

                  <div className="exercises-list">
                    {day.exercises.length === 0 && (
                      <div className="empty-state">
                        <p>Seleccioná un ejercicio arriba y hacé click en "Agregar".</p>
                      </div>
                    )}
                    {day.exercises.map((exercise, index) => (
                      <div key={exercise.id} className="exercise-row" style={{ marginTop: '10px' }}>
                        <div className="exercise-row-header">
                          <div className="exercise-number">{index + 1}</div>
                          <h3 className="exercise-name-display">{exercise.exerciseName}</h3>
                          {exercise.muscleGroup && (
                            <span style={{ color: '#6366F1', fontSize: '12px', fontWeight: 600, marginLeft: '8px' }}>
                              {exercise.muscleGroup}
                            </span>
                          )}
                          <button
                            className="btn-icon-danger ml-auto"
                            title="Eliminar ejercicio"
                            onClick={() => handleRemoveExercise(day.id, exercise.id)}
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="exercise-inputs-grid">
                          <div className="input-group">
                            <label>Progresión</label>
                            <select
                              value={exercise.progressionModel}
                              onChange={(e) => handleExerciseChange(day.id, exercise.id, 'progressionModel', e.target.value)}
                            >
                              <option value="autoregulation">Auto-regulación por RPE</option>
                              <option value="linear">Sobrecarga Lineal</option>
                              <option value="maintenance">Mantenimiento</option>
                            </select>
                          </div>

                          <div className="input-group">
                            <label>Series</label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => handleExerciseChange(day.id, exercise.id, 'sets', e.target.value)}
                            />
                          </div>

                          <div className="input-group">
                            <label>Reps (Min-Max)</label>
                            <div className="input-double">
                              <input
                                type="number"
                                value={exercise.repMin}
                                onChange={(e) => handleExerciseChange(day.id, exercise.id, 'repMin', e.target.value)}
                                placeholder="Min"
                              />
                              <span className="separator">-</span>
                              <input
                                type="number"
                                value={exercise.repMax}
                                onChange={(e) => handleExerciseChange(day.id, exercise.id, 'repMax', e.target.value)}
                                placeholder="Max"
                              />
                            </div>
                          </div>

                          <div className="input-group">
                            <label>Esfuerzo Objetivo</label>
                            <select
                              value={exercise.targetRpe}
                              onChange={(e) => handleExerciseChange(day.id, exercise.id, 'targetRpe', e.target.value)}
                            >
                              <option value="rpe7">RPE 7 (3 RIR - Fácil)</option>
                              <option value="rpe8">RPE 8 (2 RIR - Exigente)</option>
                              <option value="rpe9">RPE 9 (1 RIR - Muy Pesado)</option>
                              <option value="rpe10">RPE 10 (Al fallo absoluto)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-secondary w-full" onClick={handleAddDay} style={{ marginTop: '10px', padding: '15px' }}>
              <Plus size={20} />
              <span>+ Agregar Nuevo Día</span>
            </button>

          </div>
        )}

      </main>
    </div>
  );
}
