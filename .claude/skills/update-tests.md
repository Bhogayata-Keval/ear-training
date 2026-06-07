---
name: update-tests
description: Update TESTING.md after code changes — reviews what changed, asks clarifying questions if behavior is ambiguous, then updates the test checklist
user_invocable: true
---

# Update TESTING.md

You are maintaining the test checklist for an ear training web app. After code changes, your job is to keep TESTING.md accurate and complete.

## Steps

1. **Read the current state:**
   - Read `TESTING.md` to understand existing test cases
   - Run `git diff` to see what changed since the last commit (or `git diff HEAD~1` if changes are already committed)
   - If the diff is empty, ask the user what they changed

2. **Analyze the impact:**
   - Identify which user journey paths are affected (Play mode, Ear Training > Note, Ear Training > Interval, Mode Switching, Page Load)
   - Determine if this is a new feature, a behavior change to an existing feature, or a bug fix
   - Check if any existing test cases need to be modified or removed

3. **Ask before assuming** — if any of these are unclear, ask the user BEFORE updating:
   - A new UI element is added but its visibility rules across modes aren't obvious
   - A behavior could work multiple ways (e.g., "should this persist across mode switches?")
   - An existing test case might contradict the new change
   - A new feature interacts with multiple modes and you're unsure which modes it applies to
   - The change removes something and you're unsure if dependent test cases should be removed or rewritten

4. **Update TESTING.md:**
   - Add new test cases under the appropriate section
   - Modify existing test cases if behavior changed
   - Remove test cases that no longer apply
   - If adding a completely new feature/section, create a new section with the same format (heading, UI State, Interactions, Edge Cases)
   - Keep the checkbox format: `- [ ] description`
   - Keep test cases specific and verifiable — each should describe one observable behavior

## Rules
- Never silently remove a test case — mention it to the user
- Never add vague test cases like "feature works correctly" — be specific about what to check
- Group related test cases together under the existing section structure
- If a change affects mode switching, always update the "Mode Switching" section too
