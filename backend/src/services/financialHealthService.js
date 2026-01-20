/**
 * Financial Health Score Service
 * Deterministic scoring logic for financial health assessment
 */

/**
 * Calculate category scores and overall health score
 * @param {Object} input - Financial profile data
 * @returns {Object} Financial health assessment
 */
const calculateHealthScore = (input) => {
  const {
    monthlyIncome = 0,
    monthlyExpenses = 0,
    totalSavings = 0,
    totalDebt = 0,
    emergencyFund = 0,
    investments = 0,
    creditScore = 0,
    monthlyDebtPayments = 0,
    age = 30,
    monthsOfExpenses = 6
  } = input;

  // Calculate category scores (0-100 each)
  const savingsScore = calculateSavingsScore(monthlyIncome, totalSavings, monthlyExpenses);
  const debtScore = calculateDebtScore(monthlyIncome, totalDebt, monthlyDebtPayments);
  const emergencyScore = calculateEmergencyScore(monthlyExpenses, emergencyFund, monthsOfExpenses);
  const investingScore = calculateInvestingScore(monthlyIncome, investments, age);
  const creditScoreNormalized = calculateCreditScore(creditScore);

  const categoryScores = {
    Savings: savingsScore,
    Debt: debtScore,
    Emergency: emergencyScore,
    Investing: investingScore,
    Credit: creditScoreNormalized
  };

  // Calculate overall health score (weighted average)
  const weights = {
    Savings: 0.20,
    Debt: 0.25,
    Emergency: 0.25,
    Investing: 0.15,
    Credit: 0.15
  };

  const healthScore = Math.round(
    categoryScores.Savings * weights.Savings +
    categoryScores.Debt * weights.Debt +
    categoryScores.Emergency * weights.Emergency +
    categoryScores.Investing * weights.Investing +
    categoryScores.Credit * weights.Credit
  );

  // Determine grade
  const grade = getGrade(healthScore);

  // Identify risk flags
  const riskFlags = identifyRiskFlags(input, categoryScores);

  // Generate recommendations
  const recommendations = generateRecommendations(
    input,
    categoryScores,
    healthScore,
    riskFlags
  );

  return {
    healthScore,
    grade,
    categoryScores,
    riskFlags,
    recommendations
  };
};

/**
 * Calculate Savings Score (0-100)
 */
const calculateSavingsScore = (monthlyIncome, totalSavings, monthlyExpenses) => {
  if (monthlyIncome === 0) return 0;

  // Savings ratio: how many months of expenses covered
  const monthsOfExpensesCovered = monthlyExpenses > 0 
    ? totalSavings / monthlyExpenses 
    : 0;

  // Savings rate: savings as % of income
  const savingsRate = monthlyIncome > 0 
    ? (totalSavings / (monthlyIncome * 12)) * 100 
    : 0;

  let score = 0;

  // Months of expenses covered (max 50 points)
  if (monthsOfExpensesCovered >= 12) score += 50;
  else if (monthsOfExpensesCovered >= 6) score += 40;
  else if (monthsOfExpensesCovered >= 3) score += 30;
  else if (monthsOfExpensesCovered >= 1) score += 20;
  else if (monthsOfExpensesCovered > 0) score += 10;

  // Savings rate (max 50 points)
  if (savingsRate >= 20) score += 50;
  else if (savingsRate >= 15) score += 40;
  else if (savingsRate >= 10) score += 30;
  else if (savingsRate >= 5) score += 20;
  else if (savingsRate > 0) score += 10;

  return Math.min(100, score);
};

/**
 * Calculate Debt Score (0-100)
 */
