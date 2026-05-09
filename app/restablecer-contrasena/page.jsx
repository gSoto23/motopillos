"use client";
import { useState, useEffect } from 'react';
import { Lock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RestablecerContrasenaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Enlace inválido o expirado. Por favor solicita uno nuevo.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: formData.newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Ocurrió un error. El enlace puede haber expirado.');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '450px', width: '100%', background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
            <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>¡Contraseña Restablecida!</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
              Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link href="/login" style={{ display: 'inline-block', padding: '0.8rem 2rem', background: 'var(--accent-red)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
              Iniciar Sesión
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Crear Nueva Contraseña</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Ingresa tu nueva contraseña a continuación.</p>
            </div>

            {error ? (
              <div style={{ textAlign: 'center' }}>
                <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Error</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
                <Link href="/recuperar-contrasena" style={{ display: 'inline-block', padding: '0.8rem 2rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                  Solicitar un nuevo enlace
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Nueva Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      required
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Confirmar Contraseña
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--accent-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Guardar Contraseña'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
