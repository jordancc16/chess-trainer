"""Mine tactics puzzles out of real master games.

Reads the PGN collections in tools/corpus/, walks every game, and asks Stockfish
for the two best moves in each position. A position becomes a puzzle only when
the best move is decisively better than every alternative AND the position is not
already winning without it — that is what makes a puzzle have one answer.

Stockfish is a development tool here. It never ships with the app: it decides
which positions become puzzles and what the solution is, and the results are
baked into js/puzzles.js as plain data.

Usage:  python tools/mine.py --target 150 --out tools/mined.json
"""

import argparse, io, json, os, random, re, sys, time
import chess, chess.pgn, chess.engine

HERE = os.path.dirname(os.path.abspath(__file__))
SF = os.path.join(HERE, 'vendor', 'stockfish', 'stockfish-windows-x86-64-avx2.exe')
CORPUS = os.path.join(HERE, 'corpus')

PIECE_VALUE = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3,
               chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0}

# A puzzle needs a clear single answer, so the gap between the best move and the
# next best has to be big; and the position must be roughly level without it,
# otherwise "find the win" is meaningless.
SCAN_NODES = 20000       # cheap first pass over every position
CONFIRM_DEPTH = 16       # only for positions the first pass liked
SCAN_STRIDE = 3          # look at every other position; tactics are dense enough
MAX_SCANS_PER_GAME = 18  # do not burn the budget on a quiet game
MIN_GAP = 220            # centipawns between best and second best
MAX_WITHOUT = 90         # eval ceiling for the second best move
MIN_WITH = 200           # eval floor for the best move
MAX_ALREADY = 250        # skip positions already this winning before the move


def cp(score, pov):
    """Score in centipawns from `pov`'s side, with mates clamped high."""
    s = score.pov(pov)
    if s.is_mate():
        n = s.mate()
        return 100000 - abs(n) * 10 if n > 0 else -100000 + abs(n) * 10
    return s.score()


def is_mate(score, pov):
    s = score.pov(pov)
    return s.is_mate() and s.mate() > 0


def see_negative(board, move):
    """Does this move hand over material immediately? A rough sacrifice test."""
    victim = board.piece_at(move.to_square)
    gain = PIECE_VALUE[victim.piece_type] if victim else 0
    mover = board.piece_at(move.from_square)
    after = board.copy()
    after.push(move)
    if after.is_attacked_by(not board.turn, move.to_square):
        return gain < PIECE_VALUE[mover.piece_type]
    return False


def classify(board, line, ends_in_mate):
    """Best-effort category, matching the ones the app already browses by."""
    if ends_in_mate:
        return 'mating'
    key = line[0]
    mover = board.piece_at(key.from_square)
    after = board.copy()
    after.push(key)

    if after.is_check():
        checkers = after.checkers()
        # discovered check: the piece giving check is not the one that moved
        if key.to_square not in checkers:
            return 'discovered'

    # fork: the piece that moved now attacks two things worth having
    targets = 0
    for sq in after.attacks(key.to_square):
        p = after.piece_at(sq)
        if p and p.color != mover.color and (p.piece_type == chess.KING or PIECE_VALUE[p.piece_type] >= 3):
            targets += 1
    if targets >= 2:
        return 'forks'

    if see_negative(board, key):
        return 'sacrifice'

    if len(board.piece_map()) <= 12:
        return 'endgame'

    if mover.piece_type in (chess.BISHOP, chess.ROOK, chess.QUEEN):
        return 'pins'
    return 'deflection'


