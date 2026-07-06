const Promocao = require('../models/table_promocao');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

async function deletarPromocoesExpiradas() {

  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const destroyed = await Promocao.destroy({
      where: {
        data_validade: { [Op.lt]: hoje }
      }
    });

    if (destroyed < 1) return;

    console.log(`${destroyed} promoções expiradas deletadas.`);
  } catch (error) {
    console.error('Erro ao deletar promoções expiradas:', error);
    return;
  }
}

module.exports = {
  deletarPromocoesExpiradas
};
