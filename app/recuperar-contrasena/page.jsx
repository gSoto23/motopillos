"use client";
import { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Ocurrió un error. Intenta de nuevo.');
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
            <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Revisa tu correo</h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
              Si existe una cuenta asociada a <strong>{email}</strong>, hemos enviado las instrucciones para restablecer tu contraseña.
            </p>
            <Link href="/login" style={{ display: 'inline-block', padding: '0.8rem 2rem', background: 'var(--accent-red)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
              Volver a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Recuperar Contraseña</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan@ejemplo.com"
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

              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '8px' }}>
                  {error}
                </div>
              )}

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
                {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Enviar Enlace'}
                {!loading && <ArrowRight size={20} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  ¿Recordaste tu contraseña? <span style={{ color: 'var(--accent-red)' }}>Inicia Sesión</span>
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
