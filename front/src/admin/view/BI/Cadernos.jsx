import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useBiData from './useBiData';
import BiTable from './BiTable';
import BiCard from './BiCard';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function CadernosPage() {
  const { data, loading, error, refreshing, refresh, lastUpdated } = useBiData();

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      { title: 'Total IDs', value: data.total, color: '#0d6efd', icon: 'fa-hashtag' },
      { title: 'Total Ativos', value: data.ativos, color: '#198754', icon: 'fa-check-circle' },
      { title: 'Total Perfis', value: data.total, color: '#6f42c1', icon: 'fa-id-card' },
      { title: 'Campanhas', value: data.porUf?.reduce((s, u) => s + (u.campanhas || 0), 0) || 0, color: '#fd7e14', icon: 'fa-bullhorn' },
      { title: 'UFs', value: data.porUf?.length || 0, color: '#dc3545', icon: 'fa-globe' },
      { title: 'Telefones Atualizados', value: data.porUf?.reduce((s, u) => s + (u.telAtualizar || 0), 0) || 0, color: '#20c997', icon: 'fa-phone' },
    ];
  }, [data]);

  const columns = useMemo(() => [
    { key: 'UF', label: 'UF', className: 'fw-semibold', render: (v) => <strong>{v || 'Sem UF'}</strong> },
    { key: 'Caderno', label: 'Caderno', render: (v) => v || '-' },
    { key: 'total', label: 'Total', className: 'text-end' },
    { key: 'basico', label: 'Básicos', className: 'text-end' },
    { key: 'completo', label: 'Completos', className: 'text-end' },
    { key: 'campanhas', label: 'Campanhas', className: 'text-end' },
    { key: 'telAtualizar', label: 'Telefones', className: 'text-end' },
    { key: 'emailAtualizar', label: 'E-mails', className: 'text-end' },
  ], []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <button className="buttonload"><i className="fa fa-spinner fa-spin"></i> Carregando...</button>
    </div>
  );
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!data?.cadernosPorUf) return null;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="m-0 fw-bold" style={{ color: '#1a1a2e' }}><i className="fa fa-book me-2" style={{ color: '#6f42c1' }}></i>Cadernos</h4>
          <small className="text-muted">Distribuição por caderno e UF</small>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Link to="/admin/bi" className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 8 }}><i className="fa fa-arrow-left me-1"></i>Dashboard</Link>
          <small className="text-muted">{lastUpdated && <><i className="fa fa-clock-o me-1"></i>{new Date(lastUpdated).toLocaleString('pt-BR')}</>}</small>
          <button className="btn btn-sm btn-primary" style={{ borderRadius: 8 }} onClick={refresh} disabled={refreshing}>
            {refreshing ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-refresh"></i>}
          </button>
        </div>
      </div>

      <div className="row g-2 mb-4">
        {cards.map((c, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-2">
            <BiCard title={c.title} value={c.value} color={c.color} icon={<i className={`fa ${c.icon}`}></i>} />
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-header bg-white border-bottom-0 pt-3 pb-0 px-3">
          <small className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>
            <i className="fa fa-table me-1" style={{ color: '#6f42c1' }}></i> Tabela por Caderno
          </small>
        </div>
        <div className="card-body p-3">
          <BiTable columns={columns} data={data.cadernosPorUf} searchPlaceholder="Buscar UF ou caderno..." />
        </div>
      </div>
    </div>
  );
}
