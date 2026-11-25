import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IntensiveCoursesView } from '../components/IntensiveCoursesView';
import { PreTestView } from '../components/PreTestView';
import { ExamSimulatorView } from '../components/ExamSimulatorView';
import { AICoachView } from '../components/AICoachView';
import { AIProviderModal } from '../components/AIProviderModal';
import { ProgressDashboardView } from '../components/ProgressDashboardView';
import { getDefaultAIConfig } from '../utils/aiClient';
import { createEmptyLearnerState } from '../utils/progressStore';

describe('IntensiveCoursesView Component', () => {
  it('renders A1–C2 intensive curriculum, official internet mock links, and toggles unit completion', () => {
    const onToggleComplete = vi.fn();
    render(
      <IntensiveCoursesView
        activeLanguageId="german"
        onSelectLanguage={vi.fn()}
        activeLevel="B1"
        onSelectLevel={vi.fn()}
        completedModuleIds={[]}
        enrolledCourseIds={['de-intensive-b1']}
        onToggleModuleComplete={onToggleComplete}
        onLaunchExam={vi.fn()}
        onLaunchAICoach={vi.fn()}
        onLaunchPreTest={vi.fn()}
      />
    );

    expect(screen.getByText(/German Intensive Certification Curriculum/i)).toBeInTheDocument();
    expect(screen.getByText(/German B1 Threshold & Citizenship Mastery/i)).toBeInTheDocument();
    expect(screen.getByText(/Official Certification Portals/i)).toBeInTheDocument();

    const completeBtns = screen.getAllByText('Mark Unit Complete');
    fireEvent.click(completeBtns[0]);
    expect(onToggleComplete).toHaveBeenCalledTimes(1);
  });

  it('launches the 5-step Guided Lesson Player for Unit 1, evaluates checkpoint, and advances to Unit 2', async () => {
    const onCompleteModule = vi.fn();
    const onSaveUnitProgress = vi.fn();

    render(
      <IntensiveCoursesView
        activeLanguageId="german"
        onSelectLanguage={vi.fn()}
        activeLevel="A1"
        onSelectLevel={vi.fn()}
        completedModuleIds={[]}
        enrolledCourseIds={['de-intensive-a1']}
        onToggleModuleComplete={vi.fn()}
        onCompleteModule={onCompleteModule}
        onSaveUnitProgress={onSaveUnitProgress}
        aiConfig={getDefaultAIConfig('ollama')}
        onLaunchExam={vi.fn()}
        onLaunchAICoach={vi.fn()}
        onLaunchPreTest={vi.fn()}
      />
    );

    // Launch Unit 1 from the syllabus card
    fireEvent.click(screen.getByRole('button', { name: /Start Unit 1/i }));
    expect(screen.getByText(/A1 · Unit 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/V2 Verb-Second Engine/i)).toBeInTheDocument();

    // Step 1 -> Step 2 (Vocabulary Flashcards)
    fireEvent.click(screen.getByRole('button', { name: /Continue to Vocabulary Flashcards/i }));
    expect(screen.getByText(/High-Yield Exam Vocabulary Studio/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Reveal Meaning & Example/i }));
    expect(screen.getByText(/to be called \/ named/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Got It! Next Card/i }));
    expect(onSaveUnitProgress).toHaveBeenCalled();

    // Step 2 -> Step 3 (Interactive Quiz)
    fireEvent.click(screen.getByRole('button', { name: /Continue to Knowledge Check/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Heute wohne ich in München.' }));
    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();

    // Step 3 -> Step 4 (4-Skill Drills)
    fireEvent.click(screen.getByRole('button', { name: /Continue to 4-Skill Drills/i }));
    const markPracticedBtns = screen.getAllByRole('button', { name: /Mark Practiced/i });
    fireEvent.click(markPracticedBtns[0]);

    // Step 4 -> Step 5 (Milestone Checkpoint)
    fireEvent.click(screen.getByRole('button', { name: /Continue to Milestone Checkpoint/i }));
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: {
        value:
          'Guten Tag! Ich heiße Lukas und wohne in München. Meine Adresse ist Hauptstraße zehn und ich kann meinen Namen gut buchstabieren. Entschuldigung, wie ist Ihre Telefonnummer?',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Evaluate Checkpoint/i }));

    await waitFor(() => {
      expect(screen.getByText(/Built-in CEFR Rubric Engine/i)).toBeInTheDocument();
    });

    // Complete Unit 1 & auto-advance directly into Unit 2
    fireEvent.click(screen.getByRole('button', { name: /Complete Unit & Continue to Unit 2/i }));
    expect(onCompleteModule).toHaveBeenCalledTimes(1);
    expect(onCompleteModule.mock.calls[0][0]).toBe('de-a1-m1');
    expect(typeof onCompleteModule.mock.calls[0][1].score).toBe('number');
    expect(screen.getByText(/A1 · Unit 2 of 3/i)).toBeInTheDocument();
  });
});

describe('PreTestView Component', () => {
  it('runs a complete 12-item scored pre-test and generates collective course recommendations', () => {
    const onCompletePreTest = vi.fn();
    render(
      <PreTestView
        activeLanguageId="english"
        onSelectLanguage={vi.fn()}
        onCompletePreTest={onCompletePreTest}
        onJumpToCourse={vi.fn()}
        onLaunchExam={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Start Scored Pre-Test'));

    // Answer all 12 progressive A1->C2 items
    for (let i = 0; i < 12; i++) {
      expect(screen.getByText(`Item ${i + 1} of 12`)).toBeInTheDocument();
      const firstOption = screen.getByText('A').closest('button')!;
      fireEvent.click(firstOption);
    }

    expect(onCompletePreTest).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Recommended Collective Intensive Courses/i)).toBeInTheDocument();
  });
});

