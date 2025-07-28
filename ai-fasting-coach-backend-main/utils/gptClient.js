const { OpenAI } = require('openai');
const { COACH_PROFILE } = require('./enums');
const { env } = require('../config/index');

// OpenAI setup
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Keywords mapped to quick responses
const keywordTriggers = {
  'can i drink water':
    '💧 Yes! Staying hydrated is essential. Water is always allowed during your 72-hour fast.',
  'is water allowed':
    '💧 Absolutely. Drink as much water as you need. It helps with energy, focus, and fat burn.',
  'can i drink coffee':
    '☕ Yes, but keep it clean—black coffee only. No sugar, no cream. You’re in warrior mode.',
  'is tea allowed':
    '🍵 Herbal or green tea (unsweetened) is totally fine. It may even curb hunger a bit.',
  'how long':
    '⏳ Your fasting journey is 72 hours. You’ve got this—one hour at a time, one win at a time.',
  'what if i feel weak':
    '😮‍💨 That’s natural! Take deep breaths, hydrate, rest a bit. You’re transforming—stay with it.',
  'what can i have':
    '🥤 Stick to water, black coffee, tea (unsweetened). No food. Your body is burning stored fuel.',
  yes: '🔥 That’s the energy we want! Let’s keep stacking wins.',
  no: '🔁 No problem. Let’s get back on track. One choice at a time, you still win this.',
  'i broke my fast':
    '💔 It happens. No shame. Reflect, reset, and restart. This journey is about growth, not perfection.',
  'i feel great':
    '🌟 That’s what fasting power feels like! Lock it in. You’re doing incredible.',
  'i feel hungry':
    '🥺 Hunger comes in waves—breathe through it, drink water, and know it’ll pass.',
};

// Helper: Check if input matches a quick keyword
const checkQuickReply = (message) => {
  const lower = message.toLowerCase();
  for (const key in keywordTriggers) {
    if (lower.includes(key)) {
      return keywordTriggers[key];
    }
  }
  return null;
};

// Helper: Message Type System Prompt Add-on
const getContextPrefix = (type) => {
  switch (type) {
    case 'pre-fast':
      return 'This is a pre-fasting check-in. Help the user prepare mentally and physically.';
    case 'during-fast':
      return 'The user is in the middle of their fast. Encourage and support them.';
    case 'post-fast':
      return 'The user has completed their fast. Reflect with them and reinforce their win.';
    default:
      return '';
  }
};

const generateReply = async (
  userMessage,
  messages = [],
  coachType = 'echo',
  phase = 'during-fast'
) => {
  // 1. Handle quick keyword-based reply
  const quick = checkQuickReply(userMessage);
  if (quick) return quick;

  // 2. Get coach profile and contextual system prompt
  const profile =
    COACH_PROFILE[coachType.toLowerCase()] || COACH_PROFILE.savage;

  const contextPrefix = getContextPrefix(phase);
  const systemPrompt =
    `${contextPrefix} ${profile.systemPrompt} Respond in no more than 3 short sentences.`.trim();

  // 3. Combine last 10 messages + current message into one string
  const history = [...messages.slice(-10), userMessage]
    .map((msg) => `User: ${msg}`)
    .join('\n');

  // 4. Send to OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: history },
    ],
  });

  return response.choices[0].message.content.trim();
};

module.exports = { generateReply };
