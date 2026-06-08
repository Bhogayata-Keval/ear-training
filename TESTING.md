# User Journey Paths & Test Checklist

## Landing Page

### First Visit (no localStorage `has_visited`)
- [ ] Full hero displayed: "Online Music School" heading, subtitle, "Start Training" button
- [ ] App content (keyboard, steps, settings) is hidden
- [ ] Page title is "Online Music School"
- [ ] Sounds start loading in the background (even before clicking Start)
- [ ] Clicking "Start Training" collapses hero to compact header and reveals app
- [ ] After clicking "Start Training", `has_visited` is set in localStorage

### Return Visit (localStorage `has_visited` = "true")
- [ ] Compact header displayed: "Online Music School" in one line
- [ ] App content is immediately visible (no click needed)
- [ ] Clicking the header title expands back to full hero
- [ ] Clicking the header title again collapses back to compact

### Edge Cases
- [ ] Clearing localStorage restores full hero on next visit
- [ ] Corrupt/missing localStorage doesn't break the page

---

## Page Load (all modes)

- [ ] Sound status shows "Loading sounds..."
- [ ] After loading completes, status shows "Sounds ready"
- [ ] Keyboard renders with octaves 3-6, white and black keys
- [ ] Black keys appear only between C-D, D-E, F-G, G-A, A-B (no black key between E-F or B-C)
- [ ] Black key labels show correct flat names: Db, Eb, Gb, Ab, Bb
- [ ] Default mode is Ear Training > Note
- [ ] Sub-mode selector (Note / Interval) is visible
- [ ] Middle octave keys (C4-B4) are selected by default

---

## Path 1: Play Mode

**Enter:** Click "Play mode" button.

### UI State
- [ ] "Play mode" button is active (blue)
- [ ] "Ear Training" button is inactive
- [ ] Sub-mode selector (Note / Interval) is hidden
- [ ] All piano keys have no selection glow (no blue outlines)
- [ ] Select All / Deselect All buttons are hidden
- [ ] Interval selector is hidden
- [ ] Step cards (Step 1, 2, 3) are hidden
- [ ] Settings panel is hidden

### Interactions
- [ ] Tapping any white key plays its sound
- [ ] Tapping any black key plays its sound
- [ ] Keys animate on press (translateY)
- [ ] If sounds not loaded yet, shows "Waiting for sounds to load..."

### Edge Cases
- [ ] Rapid tapping multiple keys plays overlapping sounds correctly
- [ ] Switching to Play mode from Note mode clears key selection visuals
- [ ] Switching back to Ear Training restores key selection visuals

---

## Path 2: Ear Training > Note

**Enter:** Click "Ear Training" button, then "Note" sub-mode (default).

### UI State
- [ ] "Ear Training" button is active
- [ ] Sub-mode selector visible, "Note" is active
- [ ] Piano keys show selection state (blue glow on selected keys)
- [ ] Select All / Deselect All buttons visible below keyboard
- [ ] Interval selector is hidden
- [ ] Step cards visible (Step 1, 2, 3)
- [ ] Settings panel visible with: reference note toggle + select, repeat count, gap
- [ ] Interval direction setting is hidden
- [ ] Instruction text: "Test mode: play a random note, guess it, and check the answer."

### Key Selection
- [ ] Clicking a selected key deselects it (blue glow removed)
- [ ] Clicking an unselected key selects it (blue glow added)
- [ ] "Deselect All" removes all selections
- [ ] "Select All" selects all keys
- [ ] Guess dropdown updates to only show selected notes
- [ ] Deselecting all notes shows "No notes selected" in dropdown

