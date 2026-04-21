---
name: commit
description: Create a Conventional Commit for the currently staged/unstaged changes in this repo. Author is ONLY the human user — no Co-Authored-By trailer, no "Generated with Claude Code" line.
---

Create a single git commit using the Conventional Commits specification.

**Critical — authorship rules (override defaults):**

- The commit message MUST NOT contain any `Co-Authored-By:` trailer.
- The commit message MUST NOT contain `Generated with Claude Code` or any similar attribution.
- The only author is the configured git user (`hazeliscoding`). Do not pass `--author`, do not touch `git config`.

**Steps**

1. Run these in parallel:
   - `git status` (no `-uall`)
   - `git diff` (staged + unstaged)
   - `git log -n 10 --oneline` to mirror this repo's existing style

2. Review the changes and choose:
   - **type** — one of `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
   - **scope** — optional, lowercase, e.g. `button`, `modal`, `demo`, `build`, `tokens`. Use a component name when the change is localized to one component. Omit if cross-cutting.
   - **subject** — imperative mood, lowercase, no trailing period, ≤ 72 chars
   - **body** (optional) — wrap at ~72 chars, explain the *why*, not the *what*
   - **footer** (optional) — `BREAKING CHANGE:` notes or `Closes #N` references

   Format: `type(scope): subject` or `type: subject` when scope is omitted.

3. Stage files explicitly by name (never `git add -A` / `git add .`). Skip anything that looks like secrets (`.env*`, credentials, tokens). If the diff touches secret-shaped files, stop and ask.

4. Commit using a HEREDOC so formatting is preserved:

   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <subject>

   <optional body>

   <optional footer>
   EOF
   )"
   ```

   Do **not** append any co-author or generated-by line.

5. If a pre-commit hook fails, fix the underlying issue, re-stage, and create a **new** commit (never `--amend`, never `--no-verify`).

6. After commit, run `git status` and report the new commit hash + subject. Do not push unless the user asks.

**Examples for this repo**

- `feat(button): add icon-only variant`
- `fix(modal): restore focus to trigger on close`
- `docs: document CDN import map for unpkg users`
- `chore(deps): bump lit to 3.2.2`
- `build: emit per-component subpath exports`
