import { useState, useEffect, useCallback } from 'react';
import { masterPath } from '../../../config/config';
import { Search, MapPin, Briefcase, Building2 } from 'lucide-react';

export default function BuscarProfissionais() {
    const [ufs, setUfs] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [atividades, setAtividades] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paginacao, setPaginacao] = useState({ paginaAtual: 1, totalPaginas: 1, totalItem: 0 });

    const [filtroUf, setFiltroUf] = useState('');
    const [filtroCidade, setFiltroCidade] = useState('');
    const [filtroBairro, setFiltroBairro] = useState('');
    const [filtroProfissao, setFiltroProfissao] = useState('');

    useEffect(() => {
        fetch(`${masterPath.url}/ufs`)
            .then(x => x.json())
            .then(res => setUfs(res))
            .catch(err => console.error('Erro ao buscar UFs:', err));

        fetch(`${masterPath.url}/atividades`)
            .then(x => x.json())
            .then(res => setAtividades(res.data || res))
            .catch(err => console.error('Erro ao buscar atividades:', err));
    }, []);

    useEffect(() => {
        if (filtroUf) {
            fetch(`${masterPath.url}/cadernos?uf=${filtroUf}`)
                .then(x => x.json())
                .then(res => setCidades(res.data || res))
                .catch(err => console.error('Erro ao buscar cidades:', err));
        } else {
            setCidades([]);
        }
        setFiltroCidade('');
    }, [filtroUf]);

    const buscar = useCallback((page = 1) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filtroUf) params.append('uf', filtroUf);
        if (filtroCidade) params.append('cidade', filtroCidade);
        if (filtroBairro) params.append('bairro', filtroBairro);
        if (filtroProfissao) params.append('profissao', filtroProfissao);
        params.append('page', page);

        fetch(`${masterPath.url}/buscar-profissionais?${params.toString()}`)
            .then(x => x.json())
            .then(res => {
                setResultados(res.data || []);
                setPaginacao({
                    paginaAtual: res.paginaAtual,
                    totalPaginas: res.totalPaginas,
                    totalItem: res.totalItem
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro ao buscar profissionais:', err);
                setLoading(false);
            });
    }, [filtroUf, filtroCidade, filtroBairro, filtroProfissao]);

    const handleSearch = (e) => {
        e.preventDefault();
        buscar(1);
    };

    const handlePageChange = (newPage) => {
        buscar(newPage);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <h4 className="mb-4">
                        <Search className="me-2" size={24} />
                        Buscar Profissionais
                    </h4>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSearch}>
                                <div className="row">
                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">
                                            <MapPin size={16} className="me-1" />
                                            UF
                                        </label>
                                        <select
                                            className="form-select"
                                            value={filtroUf}
                                            onChange={(e) => setFiltroUf(e.target.value)}
                                        >
                                            <option value="">Todas</option>
                                            {ufs.map(uf => (
                                                <option key={uf.id_uf} value={uf.sigla_uf}>
                                                    {uf.sigla_uf} - {uf.nome_uf}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">
                                            <Building2 size={16} className="me-1" />
                                            Cidade
                                        </label>
                                        <select
                                            className="form-select"
                                            value={filtroCidade}
                                            onChange={(e) => setFiltroCidade(e.target.value)}
                                            disabled={!filtroUf}
                                        >
                                            <option value="">Todas</option>
                                            {cidades.map(c => (
                                                <option key={c.codCaderno} value={c.nomeCaderno}>
                                                    {c.nomeCaderno}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">
                                            <MapPin size={16} className="me-1" />
                                            Bairro
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Buscar por bairro..."
                                            value={filtroBairro}
                                            onChange={(e) => setFiltroBairro(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-3 mb-3">
                                        <label className="form-label">
                                            <Briefcase size={16} className="me-1" />
                                            Profissão
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Barbeiro, Dentista..."
                                            value={filtroProfissao}
                                            onChange={(e) => setFiltroProfissao(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-12">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="fa fa-spinner fa-spin me-2"></i>
                                                    Buscando...
                                                </>
                                            ) : (
                                                <>
                                                    <Search size={16} className="me-2" />
                                                    Buscar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {resultados.length > 0 && (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>{paginacao.totalItem}</strong> profissionais encontrados
                                </span>
                                <span className="text-muted">
                                    Página {paginacao.paginaAtual} de {paginacao.totalPaginas}
                                </span>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Profissional</th>
                                                <th>Profissão</th>
                                                <th>Cidade/UF</th>
                                                <th>Endereço</th>
                                                <th>Telefone</th>
                                                <th>Perfil</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resultados.map(item => (
                                                <tr key={item.codAnuncio}>
                                                    <td>
                                                        <strong>{item.descAnuncio}</strong>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary">
                                                            {item.profissao || 'Não informado'}
                                                        </span>
                                                    </td>
                                                    <td>{item.cidade}/{item.estado}</td>
                                                    <td className="text-muted small">
                                                        {item.descEndereco}
                                                    </td>
                                                    <td>{item.descTelefone || item.descCelular}</td>
                                                    <td>
                                                        <a
                                                            href={`/perfil/${item.codAnuncio}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            Ver Perfil
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {paginacao.totalPaginas > 1 && (
                                    <nav>
                                        <ul className="pagination justify-content-center">
                                            <li className={`page-item ${paginacao.paginaAtual === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(paginacao.paginaAtual - 1)}
                                                    disabled={paginacao.paginaAtual === 1}
                                                >
                                                    Anterior
                                                </button>
                                            </li>
                                            {Array.from({ length: Math.min(5, paginacao.totalPaginas) }, (_, i) => {
                                                const start = Math.max(1, paginacao.paginaAtual - 2);
                                                const page = start + i;
                                                if (page > paginacao.totalPaginas) return null;
                                                return (
                                                    <li key={page} className={`page-item ${page === paginacao.paginaAtual ? 'active' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                            <li className={`page-item ${paginacao.paginaAtual === paginacao.totalPaginas ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(paginacao.paginaAtual + 1)}
                                                    disabled={paginacao.paginaAtual === paginacao.totalPaginas}
                                                >
                                                    Próximo
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {resultados.length === 0 && !loading && (
                <div className="row">
                    <div className="col-12 text-center py-5">
                        <Search size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">
                            Use os filtros acima para buscar profissionais
                        </h5>
                        <p className="text-muted">
                            Selecione UF, Cidade, Bairro ou Profissão e clique em Buscar
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
