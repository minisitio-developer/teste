import React, { useState, useRef, useEffect } from 'react';

const ColumnFilter = ({ values, selected, onChange, label }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const uniqueValues = [...new Set(values.map(v => String(v || '')).filter(v => v !== ''))].sort();
    const filtered = uniqueValues.filter(v => v.toLowerCase().includes(search.toLowerCase()));

    function toggleAll() {
        if (selected.length === uniqueValues.length) {
            onChange([]);
        } else {
            onChange([...uniqueValues]);
        }
    }

    function toggle(value) {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value));
        } else {
            onChange([...selected, value]);
        }
    }

    const hasFilter = selected.length > 0 && selected.length < uniqueValues.length;

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                style={{
                    background: hasFilter ? '#0d6efd' : 'transparent',
                    color: hasFilter ? '#fff' : '#666',
                    border: hasFilter ? '1px solid #0d6efd' : '1px solid #ccc',
                    borderRadius: '3px',
                    padding: '1px 6px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    lineHeight: '14px',
                }}
                title={label || 'Filtrar'}
            >
                <i className="fa fa-filter"></i>
            </button>
            {open && (
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 9999,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        minWidth: '160px',
                        maxHeight: '250px',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ padding: '4px', borderBottom: '1px solid #eee' }}>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Buscar..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ fontSize: '11px' }}
                            autoFocus
                        />
                    </div>
                    <div
                        onClick={toggleAll}
                        style={{
                            padding: '4px 8px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            background: selected.length === uniqueValues.length ? '#e9ecef' : '#fff',
                        }}
                    >
                        {selected.length === uniqueValues.length ? '(Limpar)' : '(Selecionar Todos)'}
                    </div>
                    <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                        {filtered.map((value, idx) => (
                            <div
                                key={idx}
                                onClick={() => toggle(value)}
                                style={{
                                    padding: '3px 8px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    background: selected.includes(value) ? '#e7f1ff' : '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#d0e7ff'}
                                onMouseLeave={e => e.currentTarget.style.background = selected.includes(value) ? '#e7f1ff' : '#fff'}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(value)}
                                    readOnly
                                    style={{ margin: 0 }}
                                />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {value}
                                </span>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div style={{ padding: '6px 8px', fontSize: '11px', color: '#999' }}>
                                Nenhum valor
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnFilter;
