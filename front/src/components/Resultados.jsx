import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';



import '../assets/css/main.css';
import '../assets/css/default.css';
import '../assets/css/card.css';

import 'bootstrap/dist/css/bootstrap.min.css';
/* import 'font-awesome/css/font-awesome.min.css'; */
import { useBusca } from '../context/BuscaContext';
import Cardlist from './Cardlist';
import Pagination from './Pagination';
import { distanceKm, formatDistanceKm, hasCoordinates } from '../utils/geoDistance';

function Resultados() {

    const [anuncio, setAnuncio] = useState([]);
    const [ qtdaResult, setQtdaResult] = useState(0);
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const { result, setResult } = useBusca([]);


    const location = useLocation();
    const navigate = useNavigate();
    const paramBusca = location.state?.paramBusca

    useEffect(() => {
        //console.log(result)
        let cadernoUf = sessionStorage.getItem("uf: ");
        let cadernoCidade = sessionStorage.getItem("caderno: ");

        const capas = [
        "ADMINISTRAÇÃO REGIONAL / PREFEITURA",
        "EMERGÊNCIA",
        "UTILIDADE PÚBLICA",
        "HOSPITAIS PÚBLICOS",
        "CÂMARA DE VEREADORES - CÂMARA DISTRITAL",
        "SECRETARIA DE TURISMO",
        "INFORMAÇÕES",
        "EVENTOS NA CIDADE"
        ]

        if(!result || !result.data || result.data.length < 1) return;

        setQtdaResult(result.totalItem);


    }, [result])

    var cidade = document.querySelector('#codUf3');

    const resultadosOrdenados = (() => {
        const data = result.data || [];
        if (!userLocation) return data;

        return [...data].sort((a, b) => {
            const distanceA = distanceKm(userLocation, a);
            const distanceB = distanceKm(userLocation, b);

            if (distanceA === null && distanceB === null) return 0;
            if (distanceA === null) return 1;
            if (distanceB === null) return -1;
            return distanceA - distanceB;
        });
    })();

    const resultadosComCoordenadas = resultadosOrdenados.filter(hasCoordinates).length;

    function ativarPertoDeMim() {
        setLocationError('');

        if (!navigator.geolocation) {
            setLocationError('Seu navegador nao suporta localizacao.');
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationLoading(false);
            },
            () => {
                setLocationError('Nao foi possivel obter sua localizacao.');
                setLocationLoading(false);
            },
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
        );
    }


    return (
        <div className="resultados">
            <div className="container p-5">
                <div className='row text-start'>

                    <h4>Exibindo resultados para: {paramBusca}</h4>
                    <h6>Foram encontrados {qtdaResult} registros</h6>
                    <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={ativarPertoDeMim}
                            disabled={locationLoading}
                            title="Ordenar resultados com coordenadas pela sua distancia"
                        >
                            <i className={`fa ${locationLoading ? 'fa-spinner fa-spin' : 'fa-location-arrow'} me-1`}></i>
                            {locationLoading ? 'Localizando' : 'Perto de mim'}
                        </button>
                        {userLocation && (
                            <span className="text-muted small">
                                {resultadosComCoordenadas} resultado(s) com distancia estimada
                            </span>
                        )}
                        {locationError && <span className="text-danger small">{locationError}</span>}
                    </div>
                </div>
                <div className='row text-start mb-4'>
                    {resultadosOrdenados.map((item) => (
                        <Cardlist
                            anuncio={item}
                            key={item.codAnuncio}
                            caderno={cidade}
                            codImg={item.descImagem}
                            codCity={item.codCidade}
                            distancia={formatDistanceKm(distanceKm(userLocation, item))}
                        />
                    ))}
                </div>
                {qtdaResult > 0 &&
                    <Pagination totalPages={result.totalPaginas} paginaAtual={result.paginaAtual} totalItem={result.totalItem} table={"results"} />

                }
            </div>
           
        </div>
    );
}

export default Resultados;
