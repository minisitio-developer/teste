// components/OutroComponente.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/css/users.css';
import 'font-awesome/css/font-awesome.min.css';
import { masterPath } from '../../../config/config';
import Swal from 'sweetalert2';

//componente
import Header from "../Header";
import Spinner from '../../../components/Spinner';

const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
};

const validateCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
    const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(cnpj.charAt(i)) * w1[i];
    let r = sum % 11;
    if (parseInt(cnpj.charAt(12)) !== (r < 2 ? 0 : 11 - r)) return false;
    sum = 0;
    for (let i = 0; i < 13; i++) sum += parseInt(cnpj.charAt(i)) * w2[i];
    r = sum % 11;
    return parseInt(cnpj.charAt(13)) === (r < 2 ? 0 : 11 - r);
};

const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
};

const FormCadastro = () => {

    const [usuarios, setUsuarios] = useState([]);
    const [page, setPage] = useState(1);
    const [ufSelected, setUf] = useState(0);
    const [uf, setUfs] = useState([]);
    const [caderno, setCaderno] = useState([]);
    const [showSpinner, setShowSpinner] = useState(false);
    const [estadoSelecionado, setEstadoSelecionado] = useState(null);

    const location = useLocation();


    const getParam = new URLSearchParams(location.search);

    const param = getParam.get('page') ? getParam.get('page') : 1;



    useEffect(() => {

        /*         fetch(`${masterPath.url}/admin/usuario?page=${param}`)
                    .then((x) => x.json())
                    .then((res) => {
                        setUsuarios(res);
                        console.log(usuarios);
                    })
         */
        /*       fetch(`${masterPath.url}/cadernos`)
                  .then((x) => x.json())
                  .then((res) => {
                      setCaderno(res)
                  }) */
        fetch(`${masterPath.url}/ufs`)
            .then((x) => x.json())
            .then((res) => {
                setUfs(res);
            })
    }, [page, param]);

    const style = {
        position: "fixed",
        zIndex: "999"
    }

    const navigate = useNavigate();

    function cadastrarUsuario() {
        setShowSpinner(true);
        var validation = false;

        const tipoPessoa = document.getElementById('codTipoPessoa').value;
        const cpfcnpj = document.getElementById('nu_doc').value;
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;

        document.querySelectorAll('[name="pwd"]').forEach((item) => {
            if (item.value === "") {
                item.style.border = "1px solid red";
                validation = false;
                return;
            } else {
                item.style.border = "1px solid gray";
                validation = true;
            };
        });

        document.querySelectorAll('select').forEach((item) => {
            if (item.value === "") {
                item.style.border = "1px solid red";
                validation = false;
                return;
            } else {
                item.style.border = "1px solid gray";
                validation = true;
            };
        });

        if (!nome || nome.length < 2) {
            Swal.fire({ icon: 'error', title: 'Nome inválido', text: 'O nome deve ter pelo menos 2 caracteres' });
            setShowSpinner(false);
            return;
        }

        if (!validateEmail(email)) {
            Swal.fire({ icon: 'error', title: 'E-mail inválido', text: 'Digite um e-mail válido' });
            setShowSpinner(false);
            return;
        }

        const docClean = cpfcnpj.replace(/[^\d]/g, '');
        if (tipoPessoa === 'F') {
            if (!validateCPF(docClean)) {
                Swal.fire({ icon: 'error', title: 'CPF inválido', text: 'Digite um CPF válido' });
                setShowSpinner(false);
                return;
            }
        } else if (tipoPessoa === 'J') {
            if (!validateCNPJ(docClean)) {
                Swal.fire({ icon: 'error', title: 'CNPJ inválido', text: 'Digite um CNPJ válido' });
                setShowSpinner(false);
                return;
            }
        }

        const data = {
            "TipoPessoa": document.getElementById('codTipoPessoa').value,
            "CPFCNPJ": document.getElementById('nu_doc').value,
            "Nome": document.getElementById('nome').value,
            "Email": document.getElementById('email').value,
            //"senha": document.getElementById('senha').value,
            "hashCode": 0,
            "Value": 0,
            "TipoUsuario": document.getElementById('codTipoPerfil').value,
            "Telefone": document.getElementById('telefone').value,
            "RepresentanteConvenio": "default",
            "Endereco": document.getElementById('endereco').value,
            "Uf": document.getElementById('coduf').value,
            "Cidade": document.getElementById('codcidade').value,
            "dtCadastro": new Date(),
            "usuarioCod": 0,
            "dtCadastro2": "",
            "dtAlteracao": "",
        };

        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": 'Bearer ' + sessionStorage.getItem('userTokenAccess')
            },
            body: JSON.stringify(data)
        };

        if (validation) {

            fetch(`${masterPath.url}/admin/usuario/create`, config)
                .then((x) => {

                    if (x.status === 401) {
                        alert("Sessão expirada, faça login para continuar.");
                        navigate('/login');
                        window.location.reload();
                        return Promise.reject('Sessão expirada');
                    }
                    return x.json();
                })
                .then((res) => {
                    console.log(res)
                    if (res.success) {
                        setShowSpinner(false);
                        Swal.fire({
                            title: 'sucesso!',
                            text: 'Usuário Cadastrado!',
                            icon: 'success',
                            confirmButtonText: 'Confirmar'
                        })
                        //let msg = alert("Usuário Cadastrado! \n você deseja voltar para a listagem de usuários?");
                    } else {

                        setShowSpinner(false);
                        let errorMsg = 'Erro ao cadastrar usuário.';
                        if (typeof res.message === 'string') {
                            errorMsg = res.message;
                        } else if (res.message?.errors?.[0]?.message) {
                            errorMsg = res.message.errors[0].message;
                        }
                        Swal.fire({
                            title: 'erro!',
                            text: errorMsg,
                            icon: 'error',
                            confirmButtonText: 'Entendi'
                        });
                    }
                }).catch((error) => {
                    if (error === 'Sessão expirada') {
                        console.log("Sessão expirada, redirecionamento já realizado.");
                    } else {
                        console.error('Erro na requisição:', error);
                    }
                });
        } else {
            setShowSpinner(false);
        }

    };

    const executarSelecao = () => {
        let codigoUf = document.querySelectorAll('#coduf')[0].value;
        setUf(codigoUf);
    };

    //liberar campo select
    document.querySelectorAll('select').forEach((item) => {
        item.addEventListener("change", (event) => {
            event.target.style.border = "1px solid gray";
        })
    });
    //liberar campo input
    document.querySelectorAll('[name="pwd"]').forEach((item) => {
        item.addEventListener("change", (event) => {
            event.target.style.border = "1px solid gray";
        })
    });

    function changeUf(e) {
        fetch(`${masterPath.url}/cadernos?uf=${e.target.value}`)
            .then((x) => x.json())
            .then((res) => {
                console.log(res)
                setCaderno(res);
            })
        setEstadoSelecionado(e.target.value)
        setUf(e.target.value);
    }

    return (
        <div className="users">

            {/*        <header style={style} className='w-100'>
                <Header />
            </header>*/}
            <section className='py-5'>


                <div className="container">
                    <h2 className="pt-4 px-5 text-center">Adicionar Usuário</h2>
                    {/* <h2>Vertical (basic) form</h2> */}
                    <form action="/action_page.php">
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="email" className="w-50 px-1">Indicado por: (Digite o nome, e-mail ou CPF/CNPJ):</label>
                            <input type="email" className="form-control h-25 w-50" id="in_email" placeholder="" name="email" />
                        </div>
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">Tipo pessoa:</label>
                            {/*  <input type="password" className="form-control h-25 w-50" id="pwd" placeholder="" name="pwd" /> */}
                            <select name="codTipoPessoa" id="codTipoPessoa" className="w-50 py-1">
                                <option value="" selected="selected">- Selecione o tipo de pessoa -</option>
                                <option value="pf">Fisica</option>
                                <option value="pj">Jurídica</option>
                            </select>
                        </div>

                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">CPF ou CNPJ:</label>
                            <input type="text" className="form-control h-25 w-50" id="nu_doc" placeholder="" name="pwd" />
                        </div>
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">Nome:</label>
                            <input type="text" className="form-control h-25 w-50" id="nome" placeholder="" name="pwd" />
                        </div>
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">Email:</label>
                            <input type="text" className="form-control h-25 w-50" id="email" placeholder="" name="pwd" />
                        </div>
                        {/*                         <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">Senha:</label>
                            <input type="password" className="form-control h-25 w-50" id="senha" placeholder="" name="pwd" />
                        </div> */}
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">Tipo usuário:</label>
                            <select name="codTipoPessoa" id="codTipoPerfil" className="w-50 py-1">
                                <option value="" selected="selected">- Selecione o tipo de perfil -</option>
                                {/* <option value="1">Administrador</option> */}
                                {/* <option value="2">Associado</option>
                                <option value="3">Licenciado</option> */}
                                <option value="1">Super Administrador</option>
                                <option value="2">Master</option>
                                <option value="3">Anunciante</option>
                                <option value="5">Prefeitura</option>
                            </select>
                        </div>
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">Telefone:</label>
                            <input type="text" className="form-control h-25 w-50" id="telefone" placeholder="" name="pwd" />
                        </div>
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">Endereço:</label>
                            <input type="text" className="form-control h-25 w-50" id="endereco" placeholder="" name="pwd" />
                        </div>

                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">UF:</label>
                            <select name="codTipoPessoa" id="coduf" onChange={(e) => changeUf(e)} className="w-50 py-1">
                                <option value="" selected="selected">- Selecione um estado -</option>
                                {
                                    uf.map((uf) => (
                                        <option value={uf.sigla_uf}>{uf.sigla_uf}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="pwd" className="w-50 px-1">Cidade:</label>
                            <select name="codTipoPessoa" id="codcidade" className="w-50 py-1">
                                <option value="" selected="selected">- Selecione uma cidade -</option>
                                {
                                    caderno.map((cidades) => (
                                        cidades.UF === ufSelected &&
                                        <option value={cidades.nomeCaderno}>{cidades.nomeCaderno}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className="text-center py-3">
                            <button type="button"
                                className="btn btn-info custom-button mx-2 text-light"
                                onClick={cadastrarUsuario}
                            >Salvar</button>
                            <button type="submit" className="btn custom-button" onClick={() => navigate('/admin/users')}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </section >
            <footer className='w-100' style={{ position: "relative", bottom: "0px" }}>
                <p className='w-100 text-center'>© MINISITIO</p>
            </footer>
        </div >
    );
}

export default FormCadastro;
