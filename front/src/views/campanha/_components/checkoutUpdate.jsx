
import moment from "moment";
import { masterPath } from "../../../config/config";

//LIBS
import Swal from 'sweetalert2';

export function checkoutUpdate(radioCheck, descontoAtivado, minisitio, codDescontoInserido, precoFixo) {

    function mostrarErroPagamento() {
        Swal.fire({
            title: 'Erro',
            text: 'Nao foi possivel gerar o pagamento. Tente novamente mais tarde.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    function redirecionarPagamento(url) {
        fetch(url)
            .then((x) => x.json())
            .then((response) => {
                if (!response.url) {
                    throw new Error('URL de pagamento ausente');
                }
                window.location.href = response.url;
            })
            .catch(mostrarErroPagamento);
    }



    fetch(`${masterPath.url}/portal/desconto/buscar/${codDescontoInserido}`)
        .then((x) => x.json())
        .then((res) => {
            minisitio.codTipoAnuncio = "3";

            let descontoAprovado = false;
            if (res.success) {
                if (res.IdsValue[0].desconto > 0) {
                    descontoAprovado = true
                }

                let valorBruto = precoFixo;


                if (descontoAtivado && radioCheck === 3 && valorBruto <= 0) {
                    // window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(minisitio.descCPFCNPJ)}`;
                    atualizarMinisitio()
                } else {
                    redirecionarPagamento(`${masterPath.url}/pagamento/create/${minisitio.codAnuncio}/${codDescontoInserido}`)
                    //window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=712696516-cad9b026-5622-4fe2-921c-3d2d336a6d82`;

                }
            } else {
                redirecionarPagamento(`${masterPath.url}/pagamento/create/${minisitio.codAnuncio}`)
                //window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(minisitio.descCPFCNPJ)}`;
            }
        })
        .catch(err => {
            console.error("Erro ao buscar desconto:", err);
            Swal.fire({
                title: 'Erro',
                text: 'Ocorreu um erro ao processar o desconto. Tente novamente mais tarde.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });

    function limparCPFouCNPJ(cpfOuCnpj) {
        return cpfOuCnpj.replace(/[.\-\/]/g, '');
    }

    function atualizarMinisitio() {

        minisitio.dtCadastro2 = Date.now(); // Data de cadastro fixa para homologação
        minisitio.dueDate = moment(Date.now()).add(1, 'year').toISOString(); // Data de vencimento fixa para homologação
        minisitio.qntVisualizacoes = 0;
        minisitio.descEndereco = "n"

        const config = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "authorization": 'Bearer ' + sessionStorage.getItem('userTokenAccess')
            },
            body: JSON.stringify(minisitio)
        };


        fetch(`${masterPath.url}/admin/anuncio/update/tipo?id=${minisitio.codAnuncio}`, config)
            .then((x) => x.json())
            .then((res) => {
                if (res.success) {
                    //setShowSpinner(false);
                    Swal.fire({
                        title: 'Parabéns!',
                        text: 'O seu minisitio foi atualizado com sucesso.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            //window.location.href = import.meta.env.VITE_BASE_URL + `/ver-anuncios/${limparCPFouCNPJ(minisitio.descCPFCNPJ)}`;
                            window.location.href = import.meta.env.VITE_BASE_URL + `/perfil/${minisitio.codAnuncio}`
                        }
                    })


                } else {
                    //setShowSpinner(false);
                    Swal.fire({
                        title: 'Erro',
                        text: 'Ocorreu um erro ao atualizar o minisitio. Tente novamente mais tarde.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }).catch((err) => {
                Swal.fire({
                    title: 'Erro',
                    text: 'Ocorreu um erro ao atualizar o minisitio. Tente novamente mais tarde.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            })


    }
};
