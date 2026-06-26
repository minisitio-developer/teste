const database = require('./config/db');
const Usuario = require('./models/table_usuarios');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await database.authenticate();
        console.log('Conectado ao banco');

        const existente = await Usuario.findOne({ where: { descCPFCNPJ: '23707648000199' } });
        if (existente) {
            console.log('Usuário já existe:', existente.codUsuario);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('Admin123', salt);

        const user = await Usuario.create({
            codTipoPessoa: 'J',
            descCPFCNPJ: '23707648000199',
            descNome: 'Administrador Teste',
            descEmail: 'admin@teste.com',
            senha: hash,
            codTipoUsuario: 1,
            codUf: 27,
            codCidade: 0,
            Telefone: '',
            RepresentanteConvenio: '',
            Endereco: '',
            ativo: 1
        });

        console.log('Usuário criado:', user.codUsuario);
        process.exit(0);
    } catch (err) {
        console.error('Erro:', err.message);
        process.exit(1);
    }
}

seed();
