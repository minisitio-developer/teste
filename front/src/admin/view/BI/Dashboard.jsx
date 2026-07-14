import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function DashboardPage() {
  const { data } = useOutletContext();

  const maiorUf = useMemo(() => {
    if (!data?.porUf?.length) return null;
    return [...data.porUf].sort((a, b) => b.total - a.total)[0];
  }, [data]);

  const totalUfs = data?.porUf?.length || 0;
  const totalIds = data?.porId?.length || 0;

  if (!data) return (
    <div className="d-flex justify-content-center align-items-center p-5">
      <button className="buttonload"><i className="fa fa-spinner fa-spin"></i> Carregando BI...</button>
    </div>
  );

  const cards = [
    { title: 'Perfis por ID', value: totalIds, color: '#0d6efd', icon: 'fa-hashtag', link: '/admin/bi/id',
      desc: `Total de IDs: ${formatNumber(totalIds)}` },
    { title: 'Perfis por UF', value: totalUfs, color: '#198754', icon: 'fa-globe', link: '/admin/bi/ufs',
      desc: maiorUf ? `Maior: ${maiorUf.codUf} (${formatNumber(maiorUf.total)})` : `${totalUfs} UFs` },
    { title: 'Perfis por Caderno', value: data.cadernosPorUf?.length || 0, color: '#6f42c1', icon: 'fa-book', link: '/admin/bi/cadernos',
      desc: `${data.cadernosPorUf?.length || 0} grupos UF+Caderno` },
    { title: 'Perfis por Atividade', value: data.porAtividade?.length || 0, color: '#fd7e14', icon: 'fa-tasks', link: '/admin/bi/atividades',
      desc: `${data.porAtividade?.length || 0} atividades` },
    { title: 'Campanhas', value: data.porId?.length || 0, color: '#dc3545', icon: 'fa-bullhorn', link: '/admin/bi/campanhas',
      desc: `${formatNumber(data.porId?.reduce((s, i) => s + (i.total || 0), 0) || 0)} anúncios` },
    { title: 'Contatos', value: `${formatNumber(data.semEmail || 0)} emails`, color: '#ffc107', icon: 'fa-address-card', link: '/admin/bi/contatos',
      desc: `${formatNumber(data.semTelefone || 0)} telefones p/ atualizar` },
  ];

  return (
    <div className="p-3">
      <h5 className="fw-bold mb-3" style={{ color: '#1a1a2e' }}>
        <i className="fa fa-dashboard me-2" style={{ color: '#0d6efd' }}></i>Dashboard
      </h5>

      <div className="row g-3">
        {cards.map((c, i) => (
          <div key={i} className="col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <small className="text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>{c.title}</small>
                    <div className="fw-bold" style={{ fontSize: '1.5rem', color: c.color }}>{typeof c.value === 'number' ? formatNumber(c.value) : c.value}</div>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fa ${c.icon}`} style={{ color: c.color, fontSize: '1.1rem' }}></i>
                  </div>
                </div>
                <small className="text-muted mb-2">{c.desc}</small>
                <div className="mt-auto">
                  <Link to={c.link} className="btn btn-sm btn-outline-primary w-100" style={{ borderRadius: 8, fontSize: '0.78rem' }}>
                    <i className="fa fa-search me-1"></i>Ver relatório
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mt-3">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom-0 pt-3 pb-1 px-3">
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
            <div className="card-header bg-white border-bottom-0 pt-3 pb-1 px-3">
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
