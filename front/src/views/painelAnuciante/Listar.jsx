import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { masterPath } from '../../config/config';

import '../../assets/css/PainelAdminAnunciante.css';


function Listar(props) {

    const [showSpinner, setShowSpinner] = useState(false);
    const [anuncios, setAnuncios] = useState([]);
    const [dadoPaginacao, setDadoPaginacao] = useState({});
    

    const { cpf } = useParams();

    const buscarAnuncioId = useCallback(() => {
        setShowSpinner(true);

        fetch(`${masterPath.url}/admin/anuncio/public/?search=${cpf}`)
            .then((x) => x.json())
            .then((res) => {
                if (res.success) {
                    setAnuncios(res.message.anuncios);
                    props.setAnunciosPainel(res.message);
                    setShowSpinner(false);
                    setDadoPaginacao(res.message);
                } else {
                    props.setAnunciosPainel(res.message);
                    setShowSpinner(false);
                }

            });
    }, [cpf, props]);

    useEffect(() => {
        buscarAnuncioId();
    }, [buscarAnuncioId]);

    function apagarAnuncio(e) {
        setShowSpinner(true);
        e.target.parentNode.parentNode.remove();

        fetch(`${masterPath.url}/admin/anuncio/delete/${e.target.title}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "authorization": 'Bearer ' + sessionStorage.getItem('userTokenAccess')
            },
        })
            .then((x) => x.json())
            .then((res) => {
                console.log(res)
                if (res.success) {
                    setShowSpinner(false);
                    alert("perfil apagado");
                    sair()
                    //document.querySelector(".selecionada").remove();
                }

            })
    };

    function sair() {
        sessionStorage.removeItem('authTokenMN');

    };


    return (
        <div className="painel-admin">

            {showSpinner && <button className="buttonload">
                <i className="fa fa-spinner fa-spin"></i>Carregando
            </button>}

            {/*  <header>
                <Mosaico logoTop={true} borda="flex" mosaicoImg={mosaicoImg} />
            </header> */}
            <main>
                {/*   <Busca paginaAtual={"caderno"} /> */}
                {/*  <h1 id="title-caderno" className='py-2 text-center'>Todos os meus espaços</h1> */}

                <div className='container'>
                    <div className='col-md-12'>
                        {/*  <UserNav /> */}
                        <div className="row lista">
                            <div className="col-md-12">
                                <div className="bg-cinza" style={{ "padding-top": "10px" }}>
                                    <div className="row">
                                        <div className="col-md-6">

                                        </div>
                                        <div className="col-md-6 text-right">
                                            <input id="buscar" className="pull-right margin-bottom-0" type="text" placeholder="Buscar" />
                                        </div>
                                        <div className="col-md-12" style={{ "padding-top": "10px" }}>
                                            <div id="paginacao">
                                                <table className="table table-bordered table-striped table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ "width": "132px" }}>--</th>
                                                            <th>Anúncio</th>
                                                            <th>COD</th>
                                                            <th>Pagamento</th>
                                                            <th>Cadastrado em</th>
                                                            <th>Atualizado em</th>
                                                            <th>Válido até</th>
                                                            <th>Valor Pago</th>
                                                            <th>Forma Pagamento</th>
                                                            <th>Data Pagamento</th>
                                                            <th>Cidade/UF</th>
                                                            <th>Ver perfil</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {anuncios.map((item) => (
                                                            <tr id={item.codAnuncio}>
                                                                <td>
                                                                    <a className="btn btn-xs btn-success" title="Editar" href="/12178481426/criar-anuncio/582210" onClick={(e) => props.btnEdit(e, 2)}>
                                                                        Editar
                                                                    </a>
                                                                    <a className="btn btn-xs btn-danger" title={item.codAnuncio} code={item.codAnuncio} href="/#" onClick={(e) => { e.preventDefault(); apagarAnuncio(e); }}>
                                                                        Apagar
                                                                    </a>
                                                                </td>
                                                                <td>{item.descAnuncio}</td>
                                                                <td>{item.codAnuncio}</td>
                                                                <td>
                                                                    <a className="btn btn-xs btn-success" href="/#">Isento</a>
                                                                </td>
                                                                <td>{item.createdAt.split("T")[0]}</td>
                                                                <td>{item.updatedAt.split("T")[0]}</td>
                                                                <td>{item.dueDate ? item.dueDate.split("T")[0] : ''}</td>
                                                                <td>0,00</td>
                                                                <td>isento</td>
                                                                <td>06/09/2024</td>
                                                                <td>{`${item.codCaderno}/${item.codUf}`}</td>
                                                                <td className='text-center ver-perfil'>
                                                                    <a
                                                                        href={`/perfil/${item.codAnuncio}`}
                                                                        className='text-decoration-none'
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <i className="fa fa-eye"></i>
                                                                        Ver
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <p>Página {dadoPaginacao.paginaAtual}/{dadoPaginacao.totalPaginas} (Total: {dadoPaginacao.totalItem})</p>
                                                    </div>
                                                    {/*  <div className="col-md-6">
                                                        <nav aria-label="Page navigation" className="pull-right">
                                                            <ul className="pagination">
                                                                <li className="disabled">
                                                                    <a href="javascript:;" onclick="return false;">Primeira</a>
                                                                </li>
                                                                <li className="disabled">
                                                                    <a href="javascript:;" onclick="return false;">Anterior</a>
                                                                </li>
                                                                <li className="disabled">
                                                                    <a href="javascript:;" onclick="return false;">Próxima</a>
                                                                </li>
                                                                <li className="disabled">
                                                                    <a href="javascript:;" onclick="return false;">Última</a>
                                                                </li>
                                                            </ul>
                                                        </nav>
                                                    </div> */}
                                                </div>

                                                {/*                 <style>
                                                    .pagination {
                                                        margin: 0;
    }
                                                </style>
                                                <script>
                                                    function apagar(url) {
        if (!confirm("Você tem certeza que deseja apagar esse registro?")) {
            return false;
        }

                                                    window.location = url;
    }
                                                </script> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



            </main>

            <footer>
                {/*     <Nav styleclassName="Nav" />
                <Footer /> */}
            </footer>
        </div >
    );
}

export default Listar;
