const Promocao = require('../models/table_promocao');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

async function deletarPromocoesExpiradas() {

  try {
    const hoje = new Date().toISOString().split('T')[0];
    const promocoes = await Promocao.findAll({
      where: {
        data_validade: { [Op.lt]: hoje }
      }
    });

    if (promocoes.length < 1) return;

    for (const promocao of promocoes) {
      await promocao.destroy();
    }

    console.log(`Deletadas ${promocoes.length} promoções expiradas.`);
  } catch (error) {
    console.error('Erro ao deletar promoções expiradas:', error);
    return;
  }
}

module.exports = {
  deletarPromocoesExpiradas
};