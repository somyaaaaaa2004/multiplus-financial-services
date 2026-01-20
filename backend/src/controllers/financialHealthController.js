const { sendSuccess, sendError } = require('../utils/response');
const {
  calculateHealthScore,
  getDemoProfile
} = require('../services/financialHealthService');

/**
 * Get demo financial profile
 * GET /api/financial-health/demo
 */
exports.getDemo = async (req, res, next) => {
  try {
    const demoProfile = getDemoProfile();
    
    return sendSuccess(res, 'Demo financial profile retrieved successfully', demoProfile);
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate financial health score
 * POST /api/financial-health/score
 */
exports.calculateScore = async (req, res, next) => {
  try {
    const input = req.body;

    // Validate required fields
    if (!input.monthlyIncome && input.monthlyIncome !== 0) {
      return sendError(res, 'monthlyIncome is required', 400);
    }

    // Validate numeric fields
    const numericFields = [
      'monthlyIncome',
      'monthlyExpenses',
      'totalSavings',
      'totalDebt',
      'emergencyFund',
      'investments',
      'creditScore',
      'monthlyDebtPayments',
      'age',
      'monthsOfExpenses'
    ];

    for (const field of numericFields) {
      if (input[field] !== undefined && input[field] !== null) {
        const value = Number(input[field]);
        if (isNaN(value) || value < 0) {
          return sendError(res, `${field} must be a valid positive number`, 400);
        }
        input[field] = value;
      }
    }

    // Set defaults for optional fields
    const profileData = {
      monthlyIncome: input.monthlyIncome || 0,
      monthlyExpenses: input.monthlyExpenses || 0,
      totalSavings: input.totalSavings || 0,
      totalDebt: input.totalDebt || 0,
      emergencyFund: input.emergencyFund || 0,
      investments: input.investments || 0,
      creditScore: input.creditScore || 0,
      monthlyDebtPayments: input.monthlyDebtPayments || 0,
      age: input.age || 30,
      monthsOfExpenses: input.monthsOfExpenses || 6
    };

    // Calculate health score
    const result = calculateHealthScore(profileData);

    return sendSuccess(res, 'Financial health score calculated successfully', result);
  } catch (error) {
    next(error);
  }
};
