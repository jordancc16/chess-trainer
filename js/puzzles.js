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
      alts: [{ uci: 'b1g1', note: 'Rg1 is the same technique turned ninety degrees — 1.Rg1 Kh8 2.Rh6#. Either rook can do the cutting as long as the other does the checking.' }],
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
      fen: '7k/R7/5N2/8/8/8/8/6K1 w - - 0 1',
      moves: ['a7h7'],
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
      fen: '3rkr2/8/8/8/8/8/Q7/6K1 w - - 0 1',
      moves: ['a2e6'],
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
      fen: '3r4/1kP2qpp/8/8/8/8/6PP/6K1 w - - 0 1',
      moves: ['c7d8n', 'b7a6', 'd8f7'],
      goal: 'material',
      hint: 'A new queen only wins a rook. Something smaller wins more.',
      explain: 'cxd8=N+! takes the rook and forks king and queen. cxd8=Q wins the rook too, but it is not check, so Black keeps the queen and the game stays level — the whole point of the underpromotion is the fork.'
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
      id: 'p32', rating: 1700, themes: ['master game', 'opening trap', 'sacrifice', 'mate in 3'],
      game: "Légal de Kermeur — Saint Brie, Paris c.1750 (Légal's mate)",
      fen: 'rn1qkbnr/ppp2p1p/3p2p1/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5',
      moves: ['f3e5', 'g4d1', 'c4f7', 'e8e7', 'c3d5'],
      goal: 'trap',
      refutation: 'dxe5',
      hint: 'The knight looks pinned. Ask yourself what the pin is actually worth.',
      explain: "Légal's mate, played in a Paris café around 1750 and still catching people. The knight is not really pinned: 1.Nxe5! and if Black grabs the queen with 1...Bxd1?? then 2.Bxf7+ Ke7 3.Nd5# is mate — the knight on e5 covers d7 and defends the bishop on f7. Black must decline with 1...dxe5 2.Qxg4, when White has won a pawn and the bishop pair."
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
    },

    /* ---------------------------------------------------------- master games */
    {
      id: 'p36', rating: 1650, themes: ['master game', 'sacrifice', 'back rank', 'mate in 2'],
      game: 'Morphy — Duke of Brunswick & Count Isouard, Paris 1858 (the Opera Game)',
      fen: '4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 16',
      moves: ['b3b8', 'd7b8', 'd1d8'],
      goal: 'mate',
      hint: 'Only one black piece is holding the back rank together. It is not the king.',
      explain: 'The finish of the most famous game ever played, at the Paris opera during a performance of The Barber of Seville. Qb8+!! is the whole point: the knight on d7 is the only defender of d8, so it is forced to capture and abandon the square. Rd8# follows, with the g5 bishop covering e7 and defending the rook.'
    },
    {
      id: 'p37', rating: 1850, themes: ['master game', 'sacrifice', 'mate in 2'],
      game: 'Anderssen — Kieseritzky, London 1851 (the Immortal Game)',
      fen: 'r1bk2nr/p2p1pNp/n2B4/1p1NP2P/6P1/3P1Q2/P1P1K3/q5b1 w - - 1 22',
      moves: ['f3f6', 'g8f6', 'd6e7'],
      goal: 'mate',
      hint: 'You are a queen and two rooks down. Stop counting material and count escape squares.',
      explain: 'The Immortal Game. Anderssen has given up both rooks and now gives the queen as well: Qf6+!! and after Nxf6, Be7# is mate — the bishop is defended by the knight on d5, which also covers c7, while the knight on g7 covers e8. Every one of Black\'s extra pieces is a spectator.'
    },
    {
      id: 'p38', rating: 1400, themes: ['opening trap', 'mate in 1', 'pin'],
      game: 'The Blackburne Shilling Gambit trap',
      fen: 'r1b1kbnr/pppp1Npp/8/8/3nq3/8/PPPPBP1P/RNBQKR2 b Qkq - 1 7',
      moves: ['d4f3'],
      goal: 'mate',
      hint: 'You are Black. White has just blocked the check — look at what that bishop can no longer do.',
      explain: 'Nf3# — the trap Blackburne is said to have used to win shillings from amateurs. Bxf3 is the natural answer and it is illegal: the bishop on e2 is pinned to the king by the queen on e4. White\'s own pieces cover every escape square, so the lone knight mates.'
    },

    /* ------------------------------------------------------- more mates --- */
    {
      id: 'p39', rating: 420, category: 'mating', themes: ['mate in 1', 'back rank'],
      fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1',
      moves: ['e1e8'],
      goal: 'mate',
      hint: 'The three pawns in front of the king never moved.',
      explain: 'Re8# — the simplest pattern in chess and the one that decides the most games. A castled king with all three pawns still home has no escape from the eighth rank.'
    },
    {
      id: 'p40', rating: 450, category: 'mating', themes: ['mate in 1', 'queen mate'],
      fen: '7k/8/6K1/8/8/8/8/1Q6 w - - 0 1',
      moves: ['b1b8'],
      goal: 'mate',
      hint: 'Your king already holds g7 and h7. Take the last rank.',
      explain: 'Qb8# — with the kings in opposition the queen only has to cover the eighth rank. Learn this before the rook version: it is the same idea with one fewer piece to place.'
    },
    {
      id: 'p41', rating: 850, category: 'mating', themes: ['mate in 1', 'smothered mate'],
      fen: '6rk/6pp/3N4/8/8/8/8/6K1 w - - 0 1',
      moves: ['d6f7'],
      goal: 'mate',
      hint: 'Black has three pieces around the king and every one of them is in the way.',
      explain: 'Nf7# — a smothered mate. The rook takes g8, the pawns take g7 and h7, and a knight cannot be blocked, so one piece finishes the game.'
    },
    {
      id: 'p42', rating: 1000, category: 'mating', themes: ['mate in 1', 'battery'],
      fen: '5rk1/5pp1/8/7Q/8/3B4/8/6K1 w - - 0 1',
      moves: ['h5h7'],
      goal: 'mate',
      hint: 'h7 is empty and the bishop on d3 is looking straight at it.',
      explain: 'Qh7# — the queen lands on the square the bishop defends, so the king cannot take, and Black\'s own rook seals f8. Queen and bishop aiming at h7 is the most common attacking battery in chess.'
    },
    {
      id: 'p43', rating: 1050, category: 'mating', themes: ['mate in 1', 'Damiano mate'],
      fen: 'r6k/p2Q4/6P1/8/8/8/8/6K1 w - - 0 1',
      moves: ['d7h7'],
      goal: 'mate',
      hint: 'The pawn on g6 is not just a pawn, it is a defender.',
      explain: "Damiano's mate: Qh7# is protected by the g6 pawn, so the king cannot capture, and the queen covers g7 and g8 herself. A pawn on g6 is worth a piece in this pattern."
    },
    {
      id: 'p44', rating: 1100, category: 'mating', themes: ['mate in 1', 'two bishops'],
      fen: '7k/7p/6p1/8/2B2B2/8/8/6K1 w - - 0 1',
      moves: ['f4e5'],
      goal: 'mate',
      hint: 'One bishop already covers g8. Put the other on the long diagonal.',
      explain: 'Be5# — two bishops on crossing diagonals mate a cornered king without any help. The c4 bishop takes g8, the e5 bishop takes g7 and gives the check, and Black\'s own h7 pawn does the rest.'
    },
    {
      id: 'p45', rating: 1150, category: 'mating', themes: ['mate in 1', 'queen and knight'],
      fen: '6k1/5p1p/8/7N/3Q4/8/8/6K1 w - - 0 1',
      moves: ['d4g7'],
      goal: 'mate',
      hint: 'The knight on h5 is defending a square you would like to occupy.',
      explain: 'Qg7# — the knight defends the queen, so Kxg7 is illegal, and the queen covers f8 and h8 herself. Queen and knight are the deadliest pair of attackers precisely because the knight guards squares the queen cannot.'
    },

    /* ------------------------------------------------- more tactics -------- */
    {
      id: 'p46', rating: 1250, category: 'forks', themes: ['fork', 'knight fork', 'the exchange'],
      fen: 'n1r1r1k1/5ppp/8/5N2/8/8/5PPP/R4RK1 w - - 0 1',
      moves: ['f5d6', 'c8d8', 'd6e8'],
      goal: 'material',
      hint: 'Both black rooks are on the same rank. Find the square that touches both.',
      explain: 'Nd6! forks c8 and e8, and neither rook defends the fork square. Black can only save one — White wins the exchange. Rooks left on the same rank or file are a standing invitation to a knight.'
    },
    {
      id: 'p47', rating: 1200, category: 'pins', themes: ['skewer'],
      fen: '7q/6k1/8/8/8/8/5B2/6K1 w - - 0 1',
      moves: ['f2d4', 'g7g8', 'd4h8'],
      goal: 'material',
      hint: 'King and queen are on the same diagonal, with the king in front.',
      explain: 'Bd4+ skewers king and queen. The king has to step off the long diagonal and the queen falls. Blocking with the queen on e5 or f6 loses her just as surely — the bishop simply takes.'
    },
    {
      id: 'p48', rating: 1500, category: 'deflection', themes: ['decoy', 'sacrifice', 'knight fork'],
      fen: '4kn2/4p3/7q/4N3/8/8/5PPP/3R2K1 w - - 0 1',
      moves: ['d1d8', 'e8d8', 'e5f7', 'd8e8', 'f7h6'],
      goal: 'material',
      hint: 'The king is not standing on a fork square. Put him on one.',
      explain: 'Rd8+!! is a decoy. Count Black\'s escape squares first: the knight on e5 covers d7 and f7, and Black\'s own knight and pawn block f8 and e7 — so Kxd8 is the only legal move and the sacrifice cannot be declined. Now Nf7+ forks king and queen. A decoy does not remove a defender, it relocates a target.'
    },
    {
      id: 'p50', rating: 1150, category: 'endgame', themes: ['promotion', 'fork'],
      fen: '7k/P7/8/3r4/8/8/8/6K1 w - - 0 1',
      moves: ['a7a8q', 'd5d8', 'a8d8'],
      goal: 'material',
      hint: 'Promote, but look at which square the new queen will control.',
      explain: 'a8=Q+ is check along the eighth rank and hits the rook on d5 down the long diagonal at the same time. Blocking on d8 only loses the rook a move later. Always check what a new queen attacks before choosing the promotion square.'
    },

    /* --------------------------------------------------- opening traps ----- */
    {
      id: 'p51', rating: 1300, category: 'traps', themes: ['opening trap', 'mate in 1', 'smothered mate', 'pin'],
      game: 'Caro-Kann Defence, 4...Nd7 5.Qe2 Ngf6??',
      fen: 'r1bqkb1r/pp1npppp/2p2n2/8/3PN3/8/PPP1QPPP/R1B1KBNR w KQkq - 4 6',
      moves: ['e4d6'],
      goal: 'mate',
      hint: 'Why did White put the queen on e2 rather than develop a piece?',
      explain: 'Nd6# — the point of 5.Qe2. Every escape square is taken by one of Black\'s own pieces, and exd6 is illegal because the e7 pawn is pinned to the king by the queen on e2. This exact mate has been played thousands of times in the Caro-Kann.'
    },
    {
      id: 'p52', rating: 1350, category: 'traps', themes: ['opening trap', 'discovered check', 'material'],
      game: "Petrov's Defence, 3...Nxe4?? 4.Qe2 Nf6??",
      fen: 'rnbqkb1r/pppp1ppp/5n2/4N3/8/8/PPPPQPPP/RNB1KB1R w KQkq - 4 5',
      moves: ['e5c6', 'f8e7', 'c6d8'],
      goal: 'material',
      hint: 'The queen on e2 and the black king are on the same file. What is standing between them?',
      explain: 'Nc6+! is a discovered check from the queen, and the knight lands attacking the queen on d8. Black must deal with the check first, so the queen is lost. This is why 4...Nf6 loses on the spot and 4...Qe7 is the only move.'
    },
    {
      id: 'p53', rating: 1450, category: 'traps', themes: ['opening trap', 'material'],
      game: "Queen's Gambit Declined, the Elephant Trap",
      fen: 'r1bqkb1r/pppn1ppp/5n2/3N2B1/3P4/8/PP2PPPP/R2QKBNR b KQkq - 0 6',
      moves: ['f6d5', 'g5d8', 'f8b4', 'd1d2', 'b4d2', 'e1d2', 'e8d8'],
      goal: 'material',
      hint: 'You are Black. White just grabbed a pawn on d5 — the knight looks pinned, but is it?',
      explain: 'The Elephant Trap. 6...Nxd5! looks impossible because of the pin on the d8 queen, but after 7.Bxd8 Bb4+! White has to give the queen back: 8.Qd2 Bxd2+ 9.Kxd2 Kxd8 and Black has simply won a piece. An intermezzo check is the standard way to break out of a pin.'
    },
    {
      id: 'p54', rating: 1600, category: 'traps', themes: ['opening trap', 'underpromotion', 'material'],
      game: 'Albin Counter-Gambit, the Lasker Trap',
      fen: 'rnbqk1nr/ppp2ppp/8/4P3/1BP5/8/PP2KpPP/RN1Q1BNR b kq - 1 7',
      moves: ['f2g1n', 'h1g1', 'c8g4', 'e2e1', 'g4d1'],
      goal: 'material',
      /* Only the underpromotion is machine-checked. After 8...Bg4+ White has half a
         dozen king moves and 9.Ke1 is just the natural one, so the oracle rightly
         ranks Black's later moves against defences that were never played. */
      oracle: 'first',
      hint: 'You are Black, with a pawn on f2. A new queen is not the strongest piece here.',
      explain: 'The Lasker Trap, and the only opening line where an underpromotion appears by move seven. fxg1=N+! is check — a new queen on g1 would not be — so White must spend a move on Rxg1, and then Bg4+ drives the king off e2 and the queen on d1 falls.'
    },
    {
      id: 'p55', rating: 1500, category: 'traps', themes: ['opening trap', 'mate in 2'],
      game: 'Englund Gambit, 7.Qd2??',
      fen: 'r1b1k1nr/pppp1ppp/2n5/4P3/1b6/2B2N2/PqPQPPPP/RN2KB1R b KQkq - 6 7',
      moves: ['b4c3', 'd2c3', 'b2c1'],
      goal: 'trap',
      refutation: 'recapturing with the knight, 8.Nxc3',
      hint: 'You are Black. Trade on c3 and look at the square the white queen leaves behind.',
      explain: 'Bxc3! and if White recaptures naturally with 8.Qxc3?? then 8...Qc1# is mate — the queen on c1 covers d1 and d2, the a1 rook is blocked by its own knight and the white queen is blocked by its own c2 pawn. White has to recapture with the knight instead.'
    }
  ];

  /* `game` is a credit line — it covers both real games and named opening theory.
     `masters` is narrower: an actual game between named players. Keeping them
     separate stops "Master games" from quietly meaning "has a caption". */
  ['p32', 'p36', 'p37'].forEach(function (id) {
    PUZZLES.forEach(function (p) { if (p.id === id) p.masters = true; });
  });

  /* Categories are the top-level way to browse the set; `themes` stay as free-form
     tags. Master games are not a category — they cut across them. */
  var CATEGORIES = [
    { id: 'all', label: 'All categories' },
    { id: 'mating', label: 'Mating patterns' },
    { id: 'forks', label: 'Forks & double attacks' },
    { id: 'pins', label: 'Pins & skewers' },
    { id: 'discovered', label: 'Discovered attacks' },
    { id: 'deflection', label: 'Deflection & decoys' },
    { id: 'sacrifice', label: 'Sacrifices' },
    { id: 'endgame', label: 'Endgames' },
    { id: 'traps', label: 'Opening traps' },
    { id: 'masters', label: 'Master games' }
  ];

  /* Categories for the puzzles written before the field existed. */
  var LEGACY_CATEGORY = {
    p01: 'mating', p02: 'mating', p03: 'traps', p04: 'mating', p05: 'mating',
    p06: 'mating', p07: 'mating', p08: 'mating', p09: 'mating', p10: 'forks',
    p11: 'forks', p13: 'discovered', p14: 'pins', p15: 'pins', p16: 'forks',
    p17: 'deflection', p18: 'sacrifice', p19: 'endgame', p20: 'mating',
    p21: 'pins', p22: 'mating', p23: 'discovered', p25: 'forks', p26: 'mating',
    p27: 'deflection', p28: 'pins', p29: 'discovered', p30: 'sacrifice',
    p31: 'sacrifice', p32: 'traps', p33: 'endgame', p34: 'sacrifice',
    p35: 'endgame', p36: 'sacrifice', p37: 'sacrifice', p38: 'traps'
  };

  PUZZLES.forEach(function (p) {
    if (!p.category) p.category = LEGACY_CATEGORY[p.id];
  });

  global.PUZZLES = PUZZLES;
  global.PUZZLE_CATEGORIES = CATEGORIES;
})(window);
