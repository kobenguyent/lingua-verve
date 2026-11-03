import { DiagnosticQuestion } from '../types';

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'q1-comprehension',
    question: 'When listening to unscripted native podcasts, news, or YouTube videos in your target language:',
    options: [
      { text: 'I only catch isolated words like "hello", "yes", or numbers.', level: 'A1' },
      { text: 'I understand slow, simplified audio made for learners, but real native audio is a blur.', level: 'A2' },
      { text: 'I understand the main gist if the topic is familiar, but get lost with slang or fast cadence.', level: 'B1' },
      { text: 'I comfortably follow native talk shows and YouTube, missing only cultural jokes and rare idioms.', level: 'B2' },
      { text: 'I understand native radio debates, movies without subtitles, and nuanced sarcasm with zero cognitive strain.', level: 'C1' },
      { text: 'I pick up regional dialects, subtle puns, historical references, and literary allusions effortlessly.', level: 'C2' }
    ]
  },
  {
    id: 'q2-spontaneous-speech',
    question: 'When an unexpected spontaneous conversation starts with a native speaker:',
    options: [
      { text: 'I freeze and can only muster basic greetings or point with hand gestures.', level: 'A1' },
      { text: 'I can answer simple questions about my name, country, and job with basic phrases.', level: 'A2' },
      { text: 'I can explain my opinion and narrate past events, but I pause often to formulate grammar.', level: 'B1' },
      { text: 'I speak smoothly without halting pauses, easily pivoting around words I do not know.', level: 'B2' },
      { text: 'I can argue complex professional or philosophical viewpoints with natural idiomatic flow.', level: 'C1' },
      { text: 'I command rhetoric, wit, humor, and register shifting just like an articulate native speaker.', level: 'C2' }
    ]
  },
  {
    id: 'q3-reading-ability',
    question: 'When reading authentic written material in your target language:',
    options: [
      { text: 'I can decipher street signs, menus, and short product labels.', level: 'A1' },
      { text: 'I can read graded reader books (A2 level) and short personal emails.', level: 'A2' },
      { text: 'I can read newspaper articles and blog posts with the help of a dictionary lookup tool.', level: 'B1' },
      { text: 'I can read full non-fiction books or news commentary with good speed and high comprehension.', level: 'B2' },
      { text: 'I can read classic literature, legal contracts, and academic papers without difficulty.', level: 'C1' },
      { text: 'I appreciate archaic poetry, complex wordplay, and subtle stylistic ironies.', level: 'C2' }
    ]
  },
  {
    id: 'q4-grammar-intuition',
    question: 'How do you process the grammar of the target language when communicating?',
    options: [
      { text: 'I do not understand the grammatical structure yet; every sentence feels like a puzzle.', level: 'A1' },
      { text: 'I know basic present and past tense, but cases and complex orders confuse me.', level: 'A2' },
      { text: 'I know the rules intellectually, but make frequent errors when speaking fast.', level: 'B1' },
      { text: 'I have developed intuitive "feel" for word order and case endings; errors sound unnatural to me.', level: 'B2' },
      { text: 'I intuitively employ subjunctive moods, stylistic inversions, and passive constructions.', level: 'C1' },
      { text: 'I can play with grammar, intentionally bend conventions for stylistic effect, and spot native typos.', level: 'C2' }
    ]
  }
];