def rate(board, line, ends_in_mate, gap):
    """Rough difficulty. Longer, quieter and more sacrificial is harder."""
    r = 900
    r += 170 * (len(line) // 2)                     # extra moves to find
    key = line[0]
    if not board.is_capture(key):
        r += 130
    after = board.copy(); after.push(key)
    if not after.is_check():
        r += 120                                    # quiet moves are harder to see
    if see_negative(board, key):
        r += 260
    if ends_in_mate:
        r -= 80                                     # mate is easier to spot than a win
    if gap > 900:
        r -= 150                                    # a huge gap is usually obvious
    if len(board.piece_map()) <= 12:
        r -= 80
    return max(600, min(2400, int(round(r / 10.0) * 10)))


def credit(game):
    def tag(k, d='?'):
        v = game.headers.get(k, d)
        return v if v and v != '?' else d
    w = tag('White').split(',')[0].strip()
    b = tag('Black').split(',')[0].strip()
    ev = tag('Event', '')
    yr = tag('Date', '')[:4]
    site = tag('Site', '')
    where = ev if ev and ev.lower() not in ('?', 'unknown') else site
    where = re.sub(r'\s+', ' ', where).strip().rstrip(',')
    bits = ' — '.join(x for x in [f'{w} vs {b}'] if x)
    tail = ', '.join(x for x in [where, yr] if x and x != '?')
    return f'{bits}, {tail}' if tail else bits


def mine(engine, game, seen_fens, out, target):
    board = game.board()
    node = game
    ply = 0
    scans = 0
    prev_capture_sq = None
    while node.variations:
        node = node.variations[0]
        move = node.move
        ply += 1
        board.push(move)
        prev_capture_sq = move.to_square if board.is_capture(move) else None

        if ply < 12 or ply > 80 or ply % SCAN_STRIDE:
            continue
        scans += 1
        if scans > MAX_SCANS_PER_GAME:
            break
        if board.is_game_over():
            break
        if len(board.piece_map()) < 6:
            continue

        fen = board.fen()
        if fen in seen_fens:
            continue

        pov = board.turn
        try:
            scan = engine.analyse(board, chess.engine.Limit(nodes=SCAN_NODES), multipv=2)
        except Exception:
            continue
        if len(scan) < 2:
            continue
        s_best, s_second = cp(scan[0]['score'], pov), cp(scan[1]['score'], pov)
        if s_best - s_second < MIN_GAP or s_best < MIN_WITH or s_second > MAX_WITHOUT + 120:
            continue

        info = engine.analyse(board, chess.engine.Limit(depth=CONFIRM_DEPTH), multipv=2)
        if len(info) < 2:
            continue
        best, second = cp(info[0]['score'], pov), cp(info[1]['score'], pov)
        gap = best - second
        if gap < MIN_GAP or best < MIN_WITH or second > MAX_WITHOUT:
            continue

        # the previous move must not have left an obvious recapture
        pv = info[0]['pv']
        if prev_capture_sq is not None and pv and pv[0].to_square == prev_capture_sq:
            continue

        mate_line = is_mate(info[0]['score'], pov)

        # trim the principal variation to an odd number of plies (ends on our move)
        want = 5 if mate_line else 5
        line = list(pv[:want])
        while len(line) % 2 == 0 and line:
            line.pop()
        if len(line) < 1:
            continue

        probe = board.copy()
        for m in line:
            probe.push(m)
        if mate_line and not probe.is_checkmate():
            # trim to the actual mate if it lands earlier
            probe = board.copy()
            line = []
            for m in pv:
                probe.push(m)
                line.append(m)
                if probe.is_checkmate():
                    break
            if not probe.is_checkmate() or len(line) > 5 or len(line) % 2 == 0:
                continue

        if not probe.is_checkmate():
            # the position we leave behind has to be genuinely won
            if len(probe.piece_map()) <= 4 and not any(
                    p.piece_type in (chess.PAWN, chess.ROOK, chess.QUEEN)
                    for p in probe.piece_map().values()):
                continue
            end = engine.analyse(probe, chess.engine.Limit(depth=16))
            if cp(end['score'], pov) < MIN_WITH:
                continue

        # and it must not have been winning already before the key move
        if second > MAX_ALREADY:
            continue

        ends_mate = probe.is_checkmate()
        entry = {
            'fen': fen,
            'moves': [m.uci() for m in line],
            'goal': 'mate' if ends_mate else 'material',
            'category': classify(board, line, ends_mate),
            'rating': rate(board, line, ends_mate, gap),
            'game': credit(game),
            'sf': {'depth': CONFIRM_DEPTH, 'cp': best, 'gap': gap},
        }
        seen_fens.add(fen)
        out.append(entry)
        print(f'  + {len(out):3d}/{target}  {entry["category"]:<11} {entry["rating"]:>5}  '
              f'{entry["moves"][0]}  gap {gap:>5}  {entry["game"][:52]}', flush=True)
        if len(out) >= target:
            return True
        # one puzzle per game keeps the set varied
        return False
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--target', type=int, default=150)
    ap.add_argument('--out', default=os.path.join(HERE, 'mined.json'))
    ap.add_argument('--threads', type=int, default=3)
    ap.add_argument('--files', default='', help='comma-separated PGN basenames')
    ap.add_argument('--seed', type=int, default=7)
    args = ap.parse_args()

    random.seed(args.seed)
    engine = chess.engine.SimpleEngine.popen_uci(SF)
    engine.configure({'Threads': args.threads, 'Hash': 256})

    files = sorted(f for f in os.listdir(CORPUS) if f.endswith('.pgn'))
    if args.files:
        want = set(x.strip() + '.pgn' for x in args.files.split(','))
        files = [f for f in files if f in want]
    print(f'corpus: {len(files)} files', flush=True)

    # interleave players so the set is not all one person's style
    readers = []
    for f in files:
        readers.append(open(os.path.join(CORPUS, f), encoding='utf-8', errors='ignore'))

    out, seen = [], set()
    started = time.time()
    exhausted = set()
    games_seen = 0
    try:
        while len(out) < args.target and len(exhausted) < len(readers):
            for i, fh in enumerate(readers):
                if i in exhausted or len(out) >= args.target:
                    continue
                game = chess.pgn.read_game(fh)
                if game is None:
                    exhausted.add(i)
                    continue
                games_seen += 1
                # only decisive games: someone made something happen
                if game.headers.get('Result') not in ('1-0', '0-1'):
                    continue
                try:
                    mine(engine, game, seen, out, args.target)
                except Exception as e:
                    print(f'  ! {e}', file=sys.stderr, flush=True)
                if games_seen % 200 == 0:
                    print(f'  ... {games_seen} games, {len(out)} puzzles, '
                          f'{time.time()-started:.0f}s', flush=True)
    finally:
        engine.quit()
        for fh in readers:
            fh.close()

    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=1)
    print(f'\n{len(out)} puzzles from {games_seen} games in {time.time()-started:.0f}s '
          f'-> {args.out}', flush=True)


if __name__ == '__main__':
    main()
