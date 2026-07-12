import React, { useEffect, useState, useMemo } from 'react';
import { masterPath } from '../../../config/config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#0dcaf0'];

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

const TABS = [
  { id: 'uf', label: 'Por UF' },
  { id: 'caderno', label: 'Por Caderno' },
  { id: 'atividade', label: 'Por Atividade' },
  { id: 'id', label: 'Por ID' },
];

export default function BI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('uf');
  const [filterUF, setFilterUF] = useState('');
  const [filterText, setFilterText] = useState('');
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const token = sessionStorage.getItem('userTokenAccess');
    fetch(`${masterPath.url}/admin/dashboard`, {
      headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setData(res.data);
          if (!res.data.lastUpdated && !sessionStorage.getItem('dashboardRefreshed')) {
            sessionStorage.setItem('dashboardRefreshed', '1');
            refresh();
          }
        } else setError('Erro ao carregar dados');
        setLoading(false);
      })
      .catch(() => { setError('Erro de conexao'); setLoading(false); });
  }, []);

  const refresh = () => {
    setRefreshing(true);
    const token = sessionStorage.getItem('userTokenAccess');
    fetch(`${masterPath.url}/admin/dashboard/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'authorization': 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) window.location.reload();
        else { alert('Erro'); setRefreshing(false); }
      })
      .catch(() => { alert('Erro'); setRefreshing(false); });
  };

  const exportCSV = (rows, filename) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(';'), ...rows.map(r => headers.map(h => String(r[h] ?? '').replace(/;/g, ',')).join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const UFs = useMemo(() => {
    if (!data?.porUf) return [];
    return [{ codUf: 'Todas' }, ...data.porUf.map(u => ({ codUf: u.codUf }))];
  }, [data]);

  const filteredPorUF = useMemo(() => {
    if (!data?.porUf) return [];
    let list = [...data.porUf];
    if (filterText) list = list.filter(u => u.codUf.toLowerCase().includes(filterText.toLowerCase()));
    list.sort((a, b) => {
      let va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, filterText, sortKey, sortDir]);

  const filteredPorCaderno = useMemo(() => {
    if (!data?.cadernosPorUf) return [];
    let list = [...data.cadernosPorUf];
    if (filterUF) list = list.filter(c => c.UF === filterUF);
    if (filterText) list = list.filter(c => (c.Caderno || '').toLowerCase().includes(filterText.toLowerCase()) || c.UF.toLowerCase().includes(filterText.toLowerCase()));
    list.sort((a, b) => {
      let va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, filterUF, filterText, sortKey, sortDir]);

  const filteredPorAtividade = useMemo(() => {
    if (!data?.porAtividade) return [];
    let list = [...data.porAtividade];
    if (filterText) list = list.filter(a => (a.atividade || '').toLowerCase().includes(filterText.toLowerCase()));
    list.sort((a, b) => {
      let va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, filterText, sortKey, sortDir]);

  const filteredPorId = useMemo(() => {
    if (!data?.porId) return [];
    let list = [...data.porId];
    if (filterText) list = list.filter(i => (i.id || '').toLowerCase().includes(filterText.toLowerCase()) || (i.descricao || '').toLowerCase().includes(filterText.toLowerCase()));
    list.sort((a, b) => {
      let va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [data, filterText, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ name }) => (
    <span className="ms-1" style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => handleSort(name)}>
      {sortKey === name ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '\u25B4\u25BE'}
    </span>
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <button className="buttonload"><i className="fa fa-spinner fa-spin"></i> Carregando BI...</button>
    </div>
  );
  if (error) return <div className="alert alert-danger m-3">{error}</div>;
  if (!data) return null;

  const tableClass = "table table-striped table-sm mb-0";

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0"><i className="fa fa-bar-chart me-2"></i>BI - Business Intelligence</h4>
        <div className="d-flex gap-2">
          <small className="text-muted align-self-center">
            {data.lastUpdated ? `Atualizado: ${new Date(data.lastUpdated).toLocaleString('pt-BR')}` : 'Cache vazio'}
          </small>
          <button className="btn btn-sm btn-primary" onClick={refresh} disabled={refreshing}>
            {refreshing ? <><i className="fa fa-spinner fa-spin"></i> Atualizando...</> : <><i className="fa fa-refresh"></i> Atualizar</>}
          </button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-3 mb-2">
          <div className="card text-white bg-primary h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <small>Total de Perfis</small>
              <h3 className="mb-0">{formatNumber(data.total)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card text-white bg-success h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <small>Básicos</small>
              <h3 className="mb-0">{formatNumber(data.basico)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card text-white bg-info h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <small>Completos</small>
              <h3 className="mb-0">{formatNumber(data.completo)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-2">
          <div className="card text-white bg-warning h-100">
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <small>Ativos / Inativos</small>
              <h3 className="mb-0">{formatNumber(data.ativos)} / {formatNumber(data.inativos)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <div className="card h-100">
            <div className="card-header bg-dark text-white py-2"><small><i className="fa fa-pie-chart me-1"></i>Distribuição por Tipo</small></div>
            <div className="card-body p-2" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: 'Básicos', value: data.basico },
                    { name: 'Completos', value: data.completo },
                    { name: 'Capa', value: data.capa || 0 },
                  ]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {['Básicos', 'Completos', 'Capa'].map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <div className="card h-100">
            <div className="card-header bg-dark text-white py-2"><small><i className="fa fa-bar-chart me-1"></i>Top 10 UFs</small></div>
            <div className="card-body p-2" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...(data.porUf || [])].sort((a, b) => b.total - a.total).slice(0, 10)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="codUf" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => formatNumber(v)} />
                  <Bar dataKey="total" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header bg-dark text-white py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <ul className="nav nav-pills nav-fill flex-grow-1">
            {TABS.map(tab => (
              <li className="nav-item" key={tab.id}>
                <button className={`nav-link py-1 px-3 ${activeTab === tab.id ? 'active' : ''}`}
                  style={activeTab === tab.id ? { backgroundColor: '#0d6efd', color: 'white' } : { color: '#ccc' }}
                  onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body p-2">
          <div className="row mb-2">
            <div className="col-md-4">
              <input className="form-control form-control-sm" placeholder="Buscar..." value={filterText}
                onChange={e => setFilterText(e.target.value)} />
            </div>
            {activeTab === 'caderno' && (
              <div className="col-md-3">
                <select className="form-select form-select-sm" value={filterUF} onChange={e => setFilterUF(e.target.value)}>
                  <option value="">Todas UFs</option>
                  {(data.porUf || []).map(u => <option key={u.codUf} value={u.codUf}>{u.codUf}</option>)}
                </select>
              </div>
            )}
            <div className="col-md-auto ms-auto">
              <button className="btn btn-sm btn-outline-success" onClick={() => {
                let rows, name;
                if (activeTab === 'uf') { rows = filteredPorUF; name = 'relatorio_uf.csv'; }
                else if (activeTab === 'caderno') { rows = filteredPorCaderno; name = 'relatorio_cadernos.csv'; }
                else if (activeTab === 'atividade') { rows = filteredPorAtividade; name = 'relatorio_atividades.csv'; }
                else { rows = filteredPorId; name = 'relatorio_id.csv'; }
                exportCSV(rows, name);
              }}>
                <i className="fa fa-download me-1"></i>CSV
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '550px', overflowY: 'auto', overflowX: 'auto' }}>
            {activeTab === 'uf' && (
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>UF <SortIcon name="codUf" /></th>
                    <th className="text-end">Total <SortIcon name="total" /></th>
                    <th className="text-end">Básicos <SortIcon name="basico" /></th>
                    <th className="text-end">Completos <SortIcon name="completo" /></th>
                    <th className="text-end">Capa <SortIcon name="capa" /></th>
                    <th className="text-end">Campanhas <SortIcon name="campanhas" /></th>
                    <th className="text-end">IDs <SortIcon name="totalId" /></th>
                    <th className="text-end">Tel. atualizar <SortIcon name="telAtualizar" /></th>
                    <th className="text-end">E-mail atualizar <SortIcon name="emailAtualizar" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPorUF.map(u => (
                    <tr key={u.codUf}>
                      <td><strong>{u.codUf}</strong></td>
                      <td className="text-end">{formatNumber(u.total)}</td>
                      <td className="text-end">{formatNumber(u.basico)}</td>
                      <td className="text-end">{formatNumber(u.completo)}</td>
                      <td className="text-end">{u.capa > 0 ? formatNumber(u.capa) : '-'}</td>
                      <td className="text-end">{u.campanhas > 0 ? <span className="badge bg-warning text-dark">{formatNumber(u.campanhas)}</span> : '-'}</td>
                      <td className="text-end">{u.totalId > 0 ? formatNumber(u.totalId) : '-'}</td>
                      <td className="text-end">{u.telAtualizar > 0 ? <span className="text-danger">{formatNumber(u.telAtualizar)}</span> : '-'}</td>
                      <td className="text-end">{u.emailAtualizar > 0 ? <span className="text-danger">{formatNumber(u.emailAtualizar)}</span> : '-'}</td>
                    </tr>
                  ))}
                  <tr className="table-dark fw-bold">
                    <td>TOTAIS</td>
                    <td className="text-end">{formatNumber(filteredPorUF.reduce((s, u) => s + (u.total || 0), 0))}</td>
                    <td className="text-end">{formatNumber(filteredPorUF.reduce((s, u) => s + (u.basico || 0), 0))}</td>
                    <td className="text-end">{formatNumber(filteredPorUF.reduce((s, u) => s + (u.completo || 0), 0))}</td>
                    <td className="text-end">{formatNumber(filteredPorUF.reduce((s, u) => s + (u.capa || 0), 0))}</td>
                    <td className="text-end">{formatNumber(filteredPorUF.reduce((s, u) => s + (u.campanhas || 0), 0))}</td>
                    <td className="text-end">{formatNumber(filteredPorUF.reduce((s, u) => s + (u.totalId || 0), 0))}</td>
                    <td className="text-end">{formatNumber(filteredPorUF.reduce((s, u) => s + (u.telAtualizar || 0), 0))}</td>
                    <td className="text-end">{formatNumber(filteredPorUF.reduce((s, u) => s + (u.emailAtualizar || 0), 0))}</td>
                  </tr>
                </tbody>
              </table>
            )}

            {activeTab === 'caderno' && (
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>UF <SortIcon name="UF" /></th>
                    <th>Caderno <SortIcon name="Caderno" /></th>
                    <th className="text-end">Total <SortIcon name="total" /></th>
                    <th className="text-end">Básicos <SortIcon name="basico" /></th>
                    <th className="text-end">Completos <SortIcon name="completo" /></th>
                    <th className="text-end">Campanhas <SortIcon name="campanhas" /></th>
                    <th className="text-end">Tel. atualizar <SortIcon name="telAtualizar" /></th>
                    <th className="text-end">E-mail atualizar <SortIcon name="emailAtualizar" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPorCaderno.map(c => (
                    <tr key={`${c.UF}-${c.Caderno}`}>
                      <td><strong>{c.UF}</strong></td>
                      <td>{c.Caderno}</td>
                      <td className="text-end">{formatNumber(c.total)}</td>
                      <td className="text-end">{formatNumber(c.basico)}</td>
                      <td className="text-end">{formatNumber(c.completo)}</td>
                      <td className="text-end">{c.campanhas > 0 ? <span className="badge bg-warning text-dark">{formatNumber(c.campanhas)}</span> : '-'}</td>
                      <td className="text-end">{c.telAtualizar > 0 ? <span className="text-danger">{formatNumber(c.telAtualizar)}</span> : '-'}</td>
                      <td className="text-end">{c.emailAtualizar > 0 ? <span className="text-danger">{formatNumber(c.emailAtualizar)}</span> : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'atividade' && (
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>Atividade <SortIcon name="atividade" /></th>
                    <th className="text-end">Total <SortIcon name="total" /></th>
                    <th className="text-end">Básicos <SortIcon name="basico" /></th>
                    <th className="text-end">Completos <SortIcon name="completo" /></th>
                    <th className="text-end">Campanhas <SortIcon name="campanhas" /></th>
                    <th className="text-end">Tel. atualizar <SortIcon name="telAtualizar" /></th>
                    <th className="text-end">E-mail atualizar <SortIcon name="emailAtualizar" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPorAtividade.map(a => (
                    <tr key={a.atividade}>
                      <td style={{ maxWidth: 400, whiteSpace: 'normal', wordBreak: 'break-word' }}>{a.atividade}</td>
                      <td className="text-end"><strong>{formatNumber(a.total)}</strong></td>
                      <td className="text-end">{formatNumber(a.basico)}</td>
                      <td className="text-end">{formatNumber(a.completo)}</td>
                      <td className="text-end">{a.campanhas > 0 ? <span className="badge bg-warning text-dark">{formatNumber(a.campanhas)}</span> : '-'}</td>
                      <td className="text-end">{a.telAtualizar > 0 ? <span className="text-danger">{formatNumber(a.telAtualizar)}</span> : '-'}</td>
                      <td className="text-end">{a.emailAtualizar > 0 ? <span className="text-danger">{formatNumber(a.emailAtualizar)}</span> : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'id' && (
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>ID <SortIcon name="id" /></th>
                    <th>Descrição <SortIcon name="descricao" /></th>
                    <th className="text-end">Total <SortIcon name="total" /></th>
                    <th className="text-end">Básicos <SortIcon name="basico" /></th>
                    <th className="text-end">Completos <SortIcon name="completo" /></th>
                    <th className="text-end">Capa <SortIcon name="capa" /></th>
                    <th className="text-end">Tel. atualizar <SortIcon name="telAtualizar" /></th>
                    <th className="text-end">E-mail atualizar <SortIcon name="emailAtualizar" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPorId.map(i => (
                    <tr key={i.id}>
                      <td><code>{i.id}</code></td>
                      <td style={{ maxWidth: 250, whiteSpace: 'normal', wordBreak: 'break-word' }}>{i.descricao || '-'}</td>
                      <td className="text-end"><strong>{formatNumber(i.total)}</strong></td>
                      <td className="text-end">{formatNumber(i.basico)}</td>
                      <td className="text-end">{formatNumber(i.completo)}</td>
                      <td className="text-end">{i.capa > 0 ? formatNumber(i.capa) : '-'}</td>
                      <td className="text-end">{i.telAtualizar > 0 ? <span className="text-danger">{formatNumber(i.telAtualizar)}</span> : '-'}</td>
                      <td className="text-end">{i.emailAtualizar > 0 ? <span className="text-danger">{formatNumber(i.emailAtualizar)}</span> : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
