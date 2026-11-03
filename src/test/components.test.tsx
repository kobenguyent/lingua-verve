import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../components/Navbar';
import { TipCard } from '../components/TipCard';
import { LevelRoadmap } from '../components/LevelRoadmap';
import { FalseFriendsModal } from '../components/FalseFriendsModal';
import { LANGUAGES } from '../data/languages';
import { ALL_TIPS } from '../data';

describe('Navbar Component', () => {
  it('renders brand name and language buttons', () => {
    const handleSelectLanguage = vi.fn();
    render(
      <Navbar
        languages={LANGUAGES}
        activeLanguageId="all"
        onSelectLanguage={handleSelectLanguage}
        savedCount={3}
        masteredCount={5}
        onOpenDiagnostic={vi.fn()}
        onOpenFalseFriends={vi.fn()}
        onOpenExtensibility={vi.fn()}
        onOpenRandomTip={vi.fn()}
        isDarkMode={false}
        onToggleDarkMode={vi.fn()}
      />
    );

    expect(screen.getByText('LinguaVerve')).toBeInTheDocument();
    expect(screen.getByText('All Languages')).toBeInTheDocument();
    expect(screen.getAllByText('English').length).toBeGreaterThan(0);
    expect(screen.getAllByText('German').length).toBeGreaterThan(0);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('triggers language selection on click', () => {
    const handleSelectLanguage = vi.fn();
    render(
      <Navbar
        languages={LANGUAGES}
        activeLanguageId="all"
        onSelectLanguage={handleSelectLanguage}
        savedCount={0}
        masteredCount={0}
        onOpenDiagnostic={vi.fn()}
        onOpenFalseFriends={vi.fn()}
        onOpenExtensibility={vi.fn()}
        onOpenRandomTip={vi.fn()}
        isDarkMode={false}
        onToggleDarkMode={vi.fn()}
      />
    );

    const germanBtn = screen.getAllByText('German')[0];
    fireEvent.click(germanBtn);
    expect(handleSelectLanguage).toHaveBeenCalledWith('german');
  });
});

describe('TipCard Component', () => {
  const sampleTip = ALL_TIPS[0];

  it('renders tip details, title, and golden rule', () => {
    render(
      <TipCard
        tip={sampleTip}
        isBookmarked={false}
        isMastered={false}
        onToggleBookmark={vi.fn()}
        onToggleMastered={vi.fn()}
      />
    );

    expect(screen.getByText(sampleTip.title)).toBeInTheDocument();
    expect(screen.getByText(sampleTip.goldenRule)).toBeInTheDocument();
    expect(screen.getByText(sampleTip.summary)).toBeInTheDocument();
  });

  it('handles bookmark toggle', () => {
    const onToggleBookmark = vi.fn();
    render(
      <TipCard
        tip={sampleTip}
        isBookmarked={false}
        isMastered={false}
        onToggleBookmark={onToggleBookmark}
        onToggleMastered={vi.fn()}
      />
    );

    const bookmarkBtn = screen.getByTitle('Save for Later');
    fireEvent.click(bookmarkBtn);
    expect(onToggleBookmark).toHaveBeenCalledWith(sampleTip.id);
  });

  it('handles mastered toggle', () => {
    const onToggleMastered = vi.fn();
    render(
      <TipCard
        tip={sampleTip}
        isBookmarked={false}
        isMastered={false}
        onToggleBookmark={vi.fn()}
        onToggleMastered={onToggleMastered}
      />
    );

    const masteredBtn = screen.getByTitle('Mark as Mastered');
    fireEvent.click(masteredBtn);
    expect(onToggleMastered).toHaveBeenCalledWith(sampleTip.id);
  });
});

describe('LevelRoadmap Component', () => {
  it('renders all CEFR levels', () => {
    const onSelectLevel = vi.fn();
    render(
      <LevelRoadmap
        activeLevel="ALL"
        onSelectLevel={onSelectLevel}
        tipsCountByLevel={{ ALL: 25, A1: 4, A2: 4, B1: 4, B2: 4, C1: 4, C2: 4 }}
      />
    );

    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('B1')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
  });

  it('calls onSelectLevel when a level button is clicked', () => {
    const onSelectLevel = vi.fn();
    render(
      <LevelRoadmap
        activeLevel="ALL"
        onSelectLevel={onSelectLevel}
        tipsCountByLevel={{ ALL: 25, A1: 4, A2: 4, B1: 4, B2: 4, C1: 4, C2: 4 }}
      />
    );

    const b2Button = screen.getByText('B2');
    fireEvent.click(b2Button);
    expect(onSelectLevel).toHaveBeenCalledWith('B2');
  });
});

describe('FalseFriendsModal Component', () => {
  it('renders and filters deceptive cognates', () => {
    render(<FalseFriendsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('False Friends & Deceptive Cognates')).toBeInTheDocument();
    expect(screen.getByText('das Gift')).toBeInTheDocument();
    expect(screen.getByText('bekommen')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search words/i);
    fireEvent.change(searchInput, { target: { value: 'Gift' } });

    expect(screen.getByText('das Gift')).toBeInTheDocument();
    expect(screen.queryByText('bekommen')).not.toBeInTheDocument();
  });
});
