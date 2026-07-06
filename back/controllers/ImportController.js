const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const readline = require('readline');
const Sequelize = require('sequelize');
const database = require('../config/db');
const Atividade = require('../models/table_atividade');
const Usuarios = require('../models/table_usuarios');
const Descontos = require('../models/table_desconto');
const ImportStage = require('../models/table_importStage');
const Caderno = require('../models/table_caderno');
const Globals = require('../models/table_globals');
const saveImport = require('../functions/serverImport');

function dataNow() {
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const hora = String(dataAtual.getHours()).padStart(2, '0');
    const minutos = String(dataAtual.getMinutes()).padStart(2, '0');
    const segundos = String(dataAtual.getSeconds()).padStart(2, '0');
    return `${ano}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
}

function updateJsonName(filePath, endProccess, progress) {
    try {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const jsonData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(jsonData);

        data.progress = progress;
        data.fim = `${hours}:${minutes}:${seconds}`;
        data.endProccess = endProccess;

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Progresso atualizado para: ${progress}`);
    } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
    }
}

async function processRow(row, index, io, socketId, filePath, totalLinhasCsv, qtdaCounters, codigoDeDesconto) {
    try {
        if (index === 1) updateJsonName(filePath, false, 0);

        const idImport = row['idImport'];
        const codTipoAnuncio = row['TIPO'];
        const nomeAnuncio = row['NOME'];
        const telefone = row['TELEFONE'];
        const cep = row['CEP'];
        const estado = row['UF'];
        const cidade = row['CIDADE'];
        let tipoAtividade = row['ATIVIDADE_PRINCIPAL_CNAE'];
        const nuDocumento = row['CNPJ_CPF'];
        const autorizante = row['AUTORIZANTE'];
        const email = row['EMAIL'];
        const senha = 12345;

        const verificarAtividadeExists = await Atividade.findOne({
            where: { atividade: tipoAtividade }
        });

        if (!verificarAtividadeExists) {
            tipoAtividade = "Compras e Serviços";
        }

        const verificarUserExists = await Usuarios.findOne({
            where: { descCPFCNPJ: nuDocumento }
        });

        let codUser;
        if (verificarUserExists) {
            codUser = verificarUserExists.dataValues.codUsuario;
        } else {
            const dadosUsuario = {
                codTipoPessoa: "pf",
                descCPFCNPJ: nuDocumento,
                descNome: nomeAnuncio || `import${index}`,
                descEmail: email || "atualizar",
                descEndereco: "atualizar",
                senha,
                hashCode: "0",
                codTipoUsuario: 3,
                descTelefone: telefone || "atualizar",
                codUf: estado,
                codCidade: cidade,
                dtCadastro: dataNow(),
                usuarioCod: 0,
                dtCadastro2: dataNow(),
                dtAlteracao: dataNow(),
                ativo: "1"
            };
            const novoUsuario = await Usuarios.create(dadosUsuario);
            codUser = novoUsuario.dataValues.codUsuario;
        }

        const dataObj = {
            codUsuario: codUser,
            idImport: idImport,
            codTipoAnuncio,
            codAtividade: tipoAtividade,
            codCaderno: cidade,
            codUf: estado,
            codCidade: cidade,
            descAnuncio: nomeAnuncio || `import${index}`,
            descImagem: 0,
            descEndereco: "atualizar",
            descTelefone: telefone || "atualizar",
            descCelular: 0,
            descEmailComercial: 0,
            descEmailRetorno: email,
            descWhatsApp: 0,
            descCEP: cep,
            descTipoPessoa: "pf",
            descCPFCNPJ: nuDocumento,
            descNomeAutorizante: autorizante || `import${index}`,
            descEmailAutorizante: 0,
            codDesconto: codigoDeDesconto ? codigoDeDesconto.hash : '00.000.0000',
            descChavePix: 'chavePix',
            qntVisualizacoes: 0,
            codDuplicado: 0,
            descPromocao: 0,
            activate: 1,
        };

        qtdaCounters.dataObjGeral = dataObj;

        if (dataObj.codTipoAnuncio == 1) {
            qtdaCounters.qtdaBasico += 1;
        }
        if (dataObj.codTipoAnuncio == 2) {
            qtdaCounters.qtdaBasico += 1;
        }
        if (dataObj.codTipoAnuncio == 3) {
            qtdaCounters.qtdaCompleto += 1;
        }

        updateJsonName(filePath, false, index);
        console.log(`Linha ${index} importada com sucesso.`);

        const progress = Math.round((index / totalLinhasCsv) * 100);
        io.to(socketId).emit('download-progress', { progress });

        return dataObj;
    } catch (error) {
        console.error(`Erro ao importar linha ${index}:`, error);
        return null;
    }
}

