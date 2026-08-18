"""Rebuild the tail of a puzzle's line at higher depth, and shorten it.

A mined line is Stockfish's principal variation at the depth it was mined. Verify
at a deeper setting and the tail can shift — not because the puzzle is wrong (the
key move is still uniquely best) but because move 5 of a PV is a suggestion, not a
fact. The fix is to derive the line deeper than we verify it, and to keep it short:
three plies drift far less than five.

Usage:  python tools/retrim.py --ids p115,p116 --depth 24 --plies 3
"""

import argparse, os, re, sys
import chess, chess.engine

HERE = os.path.dirname(os.path.abspath(__file__))
SF = os.path.join(HERE, 'vendor', 'stockfish', 'stockfish-windows-x86-64-avx2.exe')
PUZZLES = os.path.join(HERE, '..', 'js', 'puzzles.js')

sys.path.insert(0, HERE)
import convert


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ids', required=True)
    ap.add_argument('--depth', type=int, default=24)
    ap.add_argument('--plies', type=int, default=3)
    ap.add_argument('--threads', type=int, default=11)
    args = ap.parse_args()

    src = open(PUZZLES, encoding='utf-8').read()
    engine = chess.engine.SimpleEngine.popen_uci(SF)
    engine.configure({'Threads': args.threads, 'Hash': 1024})
    changed = 0
    try:
        for pid in args.ids.split(','):
            pid = pid.strip()
            m = re.search(r"(id: '%s'.*?\n    \})" % pid, src, re.S)
            if not m:
                print('missing', pid); continue
            body = m.group(1)
            fen = re.search(r"fen: '([^']+)'", body).group(1)
            moves = re.findall(r"'([^']+)'", re.search(r"moves: \[([^\]]+)\]", body).group(1))

            board = chess.Board(fen)
            key = chess.Move.from_uci(moves[0])
            board.push(key)
            info = engine.analyse(board, chess.engine.Limit(depth=args.depth))
            line = [moves[0]]
            for mv in info.get('pv', [])[:args.plies - 1]:
                if mv not in board.legal_moves:
                    break
                line.append(mv.uci())
                board.push(mv)
                if board.is_checkmate():
                    break
            while len(line) % 2 == 0 and len(line) > 1:
                line.pop()

            probe = chess.Board(fen)
            for u in line:
                probe.push(chess.Move.from_uci(u))
            goal = 'mate' if probe.is_checkmate() else 'material'

            entry = {'fen': fen, 'moves': line, 'category':
                     re.search(r"category: '([^']+)'", body).group(1),
                     'sf': {'depth': args.depth, 'cp': 0, 'gap': 0},
                     'sac': convert.is_sacrifice(chess.Board(fen), key)}
            hint, explain = convert.describe(entry)

            new = body
            new = re.sub(r"moves: \[[^\]]+\]",
                         'moves: [' + ', '.join("'%s'" % u for u in line) + ']', new)
            new = re.sub(r"goal: '[^']+'", "goal: '%s'" % goal, new)
            new = re.sub(r"explain: '(?:[^'\\]|\\.)*'",
                         'explain: ' + convert.js_string(explain), new)
            new = re.sub(r"verified: '(?:[^'\\]|\\.)*'",
                         "verified: 'stockfish 17.1 depth %d'" % args.depth, new)
            src = src[:m.start(1)] + new + src[m.end(1):]
            changed += 1
            print(f'{pid}: {len(moves)} -> {len(line)} plies  {line}')
    finally:
        engine.quit()

    open(PUZZLES, 'w', encoding='utf-8').write(src)
    print(f'\nrewrote {changed} puzzles')


if __name__ == '__main__':
    main()
