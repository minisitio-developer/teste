import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import PrivateRoute from "./PrivateRoute";


import { TemaProvider } from '../context/BuscaContext';
import { QrcodeCadernoProvider } from "../context/QrcodeCadernoContext";

import Layout from "../layouts/Layout";
import Home from '../views/Home';

const Pesquisa = lazy(() => import('../views/Pesquisa'));
const Caderno = lazy(() => import('../views/Caderno'));
const TodosCaderno = lazy(() => import('../views/cadernos/geral/Caderno'));
const CadernoGeral = lazy(() => import('../views/CadernoGeral'));
const WebCard = lazy(() => import('../views/WebCard'));
const Login = lazy(() => import('../views/Login'));
const ComprarAnuncio = lazy(() => import('../views/ComprarAnuncio'));
const Dashboard = lazy(() => import('../admin/view/Dashboard'));
const BILayout = lazy(() => import('../admin/view/BI/BILayout'));
const BIDashboard = lazy(() => import('../admin/view/BI/Dashboard'));
const BiUfs = lazy(() => import('../admin/view/BI/Ufs'));
const BiCadernos = lazy(() => import('../admin/view/BI/Cadernos'));
const BiId = lazy(() => import('../admin/view/BI/Id'));
const BiAtividades = lazy(() => import('../admin/view/BI/Atividades'));
const BiCampanhas = lazy(() => import('../admin/view/BI/Campanhas'));
const BiContatos = lazy(() => import('../admin/view/BI/Contatos'));
const BiPerfisAtividade = lazy(() => import('../admin/view/BI/PerfisAtividade'));
const OutroComponente = lazy(() => import("../admin/view/OutroComponente"));
const Users = lazy(() => import("../admin/view/usuarios/Users"));
const Cadernos = lazy(() => import("../admin/view/cadernos/Cadernos"));
const CadernosEdit = lazy(() => import("../admin/view/cadernos/FormEdit"));
const InfoCadernos = lazy(() => import("../admin/view/InfoCadernos"));
const Atividades = lazy(() => import("../admin/view/Atividades/Atividades"));
const FormCadastroAtividade = lazy(() => import("../admin/view/Atividades/FormCadastroAtividade"));
const FormEditAtividade = lazy(() => import("../admin/view/Atividades/FormEditAtividade"));
const FormCadastro = lazy(() => import("../admin/view/usuarios/FormCadastro"));
const FormEditar = lazy(() => import("../admin/view/usuarios/FormEditar"));
const FormCadernos = lazy(() => import("../admin/view/cadernos/FormCadastroCadernos"));
const GerenciarIds = lazy(() => import("../admin/view/gerenciar_id/GerenciarIds"));
const GerenciarIdCadastro = lazy(() => import("../admin/view/gerenciar_id/FormCadastro"));
const GerenciarIdEditar = lazy(() => import("../admin/view/gerenciar_id/FormEdit"));
const Espacos = lazy(() => import("../admin/view/Espacos/Espacos"));
const AnuncioEditar = lazy(() => import("../admin/view/Espacos/FormEdit"));
const AnuncioCadastro = ComprarAnuncio;
const EspacosImport = lazy(() => import("../admin/view/Espacos/EspacosImport"));
const Pagamentos = lazy(() => import("../admin/view/Pagamentos/Pagamentos"));
const ConfigPay = lazy(() => import("../admin/view/Pagamentos/ConfigPay"));
const Pin = lazy(() => import("../admin/view/Pin/Pin"));
const PinCadastro = lazy(() => import("../admin/view/Pin/FormCadastro"));
const PinEditar = lazy(() => import("../admin/view/Pin/FormEdit"));
const BuscarProfissionais = lazy(() => import("../admin/view/BuscarProfissionais/BuscarProfissionais"));
const Calhau = lazy(() => import("../admin/view/Calhau/Calhau"));
const CalhauCadastro = lazy(() => import("../admin/view/Calhau/FormCadastro"));
const ConfiguracoesPortal = lazy(() => import("../admin/view/ConfiguracoesPortal/ConfiguracoesPortal"));
const AdminInstitucional = lazy(() => import("../admin/view/ConfiguracoesPortal/Institucioanl/Institucional"));
const AdminContato = lazy(() => import("../admin/view/ConfiguracoesPortal/Contato/index"));
const Duplicidades = lazy(() => import("../admin/view/Duplicidades/Duplicidades"));
const Campanha = lazy(() => import("../admin/view/Campanha/Campanha"));
const PainelAdmin = lazy(() => import("../views/painelAnuciante/PainelAdmin"));
const AssinanteCadastro = lazy(() => import("../views/area-assinante/AssinanteCadastro"));
const AtualizarPerfil = lazy(() => import("../views/comprar-anuncio/AtualizarPerfil"));
const Qrcode = lazy(() => import("../plugins/Qrcode"));
const Adesivo = lazy(() => import("../plugins/Adesivo"));
const Institucional = lazy(() => import("../views/infoPages/Institucional"));
const Contato = lazy(() => import("../views/infoPages/Contato"));
const PoliticaPrivacidade = lazy(() => import("../views/infoPages/PoliticaPrivacidade"));
const Promocoes = lazy(() => import("../views/promocao/Pesquisa"));
const NotFound = lazy(() => import('../views/NotFound'));
const ForgotPassword = lazy(() => import("../admin/components/ForgotPassword"));
const ResetPassword = lazy(() => import("../admin/components/ResetPassword"));
const Promocao = lazy(() => import("../views/campanha/Promocao"));
const TokenInvalido = lazy(() => import("../views/campanha/_components/404"));


