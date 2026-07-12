import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/header.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import { AuthContext } from '../../context/AuthContext';

function Header() {

    const { user } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);

    function sair() {
        sessionStorage.removeItem('authTokenMN');
        sessionStorage.removeItem('userLogged');
        sessionStorage.removeItem('userTokenAccess');
    };

    let usuarioLogado = sessionStorage.getItem('userLogged');


    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = (e) => {

        const caminhoCompleto = e.target.href;
        // Cria um objeto URL para analisar a URL
        const url = new URL(caminhoCompleto);

        // Obtém o pathname
        const pathname = url.pathname;

        if (location.pathname === pathname) {
            // Evita o comportamento padrão do Link
            e.preventDefault();

            // Redireciona para outra rota e depois retorna
            navigate('/temp-route');
            setTimeout(() => navigate(pathname), 0);
        }
        setMenuOpen(false);
    };

    return (
        <div className='header header-bg navbar navbar-fixed-top'>
            <div className="container-fluid header-main">
                <div className="d-flex align-items-center justify-content-between">
                    <Link className="nav-link brand" to="/admin" >
                        <img src="../../assets/img/logo.png" alt="MINISITIO" width="50" />
                    </Link>
                    <button
                        className="btn btn-outline-light d-md-none"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        <i className={`fa fa-${menuOpen ? 'times' : 'bars'}`}></i>
                    </button>
                    <ul className={`nav d-none d-md-flex justify-content-center mb-0`} style={{ fontSize: '15px', flex: 1 }}>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/dashboard" onClick={handleClick}>Dashboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/users" onClick={handleClick}>Usuarios</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/cadernos" onClick={handleClick}>Cadernos</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" id="modu-atividade" to="/admin/atividades" onClick={handleClick}>Atividades</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link espacos" to="/admin/espacos" onClick={handleClick}>Espacos</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/desconto" onClick={handleClick}>Gerenciar IDs</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/pagamentos" onClick={handleClick}>Pagamentos</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/pin" onClick={handleClick}>PINs</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/admin/duplicidades" onClick={handleClick}>Duplicidades</Link>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/" onClick={sair}>Sair</a>
                        </li>
                    </ul>
                    <div className="d-none d-md-flex btn-group-header">
                        <a href="#" data-toggle="dropdown" className="btn-quit dropdown-toggle">
                            <i className="icon-user"></i> {user.descNome} <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu">
                            <li><a href={import.meta.env.VITE_BASE_URL + '/mdluser/auth/logout'}>Sair</a></li>
                        </ul>
                    </div>
                </div>
                {menuOpen && (
                    <div className="d-md-none pb-3">
                        <ul className="nav flex-column" style={{ fontSize: '15px' }}>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/dashboard" onClick={handleClick}>Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/users" onClick={handleClick}>Usuarios</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/cadernos" onClick={handleClick}>Cadernos</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/atividades" onClick={handleClick}>Atividades</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/espacos" onClick={handleClick}>Espacos</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/desconto" onClick={handleClick}>Gerenciar IDs</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/pagamentos" onClick={handleClick}>Pagamentos</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/pin" onClick={handleClick}>PINs</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/duplicidades" onClick={handleClick}>Duplicidades</Link>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/" onClick={sair}>Sair</a>
                            </li>
                        </ul>
                        <div className="mt-2 px-3">
                            <small className="text-muted">Logado: {user.descNome}</small>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

};

export default Header;