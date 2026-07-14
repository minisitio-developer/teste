import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import useBiData from './useBiData';

const menuItems = [
  { path: '/admin/bi', label: 'Dashboard', icon: 'fa-dashboard', exact: true },
  { path: '/admin/bi/id', label: 'Perfis por ID', icon: 'fa-hashtag' },
  { path: '/admin/bi/ufs', label: 'Perfis por UF', icon: 'fa-globe' },
  { path: '/admin/bi/cadernos', label: 'Perfis por Caderno', icon: 'fa-book' },
  { path: '/admin/bi/perfis-por-atividade', label: 'Perfis por Atividade', icon: 'fa-tasks' },
  { path: '/admin/bi/campanhas', label: 'Campanhas', icon: 'fa-bullhorn' },
  { path: '/admin/bi/contatos', label: 'Contatos', icon: 'fa-address-card' },
];

export default function BILayout() {
  const { data, loading, refreshing, refresh, lastUpdated } = useBiData();

  return (
    <div className="d-flex" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <div style={{
        width: 220, minWidth: 220, background: '#1a1a2e',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        overflowY: 'auto', paddingTop: 8
      }}>
        <div className="px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h6 style={{ color: '#e0e0e0', fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>
            <i className="fa fa-bar-chart me-2"></i>BI
          </h6>
        </div>
        <nav className="mt-2">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', textDecoration: 'none',
                fontSize: '0.85rem', fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : '#8899aa',
                background: isActive ? 'rgba(13,110,253,0.2)' : 'transparent',
                borderLeft: isActive ? '3px solid #0d6efd' : '3px solid transparent',
                transition: 'all 0.2s'
              })}
            >
              <i className={`fa ${item.icon}`} style={{ width: 18, textAlign: 'center' }}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div style={{ flex: 1, overflow: 'auto', background: '#f5f6fa' }}>
        <div className="d-flex justify-content-end align-items-center gap-2 px-3 py-2"
          style={{ background: '#fff', borderBottom: '1px solid #e0e0e0' }}>
          <small className="text-muted">
            {loading ? 'Carregando...' : lastUpdated
              ? <><i className="fa fa-clock-o me-1"></i>{new Date(lastUpdated).toLocaleString('pt-BR')}</>
              : 'Cache vazio'}
          </small>
          <button className="btn btn-sm btn-primary" style={{ borderRadius: 6, fontSize: '0.75rem' }}
            onClick={refresh} disabled={refreshing || loading}>
            {refreshing ? <><i className="fa fa-spinner fa-spin"></i></> : <><i className="fa fa-refresh me-1"></i>Atualizar</>}
          </button>
          <Link to="/admin/dashboard" className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 6, fontSize: '0.75rem' }}>
            <i className="fa fa-arrow-left me-1"></i>Admin
          </Link>
        </div>
        <Outlet context={{ data, loading, error: null, refresh }} />
      </div>
    </div>
  );
}
