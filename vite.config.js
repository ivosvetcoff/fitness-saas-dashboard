import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'elizondo-fitness.html'),
        registro: resolve(__dirname, 'registro.html'),
        'vistas/perfil_alumno': resolve(__dirname, 'vistas/perfil_alumno.html'),
        'vistas/inicio_alumno': resolve(__dirname, 'vistas/inicio_alumno.html'),
        'vistas/panel_lista_alumnos_mobile': resolve(__dirname, 'vistas/panel_lista_alumnos_mobile.html'),
        'vistas/detalle_alumno_mobile': resolve(__dirname, 'vistas/detalle_alumno_mobile.html'),
        'vistas/panel_lista_alumnos_web': resolve(__dirname, 'vistas/panel_lista_alumnos_web.html'),
        'vistas/detalle_alumno_web': resolve(__dirname, 'vistas/detalle_alumno_web.html'),
      },
    },
  },
})
