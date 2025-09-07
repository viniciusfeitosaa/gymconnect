const db = require('../config/database');

/**
 * Busca o plano atual do usuário
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object|null>} Dados do plano do usuário
 */
const getUserPlan = async userId => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.max_students,
        p.features,
        pt.plan_status,
        pt.plan_expires_at,
        pt.subscription_id
      FROM personal_trainers pt
      JOIN plans p ON pt.plan_id = p.id
      WHERE pt.id = ?
    `;

    const rows = await db.execute(query, [userId]);

    if (rows.length === 0) {
      // Se não encontrar plano, retorna plano gratuito
      return await getDefaultPlan();
    }

    const plan = rows[0];

    // Parse das features se for string JSON
    if (typeof plan.features === 'string') {
      plan.features = JSON.parse(plan.features);
    }

    return plan;
  } catch (error) {
    console.error('Erro ao buscar plano do usuário:', error);
    throw error;
  }
};

/**
 * Busca o plano padrão (gratuito)
 * @returns {Promise<Object>} Plano gratuito
 */
const getDefaultPlan = async () => {
  try {
    const query = 'SELECT * FROM plans WHERE id = ?';
    const [rows] = await db.execute(query, ['free']);

    if (rows.length === 0) {
      throw new Error('Plano gratuito não encontrado');
    }

    const plan = rows[0];
    if (typeof plan.features === 'string') {
      plan.features = JSON.parse(plan.features);
    }

    return plan;
  } catch (error) {
    console.error('Erro ao buscar plano padrão:', error);
    throw error;
  }
};

/**
 * Busca todos os planos disponíveis
 * @returns {Promise<Array>} Lista de planos
 */
const getAllPlans = async () => {
  try {
    const query =
      'SELECT * FROM plans WHERE is_active = true ORDER BY price ASC';
    const rows = await db.execute(query);

    return rows.map(plan => ({
      ...plan,
      features:
        typeof plan.features === 'string'
          ? JSON.parse(plan.features)
          : plan.features,
    }));
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    throw error;
  }
};

/**
 * Atualiza o plano do usuário
 * @param {number} userId - ID do usuário
 * @param {string} planId - ID do novo plano
 * @param {string} subscriptionId - ID da assinatura (opcional)
 * @returns {Promise<boolean>} Sucesso da operação
 */
const upgradeUserPlan = async (userId, planId, subscriptionId = null) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Verificar se o plano existe
    const planQuery = 'SELECT * FROM plans WHERE id = $1 AND is_active = true';
    const planRows = await connection.execute(planQuery, [planId]);

    if (planRows.length === 0) {
      throw new Error('Plano não encontrado ou inativo');
    }

    // Atualizar usuário
    await connection.executeUpdate(
      'UPDATE personal_trainers SET plan_id = $1, subscription_id = $2, plan_status = $3 WHERE id = $4',
      [planId, subscriptionId, 'active', userId]
    );

    // Criar/atualizar assinatura se houver subscriptionId
    if (subscriptionId) {
      await connection.execute(
        `
        INSERT INTO subscriptions (id, user_id, plan_id, status, mercadopago_subscription_id)
        VALUES (?, ?, ?, 'active', ?)
        ON DUPLICATE KEY UPDATE
        plan_id = VALUES(plan_id),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
      `,
        [subscriptionId, userId, planId, subscriptionId]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao fazer upgrade do plano:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Verifica se o usuário pode adicionar mais alunos
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object>} Resultado da verificação
 */
const checkStudentLimit = async userId => {
  try {
    const userPlan = await getUserPlan(userId);

    if (!userPlan.max_students) {
      // Plano ilimitado
      return { canAdd: true, current: 0, max: null };
    }

    // Contar alunos atuais
    const countQuery =
      'SELECT COUNT(*) as count FROM students WHERE personal_id = $1';
    const countRows = await db.execute(countQuery, [userId]);
    const currentCount = countRows[0].count;

    const canAdd = currentCount < userPlan.max_students;

    return {
      canAdd,
      current: currentCount,
      max: userPlan.max_students,
      plan: userPlan.name,
    };
  } catch (error) {
    console.error('Erro ao verificar limite de alunos:', error);
    throw error;
  }
};

/**
 * Cancela a assinatura do usuário
 * @param {number} userId - ID do usuário
 * @returns {Promise<boolean>} Sucesso da operação
 */
const cancelSubscription = async userId => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Buscar assinatura ativa
    const subQuery = `
      SELECT s.* FROM subscriptions s
      JOIN personal_trainers pt ON s.user_id = pt.id
      WHERE pt.id = $1 AND s.status = 'active'
    `;
    const subRows = await connection.execute(subQuery, [userId]);

    if (subRows.length > 0) {
      const subscription = subRows[0];

      // Atualizar status da assinatura
      await connection.executeUpdate(
        'UPDATE subscriptions SET status = $1, cancelled_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', subscription.id]
      );
    }

    // Rebaixar para plano gratuito
    await connection.executeUpdate(
      'UPDATE personal_trainers SET plan_id = $1, plan_status = $2, subscription_id = NULL WHERE id = $3',
      ['free', 'active', userId]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao cancelar assinatura:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Atualiza status da assinatura via webhook
 * @param {string} subscriptionId - ID da assinatura
 * @param {string} status - Novo status
 * @returns {Promise<boolean>} Sucesso da operação
 */
const updateSubscriptionStatus = async (subscriptionId, status) => {
  try {
    const query = `
      UPDATE subscriptions s
      JOIN personal_trainers pt ON s.user_id = pt.id
      SET s.status = ?, s.updated_at = CURRENT_TIMESTAMP
      WHERE s.mercadopago_subscription_id = ?
    `;

    const result = await db.executeUpdate(query, [status, subscriptionId]);

    // Se a assinatura foi cancelada, rebaixar para plano gratuito
    if (status === 'cancelled' || status === 'expired') {
      await db.execute(
        'UPDATE personal_trainers SET plan_id = "free", plan_status = "active" WHERE subscription_id = ?',
        [subscriptionId]
      );
    }

    return result.rowCount > 0;
  } catch (error) {
    console.error('Erro ao atualizar status da assinatura:', error);
    throw error;
  }
};

module.exports = {
  getUserPlan,
  getDefaultPlan,
  getAllPlans,
  upgradeUserPlan,
  checkStudentLimit,
  cancelSubscription,
  updateSubscriptionStatus,
};
