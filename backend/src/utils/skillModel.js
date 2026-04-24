const natural = require('natural');
const { TfIdf, PorterStemmer } = natural;

/**
 * Semantic Match Engine
 * 
 * Uses Natural Language Processing (NLP) techniques:
 * 1. Tokenization & Stemming: Reducing words to their root (e.g., "Management" -> "manag").
 * 2. Vectorization: Representing skill sets as TF-IDF vectors.
 * 3. Cosine Similarity: Calculating the mathematical distance between vectors.
 */

class SemanticMatchEngine {
    constructor() {
        this.stemmer = PorterStemmer;
    }

    /**
     * Pre-process text: tokenize, stem, and normalize.
     * @param {string|string[]} input - Single string or array of skills.
     */
    _tokenizeAndStem(input) {
        let text = Array.isArray(input) ? input.join(' ') : input;
        if (!text) return [];
        
        // Tokenize and stem while removing short noise
        return natural.PorterStemmer.tokenizeAndStem(text.toLowerCase())
            .filter(token => token.length > 1);
    }

    /**
     * Calculate similarity score between student skills and job requirements.
     * @param {string[]} studentSkills 
     * @param {string[]} requiredSkills 
     * @returns {Object} - { score, matched, missing }
     */
    calculateMatch(studentSkills = [], requiredSkills = []) {
        if (!requiredSkills || requiredSkills.length === 0) {
            return { score: 0, matched: [], missing: [] };
        }

        // 1. Vectorize using TF-IDF logic
        const tfidf = new TfIdf();
        
        // Document 1: Job Requirements
        const jobTokens = this._tokenizeAndStem(requiredSkills);
        tfidf.addDocument(jobTokens);
        
        // Document 2: Student Profile
        const studentTokens = this._tokenizeAndStem(studentSkills);
        tfidf.addDocument(studentTokens);

        // 2. Compute Cosine-lite similarity
        // Overlap of unique stemmed roots
        const jobSet = new Set(jobTokens);
        const studentSet = new Set(studentTokens);
        
        const matchedStemmed = [...jobSet].filter(token => studentSet.has(token));
        
        // Re-map stemmed roots back to original required skills for UI display
        const matchedOriginal = requiredSkills.filter(req => {
            const stems = this._tokenizeAndStem(req);
            return stems.some(s => studentSet.has(s));
        });

        const missingOriginal = requiredSkills.filter(req => !matchedOriginal.includes(req));

        // Scoring: 
        // We use a Jaccard-like score on tokens but can be expanded to TF-IDF
        // Score = (Intersection / Union) * 100
        const intersection = matchedStemmed.length;
        const union = jobSet.size;
        
        const rawScore = union > 0 ? (intersection / union) * 100 : 0;
        
        return {
            score: Math.round(rawScore),
            matched: matchedOriginal,
            missing: missingOriginal
        };
    }
}

module.exports = new SemanticMatchEngine();
