const skillModel = require('../../utils/skillModel');

/**
 * Calculates a match score between student skills and required skills using NLP.
 * Uses stemming and vector similarity for high accuracy.
 */
const calculateMatchScore = (studentSkills = [], requiredSkills = []) => {
    const result = skillModel.calculateMatch(studentSkills, requiredSkills);
    return result.score;
};

/**
 * Returns a detailed match analysis including matched and missing roots.
 */
const getDetailedMatch = (studentSkills = [], requiredSkills = []) => {
    return skillModel.calculateMatch(studentSkills, requiredSkills);
};

module.exports = {
    calculateMatchScore,
    getDetailedMatch
};
