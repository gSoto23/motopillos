"use client";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const UIContext = createContext(null);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within a UIProvider");
  return context;
};

export const UIProvider = ({ children }) => {
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }
  const [confirmState, setConfirmState] = useState(null); // { message, onConfirm, onCancel, isPrompt, promptValue, placeholder }

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const showConfirm = useCallback((message, onConfirm, onCancel = () => {}) => {
    setConfirmState({ message, onConfirm, onCancel, isPrompt: false });
  }, []);

  const showPrompt = useCallback((message, placeholder, onConfirm, onCancel = () => {}) => {
    setConfirmState({ message, placeholder, onConfirm, onCancel, isPrompt: true, promptValue: '' });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);

  return (
    <UIContext.Provider value={{ showToast, showConfirm, showPrompt }}>
      {children}

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6'}`,
          animation: 'slideInUp 0.3s ease-out'
        }}>
          {toast.type === 'success' && <CheckCircle color="#10b981" size={20} />}
          {toast.type === 'error' && <AlertCircle color="#ef4444" size={20} />}
          {toast.type === 'info' && <Info color="#3b82f6" size={20} />}
          <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 'auto', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmState && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <AlertCircle color="var(--accent-red)" size={28} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Confirmar Acción</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: confirmState.isPrompt ? '16px' : '32px', fontSize: '1rem' }}>
              {confirmState.message}
            </p>
            {confirmState.isPrompt && (
              <input
                type="text"
                autoFocus
                placeholder={confirmState.placeholder || 'Escribe aquí...'}
                value={confirmState.promptValue || ''}
                onChange={(e) => setConfirmState(prev => ({ ...prev, promptValue: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  marginBottom: '32px',
                  fontSize: '1rem'
                }}
              />
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => {
                  confirmState.onCancel();
                  closeConfirm();
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (confirmState.isPrompt) {
                    confirmState.onConfirm(confirmState.promptValue);
                  } else {
                    confirmState.onConfirm();
                  }
                  closeConfirm();
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'var(--accent-red)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </UIContext.Provider>
  );
};
