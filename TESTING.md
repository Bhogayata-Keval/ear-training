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