async function importarPerfis(io, socketId, res) {
    const filePath = path.join(__dirname, '../public/importLog.json');
    const arquivoImportado = path.join(__dirname, '../public/import/uploadedfile.csv');
    const BATCH_SIZE = 500;
    const qtdaCounters = { qtdaBasico: 0, qtdaCompleto: 0, dataObjGeral: null };

    const fileStream = fs.createReadStream(arquivoImportado);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let total = 0;
    for await (const line of rl) {
        if (line.trim() !== '') total++;
    }

    const totalLinhasCsv = total - 1;

    await Globals.update({
        value: totalLinhasCsv
    }, {
        where: {
            keyValue: "total_importacao"
        }
    });

    console.log("Iniciando leitura do arquivo...");
    let index = 1;
    let importError = false;
    const MAX_IMPORT_RECORDS = 100000;
    const stream = fs.createReadStream(arquivoImportado).pipe(csv({
        separator: ';',
        quote: '"',
    }));

    const batch = [];

    for await (const row of stream) {
        if (importError) break;

        if (index > MAX_IMPORT_RECORDS) {
            console.log(`Limite de ${MAX_IMPORT_RECORDS} registros atingido.`);
            if (batch.length > 0) {
                await ImportStage.bulkCreate(batch);
            }
            const logInicial = { progress: 0, endProccess: true };
            fs.writeFileSync(filePath, JSON.stringify(logInicial, null, 2), 'utf8');
            if (!res.headersSent) {
                return res.json({ success: true, message: `Importação limitada a ${MAX_IMPORT_RECORDS} registros.` });
            }
            break;
        }

        let codigoDeDesconto = await Descontos.findOne({ where: { hash: row["ID"] } });

        if (!codigoDeDesconto) {
            console.log(`ID não encontrado: ${row['ID']}`);
            importError = true;
            const logInicial = { progress: 0, endProccess: true };
            fs.writeFileSync(filePath, JSON.stringify(logInicial, null, 2), 'utf8');
            if (!res.headersSent) {
                return res.status(404).json({ success: false, message: "O codigo de ID não foi encontrado." });
            }
            break;
        }

        const dataObj = await processRow(row, index, io, socketId, filePath, totalLinhasCsv, qtdaCounters, codigoDeDesconto);

        if (dataObj) {
            batch.push(dataObj);
        }

        if (batch.length >= BATCH_SIZE) {
            await ImportStage.bulkCreate(batch);
            batch.length = 0;
        }

        index++;
    }

    if (batch.length > 0) {
        await ImportStage.bulkCreate(batch);
    }

    if (importError) return;

    console.log("Arquivo lido com sucesso!");

    const logInicial = { progress: 0, endProccess: true };
    fs.writeFileSync(filePath, JSON.stringify(logInicial, null, 2), 'utf8');

    res.json({ success: true, message: "Importação" });
    updateJsonName(filePath, false, index - 1);

    try {
        const cadernos = await Caderno.findOne({
            where: {
                UF: qtdaCounters.dataObjGeral.codUf,
                nomeCaderno: qtdaCounters.dataObjGeral.codCaderno
            },
            attributes: ['codCaderno', 'basico', 'completo', 'total']
        });

        cadernos.basico = cadernos.basico + qtdaCounters.qtdaBasico;
        cadernos.completo = cadernos.completo + qtdaCounters.qtdaCompleto;
        cadernos.total = cadernos.total + (qtdaCounters.qtdaBasico + qtdaCounters.qtdaCompleto);
        await cadernos.save();

        io.to(socketId).emit('download-complete');

        const query = `UPDATE importStage
            JOIN (
                SELECT codAnuncio, 
                    CEIL(ROW_NUMBER() OVER (ORDER BY codAtividade ASC, codTipoAnuncio DESC, createdAt ASC, descAnuncio ASC) / 10) AS 'page_number'
                FROM importStage
                WHERE codUf = :estado AND codCaderno = :caderno
            ) AS temp
            ON importStage.codAnuncio = temp.codAnuncio
            SET importStage.page = temp.page_number
            WHERE importStage.codUf = :estado AND importStage.codCaderno = :caderno
        `;

        await database.query(query, {
            replacements: { estado: qtdaCounters.dataObjGeral.codUf, caderno: qtdaCounters.dataObjGeral.codCaderno },
            type: Sequelize.QueryTypes.UPDATE,
        });

        console.log(`Reorganização concluída para o estado:`, qtdaCounters.dataObjGeral.codUf);

    } catch (error) {
        console.error("Erro ao executar a reorganização:", error);
    }
}

function importController(io) {
    return {
        upload: saveImport().single('uploadedfile'),
        importar: async (req, res) => {
            const socketId = req.params.socketId;
            console.log("Cliente conectado:", socketId);

            try {
                await importarPerfis(io, socketId, res);
            } catch (err) {
                console.error("Erro ao importar perfis:", err);
                if (!res.headersSent) {
                    return res.status(500).json({ success: false, message: "Erro ao importar perfis" });
                }
            }
        }
    };
}

module.exports = importController;
