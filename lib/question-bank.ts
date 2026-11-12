export type BankQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
};

export const QUESTION_BANK: BankQuestion[] = [
  {
    id: "q1",
    prompt: "A customer messages: “I have been waiting for 3 days for my refund.” What is the best first response?",
    options: [
      "Tell them refunds usually take 7–10 days and close the chat.",
      "Apologise for the wait, confirm the order details and check the refund status.",
      "Ask them to email support instead.",
      "Say the delay is not your department’s fault.",
    ],
    answer: 1,
  },
  {
    id: "q2",
    prompt: "Choose the sentence with correct grammar.",
    options: [
      "She has completed the report yesterday.",
      "She completed the report yesterday.",
      "She have completed the report yesterday.",
      "She was complete the report yesterday.",
    ],
    answer: 1,
  },
  {
    id: "q3",
    prompt: "You have 4 tasks due today. Which should you do first?",
    options: [
      "The easiest task so your list looks shorter.",
      "The task your manager marked as client-critical and due at 11 AM.",
      "The task you enjoy the most.",
      "Wait for someone to tell you what to do.",
    ],
    answer: 1,
  },
  {
    id: "q4",
    prompt: "What does “work from home” require most from an employee?",
    options: [
      "A large social circle",
      "Self-discipline and clear communication",
      "Working longer hours every day",
      "Avoiding all meetings",
    ],
    answer: 1,
  },
  {
    id: "q5",
    prompt: "A customer uses abusive language in chat. What should you do?",
    options: [
      "Reply in the same tone.",
      "Stay calm, set a respectful boundary and offer a solution or escalate as per policy.",
      "Immediately block the customer without informing anyone.",
      "Ignore the chat forever.",
    ],
    answer: 1,
  },
  {
    id: "q6",
    prompt: "If 5 data-entry operators complete 100 records in 2 hours, how many records will 10 operators complete in 2 hours?",
    options: ["100", "150", "200", "250"],
    answer: 2,
  },
  {
    id: "q7",
    prompt: "Which subject line is most professional for a job application?",
    options: [
      "hey pls see my resume",
      "Application for Customer Support Executive – Priya Sharma",
      "URGENT!!! JOB!!!",
      "Resume attached",
    ],
    answer: 1,
  },
  {
    id: "q8",
    prompt: "While on a video interview, your internet drops. What is the best action?",
    options: [
      "Do nothing and hope the interviewer waits.",
      "Rejoin quickly and message the interviewer about the interruption.",
      "Cancel the interview.",
      "Send a meme to lighten the mood.",
    ],
    answer: 1,
  },
  {
    id: "q9",
    prompt: "What is the best way to proofread a document before submitting it?",
    options: [
      "Submit immediately after writing.",
      "Read it once in a hurry.",
      "Use spell-check and read it slowly once more for clarity.",
      "Ask a friend to rewrite it completely.",
    ],
    answer: 2,
  },
  {
    id: "q10",
    prompt: "Which of these is a sign of a genuine work-from-home job offer?",
    options: [
      "The employer asks you to pay ₹5,000 before joining.",
      "The employer shares a written offer, role details and a verified company contact.",
      "The salary is unusually high with no interview.",
      "They communicate only through a personal chat app.",
    ],
    answer: 1,
  },
  {
    id: "q11",
    prompt: "A customer asks a question you do not know the answer to. What should you say?",
    options: [
      "“I have no idea.”",
      "“Let me confirm that for you and get back within 10 minutes.”",
      "“Google it.”",
      "Make up an answer.",
    ],
    answer: 1,
  },
  {
    id: "q12",
    prompt: "Which tool is commonly used to manage remote team tasks?",
    options: ["Trello", "Photoshop", "Spotify", "VLC"],
    answer: 0,
  },
  {
    id: "q13",
    prompt: "What is the correct way to handle confidential customer data at home?",
    options: [
      "Share it with friends to double-check.",
      "Keep it on a personal social media account.",
      "Access it only on approved devices and never share it.",
      "Print it and leave it on your desk.",
    ],
    answer: 2,
  },
  {
    id: "q14",
    prompt: "Pick the best reply to a customer who says “Thank you for solving this so fast!”",
    options: [
      "No problem, bye.",
      "You’re welcome! I’m glad I could help. Is there anything else I can do for you?",
      "It was my job.",
      "Okay.",
    ],
    answer: 1,
  },
  {
    id: "q15",
    prompt: "Which habit helps you stay productive while working from home?",
    options: [
      "Working from bed all day",
      "Following a fixed schedule with short breaks",
      "Keeping notifications on during every call",
      "Skipping meals to save time",
    ],
    answer: 1,
  },
];

export function pickQuestions(count: number): BankQuestion[] {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(3, Math.min(count, QUESTION_BANK.length)));
}

export function publicQuestions(questions: BankQuestion[]) {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: question.options,
  }));
}

export function scoreAnswers(questions: BankQuestion[], answers: Record<string, number>) {
  const correct = questions.filter((question) => answers[question.id] === question.answer).length;
  return Math.round((correct / questions.length) * 100);
}
