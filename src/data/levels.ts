import { LevelDetail, CEFRLevel } from '../types';

export const CEFR_LEVELS: LevelDetail[] = [
  {
    id: 'A1',
    name: 'A1: Breakthrough',
    stageName: 'Absolute Beginner',
    badge: 'A1 Explorer',
    hoursEstimated: '80 – 120 hours',
    milestoneGoal: 'Survive basic social encounters, introduce yourself, decipher street signs, and grasp phonetics.',
    canDoSummary: [
      'Recognize familiar words and basic phrases concerning yourself and immediate surroundings.',
      'Ask and answer simple questions about personal details (where you live, people you know, things you have).',
      'Interact in a simple way provided the other person talks slowly and clearly and is prepared to help.',
      'Pronounce the basic sound inventory without establishing destructive fossilized habits.'
    ],
    color: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-700',
      glow: 'shadow-emerald-500/20'
    }
  },
  {
    id: 'A2',
    name: 'A2: Waystage',
    stageName: 'Elementary Pioneer',
    badge: 'A2 Builder',
    hoursEstimated: '180 – 240 hours',
    milestoneGoal: 'Narrate past events, order food effortlessly, describe your daily routine, and manage travel emergencies.',
    canDoSummary: [
      'Understand sentences and frequently used expressions related to areas of most immediate relevance (shopping, local geography, employment).',
      'Communicate in simple and routine tasks requiring a simple and direct exchange of information.',
      'Describe in simple terms aspects of your background, immediate environment, and matters in areas of immediate need.',
      'Produce short connected sentences using basic conjunctions (and, but, because).'
    ],
    color: {
      bg: 'bg-teal-500/10 dark:bg-teal-500/20',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-300 dark:border-teal-700',
      glow: 'shadow-teal-500/20'
    }
  },
  {
    id: 'B1',
    name: 'B1: Threshold',
    stageName: 'Intermediate Independent',
    badge: 'B1 Bridge',
    hoursEstimated: '350 – 450 hours',
    milestoneGoal: 'Escape textbook dependence, travel independently in the target country, and hold 15-minute unstructured chats.',
    canDoSummary: [
      'Understand the main points of clear standard input on familiar matters regularly encountered in work, school, and leisure.',
      'Deal with most situations likely to arise whilst travelling in an area where the language is spoken.',
      'Produce simple connected text on topics which are familiar or of personal interest.',
      'Describe experiences, events, dreams, hopes, and ambitions and briefly give reasons and explanations for opinions and plans.'
    ],
    color: {
      bg: 'bg-sky-500/10 dark:bg-sky-500/20',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-300 dark:border-sky-700',
      glow: 'shadow-sky-500/20'
    }
  },
  {
    id: 'B2',
    name: 'B2: Vantage',
    stageName: 'Upper-Intermediate Flow',
    badge: 'B2 Fluency',
    hoursEstimated: '550 – 700 hours',
    milestoneGoal: 'Break through the notorious B2 plateau, enjoy native podcasts, watch TV series without subtitles, and debate opinions.',
    canDoSummary: [
      'Understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in your field.',
      'Interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party.',
      'Produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue giving advantages and disadvantages.',
      'Naturally deploy common idioms and colloquial discourse markers.'
    ],
    color: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-300 dark:border-indigo-700',
      glow: 'shadow-indigo-500/20'
    }
  },
  {
    id: 'C1',
    name: 'C1: Effective Operational',
    stageName: 'Advanced Professional',
    badge: 'C1 Virtuoso',
    hoursEstimated: '800 – 1000 hours',
    milestoneGoal: 'Work, negotiate, write essays, express humor and sarcasm, and absorb implicit cultural subtext without effort.',
    canDoSummary: [
      'Understand a wide range of demanding, longer texts, and recognize implicit meaning.',
      'Express ideas fluently and spontaneously without much obvious searching for expressions.',
      'Use language flexibly and effectively for social, academic, and professional purposes.',
      'Produce clear, well-structured, detailed text on complex subjects, showing controlled use of organizational patterns, connectors, and cohesive devices.'
    ],
    color: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700',
      glow: 'shadow-purple-500/20'
    }
  },
  {
    id: 'C2',
    name: 'C2: Mastery',
    stageName: 'Near-Native Mastery',
    badge: 'C2 Polyglot Elite',
    hoursEstimated: '1200+ hours',
    milestoneGoal: 'Master literary register, understand dialects and slang instantly, write publishable prose, and speak with near-native precision.',
    canDoSummary: [
      'Understand with ease virtually everything heard or read.',
      'Summarize information from different spoken and written sources, reconstructing arguments and accounts in a coherent presentation.',
      'Express yourself spontaneously, very fluently and precisely, differentiating finer shades of meaning even in the most complex situations.',
      'Effortlessly appreciate wordplay, cultural references, irony, and regional nuance.'
    ],
    color: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700',
      glow: 'shadow-amber-500/20'
    }
  }
];

export function getLevelDetail(level: CEFRLevel): LevelDetail {
  return CEFR_LEVELS.find((l) => l.id === level) || CEFR_LEVELS[0];
}
