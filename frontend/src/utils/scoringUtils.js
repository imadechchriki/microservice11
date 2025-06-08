/**
 * Scoring utility functions that match the exact requirements from ScoringExplanation.jsx
 * Unified scoring system: all questions converted to 0-5 scale
 */

/**
 * Calculate Likert question score
 * Score = Average of responses (Σ(réponses) ÷ N)
 * Direct scoring: 1=1.0, 2=2.0, 3=3.0, 4=4.0, 5=5.0
 */
export const calculateLikertScore = (responses) => {
  if (!responses || responses.length === 0) return 0;
  
  const sum = responses.reduce((acc, response) => acc + response, 0);
  const average = sum / responses.length;
  return Math.round(average * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate Binary question score
 * Score = (% of Yes responses) × 5
 * Yes=1, No=0 → converted to 0-5 scale based on approval percentage
 */
export const calculateBinaryScore = (responses) => {
  if (!responses || responses.length === 0) return 0;
  
  const yesCount = responses.filter(response => response === 1 || response === true).length;
  const yesPercentage = yesCount / responses.length;
  const score = yesPercentage * 5;
  return Math.round(score * 10) / 10; // Round to 1 decimal place
};

/**
 * Get score interpretation based on ScoringExplanation.jsx ranges
 */
export const getScoreInterpretation = (score) => {
  if (score >= 0.0 && score <= 1.0) return { label: 'Très Faible', color: 'red' };
  if (score > 1.0 && score <= 2.0) return { label: 'Faible', color: 'orange' };
  if (score > 2.0 && score <= 3.0) return { label: 'Moyen', color: 'yellow' };
  if (score > 3.0 && score <= 4.0) return { label: 'Bon', color: 'blue' };
  if (score > 4.0 && score <= 5.0) return { label: 'Excellent', color: 'green' };
  return { label: 'Invalide', color: 'gray' };
};

/**
 * Get color classes for score display based on the score value
 */
export const getScoreColorClasses = (score, variant = 'background') => {
  const interpretation = getScoreInterpretation(score);
  
  const colorMaps = {
    background: {
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    },
    text: {
      red: 'text-red-600 dark:text-red-400',
      orange: 'text-orange-600 dark:text-orange-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      gray: 'text-gray-600 dark:text-gray-400'
    },
    border: {
      red: 'border-red-200 dark:border-red-700',
      orange: 'border-orange-200 dark:border-orange-700',
      yellow: 'border-yellow-200 dark:border-yellow-700',
      blue: 'border-blue-200 dark:border-blue-700',
      green: 'border-green-200 dark:border-green-700',
      gray: 'border-gray-200 dark:border-gray-700'
    }
  };
  
  return colorMaps[variant]?.[interpretation.color] || colorMaps[variant].gray;
};

/**
 * Format score for display with proper rounding and /5 suffix
 */
export const formatScore = (score, showScale = true) => {
  if (score === null || score === undefined) return 'N/A';
  
  const formattedScore = (typeof score === 'number') ? score.toFixed(1) : parseFloat(score).toFixed(1);
  return showScale ? `${formattedScore}/5` : formattedScore;
};

/**
 * Calculate percentage representation of a 0-5 score
 */
export const scoreToPercentage = (score) => {
  if (score === null || score === undefined) return 0;
  return Math.round((score / 5) * 100);
};

/**
 * Validate that a score is within the expected 0-5 range
 */
export const isValidScore = (score) => {
  return score !== null && score !== undefined && score >= 0 && score <= 5;
};

/**
 * Examples that match ScoringExplanation.jsx for validation
 */
export const validateScoringExamples = () => {
  console.log('=== Scoring Validation Examples ===');
  
  // Likert Example: [5, 4, 5, 3, 4, 5] = 4.3/5
  const likertExample = [5, 4, 5, 3, 4, 5];
  const likertScore = calculateLikertScore(likertExample);
  console.log(`Likert Example: [${likertExample.join(', ')}] = ${formatScore(likertScore)} (Expected: 4.3/5)`);
  
  // Binary Examples
  const binaryExample1 = [1, 1, 0, 1, 1]; // 80% Yes = 4.0/5
  const binaryScore1 = calculateBinaryScore(binaryExample1);
  console.log(`Binary Example 1: [${binaryExample1.join(', ')}] = ${formatScore(binaryScore1)} (Expected: 4.0/5)`);
  
  const binaryExample2 = [0, 0, 0, 0, 0]; // 0% Yes = 0.0/5
  const binaryScore2 = calculateBinaryScore(binaryExample2);
  console.log(`Binary Example 2: [${binaryExample2.join(', ')}] = ${formatScore(binaryScore2)} (Expected: 0.0/5)`);
  
  const binaryExample3 = [1, 1, 1, 1, 1]; // 100% Yes = 5.0/5
  const binaryScore3 = calculateBinaryScore(binaryExample3);
  console.log(`Binary Example 3: [${binaryExample3.join(', ')}] = ${formatScore(binaryScore3)} (Expected: 5.0/5)`);
  
  // Score interpretations
  console.log('\n=== Score Interpretations ===');
  [0.5, 1.5, 2.5, 3.5, 4.5].forEach(score => {
    const interpretation = getScoreInterpretation(score);
    console.log(`${formatScore(score)} = ${interpretation.label}`);
  });
};

// Export all utility functions
export default {
  calculateLikertScore,
  calculateBinaryScore,
  getScoreInterpretation,
  getScoreColorClasses,
  formatScore,
  scoreToPercentage,
  isValidScore,
  validateScoringExamples
}; 