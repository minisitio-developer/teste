import React from 'react';
import { useOutletContext } from 'react-router-dom';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function ContatosPage() {
  const { data } = useOutletContext();
  if (!data) return <div className="p-3 text-muted">Nenhum dado disponível.</div>;

  const semEmail = data.semEmail || 0;
  const semTelefone = data.semTelefone || 0;
  const semEmailETelefone = data.semEmailETelefone || 0;
  const total = data.total || 1;

  const metrics = [
    { label: 'E-mails válidos', value: total - semEmail, pct: ((total - semEmail) / total * 100), color: '#198754' },
    { label: 'E-mails para atualizar', value: semEmail, pct: (semEmail / total * 100), color: '#dc3545' },
    { label: 'Telefones válidos', value: total - semTelefone, pct: ((total - semTelefone) / total * 100), color: '#198754' },
    { label: 'Telefones para atualizar', value: semTelefone, pct: (semTelefone / total * 100), color: '#dc3545' },
  ];

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0 fw-bold" style={{ color: '#1a1a2e' }}>
          <i className="fa fa-address-card me-2" style={{ color: '#ffc107' }}></i>Contatos
        </h5>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-body">
              <h6 className="fw-semibold mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="fa fa-envelope me-2" style={{ color: '#0d6efd' }}></i>E-mails
              </h6>
              {metrics.slice(0, 2).map(m => (
                <div key={m.label} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">{m.label}</span>
                    <span className="fw-semibold">{formatNumber(m.value)}</span>
                  </div>
                  <div className="progress" style={{ height: 8, borderRadius: 6, background: '#e9ecef' }}>
                    <div className="progress-bar" style={{ width: `${m.pct}%`, background: m.color, borderRadius: 6 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-body">
              <h6 className="fw-semibold mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="fa fa-phone me-2" style={{ color: '#198754' }}></i>Telefones
              </h6>
              {metrics.slice(2).map(m => (
                <div key={m.label} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">{m.label}</span>
                    <span className="fw-semibold">{formatNumber(m.value)}</span>
                  </div>
                  <div className="progress" style={{ height: 8, borderRadius: 6, background: '#e9ecef' }}>
                    <div className="progress-bar" style={{ width: `${m.pct}%`, background: m.color, borderRadius: 6 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0" style={{ overflowX: 'auto' }}>
          <table className="table table-striped mb-0" style={{ fontSize: '0.82rem' }}>
            <thead style={{ background: '#1a1a2e', color: '#fff' }}>
              <tr>
                <th className="p-2">Indicador</th>
                <th className="p-2 text-end">Quantidade</th>
                <th className="p-2">Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2">E-mails para atualizar</td><td className="p-2 text-end fw-semibold">{formatNumber(semEmail)}</td><td className="p-2">Anúncios sem e-mail comercial válido</td></tr>
              <tr><td className="p-2">Telefones para atualizar</td><td className="p-2 text-end fw-semibold">{formatNumber(semTelefone)}</td><td className="p-2">Anúncios sem telefone válido</td></tr>
              <tr><td className="p-2">Sem e-mail e sem telefone</td><td className="p-2 text-end fw-semibold">{formatNumber(semEmailETelefone)}</td><td className="p-2">Anúncios sem ambos os contatos</td></tr>
            </tbody>
            <tfoot>
              <tr style={{ background: '#e9ecef', fontWeight: 700 }}>
                <td className="p-2">TOTAL</td>
                <td className="p-2 text-end">{formatNumber(total)}</td>
                <td className="p-2">Total de anúncios ativos</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
