/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const getRedirectUrl = (ruta: string) => {
  const entorno = process.env.NEXT_PUBLIC_ENV?.trim();

  if (!entorno) {
    return ruta;
  }

  return `/${entorno.replace(/^\/+|\/+$/g, '')}/${ruta.replace(/^\/+/, '')}`;
};

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError('');
    setCargando(true);

    try {
      const respuesta = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, password }),
      });

      if (!respuesta.ok) {
        throw new Error('Correo o contraseña incorrectos');
      }

      const data = await respuesta.json();

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // 👇 2. Determina el destino base según el rol
      const rutaBase = data.usuario.rol === 'admin' ? '/dashboard/admin' : '/dashboard/docente';

      // 👇 3. Envuelve la ruta con el helper para que anteponga /qa o /prod automáticamente
      const destinoFinal = getRedirectUrl(rutaBase);
      
      router.push(destinoFinal);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1f2937', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sistema de Informes</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={manejarLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
              Correo Institucional
            </label>
            <input 
              type="email" 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
              placeholder="ejemplo@uce.edu.ec"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
              placeholder="********"
            />
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              backgroundColor: cargando ? '#9ca3af' : '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              cursor: cargando ? 'not-allowed' : 'pointer'
            }}
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
}