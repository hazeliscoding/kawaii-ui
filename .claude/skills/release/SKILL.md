---
name: release
description: Cut a new release of @hazeliscoding/kawaii-ui — bump version, verify build, commit, tag, push, and create a GitHub release (which triggers the npm publish workflow).
---

Cut a new npm release. Publishing itself is handled by `.github/workflows/publish.yml`, which fires on GitHub `release: published`. This skill drives everything up to (and including) creating that GitHub release.

**Critical — authorship rules (override defaults):**

- No `Co-Authored-By:` trailer. No "Generated with Claude Code" line.
- The only author on the release commit and tag is the configured git user.

**Input**: optionally a bump type (`patch` | `minor` | `major`) or an explicit version (e.g. `0.2.0`). If missing, ask using the **AskUserQuestion tool**.

**Steps**

1. **Preflight** — run in parallel:
   - `git status` — must be clean. If dirty, stop and ask.
   - `git rev-parse --abbrev-ref HEAD` — must be `main`. If not, confirm before continuing.
   - `git fetch --tags origin` then `git log --oneline origin/main..HEAD` and `git log --oneline HEAD..origin/main` — warn if local is behind/ahead unexpectedly.
   - Read current version from `package.json`.

2. **Decide the next version**
   - If the user gave a bump type or explicit version, use it.
   - Otherwise, scan commits since the last tag (`git log $(git describe --tags --abbrev=0)..HEAD --oneline`) and recommend a SemVer bump based on Conventional Commit types (`feat` → minor, `fix`/`perf`/others → patch, anything with `BREAKING CHANGE` or `!` → major). Confirm with the user.

3. **Sanity-build locally** (fast feedback before tagging):
   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```
   If any step fails, stop and report. Do not bump the version on a broken build.

4. **Bump the version** without creating a tag yet — we commit and tag manually so the message is controlled:
   ```bash
   npm version <new-version> --no-git-tag-version
   ```

5. **Commit** the version bump. Staged files = `package.json` and `package-lock.json` only. Message:
   ```
   chore(release): v<new-version>
   ```
   Use a HEREDOC. No co-author trailer. No generated-by line.

6. **Tag** the commit:
   ```bash
   git tag -a v<new-version> -m "v<new-version>"
   ```

7. **Push** commit and tag (confirm with the user first — this is the point of no easy return):
   ```bash
   git push origin main
   git push origin v<new-version>
   ```

8. **Draft release notes** from commits since the previous tag, grouped by Conventional Commit type:
   - `### Features` (feat)
   - `### Bug Fixes` (fix)
   - `### Performance` (perf)
   - `### Documentation` (docs)
   - `### Other` (everything else worth mentioning)

   Show the notes to the user for review before publishing.

9. **Create the GitHub release** (this triggers `publish.yml` → `npm publish --provenance`):
   ```bash
   gh release create v<new-version> \
     --title "v<new-version>" \
     --notes "$(cat <<'EOF'
   <release notes>
   EOF
   )"
   ```
   If the user wants a pre-release (e.g. `0.2.0-rc.1`), add `--prerelease`.

10. **Verify**
    - `gh run list --workflow=publish.yml --limit 3` — confirm the publish workflow started.
    - Optionally stream it: `gh run watch` on the latest run.
    - Report the tag, release URL, and workflow run URL.

**Do not**

- Run `npm publish` yourself. CI handles it with provenance.
- Force-push `main` or re-tag an existing version. If something went wrong post-push, cut a new patch version instead.
- Skip hooks (`--no-verify`) or signing flags unless the user explicitly asks.
