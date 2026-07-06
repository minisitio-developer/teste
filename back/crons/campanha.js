const Campanha = require('../models/table_campanha');
const TokensPromocao = require('../models/tokens_promocao');
const Anuncio = require('../models/table_anuncio');
const Sequelize = require('sequelize');
const { Op } = Sequelize;
const database = require('../config/db');

async function inativarCampanhasExpiradas() {
  console.log('Iniciando inativação de campanhas expiradas...');

  try {
    const hoje = new Date();

    const [updated] = await Campanha.update({
      status: 'expired'
    }, {
      where: {
        [Op.and]: {
          status: 'valid',
          data_fim: { [Op.lt]: new Date() }
        }
      }
    });

    console.log(`Inativadas ${updated} campanhas expiradas.`, hoje);
  } catch (error) {
    console.error('Erro ao inativar campanhas expiradas:', error);
    return;
  }
}

async function downgradePerfil() {
  console.log('Iniciando downgrade de perfil...');

  const t = await database.transaction();

  try {
    const hoje = new Date();

    const tokensExpirados = await TokensPromocao.findAll({
      where: {
        [Op.and]: {
          dataLimitePromocao: { [Op.lt]: new Date() },
          statusPromocao: { [Op.ne]: 'vencido' }
        }
      },
      raw: true,
      transaction: t
    });

    if (!tokensExpirados.length) {
      console.log('Nenhum perfil expirado encontrado no momento.');
      await t.commit();
      return;
    }

    const tokenIds = tokensExpirados.map(token => token.id);
    await TokensPromocao.update({
      statusPromocao: 'vencido'
    }, {
      where: {
        id: {
          [Op.in]: tokenIds
        }
      },
      transaction: t
    });

    const campanhaIds = [...new Set(tokensExpirados.map(token => token.campanhaId).filter(Boolean))];
    const campanhas = await Campanha.findAll({
      where: { id: { [Op.in]: campanhaIds } },
      attributes: ['id', 'idRetorno'],
      raw: true,
      transaction: t
    });
    const retornoMap = Object.fromEntries(campanhas.map(campanha => [campanha.id, campanha.idRetorno]));

    const perfisExpirados = tokensExpirados.map(token => ({
      codAnuncio: token.codAnuncio,
      codDesconto: retornoMap[token.campanhaId] ?? token.idRetorno
    }));

    await Promise.all(perfisExpirados.map(perfil =>
      Anuncio.update({
        codTipoAnuncio: 1,
        codDesconto: perfil.codDesconto
      }, {
        where: {
          codAnuncio: perfil.codAnuncio
        },
        transaction: t
      })
    ));

    await t.commit();

    console.log(`downgrades em ${tokensExpirados.length} de perfis expirados.`, hoje);
  } catch (error) {
    await t.rollback();
    console.error('Erro ao atualizar perfil expirados:', error);
    return;
  }
}

module.exports = {
  inativarCampanhasExpiradas,
  downgradePerfil
};
