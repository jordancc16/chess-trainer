# Chess Trainer

A browser chess trainer with three modes, written from scratch — no chess library, no engine
binary, no build step, no server. Open `index.html` and it runs.

- **Tactics** — 35 rated puzzles from 400 to 2100, with an Elo-style rating that moves with
  you. Solve first time and it goes up; miss it or peek at the solution and it goes down.
  Each puzzle has a hint, a full solution replay, and an explanation of the pattern. The
  harder end includes Boden's mate, Anastasia's mate, Legall's mate, a windmill, and a pawn
  breakthrough. A difficulty selector lets you jump straight to a band instead of waiting
  for your rating to get there.
- **Play the engine** — four strength levels, either colour, take-backs, hints and a live
  evaluation bar.
- **Openings** — ten main lines to drill. You play one side, the line answers back, wrong
  moves are taken back before they become habit.
- **Progress** — rating graph, first-try accuracy, a breakdown by tactical theme, and your
  record against the engine. All of it lives in `localStorage`; nothing leaves the browser.

## Running it

Double-click `index.html`, or serve the folder if you prefer a real origin:

```
python -m http.server 8777
# then open http://localhost:8777/
```

## Layout

```
index.html         the app
validate.html      engine self-test — perft, puzzle lines, opening lines, edge cases
uitest.html        UI harness — drives the real page in an iframe with synthetic pointer events
css/style.css
js/engine.js       0x88 board, legal move generation, SAN, FEN, draw detection
js/ai.js           negamax + alpha-beta + quiescence, piece-square tables
js/board.js        rendering, click and drag input, promotion picker
js/puzzles.js      the tactics set
js/openings.js     the opening lines
js/app.js          modes, scoring, storage, all the wiring
```

## The engine

`js/engine.js` uses a 0x88 board: a 16×8 array where any square with a bit in `0x88` set is
off the board, so bounds checking is a single mask. Moves are generated pseudo-legally and
then filtered by making each one and testing whether the king is attacked.

It is verified by **perft** — counting the leaf nodes of the move tree to a given depth and
comparing against published reference values. `validate.html` runs the standard five test
positions, including Kiwipete, which is specifically designed to catch castling, en passant
and promotion bugs:

| position   | depth 1 | depth 2 | depth 3 | depth 4 |
|------------|---------|---------|---------|---------|
| startpos   | 20      | 400     | 8902    | 197281  |
| kiwipete   | 48      | 2039    | 97862   | —       |
| position 3 | 14      | 191     | 2812    | 43238   |
| position 4 | 6       | 264     | 9467    | —       |
| position 5 | 44      | 1486    | 62379   | —       |

## Validating the puzzles

Replaying a solution line proves it is legal. It does not prove it is *right* — a solution
can be perfectly legal and still lose to a reply you never considered. So `validate.html`
does three more things:

1. **Forced-mate proof.** Every puzzle claiming mate is checked exhaustively against *every*
   black defence, not just the scripted one. A "mate in 2" that only mates if Black
   cooperates fails here.
2. **Engine oracle.** Every solution move is put to the search: if the engine has a move
   worth more than 60 centipawns more, the puzzle fails. This is what catches a solution
   that simply hangs a piece — a queen fork is worthless if the forked piece defends the
   forking square.
3. **Material accounting.** Puzzles claiming to win material must actually end at least two
   pawns up, counted from the board.

Between them these caught four bad puzzles that legality checking alone was happy with,
including one "pin exercise" that was really just mate in one, and two forks where the
target defended the fork square. `?deep=1` runs the oracle on every move of every solution
rather than just the first.

The oracle is a safety net, not an authority. It searches to a fixed depth, so it is blind
to long forcing ideas — in the pawn-breakthrough study it prefers a move that objectively
throws the win away. Puzzles like that carry `oracle: 'first'` with a comment explaining
what the engine is missing.

## The search

`js/ai.js` is negamax with alpha-beta pruning, iterative deepening to a time budget, MVV-LVA
capture ordering, killer moves, a check extension, and a quiescence search so the engine does
not stop counting in the middle of a trade. Evaluation is material plus piece-square tables,
with separate king tables for the middlegame and the endgame.

The lower difficulty levels are not a shallower search pretending to be a weaker player —
they search shallowly *and* pick randomly among moves within a slack window of the best one,
which produces the kind of mistakes a human actually makes.

Everything runs on the main thread in short slices. Web Workers are blocked on `file://`, and
being able to double-click the HTML file mattered more than the last bit of search depth.

## Adding a puzzle

Append to `js/puzzles.js`:

```js
{
  id: 'p36', rating: 1100, themes: ['fork'],
  fen: '...',
  moves: ['g4f6', 'g8g7', 'f6d5'],   // UCI; even indices are yours, odd are the replies
  goal: 'mate',                      // 'mate' | 'material' | 'trap'
  hint: '...',
  explain: '...',

  // optional
  alts: [{ uci: 'c1e3', note: 'why this also wins' }],  // second solutions the trainer accepts
  refutation: 'dxe5',                // required for goal: 'trap' — Black's better defence
  oracle: 'first'                    // engine-check only move 1, with a comment saying why
}
```

Then open `validate.html`. A `goal: 'mate'` line must end on your move and must be forced
against every defence. A `goal: 'material'` line must end at least two pawns up. A
`goal: 'trap'` line is one Black does not have to enter — it only has to be mate once the
bait is taken, and it has to document the refutation.
