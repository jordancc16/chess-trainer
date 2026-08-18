# Chess Trainer

A browser chess trainer with three modes, written from scratch — no chess library, no engine
binary, no build step, no server. Open `index.html` and it runs.

- **Tactics** — 218 rated puzzles across ten categories, with an Elo-style rating that
  moves with you. 179 of them are positions mined out of real master games — Morphy,
  Anderssen, Capablanca, Tal, Fischer, Kasparov and others — chosen by Stockfish because
  one move there is decisively better than every alternative and the position is level
  without it. Every one is credited on screen with players, event and year, and in every
  one the opponent's replies are the engine's best defence rather than a cooperative one.
  The rest are hand-written pattern drills and named opening traps. Category and
  difficulty selectors let you drill exactly what you want.
- **Puzzle Rush** — three minutes, three strikes, puzzles easiest-first and getting harder.
  A wrong move costs a strike and moves you straight on.
- **Board Vision** — thirty seconds to click as many named squares as you can with the
  coordinates hidden, from either side of the board.
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

There are two layers. `validate.html` runs in the browser against the from-scratch engine
and covers matters of fact. `tools/verify.py` runs Stockfish over the whole set and covers
matters of judgement — every solver move must be its best, every reply must be its best
defence, the solution must be uniquely winning, and **the position left at the end must be
actually won**, not equal, not drawn and above all not lost. It runs single-threaded with the
engine's state reset between puzzles, because otherwise the verdicts are not reproducible:
multi-threaded Stockfish searches differently run to run, and its transposition table carries
over from the previous position, so the failing set moved between sweeps and two puzzles were
"repaired" on readings a later run contradicted.

`tools/settle.py` closes the loop: verify, rebuild any drifting line deeper and shorter,
re-verify, and drop what cannot be saved. It is there because doing this by hand does not
converge. The underlying lesson is that **long solution lines are not verifiable at these
margins** — the fifth move of a principal variation is a suggestion at one depth, not a fact,
and shifts by 60-120cp when you look deeper. Lines that keep drifting are cut back to the key
move, which is the part that really is verified: unique, decisive, and leaving a won position. That last check is the one that
matters: it is very easy to compose a position that shows a motif beautifully and leaves the
solver in a dead draw. Several early puzzles did exactly that, including two knight forks
that won a queen into K+N vs K.

Replaying a solution line proves it is legal. It does not prove it is *right* — a solution
can be perfectly legal and still lose to a reply you never considered, and a position can
parse cleanly and still be one no game could ever reach. So `validate.html` does five more
things:

1. **Position legality.** The side *not* to move must not be in check — otherwise the
   previous move was illegal and the position is impossible. Also one king each, and no
   pawns on the first or eighth rank.
2. **Forced-mate proof.** Every puzzle claiming mate is checked exhaustively against *every*
   black defence, not just the scripted one. A "mate in 2" that only mates if Black
   cooperates fails here.
3. **Engine oracle.** Every solution move is put to the search: if the engine has a move
   worth more than 60 centipawns more, the puzzle fails. This is what catches a solution
   that simply hangs a piece — a queen fork is worthless if the forked piece defends the
   forking square.
4. **Solution uniqueness.** Every root move is scored with a full window, and any move as
   good as the solution must either *be* the solution or be declared in `alts`. A puzzle
   with two equally good answers is a puzzle that tells an honest solver they are wrong.
   Mate scores encode distance-to-mate, so when the best move mates only an equally fast
   mate counts as a rival — otherwise a mate in five looks like a rival of a mate in one.
5. **Material accounting.** Puzzles claiming to win material must actually end at least two
   pawns up, counted from the board.

Together these have caught eleven bad puzzles that legality checking alone was happy with:
two impossible positions (a rook already giving check), a "pin exercise" that was really
mate in one, three forks where the target defended the fork square, a windmill with a faster
mate available, several positions with two equally good solutions, and an underpromotion
puzzle that won a queen and reached a dead-drawn K+N vs K ending. `?deep=1` runs the oracle
on every move of every solution rather than just the first, and enables the uniqueness pass.

The oracle is a safety net, not an authority. It searches to a fixed depth, so it is blind
to long forcing ideas — in the pawn-breakthrough study it prefers a move that objectively
throws the win away. Puzzles like that carry `oracle: 'first'` with a comment explaining
what the engine is missing.

## The search

The engine the app plays with is written from scratch — no Stockfish, no library, no binary,
and nothing fetched at runtime. (Stockfish *is* used, but only as a development tool that
never ships: it picks which positions from real games become puzzles and checks that each
one is honest. See `tools/README.md`.) `js/ai.js` is negamax with alpha-beta pruning, iterative
deepening to a time budget, MVV-LVA capture ordering, killer moves, a check extension, and a
quiescence search so the engine does not stop counting in the middle of a trade. Evaluation
is material plus piece-square tables, with separate king tables for the middlegame and the
endgame. The algorithms are textbook; the only values not invented here are the piece-square
tables, which are the standard published "simplified evaluation" set.

The lower difficulty levels are not a shallower search pretending to be a weaker player —
they search shallowly *and* pick randomly among moves within a slack window of the best one,
which produces the kind of mistakes a human actually makes.

Everything runs on the main thread in short slices. Web Workers are blocked on `file://`, and
being able to double-click the HTML file mattered more than the last bit of search depth.

## Adding a puzzle

Append to `js/puzzles.js`:

```js
{
  id: 'p56', rating: 1100, category: 'forks', themes: ['fork'],
  fen: '...',
  moves: ['g4f6', 'g8g7', 'f6d5'],   // UCI; even indices are yours, odd are the replies
  goal: 'mate',                      // 'mate' | 'material' | 'trap'
  hint: '...',
  explain: '...',

  // optional
  game: 'Morphy — Duke of Brunswick, Paris 1858',       // credited on screen
  masters: true,                                        // a real game, not just named theory
  alts: [{ uci: 'c1e3', note: 'why this also wins' }],  // second solutions the trainer accepts
  refutation: 'dxe5',                // required for goal: 'trap' — Black's better defence
  oracle: 'first'                    // engine-check only move 1, with a comment saying why
}
```

Then open `validate.html`. A `goal: 'mate'` line must end on your move and must be forced
against every defence. A `goal: 'material'` line must end at least two pawns up. A
`goal: 'trap'` line is one Black does not have to enter — it only has to be mate once the
bait is taken, and it has to document the refutation.
