// components/OutroComponente.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/css/users.css';
import 'font-awesome/css/font-awesome.min.css';
import { masterPath } from '../../../config/config';

//componente
import Header from "../Header";
import Spinner from '../../../components/Spinner';

//LIBS
import Swal from 'sweetalert2';

const FormCadastro = () => {


    const [atividadeValue, setAtividade] = useState(false);
    const [page, setPage] = useState(1);
    const [showSpinner, setShowSpinner] = useState(false);

    const tokenAuth = sessionStorage.getItem('userTokenAccess');

    const location = useLocation();

    const navigate = useNavigate();

    const getParam = new URLSearchParams(location.search);

    const param = getParam.get('page') ? getParam.get('page') : 1;

    const style = {
        position: "fixed",
        zIndex: "999"
    }



    function criarAtividade() {

        var validation = false;
        setShowSpinner(true);

        const atividadeInput = document.getElementById('in_atividade');
        const corTituloSelect = document.getElementById('corTitulo');

        if (atividadeInput.value === "") {
            atividadeInput.style.border = "1px solid red";
            validation = false;
        } else {
            atividadeInput.style.border = "1px solid gray";
            validation = true;
        }

        if (corTituloSelect.value === "") {
            corTituloSelect.style.border = "1px solid red";
            validation = false;
        } else {
            corTituloSelect.style.border = "1px solid gray";
        }

        const data = {
            "atividade": atividadeInput.value,
            "nomeAmigavel": atividadeInput.value,
            "corTitulo": corTituloSelect.value,
        };

        const currentToken = sessionStorage.getItem('userTokenAccess');

        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": 'Bearer ' + currentToken
            },
            body: JSON.stringify(data)
        };

        if (validation) {
            fetch(`${masterPath.url}/admin/atividade/create`, config)
                .then((x) => {
                    if (x.status === 401) {
                        navigate('/login');
                        return Promise.reject('Sessão expirada');
                    }
                    return x.json();
                })
                .then((res) => {
                    if (res.success) {
                        setShowSpinner(false);
                        Swal.fire({
                            title: "Success!",
                            text: "Nova atividade registrada!",
                            icon: "success"
                        }).then(() => {
                            navigate('/admin/atividades');
                        });
                    } else {
                        setShowSpinner(false);
                        Swal.fire({
                            title: "Erro!",
                            text: res.message || "Não foi possível criar a atividade.",
                            icon: "error"
                        });
                    }
                })
                .catch((err) => {
                    setShowSpinner(false);
                    console.error('Erro:', err);
                    if (err !== 'Sessão expirada') {
                        Swal.fire("Erro", "Não foi possível criar a atividade.", "error");
                    }
                });
        } else {
            setShowSpinner(false);
        }

    };


    const handleChange = (event) => {
        const { name, value } = event.target;

        switch (event.target.id) {
            case "atividade":
                atividadeValue.atividade = value;
                break;
            case "corTitulo":
                atividadeValue.corTitulo = value;
                break;
            default:
                console.log("não encontrou");
                break;
        }


        setAtividade(prevState => ({
            ...prevState,
            [name]: value
        }));


    };

    return (
        <div className="users">
            <header style={style} className='w-100'>
                <Header />
            </header>
            <section className='py-5'>
                {showSpinner && <Spinner />}

                <div className="container">
                    <h2 className="pt-4 px-5 text-center">Adicionar Atividade</h2>
                    {/* <h2>Vertical (basic) form</h2> */}
                    <form action="/action_page.php">
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="in_atividade" className="w-50 px-1">Atividade:</label>
                            <input type="text" className="form-control h-25 w-50" id="in_atividade" placeholder="" name="atividade" onChange={handleChange} />
                        </div>
                        <div className="form-group d-flex flex-column align-items-center py-3">
                            <label for="corTitulo" className="w-50 px-1">Tipo Titulo:</label>
                            <select name="corTitulo" id="corTitulo" className="w-50 py-1">
                                <option value="">- Selecione o tipo de Titulo -</option>
                                <option value="normal">Normal</option>
                                <option value="principal">Principal</option>
                                <option value="capa">Capa</option>
                            </select>
                        </div>


                        <div className="text-center py-3">
                            <button type="button"
                                className="btn btn-info custom-button mx-2 text-light"
                                onClick={criarAtividade}
                            >Salvar</button>
                            <button type="submit" className="btn custom-button" onClick={() => navigate('/admin/atividades')}>Cancelar</button>
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