### Quiz Flow
- [ ] "Play a Random Note" plays one of the selected notes
- [ ] Note repeats according to repeat count setting
- [ ] Gap between repeats matches gap setting
- [ ] If reference note enabled, reference plays before the quiz note
- [ ] If reference note disabled, only quiz note plays
- [ ] "Hear Again" is disabled before first play
- [ ] "Hear Again" is enabled after first play, replays the same note
- [ ] "Hear Again" is disabled while a sequence is playing
- [ ] "Play a Random Note" is disabled while a sequence is playing
- [ ] Guess dropdown shows only selected notes, sorted
- [ ] "Check Answer" before playing shows "Play a note first."
- [ ] "Check Answer" with no guess selected shows "Select a note first."
- [ ] "Check Answer" with correct guess shows answer + guess + checkmark
- [ ] "Check Answer" with wrong guess shows answer + guess + cross mark
- [ ] "Check Answer" disables after first check (prevents double-recording)
- [ ] "Check Answer" re-enables when next note is played

### Edge Cases
- [ ] Playing with no notes selected shows "Select at least one note to play."
- [ ] Playing while sounds still loading shows loading message
- [ ] Changing reference note select updates which reference plays
- [ ] Setting repeat count to 1 plays note only once
- [ ] Changing gap to 0.1 plays notes with minimal delay

---

## Path 3: Ear Training > Interval

**Enter:** Click "Ear Training" button, then "Interval" sub-mode.

### UI State
- [ ] "Ear Training" button is active
- [ ] Sub-mode selector visible, "Interval" is active
- [ ] Piano keys have no selection glow
- [ ] Select All / Deselect All (keyboard) buttons are hidden
- [ ] Interval selector is visible with 12 interval toggle buttons
- [ ] All 12 intervals selected by default (blue glow)
- [ ] Interval Select All / Deselect All buttons visible below interval toggles
- [ ] Step cards visible (Step 1, 2, 3)
- [ ] Step 1 button reads "Play an Interval"
- [ ] Step 2 label reads "Guess the interval"
- [ ] Settings panel visible with: repeat count, gap, interval direction
- [ ] Reference note controls are hidden
- [ ] Repeat count label reads "How many times to repeat the interval?"
- [ ] Interval direction dropdown shows Ascending / Descending / Random
- [ ] Instruction text: "Interval training: identify the interval between two notes."

### Interval Selection
- [ ] Clicking a selected interval deselects it
- [ ] Clicking an unselected interval selects it
- [ ] "Deselect All" removes all interval selections
- [ ] "Select All" selects all 12 intervals
- [ ] Guess dropdown updates to only show selected intervals
- [ ] Deselecting all intervals shows "No intervals selected" in dropdown

### Piano Keys (interval mode)
- [ ] Tapping any piano key does nothing (no sound, no selection toggle)

### Quiz Flow
- [ ] "Play an Interval" plays two notes sequentially
- [ ] With repeat count 3 and gap 2: plays 6 notes total (3 pairs, 2s gap between each note)
- [ ] No reference note plays (even if the hidden checkbox is checked)
- [ ] Ascending direction: lower note first, higher note second
- [ ] Descending direction: higher note first, lower note second
- [ ] Random direction: varies between ascending and descending
- [ ] "Hear Again" disabled before first play
- [ ] "Hear Again" enabled after first play, replays same two notes in same order
- [ ] "Hear Again" disabled while a sequence is playing
- [ ] "Play an Interval" disabled while a sequence is playing
- [ ] Guess dropdown shows only selected interval names
- [ ] "Check Answer" before playing shows "Play an interval first."
- [ ] "Check Answer" with no guess selected shows "Select an interval first."
- [ ] "Check Answer" with correct guess shows answer + guess + checkmark
- [ ] "Check Answer" with wrong guess shows answer + guess + cross mark
- [ ] "Check Answer" disables after first check (prevents double-recording)
- [ ] "Check Answer" re-enables when next interval is played

### Edge Cases
- [ ] Playing with no intervals selected shows "Select at least one interval."
- [ ] Only selecting "Octave" plays valid intervals (root note has matching note 12 semitones up)
- [ ] Playing while sounds still loading shows loading message

---

## Score Tracking (both Note and Interval modes)

