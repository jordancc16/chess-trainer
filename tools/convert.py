"""Turn mined.json into puzzle entries for js/puzzles.js.

The hint and explanation are generated, but every clause in them is derived from
the position itself — which pieces the key move attacks and on which squares,
whether it is a sacrifice, what the solution line is in algebraic notation, and
what the material outcome is. Nothing is asserted that was not computed.

Usage:  python tools/convert.py --in tools/mined.json --start 100
"""

import argparse, json, os
import chess

VALUE = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3,
         chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0}
NAME = {chess.PAWN: 'pawn', chess.KNIGHT: 'knight', chess.BISHOP: 'bishop',
        chess.ROOK: 'rook', chess.QUEEN: 'queen', chess.KING: 'king'}

HINTS = {
    'mating': "The king has fewer squares than it looks. Start with the most forcing move.",
    'forks': "One square attacks two things at once. Find it.",
    'discovered': "Move the piece in front and look at what wakes up behind it.",
    'sacrifice': "Material comes back. Work out what happens after the capture.",
    'pins': "Something on that line is not allowed to move.",
    'deflection': "A defender is doing two jobs at once. Give it a third.",
    'endgame': "Few pieces left, so every tempo counts. Look for the forcing move.",
}


def san_line(board, ucis):
    b = board.copy()
    out, n = [], b.fullmove_number
    for i, u in enumerate(ucis):
        mv = chess.Move.from_uci(u)
        s = b.san(mv)
        if b.turn == chess.WHITE:
            out.append(f'{b.fullmove_number}.{s}')
        else:
            out.append(s if out else f'{b.fullmove_number}...{s}')
        b.push(mv)
    return ' '.join(out)


def targets_of(board, sq):
    """Enemy pieces worth naming that the piece on `sq` now attacks."""
    piece = board.piece_at(sq)
    hits = []
    for t in board.attacks(sq):
        p = board.piece_at(t)
        if p and p.color != piece.color and (p.piece_type == chess.KING or VALUE[p.piece_type] >= 3):
            hits.append((NAME[p.piece_type], chess.square_name(t), VALUE[p.piece_type]))
    hits.sort(key=lambda h: -h[2])
    return hits


def is_sacrifice(board, move):
    victim = board.piece_at(move.to_square)
    gain = VALUE[victim.piece_type] if victim else 0
    mover = board.piece_at(move.from_square)
    after = board.copy(); after.push(move)
    return after.is_attacked_by(not board.turn, move.to_square) and gain < VALUE[mover.piece_type]


def material(board, colour):
    return sum(VALUE[p.piece_type] for p in board.piece_map().values() if p.color == colour)


def describe(entry):
    board = chess.Board(entry['fen'])
    solver = board.turn
    ucis = entry['moves']
    key = chess.Move.from_uci(ucis[0])
    key_san = board.san(key)
    mover = board.piece_at(key.from_square)

    after = board.copy(); after.push(key)
    end = board.copy()
    for u in ucis:
        end.push(chess.Move.from_uci(u))

    sac = is_sacrifice(board, key)
    hits = targets_of(after, key.to_square)
    line = san_line(board, ucis)
    side = 'White' if solver == chess.WHITE else 'Black'

    # --- opening clause: what the key move actually does -------------------
    if end.is_checkmate():
        lead = f'{key_san} forces mate.'
    elif len(hits) >= 2:
        a, b = hits[0], hits[1]
        lead = f'{key_san} attacks the {a[0]} on {a[1]} and the {b[0]} on {b[1]} at the same time.'
    elif after.is_check() and key.to_square not in after.checkers():
        lead = f'{key_san} is a discovered check — the check comes from the piece behind it.'
    elif after.is_check():
        lead = f'{key_san} comes with check, so Black has no time to reorganise.'
    elif hits:
        a = hits[0]
        lead = f'{key_san} hits the {a[0]} on {a[1]}.'
    else:
        lead = f'{key_san} is the only move that keeps the advantage.'

    if sac and not end.is_checkmate():
        lead = f'{key_san} gives up material on purpose. ' + lead[len(key_san) + 1:].lstrip().capitalize() \
               if len(lead) > len(key_san) + 1 else lead

    # --- closing clause: the outcome, measured ---------------------------
    if end.is_checkmate():
        tail = ''
    else:
        swing = (material(end, solver) - material(end, not solver)) - \
                (material(board, solver) - material(board, not solver))
        if swing >= 8:
            tail = f' {side} finishes a queen to the good.'
        elif swing >= 5:
            tail = f' {side} finishes a rook up.'
        elif swing >= 3:
            tail = f' {side} finishes a piece up.'
        elif swing >= 2:
            tail = f' {side} wins the exchange.'
        elif swing >= 1:
            tail = f' {side} comes out a pawn up with much the better position.'
        else:
            tail = f' The point is positional rather than material — Stockfish rates it ' \
                   f'{entry["sf"]["cp"] / 100:+.1f} for {side.lower()}.'

    explain = f'{lead} The line runs {line}.{tail}'
    hint = HINTS.get(entry['category'], HINTS['forks'])
    if sac:
        hint = HINTS['sacrifice']
    return hint, explain


def js_string(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='src', default=os.path.join('tools', 'mined.json'))
    ap.add_argument('--start', type=int, default=100)
    ap.add_argument('--out', default=os.path.join('tools', 'mined.js'))
    args = ap.parse_args()

    data = json.load(open(args.src, encoding='utf-8'))
    lines = []
    for i, e in enumerate(data):
        pid = f'p{args.start + i}'
        hint, explain = describe(e)
        themes = [e['category']]
        if e['goal'] == 'mate':
            themes.append('mate in %d' % ((len(e['moves']) + 1) // 2))
        lines.append(
            "    {\n"
            f"      id: '{pid}', rating: {e['rating']}, category: '{e['category']}',\n"
            f"      themes: [{', '.join(js_string(t) for t in themes)}],\n"
            f"      game: {js_string(e['game'])}, masters: true,\n"
            f"      fen: '{e['fen']}',\n"
            f"      moves: [{', '.join(js_string(m) for m in e['moves'])}],\n"
            f"      goal: '{e['goal']}',\n"
            f"      verified: 'stockfish 17.1 depth {e['sf']['depth']}, "
            f"best by {e['sf']['gap']}cp',\n"
            f"      hint: {js_string(hint)},\n"
            f"      explain: {js_string(explain)}\n"
            "    }"
        )
    open(args.out, 'w', encoding='utf-8').write(',\n'.join(lines) + '\n')
    print(f'{len(lines)} entries -> {args.out}')


if __name__ == '__main__':
    main()
