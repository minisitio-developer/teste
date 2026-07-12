import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useBiData from './useBiData';
import BiTable from './BiTable';
import BiCard from './BiCard';

export default function AtividadesPage() {
  const { data, loading, error, refreshing, refresh, lastUpdated } = useBiData();

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      { title: 'Total Atividades', value: data.porAtividade?.length || 0, color: '#fd7e14', icon: 'fa-tasks' },
      { title: 'Total Anúncios', value: data.total, color: '#0d6efd', icon: 'fa-file-text' },
      { title: 'Total Ativos', value: data.ativos, color: '#198754', icon: 'fa-check-circle' },
      { title: 'Campanhas', value: data.porAtividade?.reduce((s, a) => s + (a.campanhas || 0), 0) || 0, color: '#dc3545', icon: 'fa-bullhorn' },
      { title: 'Tel. Atualizar', value: data.porAtividade?.reduce((s, a) => s + (a.telAtualizar || 0), 0) || 0, color: '#20c997', icon: 'fa-phone' },
      { title: 'Email Atualizar', value: data.porAtividade?.reduce((s, a) => s + (a.emailAtualizar || 0), 0) || 0, color: '#6f42c1', icon: 'fa-envelope' },
    ];
  }, [data]);

  const columns = useMemo(() => [
    { key: 'atividade', label: 'Atividade', render: (v) => <span style={{ maxWidth: 350, display: 'inline-block', whiteSpace: 'normal', wordBreak: 'break-word' }}>{v || '-'}</span> },
    { key: 'total', label: 'Total', className: 'text-end fw-semibold' },
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
  if (!data?.porAtividade) return null;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="m-0 fw-bold" style={{ color: '#1a1a2e' }}><i className="fa fa-tasks me-2" style={{ color: '#fd7e14' }}></i>Atividades</h4>
          <small className="text-muted">Distribuição por atividade</small>
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
            <i className="fa fa-table me-1" style={{ color: '#fd7e14' }}></i> Tabela por Atividade
          </small>
        </div>
        <div className="card-body p-3">
          <BiTable columns={columns} data={data.porAtividade} searchPlaceholder="Buscar atividade..." />
        </div>
      </div>
    </div>
  );
}
