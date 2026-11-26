import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { IntensiveCoursesView } from '../components/IntensiveCoursesView';
import { PreTestView } from '../components/PreTestView';
import { ExamSimulatorView } from '../components/ExamSimulatorView';
import { AICoachView } from '../components/AICoachView';
import { AIProviderModal } from '../components/AIProviderModal';
import { VoiceSettingsModal } from '../components/VoiceSettingsModal';
import { ProgressDashboardView } from '../components/ProgressDashboardView';
import { getDefaultAIConfig } from '../utils/aiClient';
import { getDefaultVoiceSettings } from '../utils/audio';
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
    expect(screen.getByText(/A1 · Unit 1 of 6/i)).toBeInTheDocument();
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
    expect(screen.getByText(/A1 · Unit 2 of 6/i)).toBeInTheDocument();
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

    // Switch through all 4 multi-part skills
    expect(screen.getByText(/Lesen · Teil 1 & 2/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Part 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Part 3/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText('2. Listening / Hearing'));
    expect(screen.getByText(/Play Official Audio Track/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Track 2/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Track 3/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText('3. Writing'));
    const textarea = screen.getByLabelText(/Your Exam Essay/i);
    fireEvent.change(textarea, {
      target: {
        value: 'Sehr geehrte Damen und Herren, ich möchte im August einen Deutschkurs machen. Wie viel kostet der Preis und gibt es noch Platz? Viele Grüße!',
      },
    });
    expect(screen.getByRole('button', { name: /^Task 2/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText('4. Speaking'));
    expect(screen.getByRole('button', { name: /Play Examiner Prompt/i })).toBeInTheDocument();
    const speakArea = screen.getByLabelText(/Spoken Transcript/i);
    fireEvent.change(speakArea, {
      target: { value: 'Hallo, ich heiße Alex und ich komme aus Kanada. Ich wohne in Berlin und arbeite gern.' },
    });

    fireEvent.click(screen.getByText(/Finish & Grade All 4 Skills/i));

    await waitFor(() => {
      expect(onCompleteExam).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Overall \d+%/i)).toBeInTheDocument();
      expect(screen.getByText(/Goethe\/telc:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Task Fulfillment/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('generates a brand-new AI exam edition from the lobby when AI is connected', async () => {
    const mockRead = JSON.stringify({
      parts: [
        {
          partLabel: 'Lesen · Teil 1 (Klinik-Info)',
          format: 'comprehension',
          instruction: 'Lesen Sie die Information.',
          passageTitle: 'Neue Hausarztpraxis am Markt',
          passage: 'Die neue Hausarztpraxis am Marktplatz öffnet am Montag um acht Uhr. Patienten können online oder telefonisch Termine buchen und Rezepte abholen.',
          questions: [
            { prompt: 'Wann öffnet die Praxis?', options: ['Um 7 Uhr', 'Um 8 Uhr', 'Um 9 Uhr', 'Um 10 Uhr'], correctIndex: 1, explanation: 'Sie öffnet um acht Uhr.' },
            { prompt: 'Wie bucht man Termine?', options: ['Nur per Brief', 'Online oder telefonisch', 'Nur persönlich', 'Gar nicht'], correctIndex: 1, explanation: 'Online oder telefonisch.' },
            { prompt: 'Wo liegt die Praxis?', options: ['Am Bahnhof', 'Am Hafen', 'Am Marktplatz', 'Im Park'], correctIndex: 2, explanation: 'Am Marktplatz.' },
          ],
        },
        {
          partLabel: 'Lesen · Teil 2 (Richtig/Falsch)',
          format: 'true-false',
          instruction: 'Prüfen Sie die Aussagen.',
          passageTitle: 'Apotheken-Notdienst',
          passage: 'Am Sonntag hat die Sonnen-Apotheke bis 20 Uhr Notdienst. Bitte bringen Sie Ihre Gesundheitskarte und ein gültiges Rezept mit.',
          questions: [
            { prompt: 'Die Apotheke ist bis 20 Uhr offen.', options: ['Richtig', 'Falsch', 'Steht nicht im Text'], correctIndex: 0, explanation: 'Bis 20 Uhr.' },
            { prompt: 'Man braucht keine Gesundheitskarte.', options: ['Richtig', 'Falsch', 'Steht nicht im Text'], correctIndex: 1, explanation: 'Bitte bringen Sie Ihre Karte mit.' },
            { prompt: 'Die Apotheke verkauft Fahrräder.', options: ['Richtig', 'Falsch', 'Steht nicht im Text'], correctIndex: 2, explanation: 'Steht nicht im Text.' },
          ],
        },
        {
          partLabel: 'Lesen · Teil 3 (Sprachbausteine)',
          format: 'cloze',
          instruction: 'Ergänzen Sie die Lücken.',
          passageTitle: 'Termin vereinbaren',
          passage: 'Guten Tag, ich möchte [1] Montag einen Termin [2] Dr. Weber vereinbaren. Ich habe [3] Fieber.',
          questions: [
            { prompt: 'Lücke [1]', options: ['am', 'im', 'um', 'auf'], correctIndex: 0, explanation: 'am Montag' },
            { prompt: 'Lücke [2]', options: ['bei', 'aus', 'nach', 'über'], correctIndex: 0, explanation: 'bei Dr. Weber' },
            { prompt: 'Lücke [3]', options: ['kein', 'keinen', 'nicht', 'keine'], correctIndex: 0, explanation: 'kein Fieber' },
          ],
        },
      ],
    });
    const mockListen = JSON.stringify({
      tracks: [
        {
          partLabel: 'Hören · Teil 1 (DE)',
          contextNote: 'Durchsage in der Praxis.',
          accentCode: 'de-DE',
          audioScript: 'Liebe Patientinnen und Patienten, heute findet die Impfsprechstunde im Raum zwölf statt und dauert bis sechzehn Uhr.',
          hearingFocusTrap: 'Raum 12 und 16 Uhr.',
          questions: [
            { prompt: 'In welchem Raum?', options: ['Raum 10', 'Raum 12', 'Raum 14', 'Raum 16'], correctIndex: 1, explanation: 'Raum zwölf.' },
            { prompt: 'Bis wann?', options: ['14 Uhr', '15 Uhr', '16 Uhr', '18 Uhr'], correctIndex: 2, explanation: 'Bis sechzehn Uhr.' },
            { prompt: 'Was findet statt?', options: ['Konzert', 'Impfsprechstunde', 'Pause', 'Prüfung'], correctIndex: 1, explanation: 'Impfsprechstunde.' },
          ],
        },
        {
          partLabel: 'Hören · Teil 2 (AT)',
          contextNote: 'Nachricht aus Wien.',
          accentCode: 'de-AT',
          audioScript: 'Grüß Gott, hier ist die Ordination in Wien. Ihr Befund ist fertig und kann morgen ab neun Uhr abgeholt werden.',
          hearingFocusTrap: 'Ab 9 Uhr morgen.',
          questions: [
            { prompt: 'Wann abholen?', options: ['Ab 8 Uhr', 'Ab 9 Uhr', 'Ab 11 Uhr', 'Am Freitag'], correctIndex: 1, explanation: 'Ab neun Uhr.' },
            { prompt: 'Was ist fertig?', options: ['Das Buch', 'Der Befund', 'Das Ticket', 'Die Rechnung'], correctIndex: 1, explanation: 'Ihr Befund.' },
            { prompt: 'Wo ist die Praxis?', options: ['Berlin', 'Wien', 'Zürich', 'Köln'], correctIndex: 1, explanation: 'Wien.' },
          ],
        },
        {
          partLabel: 'Hören · Teil 3 (CH)',
          contextNote: 'Anruf aus Zürich.',
          accentCode: 'de-CH',
          audioScript: 'Grüezi, Ihr Zahnarzttermin am Donnerstag wurde von zehn auf elf Uhr dreißig verschoben. Vielen Dank für Ihr Verständnis.',
          hearingFocusTrap: 'Verschoben von 10:00 auf 11:30.',
          questions: [
            { prompt: 'Neue Uhrzeit?', options: ['10:00', '11:30', '12:00', '14:30'], correctIndex: 1, explanation: '11:30 Uhr.' },
            { prompt: 'Welcher Tag?', options: ['Montag', 'Mittwoch', 'Donnerstag', 'Samstag'], correctIndex: 2, explanation: 'Donnerstag.' },
            { prompt: 'Welcher Arzt?', options: ['Augenarzt', 'Zahnarzt', 'Kinderarzt', 'Hautarzt'], correctIndex: 1, explanation: 'Zahnarzttermin.' },
          ],
        },
      ],
    });
    const mockWrite = JSON.stringify({
      tasks: [
        {
          partLabel: 'Schreiben · Teil 1 (Arzttermin absagen)',
          scenario: 'Sie sind krank und können am Dienstag nicht zur Praxis kommen. Schreiben Sie eine kurze E-Mail.',
          taskRequirements: ['Absagen', 'Grund nennen', 'Neuen Termin vorschlagen'],
          weightPercent: 40,
          keyRubricKeywords: ['Termin', 'krank', 'Donnerstag', 'Grüße'],
          modelAnswer: 'Sehr geehrte Damen und Herren, leider bin ich krank und kann meinen Termin am Dienstag nicht wahrnehmen. Können wir ihn auf Donnerstag verschieben? Viele Grüße, Alex.',
        },
        {
          partLabel: 'Schreiben · Teil 2 (Nachricht an Kollegin)',
          scenario: 'Schreiben Sie Ihrer Kollegin Hannah über Ihre Erkältung und wer Ihre Aufgaben übernimmt.',
          taskRequirements: ['Situation erklären', 'Vertretung nennen', 'Rückkehrdatum angeben'],
          weightPercent: 60,
          keyRubricKeywords: ['Erkältung', 'Montag', 'Vertretung', 'Danke'],
          modelAnswer: 'Liebe Hannah, ich habe eine starke Erkältung und bleibe bis Freitag zu Hause. Lukas übernimmt meine wichtigen Anrufe. Am Montag bin ich wieder im Büro. Danke für deine Hilfe! Liebe Grüße, Alex.',
        },
      ],
    });
    const mockSpeak = JSON.stringify({
      parts: [
        {
          partLabel: 'Sprechen · Teil 1 (Gesundheit & Alltag)',
          instruction: 'Sprechen Sie über Ihren gesunden Alltag.',
          prepSeconds: 15,
          speakSeconds: 45,
          prompts: ['Sport', 'Ernährung', 'Schlaf'],
          examinerPromptAudio: 'Guten Tag! Was machen Sie im Alltag, um gesund zu bleiben?',
          keyRubricKeywords: ['Sport', 'Wasser', 'gesund'],
          modelResponseScript: 'Ich fahre jeden Tag mit dem Fahrrad zur Arbeit, trinke viel Wasser und koche abends frisches Gemüse.',
        },
        {
          partLabel: 'Sprechen · Teil 2 (Arztbesuch)',
          instruction: 'Beschreiben Sie einen Besuch beim Arzt.',
          prepSeconds: 30,
          speakSeconds: 60,
          prompts: ['Symptome', 'Wartezeit', 'Rat des Arztes'],
          examinerPromptAudio: 'Kommen wir zu Teil zwei. Erzählen Sie von einem Arztbesuch.',
          keyRubricKeywords: ['Arzt', 'Rezept', 'Ruhe'],
          modelResponseScript: 'Letzten Winter hatte ich Fieber und bin zur Hausärztin gegangen. Sie hat mir Tee, Ruhe und ein Rezept gegeben.',
        },
        {
          partLabel: 'Sprechen · Teil 3 (Höfliche Bitte)',
          instruction: 'Bitten Sie in der Apotheke um Rat.',
          prepSeconds: 15,
          speakSeconds: 45,
          prompts: ['Kopfschmerzen', 'Dosierung fragen', 'Danken'],
          examinerPromptAudio: 'Guten Tag in der Apotheke! Wie kann ich Ihnen heute helfen?',
          keyRubricKeywords: ['bitte', 'Tabletten', 'Danke'],
          modelResponseScript: 'Guten Tag, ich habe Kopfschmerzen. Könnten Sie mir bitte ein mildes Mittel empfehlen und sagen, wie oft ich es nehmen soll?',
        },
      ],
    });

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      const bodyStr = String(init?.body || '');
      const content = bodyStr.includes('Listening')
        ? mockListen
        : bodyStr.includes('Writing')
        ? mockWrite
        : bodyStr.includes('Speaking')
        ? mockSpeak
        : mockRead;
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content } }] }),
      } as unknown as Response;
    });

    try {
      const activeAI = { ...getDefaultAIConfig('openai'), enabled: true, apiKey: 'sk-test-key' };
      render(
        <ExamSimulatorView
          activeLanguageId="german"
          onSelectLanguage={vi.fn()}
          initialLevel="A1"
          aiConfig={activeAI}
          onOpenAISettings={vi.fn()}
          onCompleteExam={vi.fn()}
        />
      );

      fireEvent.change(screen.getByLabelText(/Custom Exam Topic/i), {
        target: { value: 'Arzttermin & Apotheke' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Generate Fresh A1 AI Exam/i }));

      await waitFor(() => {
        expect(screen.getByText(/Generated fresh A1 exam \(4\/4 AI-crafted skills\)/i)).toBeInTheDocument();
        expect(screen.getByText(/AI Edition \(Arzttermin & Apotheke\)/i)).toBeInTheDocument();
      });

      // Start the newly crafted AI exam and verify fresh passage appears!
      fireEvent.click(screen.getByRole('button', { name: /Begin A1 Simulated Exam/i }));
      expect(screen.getByRole('heading', { name: /Neue Hausarztpraxis am Markt/i })).toBeInTheDocument();
    } finally {
      fetchSpy.mockRestore();
    }
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

  it('opens the Past Exam Detail Inspector when clicking a recorded exam attempt', () => {
    const onLaunchExam = vi.fn();
    const onDeleteExamAttempt = vi.fn();
    const state = {
      ...createEmptyLearnerState(),
      examHistory: [
        {
          id: 'attempt-hist-1',
          timestamp: '2026-11-26T10:00:00.000Z',
          examId: 'exam-de-b1',
          examTitle: 'Goethe-Zertifikat B1 Simulation',
          alignedCertificate: 'Goethe-Zertifikat B1',
          languageId: 'german',
          level: 'B1' as const,
          mode: 'strict' as const,
          durationUsedSeconds: 1845,
          overallScore: 84,
          passed: true,
          officialGradeLabel: 'Goethe/telc: gut (84/100)',
          skills: {
            reading: { score: 89, passed: true, feedback: '8/9 correct (P1: 3/3 · P2: 3/3 · P3: 2/3).' },
            listening: { score: 78, passed: true, feedback: '7/9 correct (T1: 3/3 · T2: 2/3 · T3: 2/3) · 4 plays.' },
            writing: {
              score: 85,
              passed: true,
              feedback: 'T1 (40%): 86% · T2 (60%): 84% — Strong formal register.',
              aiGraded: true,
              rubric: {
                taskFulfillment: 88,
                coherenceCohesion: 84,
                lexicalRange: 82,
                grammaticalAccuracy: 86,
              },
            },
            speaking: {
              score: 84,
              passed: true,
              feedback: 'Parts completed: 3/3 — Confident spontaneous responses.',
              aiGraded: true,
              rubric: {
                taskFulfillment: 85,
                coherenceCohesion: 83,
                lexicalRange: 82,
                grammaticalAccuracy: 84,
              },
            },
          },
          writingSubmission: '[Task 1 · 40%]\nSehr geehrte Damen und Herren, ich schreibe wegen meines Kurses.',
          speakingTranscript: '[Part 1]\nIch fahre meistens mit der S-Bahn ins Büro.',
          questionReviews: [
            {
              id: 'q1',
              skill: 'reading' as const,
              sectionTag: 'Reading P1',
              prompt: 'Wann öffnet die Bibliothek?',
              chosenOption: 'Um 9 Uhr',
              correctOption: 'Um 9 Uhr',
              isCorrect: true,
              explanation: 'Sie öffnet morgens um neun Uhr.',
            },
            {
              id: 'q2',
              skill: 'listening' as const,
              sectionTag: 'Listening T2',
              prompt: 'Von welchem Gleis fährt der Zug?',
              chosenOption: 'Gleis 2',
              correctOption: 'Gleis 5',
              isCorrect: false,
              explanation: 'Der Zug wurde auf Gleis fünf verlegt.',
            },
          ],
          writingNotes: ['Remember verb-final word order after "obwohl".'],
          speakingNotes: ['Expand on your counterargument in Part 2.'],
        },
      ],
    };

    render(
      <ProgressDashboardView
        learnerState={state}
        masteredTipsCount={2}
        onImportState={vi.fn()}
        onResetProgress={vi.fn()}
        onJumpToCourse={vi.fn()}
        onLaunchExam={onLaunchExam}
        onDeleteExamAttempt={onDeleteExamAttempt}
      />
    );

    // Click the recorded exam row
    fireEvent.click(screen.getByRole('button', { name: /Goethe-Zertifikat B1 Simulation/i }));

    // Verify modal renders official grade, rubric, submissions, action notes, and question review
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Past Simulated Exam Dossier/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Goethe\/telc: gut \(84\/100\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Task Fulfillment/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Sehr geehrte Damen und Herren, ich schreibe wegen meines Kurses./i)).toBeInTheDocument();
    expect(screen.getByText(/Ich fahre meistens mit der S-Bahn ins Büro./i)).toBeInTheDocument();
    expect(screen.getByText(/Remember verb-final word order after "obwohl"./i)).toBeInTheDocument();
    expect(screen.getByText(/Question-by-Question Review \(1\/2 Correct\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Wann öffnet die Bibliothek\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Von welchem Gleis fährt der Zug\?/i)).toBeInTheDocument();

    // Filter to Missed Only and verify only the missed listening item remains
    fireEvent.click(screen.getByRole('button', { name: 'Missed Only' }));
    expect(screen.queryByText(/Wann öffnet die Bibliothek\?/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Your answer: Gleis 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Correct answer: Gleis 5/i)).toBeInTheDocument();

    // Reference benchmarks collapsible exists
    expect(screen.getByText(/Reference Benchmarks: Listening Dialogues & Model Answers/i)).toBeInTheDocument();

    // Retake action works
    fireEvent.click(screen.getByRole('button', { name: /Retake B1/i }));
    expect(onLaunchExam).toHaveBeenCalledWith('german', 'B1');
  });
});

describe('VoiceSettingsModal Component', () => {
  it('switches regional accents and saves a neural human voice profile', () => {
    const onSave = vi.fn();
    render(
      <VoiceSettingsModal
        isOpen={true}
        onClose={vi.fn()}
        settings={getDefaultVoiceSettings()}
        onSaveSettings={onSave}
        activeLanguageId="english"
      />
    );

    expect(screen.getByText(/Human Voice & Accent Studio/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Australian \(AU\)/i));
    fireEvent.click(screen.getByText(/German DACH \(3 Accents\)/i));
    fireEvent.click(screen.getByText(/Austria \(AT\)/i));
    fireEvent.click(screen.getByText(/OpenAI Human TTS/i));
    fireEvent.click(screen.getByText(/Sage/i));
    fireEvent.click(screen.getByRole('button', { name: /Save Voice Profile/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0];
    expect(saved.accents.english).toBe('en-AU');
    expect(saved.accents.german).toBe('de-AT');
    expect(saved.provider).toBe('openai');
    expect(saved.neuralVoice).toBe('sage');
  });
});