### Stats Display
- [ ] Stats container appears below step cards in Note mode
- [ ] Stats container appears below step cards in Interval mode
- [ ] Stats container is hidden in Play mode
- [ ] Shows "Note Stats" heading in Note mode
- [ ] Shows "Interval Stats" heading in Interval mode
- [ ] Shows correct count, total count, and accuracy percentage
- [ ] Shows current streak count
- [ ] Accuracy shows 0% when no answers recorded

### Recording
- [ ] Correct answer increments correct count, total count, and streak
- [ ] Wrong answer increments total count only, resets streak to 0
- [ ] Each answer adds an entry to recent history
- [ ] History entry shows checkmark (green) for correct, cross (red) for wrong
- [ ] History entry shows answer and guess (e.g. "✔ C4 → C4")
- [ ] History entry shows relative time ("just now", "2 min ago")
- [ ] Maximum 20 history entries kept (oldest removed)
- [ ] Clicking "Check Answer" twice on same question records only one entry

### Persistence (localStorage)
- [ ] Stats survive page reload
- [ ] Stats survive closing and reopening browser
- [ ] Note stats and Interval stats are tracked independently
- [ ] "Reset Note Stats" clears only note stats, interval stats untouched
- [ ] "Reset Interval Stats" clears only interval stats, note stats untouched
- [ ] After reset, stats show 0/0 (0%) with empty history

### Edge Cases
- [ ] First ever visit shows 0/0 (0%) with no history
- [ ] Clearing browser localStorage resets stats gracefully (no errors)
- [ ] Corrupt localStorage data falls back to defaults without error

---

## Mode Switching

- [ ] Play -> Note: keys regain selection glow, step cards appear, settings appear
- [ ] Play -> Interval: interval selector appears, step cards appear, settings appear (no reference)
- [ ] Note -> Play: selection glow removed, everything except keyboard hides
- [ ] Note -> Interval: keyboard controls swap to interval selector, reference hides, direction appears
- [ ] Interval -> Note: interval selector hides, keyboard controls appear, reference appears, direction hides
- [ ] Interval -> Play: everything hides except keyboard
- [ ] Clicking "Ear Training" when already in Note stays in Note
- [ ] Clicking "Ear Training" when in Play returns to last used sub-mode (Note or Interval)
- [ ] Answer display clears when switching modes
- [ ] "Hear Again" state resets appropriately per mode (note answer vs interval answer)
- [ ] Stats display updates to show correct mode's stats when switching between Note and Interval
- [ ] Stats display hides when switching to Play mode

---

## Settings Persistence Across Modes

- [ ] Changing repeat count in Note mode, switching to Interval, value persists
- [ ] Changing gap in Interval mode, switching to Note, value persists
- [ ] Selected notes (for Note mode) persist when switching to Interval and back
- [ ] Selected intervals persist when switching to Note and back

---

## Level Sidebar

### Sidebar Layout
- [ ] Sidebar appears on the left side of the app content
- [ ] Sidebar shows "Levels" title and collapse toggle button (◀)
- [ ] Clicking toggle collapses sidebar to narrow strip (▶ button only)
- [ ] Clicking toggle again expands sidebar back
- [ ] On mobile (< 720px), sidebar starts collapsed and stacks above content
- [ ] Sidebar has two sections: "FREE" (levels 1-3) and "PREMIUM" (levels 4-7)
- [ ] "Free Practice" option appears at the bottom of the sidebar

### Level Display
- [ ] Level 1 shows as unlocked (blue circle with "1")
- [ ] Levels 2-3 show as locked (dimmed) until previous level is completed
- [ ] Levels 4-6 show "Premium" badge
- [ ] Level 7 shows "Soon" badge
- [ ] Completed levels show green checkmark icon
- [ ] Active level has blue left border highlight and light blue background
- [ ] Free Practice shows purple music note icon
- [ ] Free Practice is highlighted when no level is selected

### Level Selection
- [ ] Clicking Level 1 activates it and configures the app
- [ ] Clicking a locked level does nothing
- [ ] Clicking a paid level shows premium subscription alert
- [ ] Clicking Free Practice exits level mode and restores full controls
- [ ] Only one level (or Free Practice) can be active at a time