function Rotas() {
    return (
        /*  <BrowserRouter>  */

        <TemaProvider> {/* Movido o TemaProvider para fora de Routes */}
            <Suspense fallback={null}>
            <Routes>
                <Route path="/">
                    <Route index element={<Home />} />
                    <Route path="buscar/:caderno/:estado" element={<Pesquisa />} />
                    <Route path="caderno/:atividade" element={<QrcodeCadernoProvider><Caderno /></QrcodeCadernoProvider>} />
                    <Route path="cadernos/:atividade" element={<TodosCaderno />} />
                    <Route path="caderno-geral/:caderno/:estado" element={<QrcodeCadernoProvider><CadernoGeral /></QrcodeCadernoProvider>} />
                    <Route path="perfil/:codAnuncio" element={<WebCard />} />
                    <Route path="login" element={<Login />} />
                    <Route path="sobre/:id" element={<OutroComponente />} />
                    <Route path="promocoes/:caderno/:estado" element={<Promocoes />} />
                    <Route path="promocao/:hash" element={<Promocao />} />
                    <Route path="token-invalido" element={<TokenInvalido />} />
                     <Route path="/comprar-espaco-minisitio" element={<ComprarAnuncio />} />
                     <Route path="/anuncie" element={<ComprarAnuncio />} />
                </Route>

                <Route element={<Layout />}>
                    <Route path="admin" element={
                        <PrivateRoute role={1}>
                            <Dashboard />
                        </PrivateRoute>}
                    />

                    <Route path="admin/dashboard" element={
                        <PrivateRoute role={1}>
                            <Dashboard />
                        </PrivateRoute>}
                    />

                    <Route path="admin/users" element={<PrivateRoute isAdmin={true}><Users /></PrivateRoute>} />
                    <Route path="admin/Cadernos" element={<PrivateRoute isAdmin={true}><Cadernos /></PrivateRoute>} />
                    <Route path="admin/info/Cadernos" element={<PrivateRoute isAdmin={true}><InfoCadernos /></PrivateRoute>} />
                    <Route path="admin/atividades" element={<PrivateRoute isAdmin={true}><Atividades /></PrivateRoute>} />
                    <Route path="admin/usuarios/cadastro" element={<PrivateRoute isAdmin={true}><FormCadastro /></PrivateRoute>} />
                    <Route path="admin/usuarios/editar" element={<PrivateRoute isAdmin={true}><FormEditar /></PrivateRoute>} />

                    <Route path="admin/cadernos/cadastro" element={<PrivateRoute isAdmin={true}><FormCadernos /></PrivateRoute>} />
                    <Route path="admin/atividades/cadastro" element={<PrivateRoute isAdmin={true}><FormCadastroAtividade /></PrivateRoute>} />
                    <Route path="admin/atividades/editar" element={<PrivateRoute isAdmin={true}><FormEditAtividade /></PrivateRoute>} />

                   
                    <Route path="admin/desconto" element={<PrivateRoute isAdmin={true}><GerenciarIds /></PrivateRoute>} />
                    <Route path="admin/desconto/cadastro" element={<PrivateRoute isAdmin={true}><GerenciarIdCadastro /></PrivateRoute>} />
                    <Route path="admin/desconto/editar" element={<PrivateRoute isAdmin={true}><GerenciarIdEditar /></PrivateRoute>} />

                    <Route path="admin/espacos" element={<PrivateRoute isAdmin={true}><Espacos /></PrivateRoute>} />
                    <Route path="admin/anuncio/cadastro" element={<PrivateRoute isAdmin={true} ><AnuncioCadastro isAdmin={true} /></PrivateRoute>} />
                    <Route path="admin/anuncio/editar" element={<PrivateRoute isAdmin={true}><AnuncioEditar /></PrivateRoute>} />
                    <Route path="admin/anuncio/import" element={<PrivateRoute isAdmin={true}><EspacosImport /></PrivateRoute>} />


                    <Route path="admin/pagamentos" element={<PrivateRoute isAdmin={true}><Pagamentos /></PrivateRoute>} />
                    <Route path="admin/pagamento/config" element={<PrivateRoute isAdmin={true}><ConfigPay /></PrivateRoute>} />

                    {/*ROTAS MODULO PIN*/}
                    <Route path="admin/pin" element={<PrivateRoute isAdmin={true}><Pin /></PrivateRoute>} />
                    <Route path="admin/buscar-profissionais" element={<PrivateRoute isAdmin={true}><BuscarProfissionais /></PrivateRoute>} />
                    <Route path="admin/pin/cadastro" element={<PrivateRoute isAdmin={true}><PinCadastro /></PrivateRoute>} />
                    <Route path="admin/pin/editar" element={<PrivateRoute isAdmin={true}><PinEditar /></PrivateRoute>} />

                    {/*ROTAS MODULO CALHAU*/}
                    <Route path="admin/calhau" element={<PrivateRoute isAdmin={true}><Calhau /></PrivateRoute>} />
                    <Route path="admin/calhau/cadastro" element={<PrivateRoute isAdmin={true}><CalhauCadastro /></PrivateRoute>} />

                    {/*ROTAS MODULO CONFIGURACÕES DO PORTAL*/}
                    <Route path="admin/configuracoes" element={<PrivateRoute isAdmin={true}><ConfiguracoesPortal /></PrivateRoute>} />
                    <Route path="admin/institucional" element={<PrivateRoute isAdmin={true}><AdminInstitucional /></PrivateRoute>} />
                    <Route path="admin/contato" element={<PrivateRoute isAdmin={true}><AdminContato /></PrivateRoute>} />

                    {/*ROTAS MODULO DUPLICIDADES*/}
                    <Route path="admin/duplicidades" element={<PrivateRoute isAdmin={true}><Duplicidades /></PrivateRoute>} />

                    {/*ROTAS MODULO GERAR CAMPANHA*/}
                    <Route path="admin/campanha" element={<PrivateRoute isAdmin={true}><Campanha /></PrivateRoute>} />


                    <Route path="admin/cadernos/editar" element={<PrivateRoute isAdmin={true}><CadernosEdit /></PrivateRoute>} />
                </Route>

                {/* ROTAS BI (fora do Layout para evitar sidebar duplicada) */}
                <Route path="admin/bi" element={
                    <PrivateRoute role={1}>
                        <BILayout />
                    </PrivateRoute>}
                >
                    <Route index element={<BIDashboard />} />
                    <Route path="ufs" element={<BiUfs />} />
                    <Route path="cadernos" element={<BiCadernos />} />
                    <Route path="id" element={<BiId />} />
                    <Route path="atividades" element={<BiAtividades />} />
                    <Route path="perfis-por-atividade" element={<BiPerfisAtividade />} />
                    <Route path="campanhas" element={<BiCampanhas />} />
                    <Route path="contatos" element={<BiContatos />} />
                </Route>

                {/* ROTAS PAINEL ADMIN DO ANUNCIANTE */}
                <Route path="ver-anuncios/:cpf" element={<PrivateRoute isAdmin={false}><PainelAdmin isPublic={true} /></PrivateRoute>} />

                {/* ROTAS AREA DO ASSINANTE */}
                <Route path="criar-cadastro" element={<AssinanteCadastro />} />
                <Route path="renovar/perfil/:codAnuncio" element={<AtualizarPerfil />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />


                <Route path="qrcode" element={<Qrcode />} />
                <Route path="adesivo" element={<Adesivo />} />

                {/* INFO PAGES */}
                <Route path="institucional" element={<Institucional />} />
                <Route path="contato" element={<Contato />} />
                <Route path="politica-privacidade" element={<PoliticaPrivacidade />} />

                {/* Rota para capturar páginas inexistentes */}
                <Route path="*" element={<NotFound />} />

            </Routes>
            </Suspense>
        </TemaProvider>

        /*  </BrowserRouter>  */

    );
}

export default Rotas;

