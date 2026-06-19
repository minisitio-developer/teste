import Mosaico from '../../components/Mosaico';
import Busca from '../../components/Busca';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

import '../../assets/css/PainelAdminAnunciante.css';

function PoliticaPrivacidade() {
    return (
        <div className="painel-admin">
            <header>
                <Mosaico logoTop={true} borda="flex" mosaicoImg={[]} />
            </header>
            <main>
                <Busca paginaAtual={"caderno"} />
                <h1 id="title-caderno" className="py-2 text-center">Política de Privacidade</h1>

                <div className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-md-10">
                            <div className="bg-cinza p-4">
                                <h4>1. Dados Coletados</h4>
                                <p>Coletamos dados fornecidos voluntariamente pelos usuários, como nome, e-mail, telefone, CPF/CNPJ e endereço, durante o cadastro e uso do site.</p>

                                <h4>2. Uso dos Dados</h4>
                                <p>Os dados são utilizados exclusivamente para: prestação de serviços, comunicação sobre sua conta, envio de informações solicitadas e melhoria da experiência no site.</p>

                                <h4>3. Compartilhamento</h4>
                                <p>Não compartilhamos dados pessoais com terceiros, exceto quando necessário para cumprir obrigações legais ou prestar serviços essenciais (ex: processamento de pagamentos).</p>

                                <h4>4. Segurança</h4>
                                <p>Adotamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição.</p>

                                <h4>5. Cookies</h4>
                                <p>Utilizamos cookies para melhorar a navegação e personalizar conteúdo. Você pode configurar seu navegador para recusar cookies, embora isso possa afetar a funcionalidade do site.</p>

                                <h4>6. Direitos do Usuário</h4>
                                <p>Você pode acessar, corrigir ou solicitar a exclusão dos seus dados pessoais a qualquer momento, entrando em contato conosco.</p>

                                <h4>7. Retenção de Dados</h4>
                                <p>Mantemos seus dados pelo tempo necessário para fornecer os serviços ou conforme exigido por lei.</p>

                                <h4>8. Alterações</h4>
                                <p>Esta política pode ser atualizada periodicamente. Recomendamos verificar esta página regularmente.</p>

                                <h4>9. Contato</h4>
                                <p>Em caso de dúvidas sobre esta política, entre em contato conosco através da nossa <a href="/contato">página de contato</a>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <Nav styleclassName="Nav" />
                <Footer />
            </footer>
        </div>
    );
}

export default PoliticaPrivacidade;
