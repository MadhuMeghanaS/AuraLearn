import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if(!apiKey) {
    console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables');
    process.exit(1);
}

/**
 * Call Gemini REST API directly to avoid version mismatch or SDK loading issues
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
const callGemini = async (prompt) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini REST API Error: status=${response.status}, message=${errorText}`);
            throw new Error(`Gemini API call failed with status ${response.status}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Failed to parse Gemini API response structure", JSON.stringify(data));
            throw new Error("Invalid response structure from Gemini API");
        }
    } catch (error) {
        console.error('Fetch error calling Gemini REST API:', error);
        throw error;
    }
};

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: easy, medium, or hard]
    
    Separate each flashcard with "---"
    
    Text:
    ${text.substring(0, 15000)}`;

    try {
        const generatedText = await callGemini(prompt);

        // Parse the response
        const flashcards = [];
        const cards = generatedText.split('---').filter(c => c.trim());

        for (const card of cards) {
            const lines = card.trim().split('\n');
            let question = '', answer = '', difficulty = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('A:')) {
                    answer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }  
                }
            }
            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }
        return flashcards.slice(0, count);
    } catch (error) {
        console.error('Gemini API error in generateFlashcards:', error);
        throw new Error('Failed to generate flashcards');    
    }
};

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options: Array<string>, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as:
    Q: [Question]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty: easy, medium, or hard]

    Separate questions with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const generatedText = await callGemini(prompt);

        const questions = [];
        const questionBlocks = generatedText.split('---').filter(q => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split('\n');
            let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) {
                    question = trimmed.substring(2).trim();
                } else if (trimmed.match(/^O\d:/)) {
                    options.push(trimmed.substring(3).trim());
                } else if (trimmed.startsWith('C:')) {
                    correctAnswer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('E:')) {
                    explanation = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && options.length === 4 && correctAnswer) {
                questions.push({ question, options, correctAnswer, explanation, difficulty });
            }
        }
        return questions.slice(0, numQuestions);
    } catch (error) {
        console.error('Gemini API error in generateQuiz:', error);
        throw new Error('Failed to generate quiz');
    }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
    const prompt = `Provide a concise summary of the following text, highlighting the key concepts and main ideas.
    Keep the summary clear and structured. 

    Text:
    ${text.substring(0, 20000)}`;

    try {
        return await callGemini(prompt);
    } catch (error) {
        console.error('Gemini API error in generateSummary:', error);
        throw new Error('Failed to generate summary');
    }
};

/**
 * Chat with document context
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

    const prompt = `Based on the following context from a document, analyze the context and answer the user question.
    If the answer is not in the context, say so.
    
    Context:
    ${context}
    
    Question: ${question}
    
    Answer:`;

    try {
        return await callGemini(prompt);
    } catch (error) {
        console.error('Gemini API error in chatWithContext:', error);
        throw new Error('Failed to generate answer');
    }
};

/**
 * Generate visual infographic data from document text
 * @param {string} text - Document text
 * @returns {Promise<Object>} Structured infographic JSON
 */
export const generateInfographic = async (text) => {
    const prompt = `Analyze the following text and generate an educational visual infographic in JSON format.
    The response MUST be a single raw JSON object (WITHOUT any markdown wrappers, code blocks, or backticks).
    
    The JSON structure MUST match exactly:
    {
      "title": "[High impact main topic title]",
      "subtitle": "[Descriptive subtitle summarizing the core theme]",
      "summary": "[Brief 2-3 sentence overview of the text content]",
      "metrics": [
        { "value": "[Key number/percentage, e.g. 85%, 3 Steps, 4x]", "label": "[Short label, e.g. Growth Rate]", "description": "[Brief context]" }
      ],
      "concepts": [
        { "term": "[Core terminology]", "definition": "[Clear definition]", "importance": "[Why it matters]" }
      ],
      "timeline": [
        { "step": "Stage 1", "title": "[Step title]", "description": "[Step description]" }
      ],
      "takeaway": "[Final high-impact takeaway statement summarizing the educational benefit]"
    }
    
    Rules:
    - metrics: include 3-5 key numbers or stats from the text
    - concepts: include 3-6 key terms/ideas
    - timeline: include 3-5 stages/steps representing the process or learning sequence
    
    Text:
    ${text.substring(0, 15000)}`;

    try {
        const generatedText = await callGemini(prompt);
        // Clean markdown code block wrapping if present
        const cleanJson = generatedText.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('Gemini API error in generateInfographic:', error);
        throw new Error('Failed to generate infographic');
    }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
    const prompt = `Explain the concept of "${concept}" based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}`;

    try {
        return await callGemini(prompt);
    } catch (error) {
        console.error('Gemini API error in explainConcept:', error);
        throw new Error('Failed to explain concept');
    }
};