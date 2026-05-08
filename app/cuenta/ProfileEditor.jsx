"use client";
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUI } from '@/context/UIContext';

export default function ProfileEditor({ user }) {
  const router = useRouter();
  const { showToast } = useUI();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  let parsedAddress = { provincia: '', canton: '', distrito: '', exacta: '', formatted: '' };
  if (user.address) {
    try {
      parsedAddress = JSON.parse(user.address);
    } catch(e) {
      parsedAddress.exacta = user.address;
      parsedAddress.formatted = user.address;
    }
  }

  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: parsedAddress.exacta || ''
  });

  const [provincias, setProvincias] = useState({});
  const [cantones, setCantones] = useState({});
  const [distritos, setDistritos] = useState({});

  const [selectedProv, setSelectedProv] = useState(parsedAddress.provincia || '');
  const [selectedCanton, setSelectedCanton] = useState(parsedAddress.canton || '');
  const [selectedDistrito, setSelectedDistrito] = useState(parsedAddress.distrito || '');

  useEffect(() => {
    fetch('https://ubicaciones.paginasweb.cr/provincias.json')
      .then(res => res.json())
      .then(data => setProvincias(data)).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedProv) {
      fetch(`https://ubicaciones.paginasweb.cr/provincia/${selectedProv}/cantones.json`)
        .then(res => res.json())
        .then(data => { setCantones(data); })
        .catch(err => console.error(err));
    } else {
      setCantones({}); setDistritos({});
    }
  }, [selectedProv]);

  useEffect(() => {
    if (selectedProv && selectedCanton) {
      fetch(`https://ubicaciones.paginasweb.cr/provincia/${selectedProv}/canton/${selectedCanton}/distritos.json`)
        .then(res => res.json())
        .then(data => { setDistritos(data); })
        .catch(err => console.error(err));
    } else {
      setDistritos({});
    }
  }, [selectedProv, selectedCanton]);

  const handleSave = async () => {
    setLoading(true);

    const provName = provincias[selectedProv] || '';
    const canName = cantones[selectedCanton] || '';
    const distName = distritos[selectedDistrito] || '';
    
    let formatted = '';
    if (provName && canName && distName) {
      formatted = `${provName}, ${canName}, ${distName}. ${formData.address}`;
    } else {
      formatted = formData.address;
    }

    const addressData = JSON.stringify({
      provincia: selectedProv,
      canton: selectedCanton,
      distrito: selectedDistrito,
      exacta: formData.address,
      formatted: formatted
    });

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, address: addressData })
      });
      if (res.ok) {
        setIsEditing(false);
        showToast('Datos guardados exitosamente', 'success');
        router.refresh(); 
      } else {
        showToast('Error guardando los datos', 'error');
      }
    } catch (e) {
      showToast('Error de red al guardar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const displayAddress = parsedAddress.formatted || parsedAddress.exacta || 'No registrada';

  if (isEditing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Editar Datos</h3>
          <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <X size={16} /> Cancelar
          </button>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nombre</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Teléfono</label>
          <input 
            type="tel" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Provincia</label>
          <select 
            value={selectedProv} 
            onChange={e => { setSelectedProv(e.target.value); setSelectedCanton(''); setSelectedDistrito(''); }} 
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            <option value="">Seleccione Provincia</option>
            {Object.entries(provincias).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Cantón</label>
            <select 
              value={selectedCanton} 
              onChange={e => { setSelectedCanton(e.target.value); setSelectedDistrito(''); }} 
              disabled={!selectedProv} 
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', opacity: !selectedProv ? 0.5 : 1 }}
            >
              <option value="">Seleccione Cantón</option>
              {Object.entries(cantones).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Distrito</label>
            <select 
              value={selectedDistrito} 
              onChange={e => setSelectedDistrito(e.target.value)} 
              disabled={!selectedCanton} 
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', opacity: !selectedCanton ? 0.5 : 1 }}
            >
              <option value="">Seleccione Distrito</option>
              {Object.entries(distritos).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Dirección Exacta</label>
          <textarea 
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})}
            placeholder="100m norte de la iglesia..."
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '80px', resize: 'vertical' }}
          />
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading}
          style={{ padding: '0.6rem', background: 'var(--accent-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
          Guardar Cambios
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
        <button onClick={() => setIsEditing(true)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
          <Edit2 size={14} /> Editar
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={20} color="var(--text-secondary)" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nombre</p>
          <p style={{ margin: 0, fontWeight: '600' }}>{user.name}</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mail size={20} color="var(--text-secondary)" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Correo Electrónico (No editable)</p>
          <p style={{ margin: 0, fontWeight: '600' }}>{user.email}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Phone size={20} color="var(--text-secondary)" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Teléfono</p>
          <p style={{ margin: 0, fontWeight: '600' }}>{user.phone || 'No registrado'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MapPin size={20} color="var(--text-secondary)" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dirección de Envío Principal</p>
          <p style={{ margin: 0, fontWeight: '600' }}>{displayAddress}</p>
        </div>
      </div>
    </div>
  );
}
