const { GoogleGenerativeAI } = require('@google/generative-ai');
//load env


const apiKey = 'YOUR_API_KEY';

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

const getAIRecommendations = async (summary, transactions) => {
    const prompt = `Hey Gemini, this is the summary of my expenses and transactions: ${JSON.stringify(summary)} and ${JSON.stringify(transactions)}. Provide recommendations to improve my budget, if i am earning more than my spending then praise me, else provide recommendations. The response should be within 200 characters.`;
  
    try {
      const result = await model.generateContent({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      });
  
      const recommendationText = result.response.candidates[0].content.parts[0].text;
      return [
        {
          title: 'AI Recommendation',
          description: recommendationText,
          buttonText: 'Take Action'
        }
      ];
    } catch (error) {
      console.error('Error with Gemini API:', error);
      return [{ error: 'Could not fetch recommendations' }];
    }
  };

module.exports = { getAIRecommendations };