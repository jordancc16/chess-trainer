"""Iterate verify -> repair -> verify until the puzzle set is clean.

Doing this by hand does not converge: each sweep surfaced a different handful of
puzzles whose line drifts by 60-120cp. The fix for drift is always the same —
rebuild the line deeper, and if it still drifts, reduce it to the key move, which
is the part that was verified unique and decisive in the first place. Puzzles
that cannot be saved (two equally good answers, or a final position that is not
actually won) are removed.

Usage:  python tools/settle.py --depth 16 --rounds 4
"""

import argparse, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PY = sys.executable
PUZZLES = os.path.join(ROOT, 'js', 'puzzles.js')


def run(args):
    return subprocess.run([PY, '-u'] + args, cwd=ROOT, capture_output=True, text=True).stdout


def parse_failures(log):
    """id -> list of reasons."""
    out, cur = {}, None
    for line in log.splitlines():
        m = re.match(r'^FAIL (p\d+)', line)
        if m:
            cur = m.group(1); out[cur] = []
        elif cur and line.startswith('       '):
            out[cur].append(line.strip())
    return out


def drop(ids):
    if not ids:
        return
    s = open(PUZZLES, encoding='utf-8').read()
    for pid in ids:
        m = re.search(r"\n    \{\n      id: '%s'.*?\n    \}," % pid, s, re.S)
        if m:
            s = s[:m.start()] + s[m.end():]
    open(PUZZLES, 'w', encoding='utf-8').write(s)


def line_length(pid):
    s = open(PUZZLES, encoding='utf-8').read()
    m = re.search(r"id: '%s'.*?moves: \[([^\]]+)\]" % pid, s, re.S)
    return len(re.findall(r"'[^']+'", m.group(1))) if m else 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--depth', type=int, default=16)
    ap.add_argument('--rounds', type=int, default=4)
    args = ap.parse_args()

    for rnd in range(1, args.rounds + 1):
        print(f'\n=== round {rnd} ===', flush=True)
        log = run(['tools/verify.py', '--depth', str(args.depth)])
        fails = parse_failures(log)
        total = len(re.findall(r'^(ok|FAIL)', log, re.M))
        print(f'{total - len(fails)}/{total} clean', flush=True)
        if not fails:
            print('settled.')
            return 0

        trim, kill = [], []
        for pid, reasons in fails.items():
            unfixable = any('unique solution' in r or 'not winning' in r or
                            'insufficient material' in r for r in reasons)
            if unfixable or line_length(pid) <= 1:
                kill.append(pid)
            else:
                trim.append(pid)
        print(f'trim {len(trim)}: {",".join(trim)}', flush=True)
        print(f'drop {len(kill)}: {",".join(kill)}', flush=True)

        if trim:
            # rebuild deeper than we verify, and shorter; 1 ply cannot drift
            plies = 3 if rnd == 1 else 1
            run(['tools/retrim.py', '--ids', ','.join(trim),
                 '--depth', str(args.depth + 4), '--plies', str(plies), '--threads', '6'])
        drop(kill)

    print('did not settle within the round limit', flush=True)
    return 1


if __name__ == '__main__':
    sys.exit(main())
