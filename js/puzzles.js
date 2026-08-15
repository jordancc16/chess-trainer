/* puzzles.js — the tactics set.
   `moves` is the full solution line in UCI: even indices are the solver's moves,
   odd indices are the replies played automatically. Every entry is checked by
   validate.html (legality of each move + the claimed mate). */
(function (global) {
  'use strict';

  var PUZZLES = [
    {
      id: 'p01', rating: 400, themes: ['mate in 1', 'rook mate'],
      fen: '7k/8/6K1/8/8/8/8/R7 w - - 0 1',
      moves: ['a1a8'],
      goal: 'mate',
      hint: 'Your king already covers g7, g8 and h7. Cut off the last rank.',
      explain: 'Ra8# is the basic rook-and-king mate: the rook takes the eighth rank while your king covers every escape square.'
    },
    {
      id: 'p02', rating: 550, themes: ['mate in 1', 'back rank'],
      fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
      moves: ['a1a8'],
      goal: 'mate',
      hint: 'Those three pawns look safe. They are actually a wall.',
      explain: 'Back-rank mate. The f7/g7/h7 pawns never moved, so the king has no luft and Ra8# ends it.'
    },
    {
      id: 'p03', rating: 500, themes: ['mate in 1', 'opening trap'],
      fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
      moves: ['f3f7'],
      goal: 'mate',
      hint: 'The bishop on c4 is doing more work than it looks.',
      explain: "Scholar's mate: Qxf7# is protected by the bishop on c4, and f7 is the weakest square in Black's camp before castling."
    },
    {
      id: 'p04', rating: 700, themes: ['ladder mate', 'rook mate'],
      fen: '8/7k/R7/8/8/8/8/1R5K w - - 0 1',
      moves: ['b1b7', 'h7h8', 'a6a8'],
      goal: 'mate',
      hint: 'One rook already fences off the sixth rank. Use the other one to push.',
      explain: 'The ladder (or "lawnmower") mate: Rb7+ drives the king to the last rank because Ra6 covers the retreat, and then Ra8# finishes. Two rooks mate on their own — the king is not needed.'
    },
    {
      id: 'p05', rating: 900, themes: ['mate in 1', 'smothered mate'],
      fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1',
      moves: ['g5f7'],
      goal: 'mate',
      hint: "Black's own pieces are the problem, not yours.",
      explain: 'Nf7# — the smothered mate. The rook and both pawns take away every flight square, so a lone knight finishes the job.'
    },
    {
      id: 'p06', rating: 1000, themes: ['mate in 1', 'Arabian mate'],
      fen: '7k/8/5N2/8/8/8/8/6KR w - - 0 1',
      moves: ['h1h7'],
      goal: 'mate',
      hint: 'The knight already guards g8 — and it can guard one more square.',
      explain: 'Arabian mate: Rh7# is defended by the knight on f6, which also covers g8. Rook and knight are a lethal pair on the edge.'
    },
    {
      id: 'p07', rating: 1200, themes: ['mate in 1', 'Anastasia mate'],
      fen: '8/4N1pk/8/8/8/8/8/K2R4 w - - 0 1',
      moves: ['d1h1'],
      goal: 'mate',
      hint: 'Which file is the king really standing on?',
      explain: "Anastasia's mate: the knight on e7 covers g8 and g6, the g7 pawn blocks the last escape, and Rh1# seals the h-file."
    },
    {
      id: 'p08', rating: 1100, themes: ['mate in 1', 'epaulette mate'],
      fen: '3rkr2/8/8/8/8/8/8/4Q1K1 w - - 0 1',
      moves: ['e1e6'],
      goal: 'mate',
      hint: 'Do not go too close — the king would just take you.',
      explain: 'Epaulette mate: the rooks on d8 and f8 are "shoulder pads" that trap their own king, so Qe6# needs no protection at all.'
    },
    {
      id: 'p09', rating: 1300, themes: ['mate in 1', 'Boden mate'],
      fen: '2kr4/3p4/2p5/8/5B2/8/4B3/6K1 w - - 0 1',
      moves: ['e2a6'],
      goal: 'mate',
      hint: 'Two bishops on crossing diagonals.',
      explain: "Boden's mate: Ba6# hits c8 through the empty b7 square while the f4 bishop covers b8 and c7. The rook on d8 blocks its own king."
    },
    {
      id: 'p10', rating: 1000, themes: ['fork', 'knight fork'],
      fen: '6k1/5p1p/6p1/3q4/6N1/8/8/6K1 w - - 0 1',
      moves: ['g4f6', 'g8g7', 'f6d5'],
      goal: 'material',
      hint: 'Check first, count material second.',
      explain: 'Nf6+ forks king and queen. Because it is check, Black has no time to move the queen — Nxd5 follows.'
    },
    {
      id: 'p11', rating: 1000, themes: ['fork', 'knight fork'],
      fen: 'r3k3/8/8/3N4/8/8/8/6K1 w - - 0 1',
      moves: ['d5c7', 'e8e7', 'c7a8'],
      goal: 'material',
      hint: 'One square hits both the king and the rook.',
      explain: 'Nc7+ is the classic royal fork. The check is forcing, so the rook on a8 cannot be saved.'
    },
    {
      id: 'p12', rating: 900, themes: ['double attack', 'queen fork'],
      fen: '4k3/8/8/8/8/7n/8/2Q1K3 w - - 0 1',
      moves: ['c1c8', 'e8e7', 'c8h3'],
      alts: [{ uci: 'c1e3', note: 'Qe3 also works — it covers g1, f2, f4 and g5, so the knight has nowhere to go. The fork is faster, but a net is just as good.' }],
      goal: 'material',
      hint: 'Find a square on the same rank as the king and the same diagonal as the knight.',
      explain: 'Qc8+ attacks the king along the eighth rank and the loose knight along the long diagonal, and Qxh3 wins a piece. Note that the fork square has to be one the target cannot cover — a bishop on h3 would simply have taken the queen on c8.'
    },
    {
      id: 'p13', rating: 1100, themes: ['discovered attack', 'discovered check'],
      fen: '7k/3q4/8/4N3/8/8/1B6/6K1 w - - 0 1',
      moves: ['e5d7', 'h8g8'],
      goal: 'material',
      hint: 'What is the bishop on b2 aiming at?',
      explain: 'Nxd7 grabs the queen and uncovers check from the b2 bishop, so Black never gets to recapture.'
    },
    {
      id: 'p14', rating: 1000, themes: ['skewer'],
      fen: '8/r7/8/8/k7/8/8/1R4K1 w - - 0 1',
      moves: ['b1a1', 'a4b4', 'a1a7'],
      goal: 'material',
      hint: 'Line the rook up behind the king, not the rook.',
      explain: 'Ra1+ skewers king and rook: the king must step off the file, and Rxa7 collects the rook.'
    },
    {
      id: 'p15', rating: 950, themes: ['skewer'],
      fen: '4k2r/8/8/8/8/8/8/R5K1 w - - 0 1',
      moves: ['a1a8', 'e8e7', 'a8h8'],
      goal: 'material',
      hint: 'The king and rook share a rank. Attack the one in front.',
      explain: 'Ra8+ forces the king off the eighth rank and Rxh8 wins the rook — a skewer along the rank.'
    },
    {
      id: 'p16', rating: 900, themes: ['fork', 'pawn fork'],
      fen: '4k3/8/2n1b3/8/2PP4/8/8/4K3 w - - 0 1',
      moves: ['d4d5', 'c6b4', 'd5e6'],
      goal: 'material',
      hint: 'The humblest piece can attack two at once.',
      explain: 'd5 forks knight and bishop, and the c4 pawn defends it. Whichever piece runs, the other one drops.'
    },
    {
      id: 'p17', rating: 1300, themes: ['deflection', 'back rank', 'mate in 2'],
      fen: '1r4k1/5ppp/8/8/8/8/3Q1PPP/3R2K1 w - - 0 1',
      moves: ['d2d8', 'b8d8', 'd1d8'],
      goal: 'mate',
      hint: "Black's rook is the only thing holding the back rank. Give it something else to do.",
      explain: 'Qd8+! deflects the rook off the eighth rank. After Rxd8, Rxd8# is a clean back-rank mate.'
    },
    {
      id: 'p18', rating: 1500, themes: ['sacrifice', 'smothered mate', 'mate in 2'],
      fen: '5r1k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1',
      moves: ['b3g8', 'f8g8', 'h6f7'],
      goal: 'mate',
      hint: 'The knight already guards g8 — so the king cannot capture there.',
      explain: "Philidor's legacy. Qg8+!! forces Rxg8 (the knight covers g8), and now the rook blocks the last escape: Nf7#."
    },
    {
      id: 'p19', rating: 1600, themes: ['underpromotion', 'fork'],
      fen: '3r4/1kP2q2/8/8/8/8/8/6K1 w - - 0 1',
      moves: ['c7d8n', 'b7a6', 'd8f7'],
      goal: 'material',
      hint: 'A new queen only wins a rook. Something smaller wins more.',
      explain: 'cxd8=N+! takes the rook and forks king and queen. Promoting to a queen would win far less.'
    },
    {
      id: 'p20', rating: 600, themes: ['mate in 1', 'queen mate'],
      fen: '6k1/5ppp/8/8/8/8/5PPP/1Q4K1 w - - 0 1',
      moves: ['b1b8'],
      goal: 'mate',
      hint: 'Straight down the eighth rank.',
      explain: 'Qb8# — no black piece can reach the eighth rank and the pawns block every flight square.'
    },
    {
      id: 'p21', rating: 1200, themes: ['pin', 'material'],
      fen: '3rkr2/3p1p2/5b2/4n3/8/3P4/8/4R1K1 w - - 0 1',
      moves: ['d3d4', 'd7d6', 'd4e5'],
      goal: 'material',
      hint: 'Attack the piece that is not allowed to move — with something cheaper than it.',
      explain: 'The knight is pinned to the king by the rook on e1. Rxe5 is no good, the bishop just recaptures; d4! attacks the pinned knight with a pawn instead, and a piece that cannot move cannot run away. Black can add defenders all day and still loses a knight for a pawn.'
    },
    {
      id: 'p22', rating: 800, themes: ['mate in 1', 'back rank'],
      fen: '2r3k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1',
      moves: ['c1c8'],
      goal: 'mate',
      hint: 'Trade first, look second.',
      explain: 'Rxc8# looks like a routine trade, but the rook that leaves c8 was the only defender of the back rank.'
    },
    {
      id: 'p23', rating: 1250, themes: ['discovered attack', 'discovered check'],
      fen: '7k/2q5/8/8/3N4/8/1B6/6K1 w - - 0 1',
      moves: ['d4e6', 'h8g8', 'e6c7'],
      goal: 'material',
      hint: 'Move the knight and the bishop wakes up. Now put the knight somewhere useful.',
      explain: 'Ne6+ is a discovered check from the b2 bishop, and the knight lands attacking the queen. Black must answer the check, so Nxc7 is unstoppable.'
    },
    {
      id: 'p24', rating: 1400, themes: ['mate in 2', 'sacrifice'],
      fen: '6rk/6pp/8/8/8/8/1B6/4R1QK w - - 0 1',
      moves: ['g1g7', 'g8g7', 'e1e8'],
      goal: 'mate',
      hint: 'The rook on g8 is holding the back rank. Force it to leave — the bishop is watching g7.',
      explain: 'Qxg7+!! The king cannot capture because the b2 bishop defends g7, so Rxg7 is forced — and now that rook is pinned to its own king and cannot come back. Re8# ends it.'
    },

    /* ---------------------------------------------------------- intermediate */
    {
      id: 'p25', rating: 1050, themes: ['fork', 'knight fork'],
      fen: '4k3/8/8/5N2/2q5/8/8/6K1 w - - 0 1',
      moves: ['f5d6', 'e8e7', 'd6c4'],
      goal: 'material',
      hint: 'One square touches both the king and the queen.',
      explain: 'Nd6+ forks king and queen. Look for the square a knight can reach that attacks both targets — here it is the only one on the board.'
    },
    {
      id: 'p26', rating: 1150, themes: ['mate in 1', 'battery'],
      fen: 'r5k1/5ppp/8/6Q1/8/8/1B6/6K1 w - - 0 1',
      moves: ['g5g7'],
      goal: 'mate',
      hint: 'The queen can go somewhere the king is not allowed to take her.',
      explain: 'Qxg7# — the bishop on b2 defends the queen through the long diagonal, so the king cannot capture, and the queen covers f8 and h8 herself. Queen plus bishop on the same diagonal is one of the deadliest batteries in chess.'
    },
    {
      id: 'p27', rating: 1250, themes: ['removing the defender', 'material'],
      fen: '6k1/6pp/5n2/3b2B1/8/8/8/3R2K1 w - - 0 1',
      moves: ['g5f6', 'g7f6', 'd1d5'],
      goal: 'material',
      hint: 'Rxd5 fails to one recapture. So deal with the recapturer first.',
      explain: 'Rxd5?? Nxd5 loses the exchange — the bishop is attacked once and defended once. Bxf6! trades the defender off, and after gxf6 the bishop on d5 is defended by nobody. Count attackers against defenders before you take, and if you are one short, remove a defender instead.'
    },
    {
      id: 'p28', rating: 1200, themes: ['skewer'],
      fen: '5r2/8/8/2k5/8/8/8/Q5K1 w - - 0 1',
      moves: ['a1a3', 'c5b5', 'a3f8'],
      goal: 'material',
      hint: 'King and rook already share a diagonal. Get behind the king on it.',
      explain: 'Qa3+ skewers along a3-f8. Checking from a distance matters: Qb4+ would also hit the diagonal, but the king simply takes it.'
    },
    {
      id: 'p29', rating: 1350, themes: ['double check', 'discovered check', 'fork'],
      fen: '3k4/q7/8/8/3N4/8/8/3R3K w - - 0 1',
      moves: ['d4c6', 'd8c8', 'c6a7'],
      goal: 'material',
      hint: 'The knight is standing on the rook\'s line. Move it somewhere that also checks.',
      explain: 'Nc6+ is a double check — from the knight and from the rook behind it. A double check can never be blocked or answered by a capture, so the king must move and the queen on a7 is simply lost.'
    },

    /* -------------------------------------------------------------- advanced */
    {
      id: 'p30', rating: 1750, themes: ['sacrifice', 'Boden mate', 'mate in 2'],
      fen: '2kr4/1p1n4/2p5/8/Q1B2B2/8/8/6K1 w - - 0 1',
      moves: ['a4c6', 'b7c6', 'c4a6'],
      goal: 'mate',
      hint: 'The b7 pawn is the only thing in the way of the light-squared bishop. Make it move.',
      explain: "Boden's mate in full. Qxc6+!! is not about the pawn, it is about the b7 pawn's square — after bxc6 the a6-c8 diagonal is open and Ba6# arrives, with the f4 bishop covering b8 and c7 and Black's own rook and knight sealing d8 and d7."
    },
    {
      id: 'p31', rating: 1900, themes: ['sacrifice', 'Anastasia mate', 'mate in 3'],
      fen: '5rk1/5ppp/8/5N1Q/8/8/8/K2R4 w - - 0 1',
      moves: ['f5e7', 'g8h8', 'h5h7', 'h8h7', 'd1h1'],
      goal: 'mate',
      hint: 'First put the knight where it covers both g8 and g6. Then the h-file is worth a queen.',
      explain: "Anastasia's mate. Ne7+ forces the king into the corner, Qxh7+!! drags it onto the open file — the king must take, every other square is covered — and Rh1# finishes, with the knight holding g8 and g6 and Black's own pawn holding g7."
    },
    {
      id: 'p32', rating: 1700, themes: ['opening trap', 'sacrifice', 'mate in 3'],
      fen: 'rn1qkbnr/ppp2p1p/3p2p1/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5',
      moves: ['f3e5', 'g4d1', 'c4f7', 'e8e7', 'c3d5'],
      goal: 'trap',
      refutation: 'dxe5',
      hint: 'The knight looks pinned. Ask yourself what the pin is actually worth.',
      explain: "Legall's mate, from 1858 and still catching people. The knight is not really pinned: 1.Nxe5! and if Black grabs the queen with 1...Bxd1?? then 2.Bxf7+ Ke7 3.Nd5# is mate — the knight on e5 covers d7 and defends the bishop on f7. Black must decline with 1...dxe5 2.Qxg4, when White has won a pawn and the bishop pair."
    },
    {
      id: 'p33', rating: 1800, themes: ['endgame', 'pawn breakthrough'],
      fen: '8/ppp4k/8/PPP5/8/8/8/K7 w - - 0 1',
      moves: ['b5b6', 'a7b6', 'c5c6', 'b7c6', 'a5a6', 'c6c5', 'a6a7', 'c5c4', 'a7a8q'],
      goal: 'material',
      /* The engine only checks the first move here: at the depth the oracle runs it
         prefers 2.axb6, which is a known blind spot — after 2.axb6 cxb6 White has
         nothing, while 2.c6! queens by force. Pawn endings need depth, not width. */
      oracle: 'first',
      hint: 'Three pawns against three, but it is your move. Give one away.',
      explain: 'The pawn breakthrough. b6! costs a pawn and cannot be declined properly: 1...axb6 2.c6! bxc6 3.a6 and the a-pawn runs. If instead 1...cxb6 2.a6! bxa6 3.c6 does the same job on the other wing. Counting tempi beats counting pawns.'
    },
    {
      id: 'p34', rating: 2100, themes: ['windmill', 'discovered check', 'sacrifice'],
      fen: '5rk1/ppn3p1/7p/8/8/8/1B6/K5R1 w - - 0 1',
      moves: ['g1g7', 'g8h8', 'g7c7', 'h8g8', 'c7g7', 'g8h8', 'g7b7', 'h8g8', 'b7g7'],
      goal: 'material',
      hint: 'The bishop on b2 is aimed at h8. What happens every time the rook steps off that diagonal?',
      explain: 'The windmill. Rxg7+ cannot be taken because the bishop defends g7, so the king must go to h8 — and now every time the rook leaves the long diagonal it is a discovered check, so it can eat its way along the seventh rank and come back. Black can only stop it by giving up more material to block on f6.'
    },
    {
      id: 'p35', rating: 1300, themes: ['removing the defender', 'promotion'],
      fen: '8/P5k1/1n6/8/8/8/8/1R4K1 w - - 0 1',
      moves: ['b1b6', 'g7f7', 'a7a8q'],
      goal: 'material',
      hint: 'Pushing the pawn now just loses it. Ask what is stopping it.',
      explain: 'a8=Q?? Nxa8 throws the pawn away — the knight covers the queening square. Rxb6! removes the only guard and nothing stops the pawn. When a passed pawn is blocked, attack the blocker rather than the pawn\'s path.'
    }
  ];

  global.PUZZLES = PUZZLES;
})(window);
