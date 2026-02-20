const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY_SUGGESTION;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL ?? "gemini-2.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  

    export const chatSessionSuggestion = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "give me a story suggestion in 20 to 25 words in the json format\nexample\n{\nstory_idea : \"Idea for the story\"\n}\ndon't modify the format"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"story_idea\": \"A sentient cloud befriends a lonely lighthouse keeper, but their friendship is tested by a fierce storm.\"\n}\n```\n"},
          ],
        },
      ],
    });
  