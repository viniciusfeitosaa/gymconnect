const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  checkPlanLimits,
  requireActivePlan,
  checkResourceLimit,
  addPlanInfo,
} = require('../middleware/planMiddleware');
const {
  getUserPlan,
  getAllPlans,
  upgradeUserPlan,
  checkStudentLimit,
  cancelSubscription,
  updateSubscriptionStatus,
} = require('../services/planService');

/**
 * GET /api/plans
 * Busca todos os planos disponíveis
 */
router.get('/', async (req, res) => {
  try {
    const plans = await getAllPlans();
    res.json({
      success: true,
      plans: plans,
    });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * GET /api/plans/user
 * Busca o plano atual do usuário
 */
router.get('/user', authenticateToken, addPlanInfo, async (req, res) => {
  try {
    const userPlan = await getUserPlan(req.user.id);

    if (!userPlan) {
      return res.status(404).json({
        success: false,
        error: 'Plano do usuário não encontrado',
      });
    }

    res.json({
      success: true,
      plan: userPlan,
    });
  } catch (error) {
    console.error('Erro ao buscar plano do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * GET /api/plans/check-limit/:resource
 * Verifica limites do plano para um recurso específico
 */
router.get('/check-limit/:resource', authenticateToken, (req, res) => {
  const { resource } = req.params;

  switch (resource) {
    case 'students':
      checkStudentLimit(req.user.id)
        .then(limit => {
          res.json({
            success: true,
            canProceed: limit.canAdd,
            limit: limit,
          });
        })
        .catch(error => {
          console.error('Erro ao verificar limite de alunos:', error);
          res.status(500).json({
            success: false,
            error: 'Erro ao verificar limite',
          });
        });
      break;

    default:
      res.status(400).json({
        success: false,
        error: 'Recurso não suportado',
      });
  }
});

/**
 * POST /api/plans/upgrade
 * Faz upgrade do plano do usuário
 */
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const { planId, subscriptionId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'ID do plano é obrigatório',
      });
    }

    // Verificar se o plano existe
    const plans = await getAllPlans();
    const planExists = plans.find(p => p.id === planId);

    if (!planExists) {
      return res.status(400).json({
        success: false,
        error: 'Plano não encontrado',
      });
    }

    // Fazer upgrade
    await upgradeUserPlan(req.user.id, planId, subscriptionId);

    // Buscar plano atualizado
    const updatedPlan = await getUserPlan(req.user.id);

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      plan: updatedPlan,
    });
  } catch (error) {
    console.error('Erro ao fazer upgrade do plano:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * POST /api/plans/cancel
 * Cancela a assinatura do usuário
 */
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    await cancelSubscription(req.user.id);

    // Buscar plano atualizado (deve ser gratuito)
    const updatedPlan = await getUserPlan(req.user.id);

    res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
      plan: updatedPlan,
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * POST /api/plans/webhook/mercadopago
 * Webhook para atualizar status da assinatura via Mercado Pago
 */
router.post('/webhook/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'subscription') {
      const { id: subscriptionId } = data;

      // Aqui você faria uma chamada para a API do Mercado Pago
      // para buscar o status atual da assinatura
      // Por enquanto, vamos simular

      const status = 'active'; // ou 'cancelled', 'expired', etc.

      await updateSubscriptionStatus(subscriptionId, status);

      res.json({
        success: true,
        message: 'Status da assinatura atualizado',
      });
    } else {
      res.json({
        success: true,
        message: 'Webhook recebido mas não processado',
      });
    }
  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * GET /api/plans/limits
 * Busca todos os limites do usuário
 */
router.get('/limits', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar limite de alunos
    const studentLimit = await checkStudentLimit(userId);

    res.json({
      success: true,
      limits: {
        students: studentLimit,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar limites:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

/**
 * Middleware para verificar limite de alunos em rotas específicas
 */
router.use('/students', checkResourceLimit('students'));

module.exports = router;
