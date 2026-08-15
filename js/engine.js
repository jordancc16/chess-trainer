/* engine.js — a self-contained 0x88 chess engine.
   Public API is deliberately close to chess.js so the UI code reads familiarly. */
(function (global) {
  'use strict';

  var EMPTY = 0;
  var PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;
  var WHITE = 8, BLACK = 16;
  var COLOR_MASK = 24, TYPE_MASK = 7;

  var KNIGHT_OFFSETS = [-33, -31, -18, -14, 14, 18, 31, 33];
  var BISHOP_OFFSETS = [-17, -15, 15, 17];
  var ROOK_OFFSETS = [-16, -1, 1, 16];
  var KING_OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];

  var FLAG_CAPTURE = 1, FLAG_BIGPAWN = 2, FLAG_EP = 4,
      FLAG_PROMO = 8, FLAG_KSIDE = 16, FLAG_QSIDE = 32;

  var C_WK = 1, C_WQ = 2, C_BK = 4, C_BQ = 8;

  var SYMBOLS = { 1: 'p', 2: 'n', 3: 'b', 4: 'r', 5: 'q', 6: 'k' };
  var TYPE_OF_CHAR = { p: PAWN, n: KNIGHT, b: BISHOP, r: ROOK, q: QUEEN, k: KING };

  /* Rights that survive a piece leaving / landing on a square. */
  var CASTLE_CLEAR = {};
  CASTLE_CLEAR[0] = C_WQ;    // a1
  CASTLE_CLEAR[7] = C_WK;    // h1
  CASTLE_CLEAR[4] = C_WK | C_WQ; // e1
  CASTLE_CLEAR[112] = C_BQ;  // a8
  CASTLE_CLEAR[119] = C_BK;  // h8
  CASTLE_CLEAR[116] = C_BK | C_BQ; // e8

  function rankOf(sq) { return sq >> 4; }
  function fileOf(sq) { return sq & 15; }
  function onBoard(sq) { return (sq & 0x88) === 0; }
  function algebraic(sq) { return 'abcdefgh'.charAt(fileOf(sq)) + (rankOf(sq) + 1); }
  function toSquare(name) {
    if (typeof name === 'number') return name;
    return (name.charCodeAt(0) - 97) + (parseInt(name.charAt(1), 10) - 1) * 16;
  }
  function swapColor(c) { return c === WHITE ? BLACK : WHITE; }

  var DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  function Chess(fen) {
    this.board = new Array(128);
    this.kings = {};
    this.load(fen || DEFAULT_FEN);
  }

  Chess.prototype.clear = function () {
    for (var i = 0; i < 128; i++) this.board[i] = EMPTY;
    this.kings[WHITE] = -1;
    this.kings[BLACK] = -1;
    this.turnColor = WHITE;
    this.castling = 0;
    this.epSquare = -1;
    this.halfMoves = 0;
    this.moveNumber = 1;
    this.stack = [];
    this.positions = [];
  };

  Chess.prototype.load = function (fen) {
    this.clear();
    var parts = fen.trim().split(/\s+/);
    var rows = parts[0].split('/');
    if (rows.length !== 8) throw new Error('Bad FEN: ' + fen);
    for (var r = 0; r < 8; r++) {
      var sq = (7 - r) * 16;
      var row = rows[r];
      for (var i = 0; i < row.length; i++) {
        var ch = row.charAt(i);
        if (ch >= '1' && ch <= '8') {
          sq += parseInt(ch, 10);
        } else {
          var color = ch === ch.toUpperCase() ? WHITE : BLACK;
          var type = TYPE_OF_CHAR[ch.toLowerCase()];
          if (!type) throw new Error('Bad FEN piece: ' + ch);
          this.put(type | color, sq);
          sq++;
        }
      }
    }
    this.turnColor = (parts[1] === 'b') ? BLACK : WHITE;
    var rights = parts[2] || '-';
    if (rights.indexOf('K') >= 0) this.castling |= C_WK;
    if (rights.indexOf('Q') >= 0) this.castling |= C_WQ;
    if (rights.indexOf('k') >= 0) this.castling |= C_BK;
    if (rights.indexOf('q') >= 0) this.castling |= C_BQ;
    this.epSquare = (parts[3] && parts[3] !== '-') ? toSquare(parts[3]) : -1;
    this.halfMoves = parts[4] ? parseInt(parts[4], 10) : 0;
    this.moveNumber = parts[5] ? parseInt(parts[5], 10) : 1;
    this.positions = [this.positionKey()];
    return this;
  };

  Chess.prototype.put = function (piece, sq) {
    this.board[sq] = piece;
    if ((piece & TYPE_MASK) === KING) this.kings[piece & COLOR_MASK] = sq;
  };

  Chess.prototype.fen = function () {
    var out = '';
    for (var r = 7; r >= 0; r--) {
      var empty = 0;
      for (var f = 0; f < 8; f++) {
        var p = this.board[r * 16 + f];
        if (p === EMPTY) { empty++; continue; }
        if (empty) { out += empty; empty = 0; }
        var ch = SYMBOLS[p & TYPE_MASK];
        out += (p & COLOR_MASK) === WHITE ? ch.toUpperCase() : ch;
      }
      if (empty) out += empty;
      if (r > 0) out += '/';
    }
    var rights = '';
    if (this.castling & C_WK) rights += 'K';
    if (this.castling & C_WQ) rights += 'Q';
    if (this.castling & C_BK) rights += 'k';
    if (this.castling & C_BQ) rights += 'q';
    return out + ' ' + (this.turnColor === WHITE ? 'w' : 'b') +
      ' ' + (rights || '-') +
      ' ' + (this.epSquare >= 0 ? algebraic(this.epSquare) : '-') +
      ' ' + this.halfMoves + ' ' + this.moveNumber;
  };

  /* Board + side to move + rights + ep — enough to detect repetition. */
  Chess.prototype.positionKey = function () {
    var f = this.fen().split(' ');
    return f[0] + ' ' + f[1] + ' ' + f[2] + ' ' + f[3];
  };

  Chess.prototype.turn = function () { return this.turnColor === WHITE ? 'w' : 'b'; };

  Chess.prototype.get = function (sq) {
    var p = this.board[toSquare(sq)];
    if (!p) return null;
    return { type: SYMBOLS[p & TYPE_MASK], color: (p & COLOR_MASK) === WHITE ? 'w' : 'b' };
  };

  /* 8x8 grid, rank 8 first — matches how the UI draws it. */
  Chess.prototype.grid = function () {
    var out = [];
    for (var r = 7; r >= 0; r--) {
      var row = [];
      for (var f = 0; f < 8; f++) {
        var sq = r * 16 + f;
        var p = this.board[sq];
        row.push(p ? { type: SYMBOLS[p & TYPE_MASK], color: (p & COLOR_MASK) === WHITE ? 'w' : 'b', square: algebraic(sq) }
                   : { type: null, color: null, square: algebraic(sq) });
      }
      out.push(row);
    }
    return out;
  };

  Chess.prototype.isAttacked = function (target, byColor) {
    var b = this.board, i, sq, p, off;

    /* pawns */
    if (byColor === WHITE) {
      if (onBoard(target - 15) && b[target - 15] === (PAWN | WHITE)) return true;
      if (onBoard(target - 17) && b[target - 17] === (PAWN | WHITE)) return true;
    } else {
      if (onBoard(target + 15) && b[target + 15] === (PAWN | BLACK)) return true;
      if (onBoard(target + 17) && b[target + 17] === (PAWN | BLACK)) return true;
    }
    /* knights */
    for (i = 0; i < 8; i++) {
      sq = target + KNIGHT_OFFSETS[i];
      if (onBoard(sq) && b[sq] === (KNIGHT | byColor)) return true;
    }
    /* king */
    for (i = 0; i < 8; i++) {
      sq = target + KING_OFFSETS[i];
      if (onBoard(sq) && b[sq] === (KING | byColor)) return true;
    }
    /* bishops / queens */
    for (i = 0; i < 4; i++) {
      off = BISHOP_OFFSETS[i];
      sq = target + off;
      while (onBoard(sq)) {
        p = b[sq];
        if (p) {
          if ((p & COLOR_MASK) === byColor) {
            var t = p & TYPE_MASK;
            if (t === BISHOP || t === QUEEN) return true;
          }
          break;
        }
        sq += off;
      }
    }
    /* rooks / queens */
    for (i = 0; i < 4; i++) {
      off = ROOK_OFFSETS[i];
      sq = target + off;
      while (onBoard(sq)) {
        p = b[sq];
        if (p) {
          if ((p & COLOR_MASK) === byColor) {
            var t2 = p & TYPE_MASK;
            if (t2 === ROOK || t2 === QUEEN) return true;
          }
          break;
        }
        sq += off;
      }
    }
    return false;
  };

  Chess.prototype.kingAttacked = function (color) {
    var k = this.kings[color];
    if (k < 0) return false;
    return this.isAttacked(k, swapColor(color));
  };

  Chess.prototype.inCheck = function () { return this.kingAttacked(this.turnColor); };

  function buildMove(board, from, to, flags, promo) {
    var move = {
      from: from,
      to: to,
      piece: board[from],
      captured: 0,
      promotion: promo || 0,
      flags: flags || 0
    };
    if (flags & FLAG_EP) {
      move.captured = board[to + ((board[from] & COLOR_MASK) === WHITE ? -16 : 16)];
    } else if (board[to]) {
      move.captured = board[to];
      move.flags |= FLAG_CAPTURE;
    }
    return move;
  }

  /* opts: { square: 'e2' | 0x88 index, legal: bool (default true), capturesOnly: bool } */
  Chess.prototype.generateMoves = function (opts) {
    opts = opts || {};
    var legal = opts.legal !== false;
    var b = this.board;
    var us = this.turnColor, them = swapColor(us);
    var moves = [];
    var first = 0, last = 119;
    var single = false;
    if (opts.square !== undefined && opts.square !== null) {
      first = last = toSquare(opts.square);
      single = true;
      if (!onBoard(first)) return [];
    }
    var secondRank = us === WHITE ? 1 : 6;
    var promoRank = us === WHITE ? 7 : 0;
    var pawnDir = us === WHITE ? 16 : -16;

    for (var from = first; from <= last; from++) {
      if (!onBoard(from)) { from += 7; continue; }
      var piece = b[from];
      if (!piece || (piece & COLOR_MASK) !== us) continue;
      var type = piece & TYPE_MASK;
      var i, to, off, sq;

      if (type === PAWN) {
        /* single + double push */
        if (!opts.capturesOnly) {
          to = from + pawnDir;
          if (onBoard(to) && !b[to]) {
            addPawnMove(moves, b, from, to, 0, promoRank);
            var to2 = from + 2 * pawnDir;
            if (rankOf(from) === secondRank && !b[to2]) {
              moves.push(buildMove(b, from, to2, FLAG_BIGPAWN));
            }
          }
        }
        /* captures */
        var caps = us === WHITE ? [15, 17] : [-15, -17];
        for (i = 0; i < 2; i++) {
          to = from + caps[i];
          if (!onBoard(to)) continue;
          if (b[to] && (b[to] & COLOR_MASK) === them) {
            addPawnMove(moves, b, from, to, 0, promoRank);
          } else if (to === this.epSquare) {
            moves.push(buildMove(b, from, to, FLAG_EP));
          }
        }
      } else if (type === KNIGHT || type === KING) {
        var offs = type === KNIGHT ? KNIGHT_OFFSETS : KING_OFFSETS;
        for (i = 0; i < 8; i++) {
          to = from + offs[i];
          if (!onBoard(to)) continue;
          if (b[to]) {
            if ((b[to] & COLOR_MASK) === them) moves.push(buildMove(b, from, to, FLAG_CAPTURE));
          } else if (!opts.capturesOnly) {
            moves.push(buildMove(b, from, to, 0));
          }
        }
      } else {
        var slide = type === BISHOP ? BISHOP_OFFSETS : type === ROOK ? ROOK_OFFSETS : KING_OFFSETS;
        for (i = 0; i < slide.length; i++) {
          off = slide[i];
          sq = from + off;
          while (onBoard(sq)) {
            if (b[sq]) {
              if ((b[sq] & COLOR_MASK) === them) moves.push(buildMove(b, from, sq, FLAG_CAPTURE));
              break;
            }
            if (!opts.capturesOnly) moves.push(buildMove(b, from, sq, 0));
            sq += off;
          }
        }
      }
    }

    /* castling */
    if (!opts.capturesOnly && (!single || first === this.kings[us])) {
      var kingSq = this.kings[us];
      if (kingSq >= 0 && !this.isAttacked(kingSq, them)) {
        var kFlag = us === WHITE ? C_WK : C_BK;
        var qFlag = us === WHITE ? C_WQ : C_BQ;
        if (this.castling & kFlag) {
          if (!b[kingSq + 1] && !b[kingSq + 2] &&
              !this.isAttacked(kingSq + 1, them) && !this.isAttacked(kingSq + 2, them)) {
            moves.push(buildMove(b, kingSq, kingSq + 2, FLAG_KSIDE));
          }
        }
        if (this.castling & qFlag) {
          if (!b[kingSq - 1] && !b[kingSq - 2] && !b[kingSq - 3] &&
              !this.isAttacked(kingSq - 1, them) && !this.isAttacked(kingSq - 2, them)) {
            moves.push(buildMove(b, kingSq, kingSq - 2, FLAG_QSIDE));
          }
        }
      }
    }

    if (!legal) return moves;

    var legalMoves = [];
    for (var m = 0; m < moves.length; m++) {
      this.makeMove(moves[m]);
      if (!this.kingAttacked(us)) legalMoves.push(moves[m]);
      this.undoMove();
    }
    return legalMoves;
  };

  function addPawnMove(moves, b, from, to, flags, promoRank) {
    if (rankOf(to) === promoRank) {
      var promos = [QUEEN, ROOK, BISHOP, KNIGHT];
      for (var i = 0; i < 4; i++) {
        moves.push(buildMove(b, from, to, flags | FLAG_PROMO, promos[i]));
      }
    } else {
      moves.push(buildMove(b, from, to, flags));
    }
  }

  Chess.prototype.makeMove = function (move) {
    var b = this.board;
    var us = this.turnColor, them = swapColor(us);

    this.stack.push({
      move: move,
      castling: this.castling,
      epSquare: this.epSquare,
      halfMoves: this.halfMoves,
      moveNumber: this.moveNumber,
      kingW: this.kings[WHITE],
      kingB: this.kings[BLACK]
    });

    b[move.to] = b[move.from];
    b[move.from] = EMPTY;

    if (move.flags & FLAG_EP) {
      b[move.to + (us === WHITE ? -16 : 16)] = EMPTY;
    }
    if (move.flags & FLAG_PROMO) {
      b[move.to] = move.promotion | us;
    }
    if ((move.piece & TYPE_MASK) === KING) {
      this.kings[us] = move.to;
      if (move.flags & FLAG_KSIDE) {
        b[move.to - 1] = b[move.to + 1];
        b[move.to + 1] = EMPTY;
      } else if (move.flags & FLAG_QSIDE) {
        b[move.to + 1] = b[move.to - 2];
        b[move.to - 2] = EMPTY;
      }
      this.castling &= ~(us === WHITE ? (C_WK | C_WQ) : (C_BK | C_BQ));
    }
    if (CASTLE_CLEAR[move.from]) this.castling &= ~CASTLE_CLEAR[move.from];
    if (CASTLE_CLEAR[move.to]) this.castling &= ~CASTLE_CLEAR[move.to];

    this.epSquare = (move.flags & FLAG_BIGPAWN) ? (move.from + (us === WHITE ? 16 : -16)) : -1;

    if ((move.piece & TYPE_MASK) === PAWN || move.captured) this.halfMoves = 0;
    else this.halfMoves++;

    if (us === BLACK) this.moveNumber++;
    this.turnColor = them;
  };

  Chess.prototype.undoMove = function () {
    var prev = this.stack.pop();
    if (!prev) return null;
    var move = prev.move;
    var b = this.board;
    var us = (move.piece & COLOR_MASK);

    this.castling = prev.castling;
    this.epSquare = prev.epSquare;
    this.halfMoves = prev.halfMoves;
    this.moveNumber = prev.moveNumber;
    this.kings[WHITE] = prev.kingW;
    this.kings[BLACK] = prev.kingB;
    this.turnColor = us;

    b[move.from] = move.piece;
    b[move.to] = EMPTY;

    if (move.flags & FLAG_EP) {
      b[move.to + (us === WHITE ? -16 : 16)] = move.captured;
    } else if (move.captured) {
      b[move.to] = move.captured;
    }
    if (move.flags & FLAG_KSIDE) {
      b[move.to + 1] = b[move.to - 1];
      b[move.to - 1] = EMPTY;
    } else if (move.flags & FLAG_QSIDE) {
      b[move.to - 2] = b[move.to + 1];
      b[move.to + 1] = EMPTY;
    }
    return move;
  };

  Chess.prototype.san = function (move, movesCache) {
    if (move.flags & FLAG_KSIDE) return this.decorate('O-O', move);
    if (move.flags & FLAG_QSIDE) return this.decorate('O-O-O', move);
    var type = move.piece & TYPE_MASK;
    var out = '';
    if (type === PAWN) {
      if (move.flags & (FLAG_CAPTURE | FLAG_EP)) out += 'abcdefgh'.charAt(fileOf(move.from)) + 'x';
      out += algebraic(move.to);
      if (move.flags & FLAG_PROMO) out += '=' + SYMBOLS[move.promotion].toUpperCase();
      return this.decorate(out, move);
    }
    out += SYMBOLS[type].toUpperCase();
    /* disambiguation */
    var all = movesCache || this.generateMoves();
    var sameFile = false, sameRank = false, ambiguous = false;
    for (var i = 0; i < all.length; i++) {
      var m = all[i];
      if (m.from === move.from || m.to !== move.to) continue;
      if ((m.piece & TYPE_MASK) !== type || (m.piece & COLOR_MASK) !== (move.piece & COLOR_MASK)) continue;
      ambiguous = true;
      if (fileOf(m.from) === fileOf(move.from)) sameFile = true;
      if (rankOf(m.from) === rankOf(move.from)) sameRank = true;
    }
    if (ambiguous) {
      if (!sameFile) out += 'abcdefgh'.charAt(fileOf(move.from));
      else if (!sameRank) out += (rankOf(move.from) + 1);
      else out += algebraic(move.from);
    }
    if (move.flags & (FLAG_CAPTURE | FLAG_EP)) out += 'x';
    out += algebraic(move.to);
    return this.decorate(out, move);
  };

  Chess.prototype.decorate = function (san, move) {
    this.makeMove(move);
    if (this.kingAttacked(this.turnColor)) {
      san += this.generateMoves().length === 0 ? '#' : '+';
    }
    this.undoMove();
    return san;
  };

  /* Accepts 'e2e4', 'e7e8q', {from,to,promotion}, or a SAN string. */
  Chess.prototype.move = function (input) {
    var moves = this.generateMoves();
    var found = null, i;
    if (typeof input === 'string') {
      var uci = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(input);
      if (uci) {
        var from = toSquare(uci[1]), to = toSquare(uci[2]);
        for (i = 0; i < moves.length; i++) {
          if (moves[i].from === from && moves[i].to === to) {
            if (moves[i].flags & FLAG_PROMO) {
              if (SYMBOLS[moves[i].promotion] !== (uci[3] || 'q')) continue;
            }
            found = moves[i]; break;
          }
        }
      } else {
        var want = input.replace(/[+#?!]+$/, '');
        for (i = 0; i < moves.length; i++) {
          if (this.san(moves[i], moves).replace(/[+#?!]+$/, '') === want) { found = moves[i]; break; }
        }
      }
    } else if (input && input.from !== undefined) {
      var f = toSquare(input.from), t = toSquare(input.to);
      for (i = 0; i < moves.length; i++) {
        if (moves[i].from === f && moves[i].to === t) {
          if (moves[i].flags & FLAG_PROMO) {
            if (SYMBOLS[moves[i].promotion] !== (input.promotion || 'q')) continue;
          }
          found = moves[i]; break;
        }
      }
    }
    if (!found) return null;
    var san = this.san(found, moves);
    this.makeMove(found);
    this.positions.push(this.positionKey());
    found.san = san;
    found.uci = algebraic(found.from) + algebraic(found.to) +
      ((found.flags & FLAG_PROMO) ? SYMBOLS[found.promotion] : '');
    found.color = (found.piece & COLOR_MASK) === WHITE ? 'w' : 'b';
    return found;
  };

  Chess.prototype.undo = function () {
    var m = this.undoMove();
    if (m) this.positions.pop();
    return m;
  };

  Chess.prototype.moves = function (opts) {
    opts = opts || {};
    var list = this.generateMoves(opts);
    if (opts.verbose) {
      var self = this;
      return list.map(function (m) {
        return {
          from: algebraic(m.from),
          to: algebraic(m.to),
          uci: algebraic(m.from) + algebraic(m.to) + ((m.flags & FLAG_PROMO) ? SYMBOLS[m.promotion] : ''),
          san: self.san(m, list),
          promotion: (m.flags & FLAG_PROMO) ? SYMBOLS[m.promotion] : null,
          captured: m.captured ? SYMBOLS[m.captured & TYPE_MASK] : null,
          _raw: m
        };
      });
    }
    return list;
  };

  Chess.prototype.isCheckmate = function () {
    return this.inCheck() && this.generateMoves().length === 0;
  };
  Chess.prototype.isStalemate = function () {
    return !this.inCheck() && this.generateMoves().length === 0;
  };
  Chess.prototype.insufficientMaterial = function () {
    var counts = {}, bishops = [], total = 0;
    for (var sq = 0; sq <= 119; sq++) {
      if (!onBoard(sq)) { sq += 7; continue; }
      var p = this.board[sq];
      if (!p) continue;
      total++;
      var t = p & TYPE_MASK;
      counts[t] = (counts[t] || 0) + 1;
      if (t === BISHOP) bishops.push((rankOf(sq) + fileOf(sq)) % 2);
    }
    if (total === 2) return true;                       // K vs K
    if (total === 3 && (counts[BISHOP] === 1 || counts[KNIGHT] === 1)) return true;
    if (total === 2 + bishops.length && bishops.length === counts[BISHOP]) {
      var sum = bishops.reduce(function (a, b) { return a + b; }, 0);
      if (bishops.length > 1 && (sum === 0 || sum === bishops.length)) return true;
    }
    return false;
  };
  Chess.prototype.isThreefold = function () {
    var key = this.positionKey(), n = 0;
    for (var i = 0; i < this.positions.length; i++) if (this.positions[i] === key) n++;
    return n >= 3;
  };
  Chess.prototype.isDraw = function () {
    return this.isStalemate() || this.halfMoves >= 100 ||
      this.insufficientMaterial() || this.isThreefold();
  };
  Chess.prototype.isGameOver = function () { return this.isCheckmate() || this.isDraw(); };

  Chess.prototype.gameResult = function () {
    if (this.isCheckmate()) return this.turnColor === WHITE ? 'Black wins by checkmate' : 'White wins by checkmate';
    if (this.isStalemate()) return 'Draw by stalemate';
    if (this.halfMoves >= 100) return 'Draw by the fifty-move rule';
    if (this.insufficientMaterial()) return 'Draw by insufficient material';
    if (this.isThreefold()) return 'Draw by repetition';
    return null;
  };

  Chess.prototype.history = function () {
    return this.stack.map(function (h) { return h.move; });
  };

  Chess.prototype.clone = function () { return new Chess(this.fen()); };

  Chess.prototype.perft = function (depth) {
    if (depth === 0) return 1;
    var moves = this.generateMoves({ legal: false });
    var nodes = 0, us = this.turnColor;
    for (var i = 0; i < moves.length; i++) {
      this.makeMove(moves[i]);
      if (!this.kingAttacked(us)) {
        nodes += depth === 1 ? 1 : this.perft(depth - 1);
      }
      this.undoMove();
    }
    return nodes;
  };

  Chess.WHITE = WHITE; Chess.BLACK = BLACK;
  Chess.PAWN = PAWN; Chess.KNIGHT = KNIGHT; Chess.BISHOP = BISHOP;
  Chess.ROOK = ROOK; Chess.QUEEN = QUEEN; Chess.KING = KING;
  Chess.TYPE_MASK = TYPE_MASK; Chess.COLOR_MASK = COLOR_MASK;
  Chess.FLAG_CAPTURE = FLAG_CAPTURE; Chess.FLAG_PROMO = FLAG_PROMO;
  Chess.FLAG_EP = FLAG_EP; Chess.FLAG_KSIDE = FLAG_KSIDE; Chess.FLAG_QSIDE = FLAG_QSIDE;
  Chess.DEFAULT_FEN = DEFAULT_FEN;
  Chess.algebraic = algebraic;
  Chess.toSquare = toSquare;
  Chess.onBoard = onBoard;
  Chess.rankOf = rankOf;
  Chess.fileOf = fileOf;
  Chess.SYMBOLS = SYMBOLS;

  global.Chess = Chess;
})(window);