describe('ExamSimulatorView Component', () => {
  it('simulates a full 4-skill exam under pressure and produces a recorded score report', async () => {
    const onCompleteExam = vi.fn();
    render(
      <ExamSimulatorView
        activeLanguageId="german"
        onSelectLanguage={vi.fn()}
        initialLevel="A1"
        aiConfig={getDefaultAIConfig('ollama')}
        onOpenAISettings={vi.fn()}
        onCompleteExam={onCompleteExam}
      />
    );

    expect(screen.getByText(/Goethe-Zertifikat A1 Simulation/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Begin A1 Simulated Exam/i));

    // Switch through all 4 skills
    expect(screen.getByText(/Lesen · Teil 1 & 2/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('2. Listening / Hearing'));
    expect(screen.getByText(/Play Official Audio Track/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('3. Writing'));
    const textarea = screen.getByLabelText(/Your Exam Essay/i);
    fireEvent.change(textarea, {
      target: {
        value: 'Sehr geehrte Damen und Herren, ich möchte im August einen Deutschkurs machen. Wie viel kostet der Preis und gibt es noch Platz? Viele Grüße!',
      },
    });

    fireEvent.click(screen.getByText('4. Speaking'));
    const speakArea = screen.getByLabelText(/Spoken Transcript/i);
    fireEvent.change(speakArea, {
      target: { value: 'Hallo, ich heiße Alex und ich komme aus Kanada. Ich wohne in Berlin und arbeite gern.' },
    });

    fireEvent.click(screen.getByText(/Finish & Grade All 4 Skills/i));

    await waitFor(() => {
      expect(onCompleteExam).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Overall \d+%/i)).toBeInTheDocument();
    });
  });
});

describe('AICoachView & AIProviderModal Components', () => {
  it('allows configuring local Ollama and saving AI settings', () => {
    const onSaveConfig = vi.fn();
    render(
      <AIProviderModal
        isOpen={true}
        onClose={vi.fn()}
        config={getDefaultAIConfig('ollama')}
        onSaveConfig={onSaveConfig}
      />
    );

    expect(screen.getByText(/Connect Local or Cloud AI Provider/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('OpenAI'));
    expect(screen.getByLabelText(/Endpoint URL/i)).toHaveValue('https://api.openai.com/v1/chat/completions');

    fireEvent.click(screen.getByText('Ollama (Local AI)'));
    fireEvent.click(screen.getByText(/Save & Enable AI/i));
    expect(onSaveConfig).toHaveBeenCalledWith(expect.objectContaining({ provider: 'ollama', enabled: true }));
  });

  it('fetches live models in AIProviderModal and lets the user select one before saving', async () => {
    const onSaveConfig = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { id: 'qwen2.5:14b', owned_by: 'ollama' },
          { id: 'gemma3:12b', owned_by: 'ollama' },
        ],
      }),
    } as unknown as Response);

    try {
      render(
        <AIProviderModal
          isOpen={true}
          onClose={vi.fn()}
          config={getDefaultAIConfig('ollama')}
          onSaveConfig={onSaveConfig}
        />
      );

      fireEvent.click(screen.getByText('Fetch Models'));

      const select = await screen.findByLabelText(/Select fetched AI model/i);
      expect(screen.getByText(/Available Models \(2\)/i)).toBeInTheDocument();

      fireEvent.change(select, { target: { value: 'gemma3:12b' } });
      expect(screen.getByLabelText(/Model Name/i)).toHaveValue('gemma3:12b');

      fireEvent.click(screen.getByText(/Save & Enable AI/i));
      expect(onSaveConfig).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'ollama', model: 'gemma3:12b', enabled: true })
      );
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('evaluates writing offline in AICoachView when AI provider is not yet connected', async () => {
    const onLog = vi.fn();
    render(
      <AICoachView
        activeLanguageId="english"
        onSelectLanguage={vi.fn()}
        initialLevel="B2"
        initialSkill="writing"
        aiConfig={getDefaultAIConfig('ollama')}
        onOpenAISettings={vi.fn()}
        onLogAISession={onLog}
      />
    );

    const input = screen.getByPlaceholderText(/Paste a B2 English essay/i);
    fireEvent.change(input, {
      target: {
        value: 'Remote work offers flexibility; however, teams still benefit from occasional in-person collaboration because trust builds faster face to face.',
      },
    });
    fireEvent.click(screen.getByText('Grade'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Built-in CEFR Rubric Engine/i)).toBeInTheDocument();
    });
  });
});

describe('ProgressDashboardView Component', () => {
  it('renders KPI counters, Zero-to-Hero maps, and export/import controls', () => {
    render(
      <ProgressDashboardView
        learnerState={createEmptyLearnerState()}
        masteredTipsCount={4}
        onImportState={vi.fn()}
        onResetProgress={vi.fn()}
        onJumpToCourse={vi.fn()}
      />
    );

    expect(screen.getByText(/Your Zero-to-Hero Polyglot Dossier/i)).toBeInTheDocument();
    expect(screen.getByText(/Export JSON Backup/i)).toBeInTheDocument();
    expect(screen.getByText(/English Zero-to-Hero Map/i)).toBeInTheDocument();
    expect(screen.getByText(/German Zero-to-Hero Map/i)).toBeInTheDocument();
  });
});
