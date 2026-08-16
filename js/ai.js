/* ai.js — negamax + alpha-beta + quiescence, with piece-square tables.
   Deliberately synchronous: it runs in small time slices so the page stays usable
   from file:// where Web Workers are blocked. */
(function (global) {
  'use strict';

  var C = global.Chess;
  var PAWN = C.PAWN, KNIGHT = C.KNIGHT, BISHOP = C.BISHOP,
      ROOK = C.ROOK, QUEEN = C.QUEEN, KING = C.KING;
  var WHITE = C.WHITE, BLACK = C.BLACK;
  var TYPE_MASK = C.TYPE_MASK, COLOR_MASK = C.COLOR_MASK;

  var VALUE = {};
  VALUE[PAWN] = 100; VALUE[KNIGHT] = 320; VALUE[BISHOP] = 330;
  VALUE[ROOK] = 500; VALUE[QUEEN] = 900; VALUE[KING] = 20000;

  /* Tables are written from White's point of view, rank 8 first. */
  function table(rows) {
    var t = new Array(128);
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) t[(7 - r) * 16 + f] = rows[r][f];
    }
    return t;
  }

  var PST = {};
  PST[PAWN] = table([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]);
  PST[KNIGHT] = table([
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ]);
  PST[BISHOP] = table([
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ]);
  PST[ROOK] = table([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0]
  ]);
  PST[QUEEN] = table([
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20]
  ]);
  var KING_MID = table([
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20]
  ]);
  var KING_END = table([
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50]
  ]);

  /* Mirror a white-oriented square for black. */
  function mirror(sq) { return ((7 - (sq >> 4)) << 4) | (sq & 15); }

  var MATE = 100000;

  function evaluate(game) {
    var b = game.board;
    var score = 0, phase = 0, sq, p, type, color, idx;
    /* first pass: material + game phase */
    for (sq = 0; sq <= 119; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      p = b[sq];
      if (!p) continue;
      type = p & TYPE_MASK;
      if (type !== PAWN && type !== KING) phase += VALUE[type];
    }
    var endgame = phase < 1300;

    for (sq = 0; sq <= 119; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      p = b[sq];
      if (!p) continue;
      type = p & TYPE_MASK;
      color = p & COLOR_MASK;
      idx = color === WHITE ? sq : mirror(sq);
      var v = VALUE[type] + (type === KING ? (endgame ? KING_END[idx] : KING_MID[idx]) : PST[type][idx]);
      score += color === WHITE ? v : -v;
    }

    /* small positional nudges */
    score += mobilityBonus(game);
    return game.turnColor === WHITE ? score : -score;
  }

  function mobilityBonus(game) {
    /* Cheap approximation: bishop pair. Full mobility is too slow per node. */
    var wb = 0, bb = 0;
    for (var sq = 0; sq <= 119; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      var p = game.board[sq];
      if (!p || (p & TYPE_MASK) !== BISHOP) continue;
      if ((p & COLOR_MASK) === WHITE) wb++; else bb++;
    }
    return (wb >= 2 ? 30 : 0) - (bb >= 2 ? 30 : 0);
  }

  function scoreMove(move, killer) {
    if (move.captured) {
      return 1000000 + VALUE[move.captured & TYPE_MASK] * 10 - VALUE[move.piece & TYPE_MASK];
    }
    if (move.flags & C.FLAG_PROMO) return 900000 + VALUE[move.promotion];
    if (killer && move.from === killer.from && move.to === killer.to) return 800000;
    return 0;
  }

  function orderMoves(moves, killer) {
    for (var i = 0; i < moves.length; i++) moves[i]._score = scoreMove(moves[i], killer);
    moves.sort(function (a, b) { return b._score - a._score; });
    return moves;
  }

  function Engine() {
    this.nodes = 0;
    this.deadline = 0;
    this.aborted = false;
    this.killers = [];
  }

  Engine.prototype.quiesce = function (game, alpha, beta) {
    this.nodes++;
    var stand = evaluate(game);
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;

    var moves = orderMoves(game.generateMoves({ legal: false, capturesOnly: true }), null);
    var us = game.turnColor;
    for (var i = 0; i < moves.length; i++) {
      game.makeMove(moves[i]);
      if (game.kingAttacked(us)) { game.undoMove(); continue; }
      var score = -this.quiesce(game, -beta, -alpha);
      game.undoMove();
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  };

  Engine.prototype.search = function (game, depth, alpha, beta, ply) {
    if ((this.nodes & 1023) === 0 && Date.now() > this.deadline) { this.aborted = true; return alpha; }
    this.nodes++;

    /* A repeated position is a draw, so scoring it 0 makes a winning side avoid it
       on its own — this is what stops the engine shuffling into a threefold when
       it is a queen up. */
    if (ply > 0 && game.isRepetition()) return 0;
    if (game.halfMoves >= 100 || game.insufficientMaterial()) return 0;

    var inCheck = game.inCheck();
    if (inCheck) depth++;                       /* check extension */
    if (depth <= 0) return this.quiesce(game, alpha, beta);

    var us = game.turnColor;
    var moves = orderMoves(game.generateMoves({ legal: false }), this.killers[ply]);
    var legal = 0, best = -Infinity;

    for (var i = 0; i < moves.length; i++) {
      game.makeMove(moves[i]);
      if (game.kingAttacked(us)) { game.undoMove(); continue; }
      legal++;
      var score = -this.search(game, depth - 1, -beta, -alpha, ply + 1);
      game.undoMove();
      if (this.aborted) return alpha;
      if (score > best) best = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) {
        if (!moves[i].captured) this.killers[ply] = moves[i];
        return beta;
      }
    }
    if (legal === 0) return inCheck ? -MATE + ply : 0;
    return alpha;
  };

  /* Returns { move, score, depth, nodes }. `skill` 0..3 adds deliberate blunders. */
  Engine.prototype.think = function (game, options) {
    options = options || {};
    var maxDepth = options.depth || 4;
    var timeMs = options.time || 1000;
    var skill = options.skill === undefined ? 3 : options.skill;

    this.nodes = 0;
    this.aborted = false;
    this.killers = [];
    this.deadline = Date.now() + timeMs;

    var root = game.generateMoves();
    if (root.length === 0) return null;

    var best = root[0], bestScore = -Infinity, scored = [];

    for (var depth = 1; depth <= maxDepth; depth++) {
      var alpha = -Infinity, beta = Infinity;
      var iterBest = null, iterScore = -Infinity;
      var iterScored = [];
      orderMoves(root, null);
      /* keep the previous best first */
      root.sort(function (a, b) {
        if (a === best) return -1;
        if (b === best) return 1;
        return b._score - a._score;
      });
      for (var i = 0; i < root.length; i++) {
        game.makeMove(root[i]);
        var score = -this.search(game, depth - 1, -beta, -alpha, 1);
        game.undoMove();
        if (this.aborted) break;
        iterScored.push({ move: root[i], score: score });
        if (score > iterScore) { iterScore = score; iterBest = root[i]; }
        if (score > alpha) alpha = score;
      }
      if (iterBest && !this.aborted) {
        best = iterBest; bestScore = iterScore; scored = iterScored;
      }
      if (this.aborted || Date.now() > this.deadline) break;
      if (Math.abs(bestScore) > MATE - 100) break;   /* forced mate found */
    }

    /* Weaker levels pick from near-best moves instead of always the top one. */
    if (skill < 3 && scored.length > 1) {
      var slack = [0, 250, 90, 0][skill];
      var pool = scored.filter(function (s) { return s.score >= bestScore - slack; });
      if (pool.length) best = pool[Math.floor(Math.random() * pool.length)].move;
    }

    /* Opening variety: for the first few moves, take any move that is essentially
       as good as the best. Without this the engine is deterministic and plays the
       identical game every time. */
    if (options.varyOpenings !== false && game.moveNumber <= 5 && scored.length > 1 &&
        Math.abs(bestScore) < 300) {
      var fresh = scored.filter(function (s) { return s.score >= bestScore - 35; });
      if (fresh.length > 1) best = fresh[Math.floor(Math.random() * fresh.length)].move;
    }

    return { move: best, score: bestScore, nodes: this.nodes, scored: scored };
  };

  var LEVELS = [
    { name: 'Beginner',     depth: 1, time: 200,  skill: 0, elo: '~600' },
    { name: 'Casual',       depth: 2, time: 400,  skill: 1, elo: '~1000' },
    { name: 'Club player',  depth: 4, time: 1200, skill: 2, elo: '~1500' },
    { name: 'Strong',       depth: 7, time: 4000, skill: 3, elo: '~1900' }
  ];

  /* A settled evaluation: play out the captures before reporting a number, so the
     bar does not swing on a capture and swing back on the recapture. */
  function settledEval(game) {
    var e = new Engine();
    e.deadline = Date.now() + 250;
    e.aborted = false;
    e.killers = [];
    e.nodes = 0;
    var score = e.search(game, 2, -Infinity, Infinity, 0);
    return game.turnColor === WHITE ? score : -score;
  }

  global.ChessAI = {
    Engine: Engine,
    evaluate: evaluate,
    settledEval: settledEval,
    LEVELS: LEVELS,
    MATE: MATE,
    VALUE: VALUE
  };
})(window);
