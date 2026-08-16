/* app.js — modes, state and all the UI wiring. */
(function () {
  'use strict';

  var STORE_KEY = 'chesstrainer.v2';
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- storage */

  var defaults = {
    rating: 800,
    solved: 0,
    attempts: 0,
    firstTry: 0,
    streak: 0,
    bestStreak: 0,
    history: [800],
    seen: {},          /* puzzleId -> { solved: n, failed: n } */
    themes: {},        /* theme -> { solved: n, failed: n } */
    games: { played: 0, won: 0, lost: 0, drawn: 0 },
    openings: {},      /* openingId -> { completed: n, best: ply } */
    sound: true
  };

  var store = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaults));
      var data = JSON.parse(raw);
      for (var k in defaults) if (!(k in data)) data[k] = JSON.parse(JSON.stringify(defaults[k]));
      return data;
    } catch (e) {
      return JSON.parse(JSON.stringify(defaults));
    }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* private mode */ }
  }

  /* ------------------------------------------------------------------ sound */

  var audio = null;
  function beep(freq, dur, type, gainVal) {
    if (!store.sound) return;
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      var osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(gainVal || 0.06, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
      osc.connect(gain).connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + dur);
    } catch (e) { /* no audio, no problem */ }
  }
  var Sound = {
    move: function () { beep(340, 0.07, 'triangle'); },
    capture: function () { beep(200, 0.09, 'square', 0.05); },
    check: function () { beep(520, 0.12, 'triangle'); },
    good: function () { beep(660, 0.09, 'sine'); setTimeout(function () { beep(880, 0.12, 'sine'); }, 90); },
    bad: function () { beep(180, 0.18, 'sawtooth', 0.04); },
    win: function () {
      [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { beep(f, 0.14, 'sine'); }, i * 110); });
    }
  };

  function playMoveSound(game, move) {
    if (game.inCheck()) Sound.check();
    else if (move.captured) Sound.capture();
    else Sound.move();
  }

  /* ------------------------------------------------------------------ board */

  var boardEl = $('#board');
  var board = new Board(boardEl, {
    onMove: function (from, to) { return Mode.current.tryMove(from, to); },
    onSelect: function (sq) { return Mode.current.select(sq); }
  });

  /* Shared helper: highlight the legal moves of the piece on `sq`. */
  function selectPiece(game, sq, allowedColor) {
    var piece = game.get(sq);
    if (!piece) return false;
    if (allowedColor && piece.color !== allowedColor) return false;
    if (piece.color !== game.turn()) return false;
    var moves = game.moves({ square: sq, verbose: true });
    if (!moves.length) return false;
    board.setTargets(sq, moves.map(function (m) {
      return { to: m.to, capture: !!m.captured };
    }));
    return true;
  }

  function checkSquare(game) {
    if (!game.inCheck()) return null;
    return Chess.algebraic(game.kings[game.turnColor]);
  }

  /* Resolve a from/to into a move, asking about promotion when needed. */
  function commitMove(game, from, to, done) {
    var options = game.moves({ square: from, verbose: true }).filter(function (m) { return m.to === to; });
    if (!options.length) return false;
    if (options.length > 1 && options[0].promotion) {
      board.askPromotion(game.turn(), function (piece) {
        done(game.move({ from: from, to: to, promotion: piece }));
      });
      return true;
    }
    done(game.move({ from: from, to: to, promotion: options[0].promotion || 'q' }));
    return true;
  }

  /* ------------------------------------------------------------------ modes */

  var Mode = { current: null, all: {} };

  function switchMode(name) {
    if (Mode.current && Mode.current.leave) Mode.current.leave();
    Mode.current = Mode.all[name];
    $$('.tab').forEach(function (t) { t.classList.toggle('active', t.dataset.mode === name); });
    $$('.panel').forEach(function (p) { p.classList.toggle('hidden', p.dataset.mode !== name); });
    $('#eval').classList.toggle('hidden', name !== 'play');
    board.clearSelection();
    Mode.current.enter();
  }

  /* ============================================================== PUZZLES == */

  /* anchor null = follow the player's own rating */
  var BANDS = {
    auto:   { min: 0,    max: 9999, anchor: null },
    easy:   { min: 0,    max: 999,  anchor: 600 },
    medium: { min: 1000, max: 1449, anchor: 1200 },
    hard:   { min: 1450, max: 9999, anchor: 1900 }
  };

  var Puzzles = {
    game: null, puzzle: null, step: 0, failed: false, hintShown: false, locked: false,

    enter: function () { if (!this.puzzle) this.next(); else this.draw(); },
    leave: function () {},

    pick: function () {
      var sel = $('#puzzle-band');
      var band = (sel && BANDS[sel.value]) || BANDS.auto;
      var pool = PUZZLES.filter(function (p) {
        return p.rating >= band.min && p.rating <= band.max;
      });
      if (!pool.length) pool = PUZZLES.slice();
      var rating = band.anchor === null ? store.rating : band.anchor;
      pool.sort(function (a, b) {
        var da = Math.abs(a.rating - rating) + freshnessPenalty(a);
        var db = Math.abs(b.rating - rating) + freshnessPenalty(b);
        return da - db;
      });
      function freshnessPenalty(p) {
        var s = store.seen[p.id];
        if (!s) return -120;                       /* prefer unseen */
        return 220 * (s.solved || 0);
      }
      /* a little randomness so it is not the same puzzle twice in a row */
      var head = pool.slice(0, 5);
      var choice = head[Math.floor(Math.random() * head.length)];
      if (this.puzzle && head.length > 1) {
        while (choice.id === this.puzzle.id) choice = head[Math.floor(Math.random() * head.length)];
      }
      return choice;
    },

    next: function () {
      this.puzzle = this.pick();
      this.start();
    },

    retry: function () { if (this.puzzle) this.start(); },

    start: function () {
      this.game = new Chess(this.puzzle.fen);
      this.step = 0;
      this.failed = false;
      this.hintShown = false;
      this.locked = false;
      this.altNote = null;
      board.setOrientation(this.game.turn());
      board.interactive = true;
      this.draw({ skipAnimation: true });
      this.status(this.game.turn() === 'w' ? 'White to play' : 'Black to play', 'neutral');
      $('#puzzle-explain').classList.add('hidden');
      $('#puzzle-hint').textContent = 'Hint';
      $('#puzzle-solution').disabled = false;
    },

    draw: function (opts) {
      opts = opts || {};
      var last = this.game.history().slice(-1)[0];
      board.render(this.game, {
        lastMove: last ? { from: Chess.algebraic(last.from), to: Chess.algebraic(last.to) } : null,
        check: checkSquare(this.game),
        skipAnimation: opts.skipAnimation
      });
      var p = this.puzzle;
      $('#puzzle-id').textContent = p.id.toUpperCase();
      $('#puzzle-rating').textContent = p.rating;
      $('#puzzle-themes').innerHTML = '';
      p.themes.forEach(function (t) {
        var chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = t;
        $('#puzzle-themes').appendChild(chip);
      });
      var source = $('#puzzle-game');
      source.textContent = p.game || '';
      source.classList.toggle('hidden', !p.game);
      $('#puzzle-progress').textContent =
        Math.floor(this.step / 2) + ' / ' + Math.ceil(p.moves.length / 2) + ' moves found';
      renderStatsBar();
    },

    status: function (text, kind) {
      var n = $('#puzzle-status');
      n.textContent = text;
      n.className = 'status ' + (kind || 'neutral');
    },

    select: function (sq) {
      if (this.locked) return false;
      return selectPiece(this.game, sq, this.game.turn());
    },

    tryMove: function (from, to) {
      if (this.locked) return false;
      var self = this;
      return commitMove(this.game, from, to, function (move) {
        if (!move) return;
        self.judge(move);
      });
    },

    judge: function (move) {
      var expected = this.puzzle.moves[this.step];
      var isLastMove = this.step === this.puzzle.moves.length - 1;
      var alsoMate = isLastMove && this.puzzle.goal === 'mate' && this.game.isCheckmate();

      /* some positions have a second move that wins just as cleanly */
      if (this.step === 0 && this.puzzle.alts) {
        for (var a = 0; a < this.puzzle.alts.length; a++) {
          if (this.puzzle.alts[a].uci === move.uci) {
            playMoveSound(this.game, move);
            this.step = this.puzzle.moves.length;
            this.draw();
            this.altNote = this.puzzle.alts[a].note;
            return this.finish();
          }
        }
      }

      var correct = move.uci === expected || (expected && move.uci === expected.slice(0, 4) && expected.length === 4) || alsoMate;

      if (!correct) {
        this.game.undo();
        Sound.bad();
        board.render(this.game, { check: checkSquare(this.game), skipAnimation: true });
        board.flash(Chess.algebraic(move.to), 'bad');
        this.status('Not this one — ' + move.san + ' lets the position slip. Try again.', 'bad');
        if (!this.failed) {
          this.failed = true;
          this.recordResult(false);
        }
        return;
      }

      playMoveSound(this.game, move);
      this.step++;
      this.draw();

      if (this.step >= this.puzzle.moves.length) return this.finish();

      /* play the scripted reply */
      var self = this;
      this.locked = true;
      this.status('Correct. ' + move.san + '!', 'good');
      setTimeout(function () {
        var reply = self.game.move(self.puzzle.moves[self.step]);
        if (reply) {
          playMoveSound(self.game, reply);
          self.step++;
          self.draw();
        }
        self.locked = false;
        if (self.step >= self.puzzle.moves.length) self.finish();
        else self.status('Good. Keep going.', 'good');
      }, 420);
    },

    finish: function () {
      this.locked = true;
      board.interactive = false;
      Sound.win();
      this.status(this.failed ? 'Solved — but not first try.' : 'Solved! ' + praise(), 'good');
      $('#puzzle-explain').textContent =
        (this.altNote ? this.altNote + ' ' : '') + this.puzzle.explain;
      $('#puzzle-explain').classList.remove('hidden');
      if (!this.failed) this.recordResult(true);
      else { store.streak = 0; save(); }
      renderStatsBar();
      renderStats();
    },

    recordResult: function (won) {
      var p = this.puzzle;
      var expected = 1 / (1 + Math.pow(10, (p.rating - store.rating) / 400));
      var k = store.attempts < 20 ? 40 : 24;
      store.rating = Math.max(400, Math.round(store.rating + k * ((won ? 1 : 0) - expected)));
      store.attempts++;
      if (won) {
        store.solved++;
        store.firstTry++;
        store.streak++;
        store.bestStreak = Math.max(store.bestStreak, store.streak);
      } else {
        store.streak = 0;
      }
      store.history.push(store.rating);
      if (store.history.length > 120) store.history.shift();
      var seen = store.seen[p.id] || (store.seen[p.id] = { solved: 0, failed: 0 });
      seen[won ? 'solved' : 'failed']++;
      p.themes.forEach(function (t) {
        var th = store.themes[t] || (store.themes[t] = { solved: 0, failed: 0 });
        th[won ? 'solved' : 'failed']++;
      });
      save();
      renderStatsBar();
    },

    hint: function () {
      if (this.locked) return;
      if (!this.hintShown) {
        this.hintShown = true;
        this.status(this.puzzle.hint, 'neutral');
        $('#puzzle-hint').textContent = 'Show the piece';
        return;
      }
      var uci = this.puzzle.moves[this.step];
      board.flash(uci.slice(0, 2), 'good');
      this.status('Start with the piece on ' + uci.slice(0, 2) + '.', 'neutral');
    },

    showSolution: function () {
      if (this.step >= this.puzzle.moves.length) return;
      if (!this.failed) { this.failed = true; this.recordResult(false); }
      var self = this;
      this.locked = true;
      $('#puzzle-solution').disabled = true;
      board.interactive = false;
      (function playNext() {
        if (self.step >= self.puzzle.moves.length) {
          self.status('That was the idea.', 'neutral');
          $('#puzzle-explain').textContent = self.puzzle.explain;
          $('#puzzle-explain').classList.remove('hidden');
          return;
        }
        var m = self.game.move(self.puzzle.moves[self.step]);
        if (m) { playMoveSound(self.game, m); self.step++; self.draw(); }
        setTimeout(playNext, 620);
      })();
    }
  };
  Mode.all.puzzles = Puzzles;

  function praise() {
    var lines = ['Clean.', 'That is the move.', 'Well spotted.', 'Textbook.', 'Nice calculation.'];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  /* ================================================================= PLAY == */

  var Play = {
    game: null, engine: new ChessAI.Engine(), human: 'w', level: 1, thinking: false, over: false,

    enter: function () { if (!this.game) this.newGame(); else this.draw({ skipAnimation: true }); },
    leave: function () {},

    newGame: function () {
      this.game = new Chess();
      this.over = false;
      this.thinking = false;
      this.human = $('#play-color').value === 'random'
        ? (Math.random() < 0.5 ? 'w' : 'b')
        : $('#play-color').value;
      this.level = parseInt($('#play-level').value, 10);
      board.setOrientation(this.human);
      board.interactive = true;
      this.draw({ skipAnimation: true });
      this.status('Your move.', 'neutral');
      if (this.game.turn() !== this.human) this.engineMove();
    },

    draw: function (opts) {
      opts = opts || {};
      var last = this.game.history().slice(-1)[0];
      board.render(this.game, {
        lastMove: last ? { from: Chess.algebraic(last.from), to: Chess.algebraic(last.to) } : null,
        check: checkSquare(this.game),
        skipAnimation: opts.skipAnimation
      });
      this.renderMoves();
      this.renderEval();
    },

    renderMoves: function () {
      var hist = this.game.history();
      var g = new Chess(this.startFen || Chess.DEFAULT_FEN);
      var rows = [], html = '';
      var sans = [];
      /* rebuild SAN by replaying — the stack keeps raw moves only */
      for (var i = 0; i < hist.length; i++) {
        var m = g.move(Chess.algebraic(hist[i].from) + Chess.algebraic(hist[i].to) +
          ((hist[i].flags & Chess.FLAG_PROMO) ? Chess.SYMBOLS[hist[i].promotion] : ''));
        sans.push(m ? m.san : '?');
      }
      for (var j = 0; j < sans.length; j += 2) {
        html += '<div class="move-row"><span class="num">' + (j / 2 + 1) + '.</span>' +
          '<span class="san">' + sans[j] + '</span>' +
          '<span class="san">' + (sans[j + 1] || '') + '</span></div>';
      }
      var list = $('#move-list');
      list.innerHTML = html || '<div class="empty">No moves yet.</div>';
      list.scrollTop = list.scrollHeight;
    },

    renderEval: function () {
      var cp = ChessAI.evaluate(this.game);
      if (this.game.turnColor === Chess.BLACK) cp = -cp;   /* to White's point of view */
      var pct = 50 + 50 * (2 / (1 + Math.exp(-cp / 350)) - 1);
      pct = Math.max(2, Math.min(98, pct));
      $('#eval-fill').style.height = pct + '%';
      var pawns = (cp / 100).toFixed(1);
      $('#eval-text').textContent = (cp > 0 ? '+' : '') + pawns;
    },

    status: function (text, kind) {
      var n = $('#play-status');
      n.textContent = text;
      n.className = 'status ' + (kind || 'neutral');
    },

    select: function (sq) {
      if (this.over || this.thinking) return false;
      if (this.game.turn() !== this.human) return false;
      return selectPiece(this.game, sq, this.human);
    },

    tryMove: function (from, to) {
      if (this.over || this.thinking) return false;
      if (this.game.turn() !== this.human) return false;
      var self = this;
      return commitMove(this.game, from, to, function (move) {
        if (!move) return;
        playMoveSound(self.game, move);
        self.draw();
        if (self.checkOver()) return;
        self.engineMove();
      });
    },

    engineMove: function () {
      var self = this;
      this.thinking = true;
      board.interactive = false;
      this.status('Thinking…', 'neutral');
      /* let the browser paint the "thinking" state before we block on search */
      setTimeout(function () {
        var level = ChessAI.LEVELS[self.level];
        var result = self.engine.think(self.game, level);
        if (result && result.move) {
          var move = self.game.move(Chess.algebraic(result.move.from) + Chess.algebraic(result.move.to) +
            ((result.move.flags & Chess.FLAG_PROMO) ? Chess.SYMBOLS[result.move.promotion] : ''));
          if (move) { playMoveSound(self.game, move); }
          self.draw();
        }
        self.thinking = false;
        board.interactive = true;
        if (!self.checkOver()) self.status('Your move.', 'neutral');
      }, 40);
    },

    checkOver: function () {
      if (!this.game.isGameOver()) return false;
      this.over = true;
      board.interactive = false;
      var result = this.game.gameResult();
      var youWon = this.game.isCheckmate() && this.game.turn() !== this.human;
      var youLost = this.game.isCheckmate() && this.game.turn() === this.human;
      this.status(result, youWon ? 'good' : youLost ? 'bad' : 'neutral');
      store.games.played++;
      if (youWon) { store.games.won++; Sound.win(); }
      else if (youLost) { store.games.lost++; Sound.bad(); }
      else store.games.drawn++;
      save();
      renderStats();
      return true;
    },

    takeBack: function () {
      if (this.thinking) return;
      if (!this.game.history().length) return;
      this.game.undo();
      if (this.game.turn() !== this.human && this.game.history().length) this.game.undo();
      this.over = false;
      board.interactive = true;
      this.draw({ skipAnimation: true });
      this.status('Take back. Your move.', 'neutral');
    },

    hint: function () {
      if (this.over || this.thinking) return;
      if (this.game.turn() !== this.human) return;
      var self = this;
      this.status('Looking…', 'neutral');
      setTimeout(function () {
        var r = self.engine.think(self.game, { depth: 4, time: 900, skill: 3 });
        if (!r || !r.move) return;
        var from = Chess.algebraic(r.move.from);
        board.flash(from, 'good');
        board.flash(Chess.algebraic(r.move.to), 'good');
        self.status('Try the piece on ' + from + '.', 'neutral');
      }, 30);
    }
  };
  Mode.all.play = Play;

  /* ============================================================= OPENINGS == */

  var Openings = {
    game: null, opening: null, ply: 0, locked: false, mistakes: 0,

    enter: function () {
      if (!$('#opening-select').options.length) this.buildList();
      if (!this.opening) this.load(OPENINGS[0].id);
      else this.draw({ skipAnimation: true });
    },
    leave: function () {},

    buildList: function () {
      var sel = $('#opening-select');
      OPENINGS.forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o.id;
        opt.textContent = o.name + '  (' + o.eco + ')';
        sel.appendChild(opt);
      });
    },

    load: function (id) {
      this.opening = OPENINGS.filter(function (o) { return o.id === id; })[0] || OPENINGS[0];
      $('#opening-select').value = this.opening.id;
      this.restart();
    },

    restart: function () {
      this.game = new Chess();
      this.ply = 0;
      this.mistakes = 0;
      this.locked = false;
      board.setOrientation(this.opening.side);
      board.interactive = true;
      $('#opening-blurb').textContent = this.opening.blurb;
      $('#opening-note').classList.add('hidden');
      this.draw({ skipAnimation: true });
      this.status('You are ' + (this.opening.side === 'w' ? 'White' : 'Black') + '. Play the main line.', 'neutral');
      if (this.turnIsTheirs()) this.autoMove();
    },

    turnIsTheirs: function () {
      return this.game.turn() !== this.opening.side;
    },

    draw: function (opts) {
      opts = opts || {};
      var last = this.game.history().slice(-1)[0];
      board.render(this.game, {
        lastMove: last ? { from: Chess.algebraic(last.from), to: Chess.algebraic(last.to) } : null,
        check: checkSquare(this.game),
        skipAnimation: opts.skipAnimation
      });
      var o = this.opening, self = this;
      var html = '';
      for (var i = 0; i < o.moves.length; i++) {
        if (i % 2 === 0) html += '<span class="num">' + (i / 2 + 1) + '.</span>';
        var cls = 'san' + (i < this.ply ? ' done' : '') + (i === this.ply ? ' next' : '');
        html += '<span class="' + cls + '">' + (i < this.ply ? o.moves[i] : '···') + '</span>';
      }
      $('#opening-line').innerHTML = html;
      $('#opening-progress').textContent = this.ply + ' / ' + o.moves.length + ' plies';
    },

    status: function (text, kind) {
      var n = $('#opening-status');
      n.textContent = text;
      n.className = 'status ' + (kind || 'neutral');
    },

    showNote: function () {
      var note = this.opening.notes && this.opening.notes[this.ply - 1];
      var el = $('#opening-note');
      if (note) { el.textContent = note; el.classList.remove('hidden'); }
      else el.classList.add('hidden');
    },

    select: function (sq) {
      if (this.locked) return false;
      return selectPiece(this.game, sq, this.opening.side);
    },

    tryMove: function (from, to) {
      if (this.locked) return false;
      var self = this;
      return commitMove(this.game, from, to, function (move) {
        if (!move) return;
        var expected = self.opening.moves[self.ply];
        var norm = function (s) { return s.replace(/[+#]/g, ''); };
        if (norm(move.san) !== norm(expected)) {
          self.game.undo();
          self.mistakes++;
          Sound.bad();
          board.render(self.game, { check: checkSquare(self.game), skipAnimation: true });
          board.flash(to, 'bad');
          self.status('The main line plays something else here. ' + move.san + ' is not it.', 'bad');
          return;
        }
        playMoveSound(self.game, move);
        self.ply++;
        self.draw();
        self.showNote();
        self.status('Yes — ' + move.san + '.', 'good');
        if (self.ply >= self.opening.moves.length) return self.finish();
        self.autoMove();
      });
    },

    autoMove: function () {
      var self = this;
      this.locked = true;
      board.interactive = false;
      setTimeout(function () {
        var m = self.game.move(self.opening.moves[self.ply]);
        if (m) {
          playMoveSound(self.game, m);
          self.ply++;
          self.draw();
          self.showNote();
        }
        self.locked = false;
        board.interactive = true;
        if (self.ply >= self.opening.moves.length) self.finish();
      }, 420);
    },

    finish: function () {
      this.locked = true;
      board.interactive = false;
      Sound.win();
      this.status(this.mistakes === 0
        ? 'Whole line, no mistakes. That one is yours now.'
        : 'Line complete — ' + this.mistakes + ' wrong turn' + (this.mistakes === 1 ? '' : 's') + ' along the way.', 'good');
      var rec = store.openings[this.opening.id] || (store.openings[this.opening.id] = { completed: 0, clean: 0 });
      rec.completed++;
      if (this.mistakes === 0) rec.clean++;
      save();
      renderStats();
    },

    reveal: function () {
      if (this.locked || this.ply >= this.opening.moves.length) return;
      this.status('The move is ' + this.opening.moves[this.ply] + '.', 'neutral');
    }
  };
  Mode.all.openings = Openings;

  /* ================================================================ STATS == */

  var Stats = {
    enter: function () { renderStats(); },
    leave: function () {},
    select: function () { return false; },
    tryMove: function () { return false; }
  };
  Mode.all.stats = Stats;

  function renderStatsBar() {
    $('#stat-rating').textContent = store.rating;
    $('#stat-solved').textContent = store.solved;
    $('#stat-streak').textContent = store.streak;
  }

  function renderStats() {
    renderStatsBar();
    $('#s-rating').textContent = store.rating;
    $('#s-solved').textContent = store.solved;
    $('#s-attempts').textContent = store.attempts;
    $('#s-best').textContent = store.bestStreak;
    var acc = store.attempts ? Math.round(100 * store.firstTry / store.attempts) : 0;
    $('#s-accuracy').textContent = acc + '%';
    $('#s-games').textContent = store.games.played;
    $('#s-record').textContent = store.games.won + 'W / ' + store.games.drawn + 'D / ' + store.games.lost + 'L';

    /* rating sparkline */
    var pts = store.history.slice(-60);
    var svg = $('#rating-chart');
    if (pts.length < 2) {
      svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" class="chart-empty">Solve a puzzle to start the graph</text>';
    } else {
      var w = 600, h = 130, pad = 10;
      var min = Math.min.apply(null, pts), max = Math.max.apply(null, pts);
      if (max - min < 100) { var mid = (max + min) / 2; min = mid - 50; max = mid + 50; }
      var d = '', area = '';
      pts.forEach(function (v, i) {
        var x = pad + (w - 2 * pad) * (i / (pts.length - 1));
        var y = pad + (h - 2 * pad) * (1 - (v - min) / (max - min));
        d += (i ? ' L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
      });
      area = d + ' L' + (w - pad) + ',' + (h - pad) + ' L' + pad + ',' + (h - pad) + ' Z';
      svg.innerHTML =
        '<path class="spark-area" d="' + area + '"/>' +
        '<path class="spark-line" d="' + d + '"/>';
    }

    /* theme breakdown */
    var rows = Object.keys(store.themes).map(function (t) {
      var s = store.themes[t];
      var total = s.solved + s.failed;
      return { theme: t, solved: s.solved, total: total, pct: total ? s.solved / total : 0 };
    }).sort(function (a, b) { return b.total - a.total; });
    var host = $('#theme-list');
    if (!rows.length) {
      host.innerHTML = '<div class="empty">No puzzle themes yet — go solve something.</div>';
    } else {
      host.innerHTML = rows.map(function (r) {
        return '<div class="theme-row">' +
          '<span class="theme-name">' + r.theme + '</span>' +
          '<span class="bar"><span class="bar-fill" style="width:' + Math.round(r.pct * 100) + '%"></span></span>' +
          '<span class="theme-num">' + r.solved + '/' + r.total + '</span></div>';
      }).join('');
    }

    /* openings */
    var oHost = $('#opening-stats');
    var oRows = OPENINGS.filter(function (o) { return store.openings[o.id]; });
    if (!oRows.length) {
      oHost.innerHTML = '<div class="empty">No opening lines drilled yet.</div>';
    } else {
      oHost.innerHTML = oRows.map(function (o) {
        var r = store.openings[o.id];
        return '<div class="theme-row"><span class="theme-name">' + o.name + '</span>' +
          '<span class="theme-num">' + r.clean + ' clean / ' + r.completed + ' runs</span></div>';
      }).join('');
    }
  }

  /* ================================================================= WIRE == */

  $$('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () { switchMode(tab.dataset.mode); });
  });

  $('#puzzle-band').addEventListener('change', function () { Puzzles.next(); });
  $('#puzzle-next').addEventListener('click', function () { Puzzles.next(); });
  $('#puzzle-retry').addEventListener('click', function () { Puzzles.retry(); });
  $('#puzzle-hint').addEventListener('click', function () { Puzzles.hint(); });
  $('#puzzle-solution').addEventListener('click', function () { Puzzles.showSolution(); });

  $('#play-new').addEventListener('click', function () { Play.newGame(); });
  $('#play-undo').addEventListener('click', function () { Play.takeBack(); });
  $('#play-hint').addEventListener('click', function () { Play.hint(); });
  $('#play-level').addEventListener('change', function () {
    Play.level = parseInt(this.value, 10);
    $('#level-elo').textContent = ChessAI.LEVELS[Play.level].elo;
  });

  $('#opening-select').addEventListener('change', function () { Openings.load(this.value); });
  $('#opening-restart').addEventListener('click', function () { Openings.restart(); });
  $('#opening-reveal').addEventListener('click', function () { Openings.reveal(); });

  $('#flip').addEventListener('click', function () { board.flip(); });
  $('#sound').addEventListener('click', function () {
    store.sound = !store.sound;
    save();
    this.textContent = store.sound ? '🔊' : '🔇';
    this.setAttribute('aria-label', store.sound ? 'Mute sounds' : 'Unmute sounds');
  });
  $('#reset').addEventListener('click', function () {
    if (!confirm('Erase all of your progress — rating, streak, solved puzzles and game record?')) return;
    store = JSON.parse(JSON.stringify(defaults));
    save();
    Puzzles.puzzle = null;
    renderStats();
    switchMode('puzzles');
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'f') board.flip();
    if (e.key === 'n' && Mode.current === Puzzles) Puzzles.next();
    if (e.key === 'h' && Mode.current === Puzzles) Puzzles.hint();
  });

  /* level labels */
  var levelSel = $('#play-level');
  ChessAI.LEVELS.forEach(function (l, i) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.textContent = l.name;
    levelSel.appendChild(opt);
  });
  levelSel.value = '1';
  $('#level-elo').textContent = ChessAI.LEVELS[1].elo;
  $('#puzzle-count').textContent = PUZZLES.length;
  $('#sound').textContent = store.sound ? '🔊' : '🔇';

  renderStats();
  switchMode('puzzles');

  /* Handle for the self-test pages (and anyone poking at it from the console). */
  window.ChessTrainer = {
    board: board,
    modes: Mode,
    state: function () { return store; }
  };
})();
