import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import Mosaico from '../components/Mosaico';
import ComponentLogin from '../admin/components/ComponentLogin';
import Footer from '../components/Footer';

function login() {
    return (
        <div className="login">
            <header>
                <Mosaico logoTop={true} borda="none" />
            </header>
            <main>
                <ComponentLogin />
            </main>

            <footer>
                <Footer />
            </footer>

        </div>
    )
}

export default login;