const calculateDebtScore = (monthlyIncome, totalDebt, monthlyDebtPayments) => {
  if (monthlyIncome === 0) {
    return totalDebt === 0 ? 100 : 0;
  }

  // Debt-to-income ratio
  const annualIncome = monthlyIncome * 12;
  const debtToIncomeRatio = annualIncome > 0 ? (totalDebt / annualIncome) * 100 : 0;

  // Debt service ratio (monthly debt payments / monthly income)
  const debtServiceRatio = monthlyIncome > 0 
    ? (monthlyDebtPayments / monthlyIncome) * 100 
    : 0;

  let score = 100;

  // Deduct points for high debt-to-income
  if (debtToIncomeRatio >= 50) score -= 50;
  else if (debtToIncomeRatio >= 40) score -= 40;
  else if (debtToIncomeRatio >= 30) score -= 30;
  else if (debtToIncomeRatio >= 20) score -= 20;
  else if (debtToIncomeRatio >= 10) score -= 10;

  // Deduct points for high debt service ratio
  if (debtServiceRatio >= 40) score -= 30;
  else if (debtServiceRatio >= 35) score -= 25;
  else if (debtServiceRatio >= 30) score -= 20;
  else if (debtServiceRatio >= 25) score -= 15;
  else if (debtServiceRatio >= 20) score -= 10;

  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate Emergency Fund Score (0-100)
 */
const calculateEmergencyScore = (monthlyExpenses, emergencyFund, monthsOfExpenses = 6) => {
  if (monthlyExpenses === 0) {
    return emergencyFund > 0 ? 100 : 50;
  }

  const monthsCovered = emergencyFund / monthlyExpenses;
  const targetMonths = monthsOfExpenses;

  if (monthsCovered >= targetMonths * 1.5) return 100;
  if (monthsCovered >= targetMonths) return 90;
  if (monthsCovered >= targetMonths * 0.75) return 75;
  if (monthsCovered >= targetMonths * 0.5) return 60;
  if (monthsCovered >= targetMonths * 0.25) return 40;
  if (monthsCovered > 0) return 20;
  return 0;
};

/**
 * Calculate Investing Score (0-100)
 */
const calculateInvestingScore = (monthlyIncome, investments, age) => {
  if (monthlyIncome === 0) return 0;

  const annualIncome = monthlyIncome * 12;
  const investmentRatio = annualIncome > 0 ? (investments / annualIncome) * 100 : 0;

  // Age-based target: 25% of annual income by age 30, 50% by age 40, etc.
  const ageTarget = Math.max(0, (age - 20) * 2.5);

  let score = 0;

  // Investment ratio scoring
  if (investmentRatio >= ageTarget) score += 60;
  else if (investmentRatio >= ageTarget * 0.75) score += 50;
  else if (investmentRatio >= ageTarget * 0.5) score += 40;
  else if (investmentRatio >= ageTarget * 0.25) score += 30;
  else if (investmentRatio > 0) score += 20;

  // Absolute investment value bonus
  if (investments >= annualIncome * 2) score += 40;
  else if (investments >= annualIncome) score += 30;
  else if (investments >= annualIncome * 0.5) score += 20;
  else if (investments > 0) score += 10;

  return Math.min(100, score);
};

/**
 * Calculate Credit Score (0-100, normalized from 300-850)
 */
const calculateCreditScore = (creditScore) => {
  if (creditScore === 0) return 50; // Unknown credit score
  if (creditScore >= 750) return 100;
  if (creditScore >= 700) return 90;
  if (creditScore >= 650) return 75;
  if (creditScore >= 600) return 60;
  if (creditScore >= 550) return 40;
  if (creditScore >= 500) return 25;
  return 10;
};

/**
 * Get overall grade based on health score
 */
const getGrade = (healthScore) => {
  if (healthScore >= 80) return 'Excellent';
  if (healthScore >= 65) return 'Good';
  if (healthScore >= 50) return 'Average';
  return 'Poor';
};

/**
 * Identify risk flags
 */
const identifyRiskFlags = (input, categoryScores) => {
  const flags = [];
  const {
    monthlyIncome = 0,
    totalDebt = 0,
    monthlyDebtPayments = 0,
    emergencyFund = 0,
    monthlyExpenses = 0,
    creditScore = 0
  } = input;

  // High debt-to-income
  const debtToIncome = monthlyIncome > 0 
    ? (totalDebt / (monthlyIncome * 12)) * 100 
    : 0;
  if (debtToIncome > 40) {
    flags.push({
      severity: 'High',
      category: 'Debt',
      message: 'Your debt-to-income ratio exceeds 40%, indicating high financial stress risk.'
    });
  }

  // Insufficient emergency fund
  const monthsCovered = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
  if (monthsCovered < 3) {
    flags.push({
      severity: 'High',
      category: 'Emergency Fund',
      message: 'Your emergency fund covers less than 3 months of expenses, leaving you vulnerable to unexpected events.'
    });
  }

  // High debt service ratio
  const debtServiceRatio = monthlyIncome > 0 
    ? (monthlyDebtPayments / monthlyIncome) * 100 
    : 0;
  if (debtServiceRatio > 30) {
    flags.push({
      severity: 'Medium',
      category: 'Debt',
      message: 'Your monthly debt payments exceed 30% of your income, limiting your financial flexibility.'
    });
  }

  // Poor credit score
  if (creditScore > 0 && creditScore < 600) {
    flags.push({
      severity: 'Medium',
      category: 'Credit',
      message: 'Your credit score is below 600, which may limit access to favorable loan terms and credit opportunities.'
    });
  }

  // Low savings score
  if (categoryScores.Savings < 30) {
    flags.push({
      severity: 'Medium',
      category: 'Savings',
      message: 'Your savings rate is below recommended levels, which may impact your long-term financial security.'
    });
  }

  // Negative cash flow
  if (input.monthlyExpenses > input.monthlyIncome && input.monthlyIncome > 0) {
    flags.push({
      severity: 'Critical',
      category: 'Cash Flow',
      message: 'You are spending more than you earn, which is unsustainable and requires immediate attention.'
    });
  }

  return flags;
};

/**
 * Generate personalized recommendations
 */
const generateRecommendations = (input, categoryScores, healthScore, riskFlags) => {
  const recommendations = [];
  const {
    monthlyIncome = 0,
    monthlyExpenses = 0,
    totalSavings = 0,
    totalDebt = 0,
    emergencyFund = 0,
    investments = 0,
    monthlyDebtPayments = 0,
    creditScore = 0
  } = input;

  // Emergency fund recommendations
  if (categoryScores.Emergency < 60) {
    const targetMonths = 6;
    const targetAmount = monthlyExpenses * targetMonths;
    const shortfall = Math.max(0, targetAmount - emergencyFund);
    
    recommendations.push({
      priority: 'High',
      category: 'Emergency Fund',
      title: 'Build Your Emergency Fund',
      description: `Aim to save $${shortfall.toLocaleString()} to reach ${targetMonths} months of expenses. This provides a safety net for unexpected events.`,
      actionSteps: [
        'Set up automatic transfers to a high-yield savings account',
        'Reduce non-essential expenses temporarily to accelerate savings',
        'Keep emergency funds in a separate, easily accessible account'
      ]
    });
  }

  // Debt reduction recommendations
  if (categoryScores.Debt < 70) {
    recommendations.push({
      priority: 'High',
      category: 'Debt',
      title: 'Create a Debt Repayment Strategy',
      description: 'Develop a systematic approach to pay down high-interest debt first, while maintaining minimum payments on all accounts.',
      actionSteps: [
        'List all debts by interest rate (highest first)',
        'Consider the debt avalanche or snowball method',
        'Explore balance transfer options for high-interest credit cards',
        'Avoid taking on new debt while paying down existing balances'
      ]
    });
  }

  // Savings recommendations
  if (categoryScores.Savings < 50) {
    const savingsGoal = monthlyIncome * 0.20; // 20% savings rate
    
    recommendations.push({
      priority: 'Medium',
      category: 'Savings',
      title: 'Increase Your Savings Rate',
      description: `Target saving at least $${savingsGoal.toLocaleString()} per month (20% of income) to build wealth over time.`,
      actionSteps: [
        'Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
        'Automate savings transfers on payday',
        'Review and cut unnecessary subscriptions or services',
        'Build savings before increasing lifestyle expenses'
      ]
    });
  }

  // Investment recommendations
  if (categoryScores.Investing < 60 && categoryScores.Emergency >= 60) {
    recommendations.push({
      priority: 'Medium',
      category: 'Investing',
      title: 'Start Building Your Investment Portfolio',
      description: 'Begin investing regularly to grow your wealth and prepare for long-term financial goals like retirement.',
      actionSteps: [
        'Open a retirement account (401(k) or IRA) and contribute regularly',
        'Consider low-cost index funds for broad market exposure',
        'Diversify across asset classes based on your risk tolerance',
        'Take advantage of employer matching contributions if available'
      ]
    });
  } else if (categoryScores.Emergency < 60 && investments > 0) {
    recommendations.push({
      priority: 'High',
      category: 'Investing',
      title: 'Prioritize Emergency Fund Over Investments',
      description: 'While investing is important, ensure you have an adequate emergency fund first to avoid liquidating investments during emergencies.',
      actionSteps: [
        'Pause new investments until emergency fund is fully funded',
        'Keep 3-6 months of expenses in a liquid savings account',
        'Resume investing once emergency fund target is reached'
      ]
    });
  }

  // Credit score recommendations
  if (creditScore > 0 && creditScore < 700) {
    recommendations.push({
      priority: 'Medium',
      category: 'Credit',
      title: 'Improve Your Credit Score',
      description: 'A higher credit score opens doors to better interest rates and financial opportunities.',
      actionSteps: [
        'Pay all bills on time - set up automatic payments',
        'Keep credit card utilization below 30% of available credit',
        'Don\'t close old credit accounts (length of history matters)',
        'Limit hard credit inquiries and new credit applications',
        'Review your credit report regularly for errors'
      ]
    });
  }

  // Cash flow recommendations
  if (monthlyExpenses > monthlyIncome && monthlyIncome > 0) {
    recommendations.push({
      priority: 'Critical',
      category: 'Cash Flow',
      title: 'Address Negative Cash Flow Immediately',
      description: 'You are spending more than you earn. This is unsustainable and requires immediate action.',
      actionSteps: [
        'Create a detailed budget tracking every expense',
        'Identify and eliminate non-essential expenses',
        'Find ways to increase income (side jobs, negotiate salary)',
        'Stop using credit cards for regular expenses',
        'Consider consulting with a financial counselor'
      ]
    });
  }

  // General positive reinforcement
  if (healthScore >= 80 && recommendations.length === 0) {
    recommendations.push({
      priority: 'Low',
      category: 'Overall',
      title: 'Maintain Your Excellent Financial Health',
      description: 'Your financial situation is strong. Continue your good habits and consider advanced strategies.',
      actionSteps: [
        'Review and optimize your investment portfolio annually',
        'Consider tax-efficient investment strategies',
        'Plan for major life events (home purchase, retirement)',
        'Continue building wealth through consistent saving and investing'
      ]
    });
  }

  return recommendations;
};

/**
 * Get demo financial profile
 */
const getDemoProfile = () => {
  return {
    monthlyIncome: 7500,
    monthlyExpenses: 5000,
    totalSavings: 30000,
    totalDebt: 15000,
    emergencyFund: 18000,
    investments: 45000,
    creditScore: 720,
    monthlyDebtPayments: 800,
    age: 32,
    monthsOfExpenses: 6
  };
};

module.exports = {
  calculateHealthScore,
  getDemoProfile
};
