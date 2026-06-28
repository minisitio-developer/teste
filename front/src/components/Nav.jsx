import React, { useEffect, useState } from 'react';
import '../assets/css/main.css';
import { masterPath } from '../config/config';

function Nav(props) {
    const [pin, setPin] = useState();

    useEffect(() => {
        fetch(`${masterPath.url}/portal/pin/`)
            .then(x => x.json())
            .then(res => {
                if (res.success && res.pin) {
                    setPin(res.pin.codigo)
                }
            })
            .catch(() => {});
    }, []);

    return (
        <div className={`${props.styleclassName} menu d-flex align-items-center`}>
            <div className="container">
                <ul className="nav justify-content-center">
                    <li className="nav-item">
                        <a className="nav-link" href="/">INÍCIO</a>
                    </li>
                    {/*   <li className="nav-item">
                        <a className="nav-link" href="/login">ÁREA DO ASSINANTE</a>
                    </li> */}
                    <li className="nav-item">
                        <a className="nav-link" href="/institucional">INSTITUCIONAL</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="https://9fffd075-9657-453a-acdc-237b7f47b8c1-00-3uwg4at33lca3.kirk.replit.dev/" target='_blank' rel='noopener noreferrer' >TRABALHE CONOSCO</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/contato">CONTATO</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link disabled" href="#">MINISITIO PIN: {pin}</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/admin/dashboard" style={{fontWeight:'bold', color:'#ffc107'}}>DASHBOARD</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Nav;
