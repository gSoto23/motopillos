"use client";
import { useState } from 'react';
import { Lock, Loader2, Key } from 'lucide-react';
import { useUI } from '@/context/UIContext';

export default function ChangePassword() {
  const { showToast } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Las contraseñas nuevas no coinciden', 'error');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast(data.message || 'Contraseña actualizada', 'success');
        setIsOpen(false);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.error || 'Error actualizando contraseña', 'error');
      }
    } catch (e) {
      showToast('Error de red', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}
      >
        <Key size={18} /> Cambiar Contraseña
      </button>
    );
  }

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Lock size={18} /> Cambiar Contraseña
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Contraseña Actual</label>
          <input 
            type="password" 
            required
            value={formData.currentPassword}
            onChange={e => setFormData({...formData, currentPassword: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nueva Contraseña</label>
          <input 
            type="password" 
            required
            value={formData.newPassword}
            onChange={e => setFormData({...formData, newPassword: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Confirmar Nueva Contraseña</label>
          <input 
            type="password" 
            required
            value={formData.confirmPassword}
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            style={{ flex: 1, padding: '0.6rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            style={{ flex: 1, padding: '0.6rem', background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
