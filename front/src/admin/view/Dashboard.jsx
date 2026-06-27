import { useEffect, useState, lazy, Suspense } from 'react';
import { masterPath } from '../../config/config';
import 'bootstrap/dist/css/bootstrap.min.css';

const CampanhaTab = lazy(() => import('./Campanha/Campanha'));
const CalhauTab = lazy(() => import('./Calhau/Calhau'));
const ConfigTab = lazy(() => import('./ConfigTab'));

function Dashboard() {
    const [activeTab, setActiveTab] = useState('resumo');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [capaData, setCapaData] = useState(null);
    const [capaLoading, setCapaLoading] = useState(false);
    const [capaError, setCapaError] = useState(null);
    const [contatoData, setContatoData] = useState(null);
    const [contatoLoading, setContatoLoading] = useState(false);
    const [contatoError, setContatoError] = useState(null);

    useEffect(() => {
        const tokenAuth = sessionStorage.getItem('userTokenAccess');
        fetch(`${masterPath.url}/admin/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer ' + tokenAuth
            }
        })
            .then(x => x.json())
            .then(res => {
                if (res.success) {
                    setData(res.data);
                    setLoading(false);
                    if (!res.data.lastUpdated && !sessionStorage.getItem('dashboardRefreshed')) {
                        sessionStorage.setItem('dashboardRefreshed', '1');
                        refreshDashboard();
                    }
                } else {
                    setError('Erro ao carregar dados');
                    setLoading(false);
                }
            })
            .catch(() => {
                setError('Erro de conexao');
                setLoading(false);
            });
    }, []);

    const loadCapa = () => {
        setCapaLoading(true);
        setCapaError(null);
        const tokenAuth = sessionStorage.getItem('userTokenAccess');
        fetch(`${masterPath.url}/admin/dashboard/capa`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer ' + tokenAuth
            }
        })
            .then(x => x.json())
            .then(res => {
                if (res.success) {
                    setCapaData(res.data);
                } else {
                    setCapaError('Erro ao carregar dados da capa');
                }
                setCapaLoading(false);
            })
            .catch(() => {
                setCapaError('Erro de conexao na capa');
                setCapaLoading(false);
            });
    };

    const loadContato = () => {
        setContatoLoading(true);
        setContatoError(null);
        const tokenAuth = sessionStorage.getItem('userTokenAccess');
        fetch(`${masterPath.url}/admin/dashboard/contatos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer ' + tokenAuth
            }
        })
            .then(x => x.json())
            .then(res => {
                if (res.success) {
                    setContatoData(res.data);
                } else {
                    setContatoError('Erro ao carregar dados de contato');
                }
                setContatoLoading(false);
            })
            .catch(() => {
                setContatoError('Erro de conexao nos contatos');
                setContatoLoading(false);
            });
    };

    const refreshDashboard = () => {
        setRefreshing(true);
        const tokenAuth = sessionStorage.getItem('userTokenAccess');
        fetch(`${masterPath.url}/admin/dashboard/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': 'Bearer ' + tokenAuth
            }
        })
            .then(x => x.json())
            .then(res => {
                if (res.success) {
                    window.location.reload();
                } else {
                    alert('Erro ao atualizar cache');
                    setRefreshing(false);
                }
            })
            .catch(() => {
                alert('Erro de conexao ao atualizar');
                setRefreshing(false);
            });
    };

    const formatNumber = (n) => Number(n).toLocaleString('pt-BR');

    const tabs = [
        { id: 'resumo', label: 'Resumo' },
        { id: 'campanha', label: 'Campanha' },
        { id: 'calhau', label: 'Calhau' },
        { id: 'config', label: 'Configurações' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'campanha':
                return <Suspense fallback={<div className="text-center py-4"><i className="fa fa-spinner fa-spin"></i> Carregando...</div>}>
                    <CampanhaTab />
                </Suspense>;
            case 'calhau':
                return <Suspense fallback={<div className="text-center py-4"><i className="fa fa-spinner fa-spin"></i> Carregando...</div>}>
                    <CalhauTab />
                </Suspense>;
            case 'config':
                return <Suspense fallback={<div className="text-center py-4"><i className="fa fa-spinner fa-spin"></i> Carregando...</div>}>
                    <ConfigTab />
                </Suspense>;
            default:
                return renderResumo();
        }
    };

    const renderResumo = () => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <button className="buttonload">
                        <i className="fa fa-spinner fa-spin"></i> Carregando dashboard...
                    </button>
                </div>
            );
        }

        if (error) {
            return <div className="alert alert-danger">{error}</div>;
        }

        if (!data) return null;

        const hasData = data.total > 0;

        return (
            <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">
                        {data.lastUpdated ? `Ultima atualizacao: ${new Date(data.lastUpdated).toLocaleString('pt-BR')}` : 'Cache vazio - clique em Atualizar'}
                    </small>
                    <button className="btn btn-sm btn-primary" onClick={refreshDashboard} disabled={refreshing}>
                        {refreshing ? <><i className="fa fa-spinner fa-spin"></i> Atualizando... (pode levar varios minutos)</> : <><i className="fa fa-refresh"></i> Atualizar dados</>}
                    </button>
                </div>
                {/* Cards Resumo */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card text-white bg-primary mb-3">
                            <div className="card-body text-center">
                                <h6 className="card-title">Total de Perfis</h6>
                                <h2 className="card-text">{formatNumber(data.total)}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-white bg-success mb-3">
                            <div className="card-body text-center">
                                <h6 className="card-title">Perfis Basicos</h6>
                                <h2 className="card-text">{formatNumber(data.basico)}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-white bg-info mb-3">
                            <div className="card-body text-center">
                                <h6 className="card-title">Perfis Completos</h6>
                                <h2 className="card-text">{formatNumber(data.completo)}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card text-white bg-warning mb-3">
                            <div className="card-body text-center">
                                <h6 className="card-title">Ativos / Inativos</h6>
                                <h2 className="card-text">{formatNumber(data.ativos)} / {formatNumber(data.inativos)}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards Contato - Lazy Load */}
                <div className="row mb-4">
                    <div className="col-md-12">
                        <div className="card text-white mb-3" style={{ backgroundColor: '#343a40' }}>
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="fa fa-address-book"></i> Dados de Contato</h5>
                                {!contatoData && !contatoLoading && (
                                    <button className="btn btn-sm btn-outline-light" onClick={loadContato}>
                                        <i className="fa fa-refresh"></i> Carregar
                                    </button>
                                )}
                            </div>
                            <div className="card-body">
                                {contatoLoading && (
                                    <div className="text-center py-3">
                                        <i className="fa fa-spinner fa-spin fa-2x"></i>
                                        <p className="mt-2">Carregando dados de contato...</p>
                                    </div>
                                )}
                                {contatoError && <div className="alert alert-warning mb-0">{contatoError}</div>}
                                {contatoData && (
                                    <div className="row text-center">
                                        <div className="col-md-4 mb-3">
                                            <div className="card text-white bg-danger">
                                                <div className="card-body">
                                                    <h6 className="card-title"><i className="fa fa-times-circle"></i> Sem E-mail e Telefone</h6>
                                                    <h3>{formatNumber(contatoData.semEmailETelefone)}</h3>
                                                    <small>{data.total > 0 ? ((contatoData.semEmailETelefone / data.total) * 100).toFixed(1) : 0}% do total</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="card text-white" style={{ backgroundColor: '#fd7e14' }}>
                                                <div className="card-body">
                                                    <h6 className="card-title"><i className="fa fa-envelope-o"></i> Sem E-mail</h6>
                                                    <h3>{formatNumber(contatoData.semEmail)}</h3>
                                                    <small>{data.total > 0 ? ((contatoData.semEmail / data.total) * 100).toFixed(1) : 0}% do total</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <div className="card text-white" style={{ backgroundColor: '#6f42c1' }}>
                                                <div className="card-body">
                                                    <h6 className="card-title"><i className="fa fa-phone"></i> Sem Telefone</h6>
                                                    <h3>{formatNumber(contatoData.semTelefone)}</h3>
                                                    <small>{data.total > 0 ? ((contatoData.semTelefone / data.total) * 100).toFixed(1) : 0}% do total</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards Validade */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card text-white mb-3" style={{ backgroundColor: '#dc3545' }}>
                            <div className="card-body text-center">
                                <h6 className="card-title"><i className="fa fa-exclamation-triangle"></i> Expirados</h6>
                                <h2 className="card-text">{formatNumber(data.expirados)}</h2>
                                <small>Anuncios com validade vencida</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-white mb-3" style={{ backgroundColor: '#ffc107', color: '#333' }}>
                            <div className="card-body text-center">
                                <h6 className="card-title"><i className="fa fa-clock-o"></i> Expiram em 30 dias</h6>
                                <h2 className="card-text">{formatNumber(data.expiraEm30Dias)}</h2>
                                <small>Anuncios proximos do vencimento</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-white mb-3" style={{ backgroundColor: '#198754' }}>
                            <div className="card-body text-center">
                                <h6 className="card-title"><i className="fa fa-check-circle"></i> Total Cadernos</h6>
                                <h2 className="card-text">{data.cadernosPorUf ? formatNumber(data.cadernosPorUf.reduce((s, c) => s + c.total, 0)) : '-'}</h2>
                                <small>Cadernos em todas as UFs</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela por UF */}
                <div className="row mb-4">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header bg-dark text-white">
                                <h5 className="mb-0"><i className="fa fa-map-marker"></i> Perfis por Estado</h5>
                            </div>
                            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="table table-striped table-sm">
                                    <thead>
                                        <tr>
                                            <th>UF</th>
                                            <th className="text-end">Total</th>
                                            <th className="text-end">Basicos</th>
                                            <th className="text-end">Completos</th>
                                            <th className="text-end">% Completo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.porUf.map(uf => (
                                            <tr key={uf.codUf}>
                                                <td><strong>{uf.codUf}</strong></td>
                                                <td className="text-end">{formatNumber(uf.total)}</td>
                                                <td className="text-end">{formatNumber(uf.basico)}</td>
                                                <td className="text-end">{formatNumber(uf.completo)}</td>
                                                <td className="text-end">{uf.total > 0 ? ((uf.completo / uf.total) * 100).toFixed(1) : 0}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cadernos por UF + Resumo */}
                {data.cadernosPorUf && data.cadernosPorUf.length > 0 && (
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header bg-dark text-white">
                                    <h5 className="mb-0"><i className="fa fa-book"></i> Cadernos por Estado</h5>
                                </div>
                                <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table className="table table-striped table-sm">
                                        <thead>
                                            <tr>
                                                <th>UF</th>
                                                <th className="text-end">Cadernos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.cadernosPorUf.map(item => (
                                                <tr key={item.UF}>
                                                    <td><strong>{item.UF}</strong></td>
                                                    <td className="text-end">{formatNumber(item.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header bg-dark text-white">
                                    <h5 className="mb-0"><i className="fa fa-pie-chart"></i> Resumo Geral</h5>
                                </div>
                                <div className="card-body">
                                    <table className="table table-sm">
                                        <tbody>
                                            <tr><td>Total de Perfis</td><td className="text-end"><strong>{formatNumber(data.total)}</strong></td></tr>
                                            <tr><td>Ativos</td><td className="text-end">{formatNumber(data.ativos)}</td></tr>
                                            <tr><td>Inativos</td><td className="text-end">{formatNumber(data.inativos)}</td></tr>
                                            <tr className="table-info"><td><strong>Basicos</strong></td><td className="text-end">{formatNumber(data.basico)}</td></tr>
                                            <tr className="table-success"><td><strong>Completos</strong></td><td className="text-end">{formatNumber(data.completo)}</td></tr>
                                            <tr><td>Expirados</td><td className="text-end text-danger">{formatNumber(data.expirados)}</td></tr>
                                            <tr><td>Expiram em 30 dias</td><td className="text-end text-warning">{formatNumber(data.expiraEm30Dias)}</td></tr>
                                            {contatoData && (
                                                <>
                                                    <tr className="table-danger"><td>Sem E-mail</td><td className="text-end">{formatNumber(contatoData.semEmail)}</td></tr>
                                                    <tr className="table-warning"><td>Sem Telefone</td><td className="text-end">{formatNumber(contatoData.semTelefone)}</td></tr>
                                                    <tr className="table-danger"><td>Sem E-mail nem Telefone</td><td className="text-end">{formatNumber(contatoData.semEmailETelefone)}</td></tr>
                                                </>
                                            )}
                                            {!contatoData && !contatoLoading && (
                                                <tr><td colSpan="2" className="text-muted text-center"><small>Dados de contato nao carregados. Clique em "Carregar" acima.</small></td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Capa do Caderno - Lazy Load */}
                <div className="row mb-4">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="fa fa-book"></i> Capa do Caderno - Completude (8 atividades-capa)</h5>
                                {!capaData && !capaLoading && (
                                    <button className="btn btn-sm btn-outline-light" onClick={loadCapa}>
                                        <i className="fa fa-refresh"></i> Carregar
                                    </button>
                                )}
                            </div>
                            <div className="card-body">
                                {capaLoading && (
                                    <div className="text-center py-4">
                                        <i className="fa fa-spinner fa-spin fa-2x"></i>
                                        <p className="mt-2">Carregando dados da capa...</p>
                                    </div>
                                )}
                                {capaError && <div className="alert alert-warning">{capaError}</div>}
                                {capaData && capaData.capaGeral && (
                                    <>
                                        <p className="text-muted mb-3">
                                            Total de <strong>{formatNumber(capaData.capaGeral.total_cadernos)}</strong> cadernos.
                                            A capa e considerada completa quando o caderno possui ao menos 1 anuncio ativo em cada uma das 8 atividades-capa.
                                        </p>
                                        <div className="row text-center">
                                            <div className="col-md-3 col-sm-6 mb-3">
                                                <div className="card text-white bg-success">
                                                    <div className="card-body">
                                                        <h6 className="card-title">Completa (8/8)</h6>
                                                        <h3>{formatNumber(capaData.capaGeral.completa)}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 mb-3">
                                                <div className="card text-white bg-danger">
                                                    <div className="card-body">
                                                        <h6 className="card-title">Sem nenhuma (0/8)</h6>
                                                        <h3>{formatNumber(capaData.capaGeral.sem_nenhuma)}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 mb-3">
                                                <div className="card text-white bg-info">
                                                    <div className="card-body">
                                                        <h6 className="card-title">Com pelo menos 1</h6>
                                                        <h3>{formatNumber(capaData.capaGeral.total_cadernos - capaData.capaGeral.sem_nenhuma)}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-sm-6 mb-3">
                                                <div className="card text-white bg-secondary">
                                                    <div className="card-body">
                                                        <h6 className="card-title">% Completa</h6>
                                                        <h3>{capaData.capaGeral.total_cadernos > 0 ? ((capaData.capaGeral.completa / capaData.capaGeral.total_cadernos) * 100).toFixed(1) : 0}%</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <table className="table table-striped table-sm mt-3">
                                            <thead>
                                                <tr>
                                                    <th>Preenchida</th>
                                                    <th className="text-end">Qtd Cadernos</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td><strong>8/8 - Completa</strong></td><td className="text-end">{formatNumber(capaData.capaGeral.completa)}</td></tr>
                                                <tr><td>7/8 - Falta 1</td><td className="text-end">{formatNumber(capaData.capaGeral.falta_1)}</td></tr>
                                                <tr><td>6/8 - Falta 2</td><td className="text-end">{formatNumber(capaData.capaGeral.falta_2)}</td></tr>
                                                <tr><td>5/8 - Falta 3</td><td className="text-end">{formatNumber(capaData.capaGeral.falta_3)}</td></tr>
                                                <tr><td>4/8 - Falta 4</td><td className="text-end">{formatNumber(capaData.capaGeral.falta_4)}</td></tr>
                                                <tr><td>3/8 - Falta 5</td><td className="text-end">{formatNumber(capaData.capaGeral.falta_5)}</td></tr>
                                                <tr><td>2/8 - Falta 6</td><td className="text-end">{formatNumber(capaData.capaGeral.falta_6)}</td></tr>
                                                <tr><td>1/8 - Falta 7</td><td className="text-end">{formatNumber(capaData.capaGeral.falta_7)}</td></tr>
                                                <tr><td><strong>0/8 - Sem nenhuma</strong></td><td className="text-end">{formatNumber(capaData.capaGeral.sem_nenhuma)}</td></tr>
                                            </tbody>
                                        </table>
                                        {capaData.capaPorUf && capaData.capaPorUf.length > 0 && (
                                            <div className="mt-4">
                                                <h6>Capa por Estado</h6>
                                                <table className="table table-striped table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>UF</th>
                                                            <th className="text-end">Total Cadernos</th>
                                                            <th className="text-end">Completas (8/8)</th>
                                                            <th className="text-end">Sem nenhuma (0/8)</th>
                                                            <th className="text-end">% Completa</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {capaData.capaPorUf.map(item => (
                                                            <tr key={item.UF}>
                                                                <td><strong>{item.UF}</strong></td>
                                                                <td className="text-end">{formatNumber(item.total_cadernos)}</td>
                                                                <td className="text-end">{formatNumber(item.completa)}</td>
                                                                <td className="text-end">{formatNumber(item.sem_nenhuma)}</td>
                                                                <td className="text-end">{item.total_cadernos > 0 ? ((item.completa / item.total_cadernos) * 100).toFixed(1) : 0}%</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabela por Mes */}
                <div className="row mb-4">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="card-header bg-dark text-white">
                                <h5 className="mb-0"><i className="fa fa-calendar"></i> Cadastros por Mes (ultimos 12 meses)</h5>
                            </div>
                            <div className="card-body">
                                <table className="table table-striped table-sm">
                                    <thead>
                                        <tr>
                                            <th>Mes</th>
                                            <th className="text-end">Total</th>
                                            <th className="text-end">Basicos</th>
                                            <th className="text-end">Completos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.porMes.map(mes => (
                                            <tr key={mes.mes}>
                                                <td><strong>{mes.mes}</strong></td>
                                                <td className="text-end">{formatNumber(mes.total)}</td>
                                                <td className="text-end">{formatNumber(mes.basico)}</td>
                                                <td className="text-end">{formatNumber(mes.completo)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="container-fluid mt-3">
            <h2 className="mb-3"><i className="fa fa-bar-chart"></i> Dashboard</h2>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                {tabs.map(tab => (
                    <li className="nav-item" key={tab.id}>
                        <button
                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    </li>
                ))}
            </ul>

            {/* Tab Content */}
            {renderTabContent()}
        </div>
    );
}

export default Dashboard;
