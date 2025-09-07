const { getUserPlan, checkStudentLimit } = require('../services/planService');

/**
 * Middleware para verificar limites de planos
 * @param {string} resource - Tipo de recurso a verificar (students, workouts, etc.)
 * @returns {Function} Middleware function
 */
const checkPlanLimits = resource => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Buscar plano do usuário
      const userPlan = await getUserPlan(userId);

      if (!userPlan) {
        return res.status(500).json({
          error: 'Erro ao verificar plano do usuário',
        });
      }

      // Verificar limites baseados no recurso
      switch (resource) {
        case 'students':
          const studentLimit = await checkStudentLimit(userId);

          if (!studentLimit.canAdd) {
            return res.status(403).json({
              error: 'Limite de alunos atingido',
              message: `Você atingiu o limite de ${studentLimit.max} alunos do seu plano ${studentLimit.plan}`,
              currentPlan: userPlan.name,
              maxStudents: studentLimit.max,
              currentStudents: studentLimit.current,
              upgradeUrl: '/dashboard/plans',
              planLimits: {
                resource: 'students',
                current: studentLimit.current,
                max: studentLimit.max,
                canAdd: false,
              },
            });
          }

          // Adicionar informações do limite ao request
          req.planLimits = {
            students: studentLimit,
          };
          break;

        case 'workouts':
          // Para treinos, geralmente não há limite, mas pode ser implementado
          // Por enquanto, apenas adiciona o plano ao request
          break;

        default:
          // Para outros recursos, apenas adiciona o plano ao request
          break;
      }

      // Adicionar plano do usuário ao request
      req.userPlan = userPlan;
      next();
    } catch (error) {
      console.error('Erro no middleware de verificação de planos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Não foi possível verificar os limites do seu plano',
      });
    }
  };
};

/**
 * Middleware para verificar se o usuário tem um plano ativo
 * @param {string} requiredPlan - Plano mínimo necessário (opcional)
 * @returns {Function} Middleware function
 */
const requireActivePlan = (requiredPlan = null) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userPlan = await getUserPlan(userId);

      if (!userPlan) {
        return res.status(500).json({
          error: 'Erro ao verificar plano do usuário',
        });
      }

      // Verificar se o plano está ativo
      if (userPlan.plan_status !== 'active') {
        return res.status(403).json({
          error: 'Plano inativo',
          message: 'Seu plano está inativo. Entre em contato com o suporte.',
          currentPlan: userPlan.name,
          status: userPlan.plan_status,
        });
      }

      // Verificar se o plano atende ao requisito mínimo
      if (requiredPlan) {
        const planHierarchy = { free: 1, basic: 2, premium: 3 };
        const userPlanLevel = planHierarchy[userPlan.id] || 0;
        const requiredPlanLevel = planHierarchy[requiredPlan] || 0;

        if (userPlanLevel < requiredPlanLevel) {
          return res.status(403).json({
            error: 'Plano insuficiente',
            message: `Esta funcionalidade requer o plano ${requiredPlan} ou superior`,
            currentPlan: userPlan.name,
            requiredPlan: requiredPlan,
            upgradeUrl: '/dashboard/plans',
          });
        }
      }

      req.userPlan = userPlan;
      next();
    } catch (error) {
      console.error('Erro no middleware de plano ativo:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  };
};

/**
 * Middleware para verificar limites antes de criar recursos
 * @param {string} resource - Tipo de recurso
 * @returns {Function} Middleware function
 */
const checkResourceLimit = resource => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      switch (resource) {
        case 'students':
          const studentLimit = await checkStudentLimit(userId);

          if (!studentLimit.canAdd) {
            return res.status(403).json({
              error: 'Limite atingido',
              message: `Você atingiu o limite de ${studentLimit.max} alunos do seu plano ${studentLimit.plan}`,
              limitInfo: {
                resource: 'students',
                current: studentLimit.current,
                max: studentLimit.max,
                canAdd: false,
              },
              upgradeUrl: '/dashboard/plans',
            });
          }

          // Adicionar informações do limite ao request
          req.resourceLimit = studentLimit;
          break;

        default:
          // Para outros recursos, apenas continua
          break;
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar limite de recurso:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  };
};

/**
 * Middleware para adicionar informações do plano ao response
 * @returns {Function} Middleware function
 */
const addPlanInfo = () => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userPlan = await getUserPlan(userId);

      if (userPlan) {
        // Adicionar informações do plano ao response
        res.locals.userPlan = userPlan;

        // Adicionar headers com informações do plano
        res.set({
          'X-User-Plan': userPlan.id,
          'X-Plan-Name': userPlan.name,
          'X-Max-Students': userPlan.max_students || 'unlimited',
        });
      }

      next();
    } catch (error) {
      console.error('Erro ao adicionar informações do plano:', error);
      // Não falha a requisição, apenas continua sem as informações
      next();
    }
  };
};

module.exports = {
  checkPlanLimits,
  requireActivePlan,
  checkResourceLimit,
  addPlanInfo,
};
