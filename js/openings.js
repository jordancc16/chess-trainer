/* openings.js — main lines to drill, in SAN. `notes` are keyed by ply index (0-based). */
(function (global) {
  'use strict';

  var OPENINGS = [
    {
      id: 'italian',
      name: 'Italian Game',
      eco: 'C50',
      side: 'w',
      blurb: 'The oldest opening in the book. Fast development, eyes on f7, fight for the centre with c3 and d4.',
      moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+'],
      notes: {
        4: 'Bc4 points straight at f7, the square only the king defends.',
        6: 'c3 prepares d4 — the whole point of the Italian is this pawn duo.',
        8: 'd4! Now the centre opens while you are the better developed side.'
      }
    },
    {
      id: 'ruy',
      name: 'Ruy Lopez, Closed',
      eco: 'C84',
      side: 'w',
      blurb: 'Pressure c6, castle, build the big centre. The main battleground of classical chess.',
      moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O'],
      notes: {
        4: 'Bb5 attacks the defender of e5 rather than e5 itself.',
        8: 'Castling is fine even though Nxe4 looks tempting for Black — Re1 wins the pawn back.',
        10: 'Re1 defends e4 and prepares d4.'
      }
    },
    {
      id: 'najdorf',
      name: 'Sicilian Defence, Najdorf',
      eco: 'B90',
      side: 'b',
      blurb: "Black's sharpest answer to 1.e4. ...a6 takes b5 away from White's pieces before anything else.",
      moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
      notes: {
        1: '...c5 fights for d4 without blocking the c8 bishop.',
        5: '...cxd4 trades a wing pawn for a centre pawn — the structural point of the Sicilian.',
        9: '...a6 is the Najdorf move: control b5, prepare ...e5 or ...e6.'
      }
    },
    {
      id: 'french',
      name: 'French Defence, Classical',
      eco: 'C11',
      side: 'b',
      blurb: 'Solid and closed. Black accepts a passive light-squared bishop in return for a rock-solid pawn chain.',
      moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e5', 'Nfd7'],
      notes: {
        1: '...e6 prepares ...d5 with support, unlike the Scandinavian.',
        7: '...Be7 breaks the pin quietly instead of grabbing space.',
        9: '...Nfd7 retreats to fight for e5 and c5 — the knight was doing nothing on f6 anyway.'
      }
    },
    {
      id: 'qgd',
      name: "Queen's Gambit Declined",
      eco: 'D35',
      side: 'b',
      blurb: 'Black holds the centre with ...e6 and ...d5. Not a real gambit — 2...dxc4 cannot be held.',
      moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O'],
      notes: {
        3: '...e6 declines the pawn and keeps a strong point on d5.',
        8: 'e3 looks modest but it frees the f1 bishop without giving up the centre.'
      }
    },
    {
      id: 'carokann',
      name: 'Caro-Kann, Classical',
      eco: 'B18',
      side: 'b',
      blurb: 'Like the French, but the light-squared bishop gets out first. Very hard to crack.',
      moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'],
      notes: {
        1: '...c6 supports ...d5 while leaving the c8 bishop its diagonal.',
        7: '...Bf5 is the whole idea: the "bad" French bishop is developed outside the pawn chain.'
      }
    },
    {
      id: 'london',
      name: 'London System',
      eco: 'D02',
      side: 'w',
      blurb: 'A setup, not a line: Bf4, e3, Nf3, c3, Bd3. Easy to learn and hard to punish.',
      moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4', 'e6', 'e3', 'Bd6', 'Bg3', 'O-O'],
      notes: {
        4: 'Bf4 goes out before e3 locks it in — that is the one move order rule of the London.',
        8: 'Bg3 avoids the trade and keeps the bishop pointing at h2-b8.'
      }
    },
    {
      id: 'kid',
      name: "King's Indian Defence",
      eco: 'E60',
      side: 'b',
      blurb: 'Give White the centre, fianchetto, castle, then blow it up with ...e5 or ...c5.',
      moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5'],
      notes: {
        3: '...g6 prepares the fianchetto — the g7 bishop will fire down the long diagonal all game.',
        11: '...e5! The thematic counterstrike. Black has let White build the centre precisely to attack it.'
      }
    },
    {
      id: 'scandi',
      name: 'Scandinavian Defence',
      eco: 'B01',
      side: 'b',
      blurb: 'Immediate central challenge. The queen comes out early but does not get trapped.',
      moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6'],
      notes: {
        3: '...Qxd5 accepts a tempo loss to remove the e-pawn entirely.',
        5: '...Qa5 keeps the queen active and out of the way of Nc3-b5 ideas.'
      }
    },
    {
      id: 'vienna',
      name: 'Vienna Game',
      eco: 'C29',
      side: 'w',
      blurb: 'A delayed King\'s Gambit. Nc3 first, then f4 with the extra defender already in place.',
      moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5'],
      notes: {
        2: 'Nc3 develops and supports e4 before committing the f-pawn.',
        5: '...d5! The only good reply — grabbing on f4 or e4 immediately runs into trouble.'
      }
    }
  ];

  global.OPENINGS = OPENINGS;
})(window);
