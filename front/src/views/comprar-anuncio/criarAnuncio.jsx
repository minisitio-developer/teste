import { masterPath } from "../../config/config";

//LIBS
import Swal from 'sweetalert2';

export function criarAnuncio(tagValue, personType, radioCheck, setShowSpinner, descontoAtivado, setAlert, isAdmin, descValor, isCapa, precoFixo, minisitio) {


    let validation = true;

    document.querySelectorAll('[required]').forEach((item) => {
        if (item.value.trim() === "") {
            item.style.border = "1px solid red";
            validation = false;
        } else {
            item.style.border = "1px solid gray";
        }
    });

    if (!validation) {
        Swal.fire({
            title: "Atenção",
            text: "Preencha todos os campos obrigatórios!",
            icon: "warning",
            confirmButtonText: "OK"
        });
        return;
    }

    setShowSpinner(true);
    const formCreate = document.querySelector('.form-create');
    if (formCreate) {
        formCreate.style.filter = 'blur(2px)';
    }

    function finalizarComErro(message = "Nao foi possivel concluir o cadastro. Tente novamente.") {
        setShowSpinner(false);
        if (formCreate) {
            formCreate.style.filter = 'none';
        }
        Swal.fire({
            title: "Erro",
            text: message,
            icon: "error",
            confirmButtonText: "OK"
        });
    }

    fetch(`${masterPath.url}/portal/usuario/buscar/${pegarElemento('#descCPFCNPJ').replace(/[.\-\/]/g, '')}`)
        .then((x) => x.json())
        .then((res) => {
            if (res.success) {
                setShowSpinner(true);

                cadastrarAnuncio(res.usuario.codUsuario)
            } else {
                setShowSpinner(true);
                criarUsuario();
            };

        })
        .catch(() => finalizarComErro("Nao foi possivel consultar o usuario. Verifique sua conexao e tente novamente."))

    function criarUsuario() {
        const obj = {
            "TipoPessoa": pegarElemento('#descTipoPessoa-pf').checked ? "F" : "J",
            "CPFCNPJ": pegarElemento('#descCPFCNPJ').replace(/[.\-\/]/g, ''),
            "Nome": pegarElemento('#descNomeAutorizante'),
            "Email": pegarElemento('#descEmailAutorizante'),
            "Value": 0,
            "TipoUsuario": isCapa ? "5" : "3",
            "Telefone": pegarElemento('#descTelefone'),
            "RepresentanteConvenio": "default",
            "Endereco": pegarElemento('#descEndereco'),
            "Uf": pegarElemento('#codUf4'),
            "Cidade": pegarElemento('#codUf5'),
            "Cadastro": 31323,
            "usuarioCod": 0,
            "dtCadastro2": "12-12-2012",
            "dtAlteracao": "12-12-2012",
            "ativo": "1"

        };




        fetch(`${masterPath.url}/portal/usuario/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj),
        })
            .then((x) => x.json())
            .then((res) => {
                if (res.success && res.message?.codUsuario) {
                    cadastrarAnuncio(res.message.codUsuario)

                } else {
                    finalizarComErro(typeof res.message === 'string' ? res.message : "Nao foi possivel criar o usuario.");
                }
                //setShowSpinner(false);
            })
            .catch(() => finalizarComErro("Falha ao criar usuario. Tente novamente."));
    }

    function pegarElemento(elemento) {
        return document.querySelector(elemento).value;
    };

    function cadastrarAnuncio(codUser) {
        const obj = {
            codAnuncio: 37,
            codUsuario: codUser,
            codTipoAnuncio: radioCheck,
            codAtividade: buscarElemento("codAtividade"),
            codPA: null,
            codDuplicado: null,
            tags: JSON.stringify(tagValue),
            codCaderno: buscarElemento("codUf5"),
            codUf: buscarElemento("codUf4"),
            codCidade: buscarElemento("codUf5"),
            descAnuncio: buscarElemento("descAnuncio"),
            descAnuncioFriendly: "oficina-de-tortas",
            descImagem: minisitio?.descImagem || 0,//localStorage.getItem("imgname") != null ? localStorage.getItem("imgname") : 0,
            descEndereco: buscarElemento("descEndereco"),
            descTelefone: buscarElemento("descTelefone"),
            descCelular: buscarElemento("descCelular"),
            descDescricao: "",
            descSite: "www.oficinadetortas.com.br",
            descSkype: null,
            descPromocao: descValor,
            descEmailComercial: buscarElemento("descEmailComercial"),
            descEmailRetorno: buscarElemento("descEmailRetorno"),
            descFacebook: "",
            descTweeter: "",
            descWhatsApp: buscarElemento("descWhatsApp"),
            descCEP: buscarElemento("descCEP"),
            descTipoPessoa: buscarElemento("descTipoPessoa-pf").checked ? "pf" : "pj",
            descCPFCNPJ: buscarElemento("descCPFCNPJ").replace(/[.\-\/]/g, ''),
            descNomeAutorizante: buscarElemento("descNomeAutorizante"),
            descEmailAutorizante: buscarElemento("descEmailAutorizante"),
            codDesconto: buscarElemento("discountHash"),
            descLat: null,
            descLng: null,
            formaPagamento: null,
            promocaoData: null,
            descContrato: null,
            descAndroid: "",
            descApple: "",
            descInsta: null,
            descPatrocinador: null,
            descPatrocinadorLink: null,
            qntVisualizacoes: 813,
            activate: 1,
            dtCadastro: 1356636164,
            dtCadastro2: descontoAtivado ? Date.now() : null,
            dtAlteracao: Date.now(),
            descLinkedin: null,
            descTelegram: null,
            certificado_logo: null,
            certificado_texto: null,
            certificado_imagem: null,
            link_comprar: null,
            cashback_logo: null,
            cashback_link: null,
            certificado_link: null,
            cartao_digital: null,
            descYouTube: buscarElemento("descYouTube")
        };


        function buscarElemento(param) {
            let elementoSelecionado = document.querySelector(`#${param}`);

            if (elementoSelecionado != undefined) {
                return elementoSelecionado.value;
            } else {
                return null;
            }

        }

        if (obj.descCPFCNPJ === "") {
            alert("Preencha todos os campos");
            return;
        }

        fetch(`${masterPath.url}/portal/anuncio/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(obj),
        })
            .then((x) => x.json())
            .then((res) => {
                if (!res.success || !res.message?.codAnuncio) {
                    finalizarComErro(typeof res.message === 'string' ? res.message : "Nao foi possivel criar o anuncio.");
                    return;
                }

                const codAnuncio = res.message.codAnuncio
                //setShowSpinner(false);
                // Remover um item do localStorage
                localStorage.removeItem("imgname");
                window.scrollTo({ top: 0, behavior: 'smooth' });


                //setAlert(true);
                Swal.fire({
                    title: "Perfil Cadastrado",
                    text: "Você será redirecionado para página de login, para efetuar o login use o seu cnpj e a senha defenida no cadastro. Você também receberá as informações do acesso no email cadastrado.",
                    icon: "success",
                    didOpen: () => { setShowSpinner(false); }
                }).then(result => {
                    let idPerfil = res.message.codAnuncio;
                    let codDesconto = res.message.codDesconto;
                    let descontoAprovado = false;

                    /*          fetch(`${masterPath.url}/pagamento/create/${idPerfil}`)
                                 .then((x) => x.json())
                                 .then((response) => {
                                 }) */


                    //if (result.isConfirmed) {
                        if (isAdmin) {
                            let valorBruto = precoFixo;
                            /*              if (descontoAtivado && radioCheck === 4) {
                                             window.open(`/ver-anuncios/${limparCPFouCNPJ(obj.descCPFCNPJ)}`, '_blank');
                                         } else if (radioCheck === 1) {
                                             window.open(`/ver-anuncios/${limparCPFouCNPJ(obj.descCPFCNPJ)}`, '_blank');
                                         } else {
                                             window.open(`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=712696516-cad9b026-5622-4fe2-921c-3d2d336a6d82`, '_blank');
                                         } */
                            if (descontoAtivado && radioCheck === 4 && valorBruto <= 0) {
                                //window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(obj.descCPFCNPJ)}`;
                                window.location.href = import.meta.env.VITE_BASE_URL + `/perfil/${codAnuncio}`;
                            } else if (descontoAtivado && radioCheck === 3 && valorBruto <= 0) {
                                //window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(obj.descCPFCNPJ)}`;
                                window.location.href = import.meta.env.VITE_BASE_URL + `/perfil/${codAnuncio}`;
                            } else if (radioCheck === 1 && valorBruto <= 0) {
                                //window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(obj.descCPFCNPJ)}`;
                                window.location.href = import.meta.env.VITE_BASE_URL + `/perfil/${codAnuncio}`;
                            } else {
                                fetch(`${masterPath.url}/pagamento/create/${idPerfil}`)
                                    .then((x) => x.json())
                                    .then((response) => {
                                        window.location.href = response.url;

                                    })
                                    .catch(() => finalizarComErro("Nao foi possivel gerar o pagamento. Tente novamente."))
                            }

                            return;

                        } else {
                            fetch(`${masterPath.url}/portal/desconto/buscar/${codDesconto}`)
                                .then((x) => x.json())
                                .then((res) => {

                                    if (res.success) {
                                        if (res.IdsValue[0].desconto > 0) {
                                            descontoAprovado = true
                                        }


                                        //let valorBruto = 10 - res.IdsValue[0].desconto;

                                        let valorBruto = precoFixo;

                                        if (descontoAtivado && radioCheck === 4 && valorBruto <= 0) {
                                            //window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(obj.descCPFCNPJ)}`;
                                            window.location.href = import.meta.env.VITE_BASE_URL + `/perfil/${codAnuncio}`;
                                        } else if (descontoAtivado && radioCheck === 3 && valorBruto <= 0) {
                                            //window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(obj.descCPFCNPJ)}`;
                                            window.location.href = import.meta.env.VITE_BASE_URL + `/perfil/${codAnuncio}`;
                                        } else if (radioCheck === 1 && valorBruto <= 0) {
                                            //window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(obj.descCPFCNPJ)}`;
                                            window.location.href = import.meta.env.VITE_BASE_URL + `/perfil/${codAnuncio}`;
                                        } else {
                                            fetch(`${masterPath.url}/pagamento/create/${idPerfil}`)
                                                .then((x) => x.json())
                                                .then((response) => {
                                                    window.location.href = response.url;

                                                })
                                                .catch(() => finalizarComErro("Nao foi possivel gerar o pagamento. Tente novamente."))
                                            //window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=712696516-cad9b026-5622-4fe2-921c-3d2d336a6d82`;

                                        }
                                    } else {
                                        if (radioCheck === 3) {
                                            fetch(`${masterPath.url}/pagamento/create/${idPerfil}`)
                                                .then((x) => x.json())
                                                .then((response) => {
                                                    window.location.href = response.url;

                                                })
                                                .catch(() => finalizarComErro("Nao foi possivel gerar o pagamento. Tente novamente."))
                                        } else {
                                            //window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(obj.descCPFCNPJ)}`;
                                            window.location.href = import.meta.env.VITE_BASE_URL + `/perfil/${codAnuncio}`;
                                        }
                                    }
                                })

                        }

                    //}

                });
            })
            .catch(() => finalizarComErro("Falha ao criar anuncio. Tente novamente."));
    }




    function limparCPFouCNPJ(cpfOuCnpj) {
        return cpfOuCnpj.replace(/[.\-\/]/g, '');
    }

};
