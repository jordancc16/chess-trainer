"""Verify every puzzle in js/puzzles.js against Stockfish.

This is the authoritative check. validate.html runs in the browser against the
from-scratch engine and covers everything that is a matter of fact — legality,
whether a line replays, whether a mate is forced. This script covers everything
that is a matter of judgement, and it uses a real engine to do it:

  * the position is reachable (the side not to move is not in check)
  * every move the solver plays is Stockfish's best move
  * every reply the opponent plays is Stockfish's best move, so the defence is
    a real defence and not a helpmate
  * the solution is the ONLY move that wins, by a clear margin
  * the position left at the end is actually won — not equal, not drawn, and
    above all not lost

Usage:  python tools/verify.py [--depth 20] [--only p12,p37]
"""

import argparse, json, os, re, sys
import chess, chess.engine

HERE = os.path.dirname(os.path.abspath(__file__))
SF = os.path.join(HERE, 'vendor', 'stockfish', 'stockfish-windows-x86-64-avx2.exe')
PUZZLES_JS = os.path.join(HERE, '..', 'js', 'puzzles.js')

WIN = 200          # centipawns: what counts as "actually winning"
SOLVER_SLACK = 70  # how far off Stockfish's best a solver move may be
REPLY_SLACK = 60   # ditto for the defence
UNIQUE_GAP = 120   # the solution must beat the runner-up by this much


def load_puzzles(path):
    """Pull the puzzle objects out of the JS source without needing a JS runtime."""
    src = open(path, encoding='utf-8').read()
    out = []
    for m in re.finditer(r"\{\s*\n\s*id:\s*'(p\d+)'(.*?)\n    \}", src, re.S):
        pid, body = m.group(1), m.group(2)
        fen = re.search(r"fen:\s*'([^']+)'", body)
        moves = re.search(r"moves:\s*\[([^\]]+)\]", body)
        goal = re.search(r"goal:\s*'([^']+)'", body)
        if not (fen and moves):
            continue
        out.append({
            'id': pid,
            'fen': fen.group(1),
            'moves': re.findall(r"'([^']+)'", moves.group(1)),
            'goal': goal.group(1) if goal else 'material',
            'oracle': (re.search(r"oracle:\s*'([^']+)'", body) or [None, None])[1]
                      if re.search(r"oracle:", body) else None,
            'game': bool(re.search(r"\n\s*game:", body)),
            'alts': re.findall(r"uci:\s*'([^']+)'", body),
        })
    return out


def cp(score, pov):
    s = score.pov(pov)
    if s.is_mate():
        n = s.mate()
        # spaced 1000 apart so a mate in 3 never reads as 'only 20cp worse' than a mate in 1
        return 100000 - abs(n) * 1000 if n > 0 else -100000 + abs(n) * 1000
    return s.score()


def best_moves(engine, board, depth, n=2):
    info = engine.analyse(board, chess.engine.Limit(depth=depth), multipv=n)
    pov = board.turn
    return [(i['pv'][0].uci(), cp(i['score'], pov)) for i in info if i.get('pv')]


def check(engine, p, depth):
    fails = []
    try:
        board = chess.Board(p['fen'])
    except Exception as e:
        return [f'unparseable FEN: {e}']

    if not board.is_valid():
        # python-chess's own reachability check catches the side-not-to-move-in-check case
        fails.append(f'illegal position ({board.status()!r})')
        return fails

    solver = board.turn

    # 1. the solution must be the unique best move
    tops = best_moves(engine, board, depth, 2)
    if not tops:
        return ['engine found no moves']
    if tops[0][0] != p['moves'][0] and tops[0][0] not in p.get('alts', []):
        fails.append(f"key move {p['moves'][0]} is not best (engine: {tops[0][0]}, "
                     f"{tops[0][1]} vs ours)")
    mate_in_one = p['goal'] == 'mate' and len(p['moves']) == 1
    # a declared alternative is not a rival; nor is anything in a trap puzzle,
    # whose subject is the opponent's mistake rather than a unique best move
    exempt = mate_in_one or p['goal'] == 'trap'
    rivals = [t for t in tops if t[0] != p['moves'][0] and t[0] not in p.get('alts', [])]
    if (rivals and tops[0][1] - rivals[0][1] < UNIQUE_GAP and not exempt):
        fails.append(f'not a unique solution: {rivals[0][0]} is only '
                     f'{tops[0][1] - rivals[0][1]}cp worse')

    # 2. walk the line, checking both sides play the best move available
    for i, uci in enumerate(p['moves']):
        try:
            mv = chess.Move.from_uci(uci)
        except Exception:
            fails.append(f'move {i+1} unparseable: {uci}')
            break
        if mv not in board.legal_moves:
            fails.append(f'move {i+1} illegal: {uci}')
            break
        if i > 0 and p['goal'] != 'trap':
            tb = best_moves(engine, board, depth, 1)
            if tb and tb[0][0] != uci:
                after_ours = board.copy(); after_ours.push(mv)
                ours = -cp(engine.analyse(after_ours, chess.engine.Limit(depth=depth - 2))['score'],
                           not board.turn)
                if tb[0][1] - ours > (SOLVER_SLACK if i % 2 == 0 else REPLY_SLACK):
                    who = 'solver' if i % 2 == 0 else 'defence'
                    fails.append(f'{who} move {i+1} ({uci}) is {tb[0][1] - ours}cp worse '
                                 f'than {tb[0][0]}')
        board.push(mv)

    # 3. the position we leave behind must be won
    if board.is_checkmate():
        return fails
    if p['goal'] in ('mate', 'trap'):
        fails.append('line does not end in mate')
        return fails
    if board.is_insufficient_material():
        fails.append('final position is a draw by insufficient material')
        return fails
    if bare_king_loss(board, solver):
        return fails          # a known forced win, whatever the number says
    final = cp(engine.analyse(board, chess.engine.Limit(depth=depth))['score'], solver)
    if final < WIN:
        fails.append(f'final position is not winning ({final}cp for the solver)')
    return fails


