//models
const database = require('../config/db');
const Caderno = require('../models/table_caderno');
const Anuncio = require('../models/table_anuncio');
const Atividade = require('../models/table_atividade');
const Promocao = require('../models/table_promocao');
const Uf = require('../models/table_uf');
const path = require('path');
const fs = require('fs');

const Sequelize = require('sequelize');
const Pagamento = require('../models/table_pagamentos');
const { Op } = Sequelize;

/* (
  a.descAnuncio LIKE :termo AND a.activate = 1 OR 
  atv.atividade LIKE :termo AND a.activate = 1 OR
  atv.nomeAmigavel LIKE :termo OR 
  t.tagValue LIKE :termo AND
  a.activate = 1
) */

module.exports = {
    busca: async (req, res) => {
        const paginaAtual = req.query.page ? parseInt(req.query.page) : 1;
        const porPagina = 10;
        const offset = (paginaAtual - 1) * porPagina;


        const { uf, cidade, atividade, name, telefone, nu_documento, codigoCaderno } = req.body;

        try {
            const cadernoParam = decodeURIComponent(codigoCaderno || '');
            const cadernoInfo = await Caderno.findOne({
                where: { UF: uf, [Op.or]: [{ nomeCadernoFriendly: cadernoParam }, { nomeCaderno: cadernoParam }] },
                raw: true
            });

            const nomeCadernoReal = (cadernoInfo && cadernoInfo.nomeCaderno) ? cadernoInfo.nomeCaderno : cadernoParam;
            const codCadernoId = cadernoInfo ? String(cadernoInfo.codCaderno) : '';

            let anuncios;
            try {
                anuncios = await database.query(`SELECT a.*
    FROM anuncio a
    WHERE 
        a.activate = 1
        AND a.codUf = :uf
        AND (a.codCaderno = :caderno OR a.codCaderno = :cadernoId)
        AND (
            a.descAnuncio LIKE :termo
            OR EXISTS (
                SELECT 1 FROM atividade atv
                WHERE atv.atividade = a.codAtividade
                  AND (atv.atividade LIKE :termo OR atv.nomeAmigavel LIKE :termo)
            )
            OR EXISTS (
                SELECT 1 FROM tags t
                WHERE t.codAnuncio = a.codAnuncio
                  AND t.tagValue LIKE :termo
            )
        )
    ORDER BY a.codAtividade ASC, a.codTipoAnuncio DESC, a.createdAt ASC, a.descAnuncio ASC
    LIMIT :limit OFFSET :offset;`, {
                    replacements: {
                        termo: `%${atividade}%`,
                        uf: uf,
                        caderno: nomeCadernoReal,
                        cadernoId: codCadernoId,
                        limit: porPagina,
                        offset: offset
                    },
                    type: database.QueryTypes.SELECT,
                });
            } catch (queryErr) {
                console.warn('Query com tabela tags falhou, tentando sem tags:', queryErr.message);
                anuncios = await database.query(`SELECT a.*
    FROM anuncio a
    WHERE 
        a.activate = 1
        AND a.codUf = :uf
        AND (a.codCaderno = :caderno OR a.codCaderno = :cadernoId)
        AND (
            a.descAnuncio LIKE :termo
            OR EXISTS (
                SELECT 1 FROM atividade atv
                WHERE atv.atividade = a.codAtividade
                  AND (atv.atividade LIKE :termo OR atv.nomeAmigavel LIKE :termo)
            )
        )
    ORDER BY a.codAtividade ASC, a.codTipoAnuncio DESC, a.createdAt ASC, a.descAnuncio ASC
    LIMIT :limit OFFSET :offset;`, {
                    replacements: {
                        termo: `%${atividade}%`,
                        uf: uf,
                        caderno: nomeCadernoReal,
                        cadernoId: codCadernoId,
                        limit: porPagina,
                        offset: offset
                    },
                    type: database.QueryTypes.SELECT,
                });
            }


            if (req.query.totalPages > 0) {
                return res.json({
                    success: true, data: anuncios,
                    paginaAtual: req.query.paginaAtual,
                    totalPaginas: req.query.totalPaginas,
                    totalItem: req.query.totalItens
                });
            } else {
                let resultAnuncioCount;
                try {
                    [resultAnuncioCount] = await database.query(
                        `SELECT COUNT(*) AS total
    FROM anuncio a
    WHERE 
      a.activate = 1
      AND a.codUf = :uf
      AND (a.codCaderno = :caderno OR a.codCaderno = :cadernoId)
      AND (
        a.descAnuncio LIKE :termo
        OR EXISTS (
          SELECT 1 FROM atividade atv
          WHERE atv.atividade = a.codAtividade
            AND (atv.atividade LIKE :termo OR atv.nomeAmigavel LIKE :termo)
        )
        OR EXISTS (
          SELECT 1 FROM tags t
          WHERE t.codAnuncio = a.codAnuncio
            AND t.tagValue LIKE :termo
        )
      )`, {
                        replacements: {
                            termo: `%${atividade}%`,
                            uf: uf,
                            caderno: nomeCadernoReal,
                            cadernoId: codCadernoId
                        },
                        type: database.QueryTypes.SELECT
                    });
                } catch (countErr) {
                    console.warn('Count com tabela tags falhou, tentando sem tags:', countErr.message);
                    [resultAnuncioCount] = await database.query(
                        `SELECT COUNT(*) AS total
    FROM anuncio a
    WHERE 
      a.activate = 1
      AND a.codUf = :uf
      AND (a.codCaderno = :caderno OR a.codCaderno = :cadernoId)
      AND (
        a.descAnuncio LIKE :termo
        OR EXISTS (
          SELECT 1 FROM atividade atv
          WHERE atv.atividade = a.codAtividade
            AND (atv.atividade LIKE :termo OR atv.nomeAmigavel LIKE :termo)
        )
      )`, {
                        replacements: {
                            termo: `%${atividade}%`,
                            uf: uf,
                            caderno: nomeCadernoReal,
                            cadernoId: codCadernoId
                        },
                        type: database.QueryTypes.SELECT
                    });
                }

                const totalItens = resultAnuncioCount.total;
                const totalPaginas = Math.ceil(totalItens / porPagina);


                res.json({
                    success: true, data: anuncios,
                    paginaAtual: paginaAtual,
                    totalPaginas: totalPaginas,
                    totalItem: totalItens, teste: ""
                });
            }
        } catch (error) {
            console.error('Erro na busca:', error);
            res.status(500).json({ success: false, message: 'Erro ao processar busca', data: [], paginaAtual: 1, totalPaginas: 0, totalItem: 0 });
        }

        return;
    },
    buscarCaderno: async (req, res) => {
        const uf = req.query.uf;

        if (!uf || uf === 'undefined' || uf === 'null') {
            return res.json([]);
        }

        try {
            const cadernos = await Caderno.findAll({
                where: {
                    UF: uf
                },
                order: [
                    ['isCapital', 'ASC'],
                    ['nomeCaderno', 'ASC']
                ],
            });
            return res.json(cadernos);
        } catch (error) {
            console.log(error)
        }
  
    },
    buscarUf: async (req, res) => {

        const ufs = await Uf.findAll({
              order: [
                ['sigla_uf', 'ASC'],
            ],
        });

        res.json(ufs);
    },
    buscarAtividades: async (req, res) => {
        try {
            const atividades = await Atividade.findAll({
                attributes: ['atividade', 'nomeAmigavel'],
                order: [['nomeAmigavel', 'ASC']]
            });
            res.json({ success: true, data: atividades });
        } catch (error) {
            console.error('Erro ao buscar atividades:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    },
    buscaGeralCadernoold: async (req, res) => {

        const paginaAtual = req.query.page ? parseInt(req.query.page) : 1; // Página atual, padrão: 1
        const porPagina = 10; // Número de itens por página
        const codigoCaderno = req.params.codCaderno;
        const offset = (paginaAtual - 1) * porPagina;

        // Consulta para recuperar apenas os itens da página atual
        const anuncios = await Anuncio.findAndCountAll({
            where: {
                codCaderno: codigoCaderno,
            },
            limit: porPagina,
            offset: offset
        });

        // Número total de itens
        const totalItens = anuncios.count;
        // Número total de páginas
        const totalPaginas = Math.ceil(totalItens / porPagina);

        console.log({
            anuncios: anuncios.rows, // Itens da página atual
            paginaAtual: paginaAtual,
            totalPaginas: totalPaginas
        })

        res.json({
            anuncios: anuncios.rows, // Itens da página atual
            paginaAtual: paginaAtual,
            totalPaginas: totalPaginas
        });
    },
    buscaGeralCaderno: async (req, res) => {

        const paginaAtual = req.query.page ? parseInt(req.query.page) : 1;
        const porPagina = 10;
        const codigoCaderno = req.params.codCaderno;
        const offset = (paginaAtual - 1) * porPagina;

        try {
            const anuncios = await Anuncio.findAndCountAll({
                where: {
                    codCaderno: codigoCaderno,
                },
                limit: porPagina,
                offset: offset
            });

            const totalItens = anuncios.count;
            const totalPaginas = Math.ceil(totalItens / porPagina);

            res.json({
                anuncios: anuncios.rows,
                paginaAtual: paginaAtual,
                totalPaginas: totalPaginas
            });
        } catch (error) {
            console.error('Erro ao buscar anúncios do caderno:', error);
            res.status(500).json({ success: false, message: 'Erro ao buscar anúncios do caderno' });
        }
    },
    buscaAtividade: async (req, res) => {

        const codAtividade = req.params.codAtividade;

        //Atividades
        const resultAtividades = await Atividade.findAll();

        res.json(resultAtividades);
    },
    buscaAnuncio: async (req, res) => {
        const codigoAnuncio = req.params.codAnuncio;

        try {
            const resultAnuncio = await Anuncio.findAll({
                where: {
                    codAnuncio: codigoAnuncio
                },
                include: [{
                    model: Promocao,
                    as: 'promoc',
                    attributes: ['data_validade', 'banner']
                },
                {
                    model: Pagamento,
                    as: 'dataPagamento',
                    attributes: ['data']
                }]
            });

            if (!resultAnuncio || resultAnuncio.length === 0) {
                return res.status(404).json({ success: false, message: 'Anúncio não encontrado' });
            }

            const cader = await resultAnuncio[0].getCaderno();
            const atividades = await resultAnuncio[0].getAtividade();
            const descontoHash = await resultAnuncio[0].getDesconto();

            const atividadeAmigavel = await Atividade.findOne({
                where: {
                    atividade: resultAnuncio[0].codAtividade
                },
                raw: true,
                attributes: ["nomeAmigavel"]
            });

            resultAnuncio[0].setDataValue('nomeCaderno', resultAnuncio[0].codCaderno);
            resultAnuncio[0].setDataValue('nomeAtividade', atividadeAmigavel ? atividadeAmigavel.nomeAmigavel : resultAnuncio[0].codAtividade);
            resultAnuncio[0].setDataValue('hash', resultAnuncio[0].codDesconto);

            res.json(resultAnuncio);
        } catch (err) {
            console.error('Erro ao buscar anúncio:', err);
            res.status(500).json({ success: false, message: 'Erro ao buscar anúncio' });
        }
    },
    progressImport: async (req, res) => {

        // Caminho do arquivo JSON
        const filePath = path.join(__dirname, '../public/importLog.json');

        // Função para ler o arquivo JSON
        async function readJsonFile(filePath) {
            try {
                const jsonData = await fs.promises.readFile(filePath, 'utf8');
                const data = JSON.parse(jsonData);
                res.json({ success: true, message: data })
                return data;
            } catch (error) {
                console.error('Erro ao ler o arquivo JSON:', error);
                return null;
            }
        }

        // Chamar a função
        const jsonData = await readJsonFile(filePath);

        // Exemplo: acessar os dados do JSON
        /*      if (jsonData) {
                 console.log(`Nome: ${jsonData.name}`);
                 console.log(`Idade: ${jsonData.age}`);
                 console.log(`Email: ${jsonData.email}`);
             } */



    },
    buscarPromocoes: async (req, res) => {
        const { caderno, uf } = req.params;

        const promocoes = await Promocao.findAll({
            where: {
                uf: uf,
                caderno: caderno
            },
            include: {
                model: Anuncio,
                as: 'anuncio',
                attributes: ['codAtividade', 'descEndereco']
            }
        });

        if (promocoes.length < 1) {
            res.json({ success: false, message: 'não existe promoção para esse caderno' }).status(404)
        } else {
            res.json({ success: true, promocoes: promocoes }).status(200)
        }

    },

    buscarProfissionais: async (req, res) => {
        const paginaAtual = req.query.page ? parseInt(req.query.page) : 1;
        const porPagina = 20;
        const offset = (paginaAtual - 1) * porPagina;

        const { uf, cidade, bairro, profissao } = req.query;

        try {
            let whereConditions = ['a.activate = 1'];
            let replacements = {};

            if (uf) {
                whereConditions.push('a.codUf = :uf');
                replacements.uf = uf;
            }
            if (cidade) {
                whereConditions.push('a.codCaderno = :cidade');
                replacements.cidade = cidade;
            }
            if (bairro) {
                whereConditions.push('a.descEndereco LIKE :bairro');
                replacements.bairro = `%${bairro}%`;
            }
            if (profissao) {
                whereConditions.push('(atv.atividade LIKE :profissao OR atv.nomeAmigavel LIKE :profissao)');
                replacements.profissao = `%${profissao}%`;
            }

            const whereClause = whereConditions.join(' AND ');

            const countQuery = `
                SELECT COUNT(*) as total
                FROM anuncio a
                LEFT JOIN atividade atv ON a.codAtividade = atv.atividade
                WHERE ${whereClause}
            `;

            const dataQuery = `
                SELECT 
                    a.codAnuncio, a.descAnuncio, a.descEndereco, a.descTelefone,
                    a.descCelular, a.descImagem, a.codAtividade, a.codCaderno, a.codUf,
                    a.descCPFCNPJ, a.descEmailComercial, a.createdAt,
                    atv.nomeAmigavel AS profissao,
                    c.nomeCaderno AS cidade,
                    c.UF AS estado
                FROM anuncio a
                LEFT JOIN atividade atv ON a.codAtividade = atv.atividade
                LEFT JOIN caderno c ON a.codCaderno = c.nomeCaderno
                WHERE ${whereClause}
                ORDER BY atv.nomeAmigavel ASC, a.descAnuncio ASC
                LIMIT :limit OFFSET :offset
            `;

            const [countResult] = await database.query(countQuery, {
                replacements,
                type: Sequelize.QueryTypes.SELECT
            });

            const anuncios = await database.query(dataQuery, {
                replacements: { ...replacements, limit: porPagina, offset },
                type: Sequelize.QueryTypes.SELECT
            });

            const totalPaginas = Math.ceil(countResult.total / porPagina);

            res.json({
                success: true,
                data: anuncios,
                paginaAtual,
                totalPaginas,
                totalItem: countResult.total
            });

        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }
}
