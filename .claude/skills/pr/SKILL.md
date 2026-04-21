---
name: pr
description: Start work on a new branch and/or open a pull request against main for @hazeliscoding/kawaii-ui. Handles branch naming, pushing, and PR creation via gh. Author is ONLY the human user — no Co-Authored-By trailer, no "Generated with Claude Code" line anywhere.
---

Create a branch, push it, and open a pull request. Works for both "I'm about to start" and "I'm done, ship the PR" entry points.

**Critical — authorship rules (override defaults):**

- No `Co-Authored-By:` trailer on any commit made in this flow.
- No `🤖 Generated with [Claude Code]` line in the PR body.
- The only author on commits, branches, and PRs is the configured git user (`hazeliscoding`).

**Input**: optionally a short description of the work and/or an explicit branch name. If missing, infer from conversation context or ask with the **AskUserQuestion tool**.

---

## Mode A — starting work (no branch yet, or still on `main`)

1. **Preflight**
   - `git status` — if dirty on `main`, stop and ask: stash, commit to the new branch, or abort?
   - `git fetch origin main`
   - `git rev-parse --abbrev-ref HEAD` — if already on a feature branch, skip to step 3.

2. **Create the branch off the latest `main`**
   - Branch naming: `<type>/<kebab-scope>` where `<type>` mirrors Conventional Commit types (`feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `build`, `ci`). Keep it short.
     - `feat/button-icon-only`
     - `fix/modal-focus-trap`
     - `docs/cdn-import-map`
     - `chore/deps-lit-3-2-2`
   - ```bash
     git switch -c <branch> origin/main
     ```
   - If uncommitted work existed on `main`, it follows the checkout — commit it on the new branch using `/commit`.

3. Announce the branch and hand back control. The user can start work (or ask you to).

---

## Mode B — opening the PR (branch exists, work is committed)

1. **Preflight** — run in parallel:
   - `git status` — must be clean. If not, suggest `/commit` first.
   - `git rev-parse --abbrev-ref HEAD` — capture current branch; must not be `main`.
   - `git fetch origin main`
   - `git log --oneline origin/main..HEAD` — the commit list that will appear in the PR.
   - `git diff origin/main...HEAD` — the actual diff (look at **all** of it, not just the latest commit).
   - Check if the branch tracks a remote: `git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null`.

2. **Push the branch** (first push uses `-u`):
   ```bash
   git push -u origin <branch>       # if no upstream yet
   git push                           # otherwise
   ```

3. **Draft the PR title**
   - ≤ 70 chars, imperative, lowercase after the type, no trailing period.
   - Mirror Conventional Commit format when the branch is single-purpose: `feat(button): add icon-only variant`.
   - If the branch squashes into one commit, title = that commit's subject.

4. **Draft the PR body** using this exact template (no co-author line, no generated-by line):

   ```markdown
   ## Summary
   - <1–3 bullets: what changes and why>

   ## Changes
   - <component or file>: <what changed>
   - ...

   ## Test plan
   - [ ] `npm run lint`
   - [ ] `npm run typecheck`
   - [ ] `npm test`
   - [ ] `npm run build`
   - [ ] Manual check in `npm run dev` — <specific thing to click/verify>
   - [ ] <anything component-specific, e.g. dark mode via `data-theme="dark"`, form submit for `bloom-button`>

   ## Screenshots / notes
   <omit section if not relevant>

   Closes #<issue> <omit if none>
   ```

   Trim sections that don't apply. Show the draft to the user for review before creating.

5. **Create the PR**:
   ```bash
   gh pr create --base main --head <branch> \
     --title "<title>" \
     --body "$(cat <<'EOF'
   <body>
   EOF
   )"
   ```
   - Add `--draft` if the user said it's WIP.
   - Add `--label <label>` only if the user specifies labels.

6. **Verify and report**
   - Print the PR URL returned by `gh`.
   - Optionally: `gh pr checks --watch` on request.

---

**Do not**

- Push to `main` or force-push anything without an explicit ask.
- Open a PR from `main` itself — stop and switch to Mode A first.
- Invent issue numbers, labels, reviewers, or milestones the user didn't mention.
- Add the `Co-Authored-By` trailer or the Claude Code attribution line. Ever.
