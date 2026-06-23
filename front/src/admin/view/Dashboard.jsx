import { useEffect, useState } from 'react';
import { masterPath } from '../../config/config';
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                } else {
                    setError('Erro ao carregar dados');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Erro de conexao');
                setLoading(false);
            });
    }, []);

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
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    const formatNumber = (n) => Number(n).toLocaleString('pt-BR');

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4"><i className="fa fa-bar-chart"></i> Dashboard Gerencial</h2>

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
        </div>
    );
}

export default Dashboard;
