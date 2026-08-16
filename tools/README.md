# tools — development only

Nothing in here ships with the app. `index.html` still opens by double-click with
no dependencies; these scripts exist to *build and check* the puzzle set.

The app's own engine is the one in `js/ai.js`, written from scratch. Stockfish is
used here as a judge, not as a player: it decides which positions from real games
become puzzles, what the solution is, and whether a puzzle is honest. Its verdicts
are baked into `js/puzzles.js` as plain data and Stockfish is not needed to run,
build or deploy the site.

## Setup

Neither the engine binary nor the game corpus is committed — one is 76 MB, the
other is 13 MB, and neither is mine to redistribute.

```bash
pip install chess

# Stockfish (GPL v3) — used only by these scripts
mkdir -p tools/vendor && cd tools/vendor
curl -LO https://github.com/official-stockfish/Stockfish/releases/download/sf_17.1/stockfish-windows-x86-64-avx2.zip
unzip stockfish-windows-x86-64-avx2.zip

# master game collections
mkdir -p tools/corpus && cd tools/corpus
for p in Morphy Anderssen Tal Alekhine Capablanca Fischer Kasparov Spassky \
         Keres Botvinnik Smyslov Karpov Bronstein Rubinstein; do
  curl -LO "https://www.pgnmentor.com/players/$p.zip" && unzip -o "$p.zip"
done
```

## mine.py — find puzzles in real games

```bash
python tools/mine.py --target 150 --out tools/mined.json
```

Walks every game and asks Stockfish for the two best moves in each position. A
position only becomes a puzzle when

* the best move beats the second best by 250cp or more — so there is one answer,
* the position is roughly level *without* it (second best ≤ 60cp) — so the puzzle
  is "find the win", not "you are already winning",
* the key move is not just recapturing what was captured last move, and
* the position left at the end of the line is genuinely won.

The solution line is Stockfish's principal variation, which means the opponent's
replies in every puzzle are the engine's best defence rather than a cooperative
one.

## convert.py — write the puzzle entries

```bash
python tools/convert.py --in tools/mined.json --start 100 --out tools/mined.js
```

Generates the `js/puzzles.js` entries. The hint and explanation are generated, but
every clause is computed from the position — which pieces the key move attacks and
on which squares, whether it is a sacrifice, the line in algebraic notation, and
the measured material outcome. Nothing is asserted that was not derived.

## verify.py — the authoritative check

```bash
python tools/verify.py --depth 20            # everything
python tools/verify.py --depth 20 --only p11 # one puzzle
python tools/verify.py --fix tools/fixes.json   # repair cooperative defences
```

`validate.html` runs in the browser against the from-scratch engine and covers
matters of fact: legality, whether a line replays, whether a mate is forced
against every defence. This script covers matters of judgement, with a real
engine:

* the position is reachable at all,
* every move the solver plays is Stockfish's best,
* every reply is Stockfish's best, so the defence is a defence and not a helpmate,
* the solution is the only move that wins, by a clear margin,
* **the position left at the end is actually won** — not equal, not drawn, and
  above all not lost.

That last one is the check that matters most. It is very easy to compose a
position that demonstrates a motif beautifully and leaves the solver in a dead
draw or worse; several puzzles in early versions of this set did exactly that.
