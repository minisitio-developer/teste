import React from 'react';
import { useLocation } from 'react-router-dom';


import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CookieConsent from "react-cookie-consent";

import { masterPath } from './config/config';

//Rotas
import Rotas from './routes/Rotas'


class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); console.error('AppErrorBoundary caught:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#f5f6fa' }}>
          <div className="card shadow-sm p-4" style={{ maxWidth: 600, borderRadius: 12 }}>
            <h4 className="text-danger mb-3"><i className="fa fa-exclamation-triangle me-2"></i>Erro na aplicação</h4>
            <p className="text-muted mb-2">Ocorreu um erro inesperado. Tente recarregar a página.</p>
            <pre className="bg-light p-2 rounded" style={{ fontSize: '0.7rem', overflowX: 'auto', maxHeight: 300 }}>{this.state.error?.stack}</pre>
            <button className="btn btn-primary btn-sm mt-2" onClick={() => window.location.reload()}>
              <i className="fa fa-refresh me-1"></i>Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {

  /*  setInterval(() => {
     const config = {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "authorization": 'Bearer ' + masterPath.accessToken
       }
     };
 
 
     fetch(`${masterPath.url}/test-connection`, config)
      .then((x) => {
        if (x.status === 401) {
           alert("Sessão expirada, faça login para continuar.");
           //navigate('/login');
            window.location.href = import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL + '/login' : '/login';
           return Promise.reject('Sessão expirada');
         }
         return x.json();
       })
       .then((res) => {
         console.log(res)
       }).catch((error) => {
         if (error === 'Sessão expirada') {
           console.log("Sessão expirada, redirecionamento já realizado.");
           // Aqui você pode evitar que o erro seja mostrado globalmente
         } else {
           // Trate outros erros aqui, se necessário
           console.error('Erro na requisição:', error);
         }
       });
   }, 300000) */

  const location = useLocation();

  // Rotas onde o Cookie não deve aparecer
  const routesHiddenCookie = "promocao";

  const shouldShowCookie = !location.pathname.includes(routesHiddenCookie);
  //console.log(shouldShowCookie, location.pathname)

  return (
    <AppErrorBoundary>
      <Rotas />
      {shouldShowCookie && (
              <CookieConsent
        location="bottom"
        buttonText="Aceitar"
        declineButtonText="Recusar"
        enableDeclineButton
        cookieName="consentimentoUsuario"
        style={{ background: "#2B373B" }}
        buttonStyle={{ background: "#4CAF50", color: "#fff", fontSize: "13px", marginRight: "10px", borderRadius: "5px" }}
        declineButtonStyle={{ background: "#f44336", color: "#fff", fontSize: "13px", borderRadius: "5px" }}
        expires={15}
        onAccept={() => {
          console.log("Usuário aceitou os cookies!");
          // Ativar scripts de rastreamento aqui
        }}
        onDecline={() => {
          console.log("Usuário recusou os cookies.");
          // Bloquear scripts de rastreamento aqui
        }}
      >
        O Minisitio utiliza cookies para entregar uma melhor experiência durante a navegação.
        {/*   <a href={import.meta.env.VITE_BASE_URL + '/politica-de-privacidade'} style={{ color: "#FFD700" }}>
          Saiba mais
        </a> */}
      </CookieConsent>
      )}

    </AppErrorBoundary>

    /*     <BrowserRouter>
          <Routes>
            <Route path="/">
              <Route index element={<Home />} />
              <Route path="buscar" element={<Pesquisa />} />
              <Route path="caderno" element={<Caderno />} />
              <Route path="local" element={<WebCard />} />
              <Route path="admin" element={<Administrator />} />
              <Route path="sobre/:id" element={<OutroComponente />} />
            </Route>
          </Routes>
        </BrowserRouter> */

  );
}

export default App;