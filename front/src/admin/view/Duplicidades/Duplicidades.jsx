import React, { useEffect, useState } from 'react';
import '../../assets/css/users.css';
import 'font-awesome/css/font-awesome.min.css';
import { masterPath, version } from '../../../config/config';
import Spinner from '../../../components/Spinner';

const Duplicidades = () => {
    const [duplicacoes, setDuplicacoes] = useState(null);
    const [showSpinner, setShowSpinner] = useState(true);
    const [filtroTabela, setFiltroTabela] = useState('todos');
    const [filtroCampo, setFiltroCampo] = useState('todos');
    const [busca, setBusca] = useState('');

    const tokenAuth = sessionStorage.getItem('userTokenAccess');

    const camposPorTabela = {
        todos: [
            { value: 'todos', label: 'Todos' }
        ],
        usuario: [
            { value: 'todos', label: 'Todos' },
            { value: 'email', label: 'E-mail' },
            { value: 'cpf_cnpj', label: 'CPF/CNPJ' },
            { value: 'telefone', label: 'Telefone' }
        ],
        anuncio: [
            { value: 'todos', label: 'Todos' },
            { value: 'email_comercial', label: 'E-mail Comercial' },
            { value: 'email_retorno', label: 'E-mail Retorno' },
            { value: 'email_autorizante', label: 'E-mail Autorizante' },
            { value: 'cpf_cnpj', label: 'CPF/CNPJ' },
            { value: 'telefone', label: 'Telefone' },
            { value: 'celular', label: 'Celular' }
        ]
    };

    const labelsCampos = {
        email: 'E-mail',
        cpf_cnpj: 'CPF/CNPJ',
        telefone: 'Telefone',
        email_comercial: 'E-mail Comercial',
        email_retorno: 'E-mail Retorno',
        email_autorizante: 'E-mail Autorizante',
        celular: 'Celular'
    };

    useEffect(() => {
        fetchDuplicacoes();
    }, []);

    useEffect(() => {
        setFiltroCampo('todos');
    }, [filtroTabela]);

    function fetchDuplicacoes() {
        setShowSpinner(true);
        fetch(`${masterPath.url}/admin/duplicacoes`, {
            headers: { "authorization": 'Bearer ' + tokenAuth }
        })
            .then(x => x.json())
            .then(res => {
                if (res.success) {
                    setDuplicacoes(res);
                }
                setShowSpinner(false);
            })
            .catch(() => setShowSpinner(false));
    }

    function getDadosFiltrados() {
        if (!duplicacoes) return [];

        const resultados = [];

        const tabelas = filtroTabela === 'todos' ? ['usuario', 'anuncio'] : [filtroTabela];

        tabelas.forEach(tabela => {
            const dadosTabela = duplicacoes[tabela];
            if (!dadosTabela) return;

            const campos = filtroCampo === 'todos' ? Object.keys(dadosTabela) : [filtroCampo];

            campos.forEach(campo => {
                const items = dadosTabela[campo] || [];
                items.forEach(item => {
                    if (busca && !String(item.valor).toLowerCase().includes(busca.toLowerCase())) return;
                    resultados.push({
                        tabela,
                        campo,
                        valor: item.valor,
                        total: item.total
                    });
                });
            });
        });

        resultados.sort((a, b) => b.total - a.total);
        return resultados;
    }

    function exportCSV() {
        const dados = getDadosFiltrados();
        if (dados.length === 0) return;

        let csv = 'Tabela,Campo,Valor,Quantidade\n';
        dados.forEach(d => {
            csv += `"${d.tabela}","${labelsCampos[d.campo] || d.campo}","${d.valor}",${d.total}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'duplicidades.csv';
        link.click();
    }

    const dados = getDadosFiltrados();

    return (
        <div className="Atividades">
            <section>
                {showSpinner && <Spinner />}

                <h1 className="px-4">Duplicidades</h1>
                <div className="container-fluid py-4 px-4">
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Tabela</label>
                            <select
                                className="form-select"
                                value={filtroTabela}
                                onChange={e => setFiltroTabela(e.target.value)}
                            >
                                <option value="todos">Todas</option>
                                <option value="usuario">Usuários</option>
                                <option value="anuncio">Anúncios</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Campo</label>
                            <select
                                className="form-select"
                                value={filtroCampo}
                                onChange={e => setFiltroCampo(e.target.value)}
                            >
                                {(camposPorTabela[filtroTabela] || camposPorTabela.todos).map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Buscar valor</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filtrar por valor..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button className="btn btn-success w-100" onClick={exportCSV}>
                                <i className="fa fa-download me-1"></i> Exportar CSV
                            </button>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col">
                            <span className="badge bg-secondary fs-6">
                                {dados.length} duplicidade{dados.length !== 1 ? 's' : ''} encontrada{dados.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                <article>
                    <div className="container-fluid px-4">
                        <div className="row">
                            <table className="table table-bordered table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>Tabela</th>
                                        <th>Campo</th>
                                        <th>Valor</th>
                                        <th className="text-center">Ocorrências</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dados.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <span className={`badge ${item.tabela === 'usuario' ? 'bg-primary' : 'bg-info'}`}>
                                                    {item.tabela === 'usuario' ? 'Usuário' : 'Anúncio'}
                                                </span>
                                            </td>
                                            <td>{labelsCampos[item.campo] || item.campo}</td>
                                            <td>{item.valor}</td>
                                            <td className="text-center">
                                                <span className={`badge ${item.total >= 5 ? 'bg-danger' : item.total >= 3 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                    {item.total}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {dados.length === 0 && !showSpinner && (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted py-4">
                                                Nenhuma duplicidade encontrada
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </article>
                <p className='w-100 text-center'>© MINISITIO - {version.version}</p>
            </section>
        </div>
    );
};

export default Duplicidades;
