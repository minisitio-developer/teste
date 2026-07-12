import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useBiData from './useBiData';
import BiCard from './BiCard';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function DashboardPage() {
  const { data, loading, error, refreshing, refresh, lastUpdated } = useBiData();

  const maiorUf = useMemo(() => {
    if (!data?.porUf?.length) return null;
    return [...data.porUf].sort((a, b) => b.total - a.total)[0];
  }, [data]);

  const totalUfs = data?.porUf?.length || 0;
  const totalIds = data?.porId?.length || 0;
  const totalCampanhas = data?.porId?.reduce((s, i) => s + (i.total || 0), 0) || 0;

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <button className="buttonload"><i className="fa fa-spinner fa-spin"></i> Carregando BI...</button>
    </div>
  );
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!data) return null;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="m-0 fw-bold" style={{ color: '#1a1a2e' }}>Dashboard</h4>
          <small className="text-muted">Visão geral do BI</small>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <small className="text-muted">
            {lastUpdated ? <><i className="fa fa-clock-o me-1"></i>{new Date(lastUpdated).toLocaleString('pt-BR')}</> : 'Cache vazio'}
          </small>
          <button className="btn btn-sm btn-primary" style={{ borderRadius: 8 }} onClick={refresh} disabled={refreshing}>
            {refreshing ? <><i className="fa fa-spinner fa-spin"></i> Atualizando...</> : <><i className="fa fa-refresh me-1"></i>Atualizar</>}
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg col-md-6">
          <BiCard title="Por ID" value={totalIds} color="#0d6efd" link="/admin/bi/id" linkText="Ver relatório"
            icon={<i className="fa fa-hashtag"></i>}>
            <small className="text-muted d-block mt-1">Total de IDs cadastrados</small>
            {lastUpdated && <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>Cache: {new Date(lastUpdated).toLocaleString('pt-BR')}</small>}
          </BiCard>
        </div>
        <div className="col-lg col-md-6">
          <BiCard title="Distribuição por UF" value={totalUfs} color="#198754" link="/admin/bi/ufs" linkText="Ver relatório"
            icon={<i className="fa fa-globe"></i>}>
            <small className="text-muted d-block mt-1">
              {maiorUf ? <>Maior volume: <strong>{maiorUf.codUf}</strong> ({formatNumber(maiorUf.total)})</> : '...'}
            </small>
          </BiCard>
        </div>
        <div className="col-lg col-md-6">
          <BiCard title="Qualidade de Contatos" color="#ffc107" link="/admin/bi/contatos" linkText="Ver relatório"
            icon={<i className="fa fa-envelope"></i>}>
            <div className="mt-1">
              <div className="d-flex justify-content-between small">
                <span className="text-muted">E-mails para atualizar</span>
                <span className="fw-semibold">{formatNumber(data.semEmail)}</span>
              </div>
              <div className="d-flex justify-content-between small">
                <span className="text-muted">Telefones para atualizar</span>
                <span className="fw-semibold">{formatNumber(data.semTelefone)}</span>
              </div>
              <div className="d-flex justify-content-between small fw-bold border-top pt-1 mt-1">
                <span>Total pendentes</span>
                <span>{formatNumber((data.semEmail || 0) + (data.semTelefone || 0))}</span>
              </div>
            </div>
          </BiCard>
        </div>
        <div className="col-lg col-md-6">
          <BiCard title="Por Caderno" value={formatNumber(data.total)} color="#6f42c1" link="/admin/bi/cadernos" linkText="Ver relatório"
            icon={<i className="fa fa-book"></i>}>
            <small className="text-muted d-block mt-1">
              {data.cadernosPorUf?.length || 0} grupos UF+Caderno
            </small>
            <small className="text-muted d-block">
              {data.porUf?.filter(u => !u.codUf || u.codUf === '00').length ? 'Registros sem UF' : 'Todas UFs com caderno'}
            </small>
          </BiCard>
        </div>
        <div className="col-lg col-md-6">
          <BiCard title="Campanhas" value={data.porId?.length || 0} color="#dc3545" icon={<i className="fa fa-bullhorn"></i>}>
            <small className="text-muted d-block mt-1">Total de campanhas ativas</small>
            <div className="d-flex gap-2 mt-2">
              <Link to="/admin/campanha" className="btn btn-sm btn-outline-primary" style={{ borderRadius: 6, fontSize: '0.75rem' }}>
                <i className="fa fa-external-link me-1"></i>Consulta ao vivo
              </Link>
              <Link to="/admin/bi/campanhas" className="text-decoration-none align-self-center" style={{ fontSize: '0.8rem', color: '#0d6efd' }}>
                Ver relatório →
              </Link>
            </div>
          </BiCard>
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw-semibold mb-3" style={{ color: '#1a1a2e' }}>Acesso rápido</h6>
        <div className="d-flex flex-wrap gap-2">
          {[
            { label: 'UFs', icon: 'fa-globe', to: '/admin/bi/ufs', color: '#198754' },
            { label: 'Cadernos', icon: 'fa-book', to: '/admin/bi/cadernos', color: '#6f42c1' },
            { label: 'Atividades', icon: 'fa-tasks', to: '/admin/bi/atividades', color: '#fd7e14' },
            { label: 'ID', icon: 'fa-hashtag', to: '/admin/bi/id', color: '#0d6efd' },
            { label: 'Campanhas', icon: 'fa-bullhorn', to: '/admin/bi/campanhas', color: '#dc3545' },
            { label: 'Contatos', icon: 'fa-address-card', to: '/admin/bi/contatos', color: '#ffc107' },
          ].map(item => (
            <Link key={item.label} to={item.to}
              className="btn btn-sm d-flex align-items-center gap-2 border-0 shadow-sm"
              style={{ background: '#fff', color: item.color, borderRadius: 10, padding: '8px 16px', fontWeight: 500, transition: 'all 0.2s' }}>
              <i className={`fa ${item.icon}`}></i>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom-0 pt-3 pb-0 px-3 d-flex justify-content-between align-items-center">
              <small className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>
                <i className="fa fa-bar-chart me-1" style={{ color: '#0d6efd' }}></i> Top 10 UFs por quantidade
              </small>
            </div>
            <div className="card-body p-3">
              {[...(data.porUf || [])].sort((a, b) => b.total - a.total).slice(0, 10).map((u, i) => {
                const maxTotal = Math.max(...data.porUf.map(x => x.total), 1);
                const pct = (u.total / maxTotal) * 100;
                return (
                  <div key={u.codUf} className="mb-2">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{u.codUf || 'Sem UF'}</span>
                      <span>{formatNumber(u.total)}</span>
                    </div>
                    <div className="progress" style={{ height: 6, borderRadius: 4, background: '#e9ecef' }}>
                      <div className="progress-bar" style={{ width: `${pct}%`, background: `hsl(${210 - i * 12}, 70%, 50%)`, borderRadius: 4 }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom-0 pt-3 pb-0 px-3">
              <small className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>
                <i className="fa fa-pie-chart me-1" style={{ color: '#198754' }}></i> Por tipo de perfil
              </small>
            </div>
            <div className="card-body p-3">
              {[
                { label: 'Básicos', value: data.basico, pct: data.total ? (data.basico / data.total * 100) : 0, color: '#0d6efd' },
                { label: 'Completos', value: data.completo, pct: data.total ? (data.completo / data.total * 100) : 0, color: '#198754' },
                { label: 'Capa', value: data.capa || 0, pct: data.total ? ((data.capa || 0) / data.total * 100) : 0, color: '#ffc107' },
              ].map(item => (
                <div key={item.label} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">{item.label}</span>
                    <span className="fw-semibold">{formatNumber(item.value)}</span>
                  </div>
                  <div className="progress" style={{ height: 8, borderRadius: 6, background: '#e9ecef' }}>
                    <div className="progress-bar" style={{ width: `${item.pct}%`, background: item.color, borderRadius: 6 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