def bare_king_loss(board, solver):
    """Opponent down to a lone king against enough material to force mate.

    Bishop and knight against a bare king is a forced win, but engines score it
    around +2 because the mate is 30-odd moves away. That is a fact about the
    endgame, not an opinion about the position, so it should not be decided by a
    centipawn threshold."""
    theirs = [p for sq, p in board.piece_map().items() if p.color != solver]
    if any(p.piece_type != chess.KING for p in theirs):
        return False
    ours = [p.piece_type for sq, p in board.piece_map().items()
            if p.color == solver and p.piece_type != chess.KING]
    if any(t in (chess.QUEEN, chess.ROOK, chess.PAWN) for t in ours):
        return True
    minors = [t for t in ours if t in (chess.BISHOP, chess.KNIGHT)]
    return len(minors) >= 2 and minors.count(chess.KNIGHT) < 2


def repair(engine, p, depth):
    """Rebuild the line so the defence is Stockfish's, keeping the key move."""
    board = chess.Board(p['fen'])
    key = chess.Move.from_uci(p['moves'][0])
    if key not in board.legal_moves:
        return None
    board.push(key)
    line = [p['moves'][0]]
    want = len(p['moves']) - 1
    if want <= 0:
        return None
    info = engine.analyse(board, chess.engine.Limit(depth=depth))
    pv = info.get('pv', [])
    for mv in pv[:want]:
        if mv not in board.legal_moves:
            break
        line.append(mv.uci())
        board.push(mv)
        if board.is_checkmate():
            break
    while len(line) % 2 == 0 and len(line) > 1:
        line.pop()
    return line if len(line) > 1 and line != p['moves'] else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--depth', type=int, default=20)
    ap.add_argument('--only', default='')
    ap.add_argument('--threads', type=int, default=10)
    ap.add_argument('--fix', default='', help='write a JSON patch of repaired lines here')
    args = ap.parse_args()

    puzzles = load_puzzles(PUZZLES_JS)
    if args.only:
        want = set(args.only.split(','))
        puzzles = [p for p in puzzles if p['id'] in want]
    print(f'verifying {len(puzzles)} puzzles at depth {args.depth}\n', flush=True)

    engine = chess.engine.SimpleEngine.popen_uci(SF)
    engine.configure({'Threads': args.threads, 'Hash': 512})
    bad = 0
    patch = {}
    try:
        for p in puzzles:
            fails = check(engine, p, args.depth)
            if fails:
                bad += 1
                print(f'FAIL {p["id"]}', flush=True)
                for f in fails:
                    print(f'       {f}', flush=True)
                if args.fix and any('defence move' in f for f in fails):
                    fixed = repair(engine, p, args.depth)
                    if fixed:
                        patch[p['id']] = fixed
                        print(f'       -> repaired line {fixed}', flush=True)
            else:
                print(f'ok   {p["id"]}', flush=True)
    finally:
        engine.quit()

    if args.fix and patch:
        json.dump(patch, open(args.fix, 'w', encoding='utf-8'), indent=1)
        print(f'\nwrote {len(patch)} repaired lines -> {args.fix}')
    print(f'\n{len(puzzles) - bad}/{len(puzzles)} verified, {bad} failed')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
