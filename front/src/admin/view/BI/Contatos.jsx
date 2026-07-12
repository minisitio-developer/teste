import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useBiData from './useBiData';
import BiCard from './BiCard';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function ContatosPage() {
  const { data, loading, error, refreshing, refresh, lastUpdated } = useBiData();

  const contatos = useMemo(() => {
    if (!data) return null;
    const total = data.total || 0;
    const semTel = data.semTelefone || 0;
    const semEmail = data.semEmail || 0;
    const ambos = data.semEmailETelefone || 0;
    const telValidos = total - semTel;
    const emailValidos = total - semEmail;
    return { total, semTel, semEmail, ambos, telValidos, emailValidos };
  }, [data]);

  const tabelaQualidade = useMemo(() => {
    if (!contatos) return [];
    return [
      { categoria: 'Sem telefone', quantidade: contatos.semTel, descricao: 'Anúncios sem telefone ou com telefone "atualizar"' },
      { categoria: 'Sem e-mail', quantidade: contatos.semEmail, descricao: 'Anúncios sem e-mail comercial ou com e-mail "atualizar"' },
      { categoria: 'Sem ambos', quantidade: contatos.ambos, descricao: 'Anúncios sem telefone E sem e-mail' },
      { categoria: 'Telefones válidos', quantidade: contatos.telValidos, descricao: 'Anúncios com telefone válido informado' },
      { categoria: 'E-mails válidos', quantidade: contatos.emailValidos, descricao: 'Anúncios com e-mail válido informado' },
      { categoria: 'Total de contatos', quantidade: contatos.total, descricao: 'Total de anúncios ativos' },
    ];
  }, [contatos]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <button className="buttonload"><i className="fa fa-spinner fa-spin"></i> Carregando...</button>
    </div>
  );
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!contatos) return null;

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="m-0 fw-bold" style={{ color: '#1a1a2e' }}><i className="fa fa-address-card me-2" style={{ color: '#ffc107' }}></i>Qualidade de Contatos</h4>
          <small className="text-muted">Indicadores de qualidade dos contatos</small>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Link to="/admin/bi" className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 8 }}><i className="fa fa-arrow-left me-1"></i>Dashboard</Link>
          <small className="text-muted">{lastUpdated && <><i className="fa fa-clock-o me-1"></i>{new Date(lastUpdated).toLocaleString('pt-BR')}</>}</small>
          <button className="btn btn-sm btn-primary" style={{ borderRadius: 8 }} onClick={refresh} disabled={refreshing}>
            {refreshing ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-refresh"></i>}
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg">
          <BiCard title="Total Contatos" value={contatos.total} color="#0d6efd" icon={<i className="fa fa-address-book"></i>} />
        </div>
        <div className="col-6 col-md-4 col-lg">
          <BiCard title="Telefones Válidos" value={contatos.telValidos} color="#198754" icon={<i className="fa fa-phone"></i>} />
        </div>
        <div className="col-6 col-md-4 col-lg">
          <BiCard title="E-mails Válidos" value={contatos.emailValidos} color="#20c997" icon={<i className="fa fa-envelope"></i>} />
        </div>
        <div className="col-6 col-md-4 col-lg">
          <BiCard title="Telefones Inválidos" value={contatos.semTel} color="#dc3545" icon={<i className="fa fa-phone-square"></i>} />
        </div>
        <div className="col-6 col-md-4 col-lg">
          <BiCard title="E-mails Inválidos" value={contatos.semEmail} color="#fd7e14" icon={<i className="fa fa-envelope-o"></i>} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom-0 pt-3 pb-0 px-3">
              <small className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>
                <i className="fa fa-pie-chart me-1" style={{ color: '#ffc107' }}></i> Distribuição
              </small>
            </div>
            <div className="card-body p-3">
              {[
                { label: 'Telefone válido', value: contatos.telValidos, pct: contatos.total ? (contatos.telValidos / contatos.total * 100) : 0, color: '#198754' },
                { label: 'Sem telefone', value: contatos.semTel, pct: contatos.total ? (contatos.semTel / contatos.total * 100) : 0, color: '#dc3545' },
                { label: 'E-mail válido', value: contatos.emailValidos, pct: contatos.total ? (contatos.emailValidos / contatos.total * 100) : 0, color: '#0d6efd' },
                { label: 'Sem e-mail', value: contatos.semEmail, pct: contatos.total ? (contatos.semEmail / contatos.total * 100) : 0, color: '#fd7e14' },
                { label: 'Sem ambos', value: contatos.ambos, pct: contatos.total ? (contatos.ambos / contatos.total * 100) : 0, color: '#6f42c1' },
              ].map(item => (
                <div key={item.label} className="mb-2">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">{item.label}</span>
                    <span className="fw-semibold">{formatNumber(item.value)} ({item.pct.toFixed(1)}%)</span>
                  </div>
                  <div className="progress" style={{ height: 8, borderRadius: 6, background: '#e9ecef' }}>
                    <div className="progress-bar" style={{ width: `${item.pct}%`, background: item.color, borderRadius: 6 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom-0 pt-3 pb-0 px-3">
              <small className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>
                <i className="fa fa-table me-1" style={{ color: '#ffc107' }}></i> Tabela de Qualidade
              </small>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style={{ background: '#f8f9fc', fontSize: '0.75rem', textTransform: 'uppercase', padding: '10px 12px' }}>Categoria</th>
                    <th className="text-end" style={{ background: '#f8f9fc', fontSize: '0.75rem', textTransform: 'uppercase', padding: '10px 12px' }}>Quantidade</th>
                    <th style={{ background: '#f8f9fc', fontSize: '0.75rem', textTransform: 'uppercase', padding: '10px 12px' }}>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {tabelaQualidade.map((item, i) => (
                    <tr key={i}>
                      <td className="fw-semibold" style={{ padding: '8px 12px', fontSize: '0.82rem' }}>{item.categoria}</td>
                      <td className="text-end fw-bold" style={{ padding: '8px 12px', fontSize: '0.82rem' }}>{formatNumber(item.quantidade)}</td>
                      <td style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#6c757d' }}>{item.descricao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