### Level UI (all levels 1-7)
- [ ] "Play mode" button is hidden
- [ ] "Ear Training" button stays visible but disabled (with mode instruction + sound status)
- [ ] Note / Interval sub-mode buttons are hidden
- [ ] Select All / Deselect All buttons are hidden (both keyboard and interval)
- [ ] Non-level white keys appear greyed out (30% opacity, not-allowed cursor)
- [ ] Non-level black keys appear as solid mid-grey (#999, not-allowed cursor)
- [ ] Clicking a disabled key does nothing (no sound, no toggle)
- [ ] Clicking a level-enabled key plays its sound
- [ ] Non-level interval toggles appear greyed out (30% opacity, not-allowed cursor)
- [ ] Clicking a disabled interval toggle does nothing

### Level 1: Natural Notes
- [ ] Selects Note mode (Ear Training > Note)
- [ ] Only white keys in octave 4 are selected (C4-B4, 7 notes)
- [ ] All other keys (black keys, other octaves) show as disabled
- [ ] Guess dropdown only shows the 7 natural notes
- [ ] Quiz flow works: play random, guess, check answer

### Level 2: Chromatic Scale (requires Level 1 mastery)
- [ ] Selects Note mode
- [ ] All 12 notes in octave 4 selected (including sharps/flats)
- [ ] Keys outside octave 4 show as disabled
- [ ] Guess dropdown shows all 12 note names

### Level 3: Easy Intervals (requires Level 2 mastery)
- [ ] Selects Interval mode (Ear Training > Interval)
- [ ] Only Perfect 5th and Octave intervals selected
- [ ] Other 10 interval toggles show as disabled
- [ ] Guess dropdown shows only Perfect 5th and Octave
- [ ] Quiz flow works: play interval, guess, check answer

### Level Stats Tracking
- [ ] Stats container shows "Level N Stats" heading when in a level
- [ ] Correct/total/accuracy tracked per level independently
- [ ] Streak tracked per level independently
- [ ] History shows last 20 answers for the current level
- [ ] Stats persist in localStorage under "ear-training-levels" key
- [ ] "Reset Stats" button resets only the current level's stats
- [ ] Level stats are separate from Free Practice note/interval stats
- [ ] Progress message shows how many more answers needed to unlock next level
- [ ] When threshold met (80% accuracy, 10+ answers), shows "Level mastered!" message

### Level Unlock Progression
- [ ] Level 1 is always unlocked
- [ ] Level 2 unlocks when Level 1 has ≥80% accuracy with ≥10 answers
- [ ] Level 3 unlocks when Level 2 has ≥80% accuracy with ≥10 answers
- [ ] When a level unlocks, a green toast notification appears at bottom-right
- [ ] Toast shows "Level N Unlocked!" with the level name
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Unlock toast only shows once (tracked in localStorage)
- [ ] Sidebar updates immediately to show newly unlocked level
- [ ] Progress bar appears on sidebar for levels with any recorded answers
- [ ] Progress bar turns green when level is completed

### Free Practice Mode
- [ ] Clicking "Free Practice" in sidebar exits any active level
- [ ] "Play mode" button reappears
- [ ] "Ear Training" button re-enabled
- [ ] Note / Interval sub-mode buttons reappear
- [ ] Select All / Deselect All buttons reappear
- [ ] All keys and interval toggles lose disabled styling
- [ ] Note selection defaults back to C4-B4
- [ ] Interval selection defaults to all 12 intervals
- [ ] Direction dropdown re-enabled and reset to ascending
- [ ] Stats show regular Note/Interval stats (not level stats)
- [ ] All existing app behavior works unchanged

### Edge Cases
- [ ] Refreshing page while in a level returns to Free Practice
- [ ] Clearing localStorage resets all level stats and unlock progress
- [ ] Corrupt localStorage for levels falls back to defaults
- [ ] Switching between levels clears answer display and resets quiz state
- [ ] Level stats don't affect Free Practice stats and vice versa
