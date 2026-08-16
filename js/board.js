/* board.js — rendering and input for the chessboard. No dependencies. */
(function (global) {
  'use strict';

  var GLYPH = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };
  var FILES = 'abcdefgh';

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  function Board(root, opts) {
    opts = opts || {};
    this.root = root;
    this.orientation = opts.orientation || 'w';
    this.onMove = opts.onMove || function () { return false; };
    this.onSelect = opts.onSelect || null;
    this.interactive = true;
    this.squares = {};
    this.selected = null;
    this.targets = [];
    this.lastMove = null;
    this.checkSquare = null;
    this.position = null;
    this.drag = null;
    this._build();
  }

  Board.prototype._build = function () {
    this.root.innerHTML = '';
    this.root.classList.add('board');
    this.grid = el('div', 'board-grid');
    this.root.appendChild(this.grid);
    this.overlay = el('div', 'promo-overlay hidden');
    this.root.appendChild(this.overlay);
    this._layout();

    var self = this;
    this.grid.addEventListener('pointerdown', function (e) { self._down(e); });
    window.addEventListener('pointermove', function (e) { self._move(e); });
    window.addEventListener('pointerup', function (e) { self._up(e); });
  };

  Board.prototype._layout = function () {
    this.grid.innerHTML = '';
    this.squares = {};
    var ranks = this.orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
    var files = this.orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        var name = FILES.charAt(files[f]) + ranks[r];
        var dark = (files[f] + ranks[r]) % 2 === 0;
        var sq = el('div', 'sq ' + (dark ? 'dark' : 'light'));
        sq.dataset.square = name;
        if (f === 0) {
          var rl = el('span', 'coord rank');
          rl.textContent = ranks[r];
          sq.appendChild(rl);
        }
        if (r === 7) {
          var fl = el('span', 'coord file');
          fl.textContent = FILES.charAt(files[f]);
          sq.appendChild(fl);
        }
        this.grid.appendChild(sq);
        this.squares[name] = sq;
      }
    }
  };

  Board.prototype.setOrientation = function (side) {
    this.orientation = side;
    this._layout();
    if (this.position) this.render(this.position, { skipAnimation: true });
  };

  Board.prototype.flip = function () {
    this.setOrientation(this.orientation === 'w' ? 'b' : 'w');
  };

  /* game: a Chess instance. opts: { lastMove:{from,to}, check:'e1', skipAnimation } */
  Board.prototype.render = function (game, opts) {
    opts = opts || {};
    this.position = game;
    if (opts.lastMove !== undefined) this.lastMove = opts.lastMove;
    if (opts.check !== undefined) this.checkSquare = opts.check;

    var grid = game.grid();
    var name, sq, cell, piece;
    for (name in this.squares) {
      sq = this.squares[name];
      var old = sq.querySelector('.piece');
      if (old) sq.removeChild(old);
      sq.classList.remove('last-from', 'last-to', 'selected', 'check', 'target', 'target-capture');
    }
    for (var r = 0; r < 8; r++) {
      for (var f = 0; f < 8; f++) {
        cell = grid[r][f];
        if (!cell.type) continue;
        sq = this.squares[cell.square];
        piece = el('div', 'piece ' + (cell.color === 'w' ? 'white' : 'black'));
        piece.textContent = GLYPH[cell.type];
        piece.dataset.square = cell.square;
        piece.dataset.color = cell.color;
        sq.appendChild(piece);
      }
    }
    if (this.lastMove) {
      if (this.squares[this.lastMove.from]) this.squares[this.lastMove.from].classList.add('last-from');
      if (this.squares[this.lastMove.to]) this.squares[this.lastMove.to].classList.add('last-to');
      if (!opts.skipAnimation) this._animate(this.lastMove);
    }
    if (this.checkSquare && this.squares[this.checkSquare]) {
      this.squares[this.checkSquare].classList.add('check');
    }
    this._paintSelection();
  };

  Board.prototype._animate = function (move) {
    var fromSq = this.squares[move.from], toSq = this.squares[move.to];
    if (!fromSq || !toSq) return;
    var piece = toSq.querySelector('.piece');
    if (!piece) return;
    var a = fromSq.getBoundingClientRect(), b = toSq.getBoundingClientRect();
    piece.style.transition = 'none';
    piece.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)';
    /* force reflow, then slide home */
    void piece.offsetWidth;
    piece.style.transition = 'transform .18s cubic-bezier(.2,.8,.3,1)';
    piece.style.transform = '';
  };

  Board.prototype.setTargets = function (from, targets) {
    this.selected = from;
    this.targets = targets || [];
    this._paintSelection();
  };

  Board.prototype.clearSelection = function () {
    this.selected = null;
    this.targets = [];
    this._paintSelection();
  };

  Board.prototype._paintSelection = function () {
    for (var name in this.squares) {
      this.squares[name].classList.remove('selected', 'target', 'target-capture');
    }
    if (this.selected && this.squares[this.selected]) {
      this.squares[this.selected].classList.add('selected');
    }
    for (var i = 0; i < this.targets.length; i++) {
      var t = this.targets[i];
      var sq = this.squares[t.to];
      if (!sq) continue;
      sq.classList.add(t.capture ? 'target-capture' : 'target');
    }
  };

  Board.prototype.flash = function (square, kind) {
    var sq = this.squares[square];
    if (!sq) return;
    sq.classList.remove('flash-good', 'flash-bad');
    void sq.offsetWidth;
    sq.classList.add(kind === 'bad' ? 'flash-bad' : 'flash-good');
    setTimeout(function () { sq.classList.remove('flash-good', 'flash-bad'); }, 700);
  };

  Board.prototype._squareFromPoint = function (x, y) {
    var rect = this.grid.getBoundingClientRect();
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
    /* measure both axes — never assume the rendered board is exactly square */
    var col = Math.floor((x - rect.left) / (rect.width / 8));
    var row = Math.floor((y - rect.top) / (rect.height / 8));
    col = Math.max(0, Math.min(7, col));
    row = Math.max(0, Math.min(7, row));
    var ranks = this.orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
    var files = this.orientation === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    return FILES.charAt(files[col]) + ranks[row];
  };

  Board.prototype._down = function (e) {
    if (!this.interactive) return;
    var square = this._squareFromPoint(e.clientX, e.clientY);
    if (!square) return;
    e.preventDefault();

    /* completing a move onto a highlighted target */
    if (this.selected && this.selected !== square) {
      for (var i = 0; i < this.targets.length; i++) {
        if (this.targets[i].to === square) {
          var from = this.selected;
          this.clearSelection();
          this.onMove(from, square);
          return;
        }
      }
    }
    if (this.selected === square) { this.clearSelection(); return; }

    /* onSelect runs even for empty squares — the vision trainer works on bare
       squares, and piece modes reject them anyway by returning false. */
    var piece = this.squares[square].querySelector('.piece');
    if (this.onSelect && this.onSelect(square) === false) { this.clearSelection(); return; }
    if (!piece) { this.clearSelection(); return; }

    /* start a drag */
    var rect = piece.getBoundingClientRect();
    this.drag = {
      from: square,
      node: piece,
      dx: e.clientX - (rect.left + rect.width / 2),
      dy: e.clientY - (rect.top + rect.height / 2),
      moved: false
    };
    piece.classList.add('dragging');
  };

  Board.prototype._move = function (e) {
    if (!this.drag) return;
    this.drag.moved = true;
    this.drag.node.style.transition = 'none';
    var sq = this.squares[this.drag.from].getBoundingClientRect();
    var cx = sq.left + sq.width / 2, cy = sq.top + sq.height / 2;
    this.drag.node.style.transform =
      'translate(' + (e.clientX - cx - this.drag.dx) + 'px,' + (e.clientY - cy - this.drag.dy) + 'px)';
  };

  Board.prototype._up = function (e) {
    if (!this.drag) return;
    var d = this.drag;
    this.drag = null;
    d.node.classList.remove('dragging');
    d.node.style.transition = '';
    d.node.style.transform = '';
    var target = this._squareFromPoint(e.clientX, e.clientY);
    if (d.moved && target && target !== d.from) {
      var ok = false;
      for (var i = 0; i < this.targets.length; i++) if (this.targets[i].to === target) ok = true;
      this.clearSelection();
      if (ok) this.onMove(d.from, target);
      return;
    }
    /* treat as a click: keep the selection painted by onSelect */
  };

  /* Returns a promise-ish via callback: pick('w', cb) */
  Board.prototype.askPromotion = function (color, cb) {
    var self = this;
    this.overlay.innerHTML = '';
    this.overlay.classList.remove('hidden');
    var card = el('div', 'promo-card');
    var label = el('div', 'promo-label');
    label.textContent = 'Promote to';
    card.appendChild(label);
    var row = el('div', 'promo-row');
    ['q', 'r', 'b', 'n'].forEach(function (t) {
      var btn = el('button', 'promo-btn piece ' + (color === 'w' ? 'white' : 'black'));
      btn.textContent = GLYPH[t];
      btn.addEventListener('click', function () {
        self.overlay.classList.add('hidden');
        cb(t);
      });
      row.appendChild(btn);
    });
    card.appendChild(row);
    this.overlay.appendChild(card);
  };

  Board.GLYPH = GLYPH;
  global.Board = Board;
})(window);
