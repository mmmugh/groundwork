"""Check that .githooks/pre-push scans what actually reaches the remote.

    python3 tests/pre_push_test.py

Builds a throwaway bare remote in a temp directory and pushes at it with the
repo's real hooks installed. Nothing here touches this repo or any network.

This is a separate test from leak_scan_test.py on purpose. That one asks
whether the scanner recognizes a leak in a diff it is handed; this one asks
whether the hook hands it the right diffs. The distinction is not academic:
the scanner was already correct when a push carrying a token in its history
sailed through, because the hook was feeding it the NET difference between
the two ends of the push. A leak added in one commit and deleted in the next
nets to nothing. The push was allowed and the remote's log held the token
twice -- which is the precise case a pre-push hook exists for, since anything
reaching it has already gone past pre-commit.
"""

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Assembled, not written out: a file containing this literally could not be
# committed through the very hook it tests.
TOKEN = "ghp_" + "a" * 36


def git(repo, *args, allow_fail=False):
    done = subprocess.run(["git", "-C", str(repo), *args],
                          capture_output=True, text=True)
    if done.returncode and not allow_fail:
        raise SystemExit(f"git {' '.join(args)} failed in {repo}:\n{done.stderr}")
    return done


def push(work, *args):
    """True when the push was allowed through."""
    return git(work, "push", *args, allow_fail=True).returncode == 0


def main():
    results = []

    def expect(label, got, want):
        results.append((label, got == want, got, want))

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        remote, work = tmp / "remote.git", tmp / "work"
        subprocess.run(["git", "init", "-q", "--bare", str(remote)], check=True)
        subprocess.run(["git", "init", "-q", str(work)], check=True)
        for k, v in (("user.email", "t@example.invalid"), ("user.name", "t"),
                     ("core.hooksPath", str(ROOT / ".githooks"))):
            git(work, "config", k, v)
        git(work, "remote", "add", "origin", str(remote))

        def commit(name, body, no_verify=False):
            (work / name).write_text(body)
            git(work, "add", "-A")
            git(work, "commit", "-qm", f"add {name}", *(["--no-verify"] if no_verify else []))

        commit("readme.md", "hello\n")
        expect("a clean first push is allowed", push(work, "origin", "main"), True)

        commit("notes.md", "more prose\n")
        expect("a clean incremental push is allowed", push(work, "origin", "main"), True)
        safe = git(work, "rev-parse", "HEAD").stdout.strip()

        # The whole point: added with --no-verify, then deleted. Nets to zero.
        commit("secret.md", f"token={TOKEN}\n", no_verify=True)
        git(work, "rm", "-q", "secret.md")
        git(work, "commit", "-qm", "remove it again")
        expect("a leak added and then deleted is still blocked",
               push(work, "origin", "main"), False)

        git(work, "reset", "-q", "--hard", safe)
        git(work, "checkout", "-q", "-b", "leaky")
        commit("secret.md", f"token={TOKEN}\n", no_verify=True)
        git(work, "rm", "-q", "secret.md")
        git(work, "commit", "-qm", "remove it again")
        expect("the same on a brand-new branch is blocked",
               push(work, "origin", "leaky"), False)

        git(work, "checkout", "-q", "main")
        git(work, "checkout", "-q", "-b", "feature")
        commit("chapter.md", "ordinary content\n")
        expect("a clean new branch off pushed history is allowed",
               push(work, "origin", "feature"), True)

        git(work, "checkout", "-q", "main")
        git(work, "merge", "-q", "--no-ff", "-m", "merge leaky", "leaky")
        expect("a merge that brings the leaky branch in is blocked",
               push(work, "origin", "main"), False)

        found = subprocess.run(["git", "-C", str(remote), "log", "-p", "--all"],
                               capture_output=True, text=True).stdout.count(TOKEN)
        expect("the remote ends with no copy of the token at all", found, 0)

    bad = 0
    for label, ok, got, want in results:
        if not ok:
            bad += 1
        print(f"  {'ok  ' if ok else 'FAIL'}  {label}"
              f"{'' if ok else f'  (got {got!r}, wanted {want!r})'}")
    print(f"\n{'pre-push scans what reaches the remote' if not bad else f'{bad} wrong'}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
