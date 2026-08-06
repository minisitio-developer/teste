import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

import Mosaico from '../components/Mosaico';
import ComponentLogin from '../admin/components/ComponentLogin';
import Footer from '../components/Footer';
import PageLayout from '../components/PageLayout';

function login() {
    return (
        <PageLayout className="login">
            <header>
                <Mosaico logoTop={true} borda="none" />
            </header>
            <main>
                <ComponentLogin />
            </main>

            <footer>
                <Footer />
            </footer>

        </PageLayout>
    )
}

export default login;