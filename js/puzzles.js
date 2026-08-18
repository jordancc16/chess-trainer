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
      fen: '6k1/5p1p/6p1/3q4/6N1/8/5PPP/6K1 w - - 0 1',
      moves: ['g4f6', 'g8g7', 'f6d5'],
      goal: 'material',
      hint: 'Check first, count material second.',
      explain: 'Nf6+ forks king and queen. Because it is check, Black has no time to move the queen — Nxd5 follows.'
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
      fen: '4k3/5ppp/8/5N2/2q5/8/5PPP/6K1 w - - 0 1',
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
      moves: ['g5f6', 'd5b3', 'd1b1'],
      goal: 'material',
      hint: 'Rxd5 fails to one recapture. So deal with the recapturer first.',
      explain: 'Rxd5?? Nxd5 loses the exchange — the bishop is attacked once and defended once. Bxf6! removes the defender, and now gxf6 is impossible because Rxd5 would simply take the bishop. Black has to abandon it with ...Bb3 and stay a piece down. Count attackers against defenders before you take, and if you are one short, remove a defender instead.'
    },
    {
      id: 'p29', rating: 1350, themes: ['double check', 'discovered check', 'fork'],
      fen: '3k4/q7/8/8/3N4/8/8/3R3K w - - 0 1',
      moves: ['d4c6', 'd8c7', 'c6a7'],
      alts: [{ uci: 'd4b5', note: 'Nb5+ does the same job. Any knight move here is a discovered check — the skill is picking one that also hits the queen, and both c6 and b5 do.' }],
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
      moves: ['f2g1n'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 26, +5.5 for Black after the underpromotion',
      hint: 'You are Black, with a pawn on f2. A new queen is not the strongest piece here.',
      explain: 'The Lasker Trap, and the only opening line where an underpromotion turns up by move seven. fxg1=N+! is check; a new queen on g1 would not be, and that tempo is the whole difference. Stockfish has Black +5.5 here. If White grabs with 8.Rxg1?, then 8...Bg4+ 9.Ke1 Qxd1+! wins the queen for nothing — note that it is the queen that captures, not the bishop: the bishop\'s job is to cover d1 through the empty e2 square so that Kxd1 is illegal, and White\'s only legal reply is Kf2. Best is actually 8.Ke1, declining the knight, but Black is winning anyway after 8...Qh4+.'
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
    },

    /* ------------------------------------------------- mined from real games
       Positions where Stockfish says one move is decisively best and the game
       is level without it. See tools/mine.py; every one is credited. */
    {
      id: 'p100', rating: 800, category: 'mating',
      themes: ['mating attack', 'mate in 1', 'from a real game'],
      game: 'Mac Connel vs Morphy, New Orleans, 1849', masters: true,
      fen: 'r4rk1/p7/4b2p/3p1pp1/2P2p2/7n/PPQN2PP/R1B3RK b - - 0 23',
      moves: ['h3f2'],
      goal: 'mate',
      verified: 'stockfish 17.1 depth 16, best by a forced mate',
      hint: 'The king has fewer squares than it looks. Start with the most forcing move.',
      explain: 'Nf2# forces mate. The line runs 23...Nf2#.'
    },
    {
      id: 'p101', rating: 800, category: 'mating',
      themes: ['mating attack', 'mate in 1', 'from a real game'],
      game: 'Anderssen vs Finch, London2, 1851', masters: true,
      fen: '8/1pp1Qp1k/1b2b2p/p6P/P7/6r1/6N1/R3R2K b - - 0 32',
      moves: ['g3h3'],
      goal: 'mate',
      verified: 'stockfish 17.1 depth 16, best by a forced mate',
      hint: 'The king has fewer squares than it looks. Start with the most forcing move.',
      explain: 'Rh3# forces mate. The line runs 32...Rh3#.'
    },
    {
      id: 'p102', rating: 970, category: 'mating',
      themes: ['mating attack', 'mate in 2', 'from a real game'],
      game: 'Morphy vs Maurian, Alabama, 1855', masters: true,
      fen: 'r3kb1r/p1pp1ppp/Q4n2/7q/1p1NPp2/1B6/PPP3PP/RNB2K1R b kq - 0 11',
      moves: ['h5d1', 'f1f2', 'f6e4'],
      goal: 'mate',
      verified: 'stockfish 17.1 depth 16, best by a forced mate',
      hint: 'The king has fewer squares than it looks. Start with the most forcing move.',
      explain: 'Qd1+ forces mate. The line runs 11...Qd1+ 12.Kf2 Nxe4#.'
    },
    {
      id: 'p103', rating: 1210, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Gradus vs Tal, LAT-ch, 1953', masters: true,
      fen: 'r2q2k1/1p3pbp/2p3p1/4B3/pPbQ4/2N3PP/P4PB1/R5K1 b - - 0 20',
      moves: ['d8d4', 'e5d4', 'g7d4', 'a1c1', 'd4c3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 913cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qxd4 attacks the knight on c3 and the bishop on e5 at the same time. The line runs 20...Qxd4 21.Bxd4 Bxd4 22.Rc1 Bxc3. Black finishes a rook up.'
    },
    {
      id: 'p104', rating: 1210, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Morphy vs Paulsen, USA-01.Congress, 1857', masters: true,
      fen: '2r4k/1p1p1r2/p3pnp1/7p/5q2/5NPB/PPP2P1P/R5RK w - - 0 28',
      moves: ['g3f4', 'c8c2', 'f3e5', 'f7g7', 'f2f3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 975cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'gxf4 is the only move that keeps the advantage. The line runs 28.gxf4 Rxc2 29.Ne5 Rg7 30.f3. White finishes a queen to the good.'
    },
    {
      id: 'p105', rating: 1210, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Spassky vs Taimanov, URS-ch22, 1955', masters: true,
      fen: 'b2k1b1r/2p1nq1p/5p2/1p2p1pQ/4P2N/1P2B3/1PP2PPP/6K1 w - - 0 19',
      moves: ['h5f7', 'g5h4', 'f7f6', 'h8g8', 'f6h4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 968cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qxf7 attacks the knight on e7 and the bishop on f8 at the same time. The line runs 19.Qxf7 gxh4 20.Qxf6 Rg8 21.Qxh4. White finishes a queen to the good.'
    },
    {
      id: 'p106', rating: 1220, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Lange vs Anderssen, Berlin, 1851', masters: true,
      fen: '3r4/kpN2p2/7p/5npq/2P3b1/3Q2P1/P1P3K1/2B1R1b1 w - - 0 28',
      moves: ['c7b5', 'a7a6', 'd3a3', 'a6b6', 'g2g1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 961cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nb5+ comes with check, so Black has no time to reorganise. The line runs 28.Nb5+ Ka6 29.Qa3+ Kb6 30.Kxg1. White finishes a piece up.'
    },
    {
      id: 'p107', rating: 1240, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Morphy vs NN, New Orleans, 1849', masters: true,
      fen: 'rn1qk2r/pp2b3/2pp4/8/2Bn1Bp1/2NN4/PPPK4/5R1R w kq - 0 19',
      moves: ['h1h8', 'e8d7', 'h8d8', 'd7d8', 'f1h1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 777cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Rxh8+ comes with check, so Black has no time to reorganise. The line runs 19.Rxh8+ Kd7 20.Rxd8+ Kxd8 21.Rh1. White finishes a queen to the good.'
    },
    {
      id: 'p108', rating: 1240, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Morphy vs Morphy, New Orleans, 1856', masters: true,
      fen: 'r1bn1q1r/pp2kp2/1b1N1p1p/1p2p3/1P2P3/2PQ4/P4PPP/RN3RK1 w - - 0 16',
      moves: ['d6c8', 'a8c8', 'f1d1', 'b6d4', 'c3d4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 291cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Nxc8+ attacks the bishop on b6 and the king on e7 at the same time. The line runs 16.Nxc8+ Rxc8 17.Rd1 Bd4 18.cxd4. White finishes a piece up.'
    },
    {
      id: 'p109', rating: 1240, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Tal vs Semenikhin, Riga-ch, 1954', masters: true,
      fen: 'r4r1k/pp1bb1pp/1qpp1n2/3P2N1/2P3p1/1P2P1P1/PBQ1N2P/R4RK1 b - - 7 17',
      moves: ['b6e3', 'f1f2', 'e3g5', 'e2f4', 'd7f5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 701cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qxe3+ attacks the knight on e2 and the knight on g5 at the same time. The line runs 17...Qxe3+ 18.Rf2 Qxg5 19.Nf4 Bf5. Black finishes a piece up.'
    },
    {
      id: 'p110', rating: 1240, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Morphy vs Rhodes, Birmingham sim, 1858', masters: true,
      fen: 'r3k1nr/ppp2ppp/1b6/4n3/3P4/2P2q2/PP2QN1P/R1B1KB1R w KQkq - 0 13',
      moves: ['e2e5', 'e8f8', 'f1e2', 'f3c6', 'h1g1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 365cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qxe5+ comes with check, so Black has no time to reorganise. The line runs 13.Qxe5+ Kf8 14.Be2 Qc6 15.Rg1. White finishes a piece up.'
    },
    {
      id: 'p111', rating: 1240, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Anderssen vs Kieseritzky, London m8, 1851', masters: true,
      fen: 'rn3rk1/p3b2p/2p4q/3pPNpn/3P4/3B4/PPP4P/R1BbK1R1 w - - 0 19',
      moves: ['f5h6', 'g8h8', 'e1d1', 'h5f4', 'c1f4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 571cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nxh6+ comes with check, so Black has no time to reorganise. The line runs 19.Nxh6+ Kh8 20.Kxd1 Nf4 21.Bxf4. White finishes a queen to the good.'
    },
    {
      id: 'p112', rating: 1240, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Rabinovich vs Botvinnik, URS-ch05, 1927', masters: true,
      fen: 'r5k1/pp1R2pp/2p5/2b1P3/2P1pP1P/1P2Pq2/P4Q2/5K1R b - - 1 26',
      moves: ['f3h1', 'f1e2', 'h1h3', 'f4f5', 'h3g4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 841cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qxh1+ comes with check, so White has no time to reorganise. The line runs 26...Qxh1+ 27.Ke2 Qh3 28.f5 Qg4+. Black finishes a rook up.'
    },
    {
      id: 'p113', rating: 1240, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Helling vs Keres, Dresden, 1936', masters: true,
      fen: '8/p2b2kp/1r2p1p1/5r2/PPq1ppN1/2P2P2/3Q2PP/4R2K w - - 0 31',
      moves: ['d2d7', 'g7f8', 'd7d8', 'f8f7', 'e1d1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 674cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qxd7+ comes with check, so Black has no time to reorganise. The line runs 31.Qxd7+ Kf8 32.Qd8+ Kf7 33.Rd1. White finishes a piece up.'
    },
    {
      id: 'p114', rating: 1240, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Keres vs Gilg, Prague, 1937', masters: true,
      fen: '5r2/pk1p3p/1ppQn1p1/4P1q1/3P4/5BP1/P6P/4R1K1 w - - 0 31',
      moves: ['d6d7', 'b7b8', 'd7d6', 'e6c7', 'd6f8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 822cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qxd7+ attacks the knight on e6 and the king on b7 at the same time. The line runs 31.Qxd7+ Kb8 32.Qd6+ Nc7 33.Qxf8+. White finishes a rook up.'
    },
    {
      id: 'p115', rating: 1240, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Kasparov vs Gheorghiu, Moscow Interzonal, 1982', masters: true,
      fen: 'r6r/3kbpp1/pp5p/2pb4/5q2/P1P2N2/2Q2PPP/R2R2K1 w - - 0 19',
      moves: ['d1d5', 'd7c8', 'd5f5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxd5+ comes with check, so Black has no time to reorganise. The line runs 19.Rxd5+ Kc8 20.Rf5. White finishes a piece up.'
    },
    {
      id: 'p116', rating: 1240, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Spassky vs Franz, Riga, 1959', masters: true,
      fen: '8/pp1b1p2/3Qpr2/1k1pP3/2p4N/P1P5/4BPKP/nq6 w - - 2 31',
      moves: ['d6d7', 'b5a6', 'e5f6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qxd7+ comes with check, so Black has no time to reorganise. The line runs 31.Qxd7+ Ka6 32.exf6. White finishes a queen to the good.'
    },
    {
      id: 'p117', rating: 1240, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Rubinstein vs Rabinovich, RUS-ch03, 1903', masters: true,
      fen: '6rq/pb2bk2/1p1p1n2/2p1pP2/2Pn4/1P1BQPN1/PB5R/R3N1K1 b - - 0 23',
      moves: ['g8g3', 'e1g2', 'd4f3', 'e3f3', 'h8h2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 695cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Rxg3+ comes with check, so White has no time to reorganise. The line runs 23...Rxg3+ 24.Ng2 Nxf3+ 25.Qxf3 Qxh2+. Black finishes a rook up.'
    },
    {
      id: 'p118', rating: 1240, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Kavalek vs Karpov, Caracas, 1970', masters: true,
      fen: '1n1r3k/2q2bpp/p2N1p2/1p2p3/2p1P3/2P4P/PPB2PP1/3Q2K1 w - - 0 31',
      moves: ['d6f7', 'c7f7', 'd1d8', 'f7g8', 'd8d6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 891cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Nxf7+ attacks the rook on d8 and the king on h8 at the same time. The line runs 31.Nxf7+ Qxf7 32.Qxd8+ Qg8 33.Qd6. White finishes a rook up.'
    },
    {
      id: 'p119', rating: 1240, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Rubinstein vs Duras, Vienna, 1908', masters: true,
      fen: 'r3kb1r/p1q1pppp/5n2/1p2N3/1P6/P3P3/1B3PPP/R2bKB1R w KQkq - 0 13',
      moves: ['f1b5', 'f6d7', 'a1d1', 'e8c8', 'e5d7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 596cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Bxb5+ comes with check, so Black has no time to reorganise. The line runs 13.Bxb5+ Nd7 14.Rxd1 O-O-O 15.Nxd7. White finishes a rook up.'
    },
    {
      id: 'p120', rating: 1280, category: 'endgame',
      themes: ['endgame', 'from a real game'],
      game: 'Kasparov vs Galle, Wch U16, 1976', masters: true,
      fen: '1r6/1k3ppp/N7/3p4/8/5P2/P4KPP/8 w - - 0 31',
      moves: ['a6b8', 'b7b8', 'f2e3', 'b8c7', 'f3f4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 886cp',
      hint: 'Few pieces left, so every tempo counts. Look for the forcing move.',
      explain: 'Nxb8 is the only move that keeps the advantage. The line runs 31.Nxb8 Kxb8 32.Ke3 Kc7 33.f4. White wins the exchange.'
    },
    {
      id: 'p121', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Morphy vs Rousseau, New Orleans, 1849', masters: true,
      fen: 'r1b2b1r/pp2nNpp/2p1k3/3n4/2B1p3/3P4/PPP2PPP/R1B2RK1 w - - 2 16',
      moves: ['f7h8', 'b7b5', 'c4b3', 'e4d3', 'h2h4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 234cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nxh8 is the only move that keeps the advantage. The line runs 16.Nxh8 b5 17.Bb3 exd3 18.h4. White finishes a piece up.'
    },
    {
      id: 'p122', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Alekhine vs Giese, Earl tourn, 1906', masters: true,
      fen: '2r5/pp1kP2p/6p1/3p1p2/3P4/3PK3/P5PP/2R5 w - - 1 25',
      moves: ['c1c8', 'd7e7', 'c8c7', 'e7f6', 'c7h7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 863cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxc8 is the only move that keeps the advantage. The line runs 25.Rxc8 Kxe7 26.Rc7+ Kf6 27.Rxh7. White finishes a rook up.'
    },
    {
      id: 'p123', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Tal vs Zaid, Riga-ch, 1952', masters: true,
      fen: '2r3k1/1r3ppn/2Rq4/p2Pp2p/Pp2P1nP/1P1N1NP1/5P2/5RK1 w - - 0 28',
      moves: ['c6d6', 'h7f6', 'f1e1', 'c8c3', 'd6d8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 418cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxd6 is the only move that keeps the advantage. The line runs 28.Rxd6 Nhf6 29.Re1 Rc3 30.Rd8+. White finishes a queen to the good.'
    },
    {
      id: 'p124', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Marshall vs Capablanca, USA m, 1909', masters: true,
      fen: '1Q6/p4pqk/1p2p2p/4P3/3Rb1nP/8/P4PP1/1B4K1 b - - 0 29',
      moves: ['e4b1', 'b8a7', 'g4e5', 'a7b6', 'b1e4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 578cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Bxb1 is the only move that keeps the advantage. The line runs 29...Bxb1 30.Qxa7 Nxe5 31.Qxb6 Be4. Black wins the exchange.'
    },
    {
      id: 'p125', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Alekhine vs Kunze, Duesseldorf, 1908', masters: true,
      fen: 'r3r2k/1pqnb3/p3Q1n1/3p2P1/7B/2N5/PPP4P/5RRK w - - 1 25',
      moves: ['e6g6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 22',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qxg6 hits the rook on e8. The line runs 25.Qxg6. White finishes a piece up.'
    },
    {
      id: 'p126', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Morphy vs Thompson, USA-01.Congress, 1857', masters: true,
      fen: '6k1/3bR1p1/3P3p/3r1p2/1p6/5PP1/PP5P/6K1 w - - 0 31',
      moves: ['e7d7', 'g7g5', 'g1f2', 'f5f4', 'g3f4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 760cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxd7 is the only move that keeps the advantage. The line runs 31.Rxd7 g5 32.Kf2 f4 33.gxf4. White finishes a piece up.'
    },
    {
      id: 'p127', rating: 1360, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Paulsen vs Morphy, USA-01.Congress, 1857', masters: true,
      fen: '4k3/2prb3/p1p5/2P1rp2/BP3Npp/P7/6PP/3R3K w - - 0 31',
      moves: ['a4c6', 'e7f6', 'c6d7', 'e8f7', 'g2g3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 884cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Bxc6 hits the rook on d7. The line runs 31.Bxc6 Bf6 32.Bxd7+ Kf7 33.g3. White finishes a rook up.'
    },
    {
      id: 'p128', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Capablanca vs Walcott, New York, 1911', masters: true,
      fen: 'r5k1/1pp1b1pp/p2pp3/4p1P1/5r1N/2P3NP/PPqR1PK1/R1B5 w - - 0 25',
      moves: ['d2c2', 'f4h4', 'c1d2', 'h7h6', 'g5h6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 727cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxc2 is the only move that keeps the advantage. The line runs 25.Rxc2 Rxh4 26.Bd2 h6 27.gxh6. White finishes a rook up.'
    },
    {
      id: 'p129', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Morphy vs Freeman, Birmingham sim, 1858', masters: true,
      fen: 'r4rk1/pp3p1p/2p1R3/3B3n/1P1b1P2/8/PBP4P/R6K w - - 0 22',
      moves: ['b2d4', 'h5f4', 'e6e4', 'f4g6', 'd5b3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 887cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Bxd4 is the only move that keeps the advantage. The line runs 22.Bxd4 Nxf4 23.Re4 Ng6 24.Bb3. White wins the exchange.'
    },
    {
      id: 'p130', rating: 1360, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Morphy vs Deacon, London, 1858', masters: true,
      fen: 'r1bqk2r/pp2nppp/1b1p4/8/2BQ2n1/B1P2N2/P4PPP/RN2R1K1 w kq - 1 13',
      moves: ['d4g7', 'b6f2', 'g1h1', 'f2e1', 'c4b5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 495cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qxg7 attacks the rook on h8 and the knight on g4 at the same time. The line runs 13.Qxg7 Bxf2+ 14.Kh1 Bxe1 15.Bb5+. The point is positional rather than material — Stockfish rates it +3.9 for white.'
    },
    {
      id: 'p131', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Tal vs Saigin, Riga m, 1954', masters: true,
      fen: 'r4rk1/1pqbbppp/p4n2/2n1pPP1/P3p3/2NB1N2/1PP4P/R1B1QR1K w - - 0 16',
      moves: ['g5f6', 'e7f6', 'c3e4', 'c5e4', 'd3e4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 483cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'gxf6 hits the bishop on e7. The line runs 16.gxf6 Bxf6 17.Nxe4 Nxe4 18.Bxe4. White finishes a piece up.'
    },
    {
      id: 'p132', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Buckle vs Anderssen, London2, 1851', masters: true,
      fen: 'r1b1R3/ppp3pk/6p1/8/3P1r2/6P1/PP1N1PP1/6K1 w - - 2 22',
      moves: ['g3f4', 'g6g5', 'f4g5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'gxf4 is the only move that keeps the advantage. The line runs 22.gxf4 g5 23.fxg5. White finishes a rook up.'
    },
    {
      id: 'p133', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Kieseritzky vs Anderssen, London m8, 1851', masters: true,
      fen: '5rk1/p1p4r/4R3/1p4p1/5qP1/5Bn1/PP3Q2/3N1RK1 b - - 0 32',
      moves: ['g3f1', 'f3e4', 'f4g4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nxf1 is the only move that keeps the advantage. The line runs 32...Nxf1 33.Be4 Qxg4+. Black finishes a rook up.'
    },
    {
      id: 'p134', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Thomason vs Fischer, USA-chJ, 1955', masters: true,
      fen: 'r2q4/ppp3bk/3p2pp/3P4/2n1NQ2/8/PPB1n1PP/R4R1K b - - 2 23',
      moves: ['e2f4', 'f1f4', 'c4e3', 'c2d3', 'h7g8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 666cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nxf4 is the only move that keeps the advantage. The line runs 23...Nxf4 24.Rxf4 Ne3 25.Bd3 Kg8. Black finishes a rook up.'
    },
    {
      id: 'p135', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Botvinnik vs Ostrowski, Leningrad-ch, 1926', masters: true,
      fen: '2b2rk1/2p3pp/2P1p3/8/3P4/3BPqp1/5P1P/2RQ2K1 w - - 0 28',
      moves: ['d1f3', 'f8f3', 'h2g3', 'e6e5', 'd4e5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 585cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qxf3 hits the rook on f8. The line runs 28.Qxf3 Rxf3 29.hxg3 e5 30.dxe5. White wins the exchange.'
    },
    {
      id: 'p136', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Keres vs Winter, Warsaw ol, 1935', masters: true,
      fen: 'rnb4r/pp3k2/3b2p1/q2p2BQ/8/8/Pp3PPP/1R3RK1 w - - 0 16',
      moves: ['h5h8', 'd5d4', 'h8h7', 'f7e6', 'f1e1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 821cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qxh8 hits the bishop on c8. The line runs 16.Qxh8 d4 17.Qh7+ Ke6 18.Rfe1+. White finishes a rook up.'
    },
    {
      id: 'p137', rating: 1360, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Barda vs Spassky, Bucharest, 1953', masters: true,
      fen: '6k1/3q1pbp/3p2p1/2pQ4/1p3PP1/1P5P/r1N4N/2B2BK1 b - - 0 26',
      moves: ['a2c2', 'c1e3', 'd7e6', 'd5e6', 'f7e6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 402cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Rxc2 attacks the bishop on c1 and the knight on h2 at the same time. The line runs 26...Rxc2 27.Be3 Qe6 28.Qxe6 fxe6. Black finishes a piece up.'
    },
    {
      id: 'p138', rating: 1360, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Purdy vs Spassky, Wch U20 prel-A, 1955', masters: true,
      fen: 'r1bq1rk1/pp2ppBp/2n3p1/2pn4/5P2/NP1pPN2/P1PPB1PP/3RQRK1 b - - 0 11',
      moves: ['d3e2', 'e1e2', 'g8g7', 'c2c4', 'd5f6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 352cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'dxe2 attacks the rook on d1 and the rook on f1 at the same time. The line runs 11...dxe2 12.Qxe2 Kxg7 13.c4 Nf6. Black finishes a rook up.'
    },
    {
      id: 'p139', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Sibarevic vs Kasparov, Banja Luka, 1979', masters: true,
      fen: '2R2rk1/4bp1p/R5p1/5p2/4b3/6Q1/2P1B1PP/1q4BK b - - 2 29',
      moves: ['f8c8', 'g3e5', 'b1c2', 'e2f1', 'e7c5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 481cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxc8 is the only move that keeps the advantage. The line runs 29...Rxc8 30.Qe5 Qxc2 31.Bf1 Bc5. Black finishes a rook up.'
    },
    {
      id: 'p140', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Kirillov vs Botvinnik, URS-ch07, 1931', masters: true,
      fen: '2rr2k1/p2qb1pp/1p2bp2/2p1p3/3N4/1PNP2P1/nB2PPBP/2RQR1K1 b - - 0 23',
      moves: ['a2c3', 'c1c3', 'c5d4', 'c3c8', 'd8c8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 302cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nxc3 hits the queen on d1. The line runs 23...Nxc3 24.Rxc3 cxd4 25.Rxc8 Rxc8. Black finishes a piece up.'
    },
    {
      id: 'p141', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Giardelli vs Kasparov, Malta ol (Men), 1980', masters: true,
      fen: '2r5/5pk1/6p1/p6p/3Np3/3n2P1/PP3PBP/4R1K1 b - - 0 32',
      moves: ['d3e1', 'g1f1', 'e1g2', 'b2b3', 'c8d8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 838cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nxe1 hits the bishop on g2. The line runs 32...Nxe1 33.Kf1 Nxg2 34.b3 Rd8. Black finishes a queen to the good.'
    },
    {
      id: 'p142', rating: 1360, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Kasparov vs Petursson, Malta ol (Men), 1980', masters: true,
      fen: '5k2/5p1r/4nPpp/pp3q2/2p1B3/2P1Q3/5PPP/3rR1K1 w - - 0 31',
      moves: ['e4f5', 'd1d8', 'f5h3', 'g6g5', 'g1f1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 627cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Bxf5 hits the knight on e6. The line runs 31.Bxf5 Rd8 32.Bh3 g5 33.Kf1. White finishes a queen to the good.'
    },
    {
      id: 'p143', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Kasparov vs Speelman, Malta ol (Men), 1980', masters: true,
      fen: 'r4rk1/2pp1ppp/1p1nq3/3nP3/p7/2BQ1PP1/PP1N1K1P/R4R2 w - - 2 19',
      moves: ['e5d6', 'c7c6', 'd3d4', 'e6h6', 'h2h4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 435cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'exd6 is the only move that keeps the advantage. The line runs 19.exd6 c6 20.Qd4 Qh6 21.h4. White finishes a piece up.'
    },
    {
      id: 'p144', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Keres vs Ragozin, Semmering/Baden, 1937', masters: true,
      fen: '5rk1/4bppp/rN2pn2/pp6/1P6/P5P1/3BPPKP/R2R4 w - - 2 22',
      moves: ['b4a5', 'f8e8', 'd2b4', 'e7d8', 'd1d6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 313cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'bxa5 is the only move that keeps the advantage. The line runs 22.bxa5 Re8 23.Bb4 Bd8 24.Rd6. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p145', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Pirc vs Keres, Stockholm ol, 1937', masters: true,
      fen: '4qr1k/p1p1b1pp/1r2p3/3P4/4RP2/BP3RP1/P2Q2KP/8 b - - 0 23',
      moves: ['e7a3', 'b3b4', 'e8a4', 'd5e6', 'a3b4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 371cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Bxa3 is the only move that keeps the advantage. The line runs 23...Bxa3 24.b4 Qa4 25.dxe6 Bxb4. Black finishes a piece up.'
    },
    {
      id: 'p146', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Schiffers vs Rubinstein, RUS-ch03, 1903', masters: true,
      fen: '2r3k1/pb2Bppn/1p2p3/q7/2N1r3/1P6/P3QPPP/3R1RK1 b - - 2 20',
      moves: ['e4e2', 'c4a5', 'b6a5', 'd1d7', 'b7d5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 446cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxe2 is the only move that keeps the advantage. The line runs 20...Rxe2 21.Nxa5 bxa5 22.Rd7 Bd5. Black finishes a piece up.'
    },
    {
      id: 'p147', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Rubinstein vs Salwe, Lodz-m, 1903', masters: true,
      fen: '2rqbr2/pp3knQ/4p3/3pn1p1/3P1pP1/PP1B4/1BP4P/R5RK w - - 2 25',
      moves: ['d4e5', 'f8g8', 'a3a4', 'c8c5', 'b2a3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 708cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'dxe5 is the only move that keeps the advantage. The line runs 25.dxe5 Rg8 26.a4 Rc5 27.Ba3. White finishes a piece up.'
    },
    {
      id: 'p148', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Bronstein vs Goldberg, URS-ch14, 1945', masters: true,
      fen: '2r5/3kp3/pQ1pqrp1/1p6/8/PPP5/6P1/2KRR3 w - - 2 31',
      moves: ['e1e6', 'f6e6', 'c1c2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxe6 hits the rook on f6. The line runs 31.Rxe6 Rxe6 32.Kc2. White finishes a piece up.'
    },
    {
      id: 'p149', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Cihelashvili vs Karpov, URS-chT, 1968', masters: true,
      fen: '2k2r2/pppq4/2n5/4p1Pp/4Q2P/2P1r3/PP1N1R2/R1BK4 b - - 0 26',
      moves: ['e3e4', 'f2f8', 'c6d8', 'd1c2', 'e4f4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 615cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxe4 is the only move that keeps the advantage. The line runs 26...Rxe4 27.Rxf8+ Nd8 28.Kc2 Rf4. Black finishes a piece up.'
    },
    {
      id: 'p150', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Chistiakov vs Bronstein, Moscow-ch, 1946', masters: true,
      fen: '3q1rk1/pp5p/3b2p1/3p4/3N4/2P3Pb/PP1N1Q1P/1B1R2K1 b - - 2 29',
      moves: ['f8f2', 'g1f2', 'd8b6', 'd2b3', 'a7a5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 608cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxf2 hits the knight on d2. The line runs 29...Rxf2 30.Kxf2 Qb6 31.Nb3 a5. Black finishes a piece up.'
    },
    {
      id: 'p151', rating: 1360, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Pachman vs Bronstein, Moscow-Prague, 1946', masters: true,
      fen: '2b1rnk1/1p3p2/1qpR2p1/8/2P1P2p/1nN3PP/5PBK/R2Q4 b - - 0 23',
      moves: ['b6f2', 'd6d3', 'h4g3', 'd3g3', 'b3a1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 397cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qxf2 hits the bishop on g2. The line runs 23...Qxf2 24.Rd3 hxg3+ 25.Rxg3 Nxa1. Black finishes a rook up.'
    },
    {
      id: 'p152', rating: 1360, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Smyslov vs Kan, Sverdlovsk, 1943', masters: true,
      fen: '2kr4/pp1bbB2/2pq3Q/4p1p1/3Pn3/8/PPPB2PP/R4R1K w - - 1 22',
      moves: ['h6d6', 'e7d6', 'd2e1', 'e5d4', 'f7g6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 365cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qxd6 attacks the bishop on d7 and the bishop on e7 at the same time. The line runs 22.Qxd6 Bxd6 23.Be1 exd4 24.Bg6. The point is positional rather than material — Stockfish rates it +2.8 for white.'
    },
    {
      id: 'p153', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Przepiorka vs Rubinstein, Lodz, 1907', masters: true,
      fen: '5r1k/2q1b1p1/2n1B2p/1p1rp3/4n3/2P4P/4QPP1/R1B1R1K1 w - - 0 25',
      moves: ['e2e4', 'd5c5', 'e6b3', 'c5c3', 'b3c2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 368cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qxe4 hits the rook on d5. The line runs 25.Qxe4 Rc5 26.Bb3 Rxc3 27.Bc2. White wins the exchange.'
    },
    {
      id: 'p154', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Rubinstein vs Salwe, Lodz mt, 1908', masters: true,
      fen: '1r4k1/r4ppp/p1q1b3/R2p4/1P1Q4/P3PPP1/7P/5BK1 w - - 0 28',
      moves: ['d4a7', 'c6c8', 'a5c5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qxa7 hits the rook on b8. The line runs 28.Qxa7 Qc8 29.Rc5. White finishes a rook up.'
    },
    {
      id: 'p155', rating: 1360, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Boleslavsky vs Smyslov, Groningen, 1946', masters: true,
      fen: '5rk1/6pp/pQ2pn2/1p2p3/4P3/q4N1P/5PP1/2R2NK1 b - - 0 29',
      moves: ['a3c1', 'b6a6', 'f6e4', 'a6e6', 'g8h8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 634cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qxc1 hits the knight on f1. The line runs 29...Qxc1 30.Qxa6 Nxe4 31.Qxe6+ Kh8. Black finishes a piece up.'
    },
    {
      id: 'p156', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Swiderski vs Rubinstein, Vienna, 1908', masters: true,
      fen: '1q2r3/p1B1r1kp/2p2pp1/1p1n1p2/2NPn3/P2QPNP1/1P3PKP/2R1R3 b - - 0 23',
      moves: ['b5c4', 'd3e4', 'f5e4', 'c7b8', 'e4f3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 238cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'bxc4 hits the queen on d3. The line runs 23...bxc4 24.Qxe4 fxe4 25.Bxb8 exf3+. Black finishes a piece up.'
    },
    {
      id: 'p157', rating: 1360, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Smyslov vs Pachman, Chigorin mem, 1947', masters: true,
      fen: '3r1k2/p3qpp1/1p2pn1p/3bN3/1P3Q2/1BP3RP/P2r1PP1/4R1K1 w - - 5 28',
      moves: ['f4d2', 'd5b3', 'g3d3', 'd8d3', 'd2d3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 359cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qxd2 hits the bishop on d5. The line runs 28.Qxd2 Bxb3 29.Rd3 Rxd3 30.Qxd3. White wins the exchange.'
    },
    {
      id: 'p158', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Smyslov vs Euwe, World Championship 18th, 1948', masters: true,
      fen: 'r1q1kb1r/4nppp/p1p5/1p2P3/2b1Q3/N4N2/1P3PPP/R1BR2K1 w kq - 0 16',
      moves: ['a3c4', 'b5c4', 'a1a4', 'h7h6', 'c1d2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 323cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nxc4 is the only move that keeps the advantage. The line runs 16.Nxc4 bxc4 17.Ra4 h6 18.Bd2. The point is positional rather than material — Stockfish rates it +3.1 for white.'
    },
    {
      id: 'p159', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Karpov vs Kortschnoj, Candidats final, 1974', masters: true,
      fen: '4r1k1/pp2pp1p/3p1npQ/q2bP3/5N2/5P2/PPP5/2K4R w - - 0 25',
      moves: ['e5f6', 'e7f6', 'h6h7', 'g8f8', 'h7h8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 730cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'exf6 is the only move that keeps the advantage. The line runs 25.exf6 exf6 26.Qxh7+ Kf8 27.Qh8+. White finishes a piece up.'
    },
    {
      id: 'p160', rating: 1360, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Levenfish vs Smyslov, URS-ch17, 1949', masters: true,
      fen: 'r1q2rk1/pp4b1/2P1p1p1/8/3Bn3/1Q5R/PP2NP1P/4K3 w - - 0 25',
      moves: ['c6b7', 'c8c6', 'b7a8r', 'f8a8', 'd4g7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 386cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'cxb7 attacks the queen on c8 and the rook on a8 at the same time. The line runs 25.cxb7 Qc6 26.bxa8=R Rxa8 27.Bxg7. White finishes a queen to the good.'
    },
    {
      id: 'p161', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Alekhine vs Rubinstein, RUS-ch, 1912', masters: true,
      fen: 'r5k1/2pqb1pp/p1n1n3/1p1pP1p1/8/1NP1BP1P/PP1Q1P2/R4RK1 b - - 0 20',
      moves: ['c6e5', 'g1g2', 'a8f8', 'b3d4', 'e6d4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 283cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nxe5 is the only move that keeps the advantage. The line runs 20...Nxe5 21.Kg2 Rf8 22.Nd4 Nxd4. Black finishes a piece up.'
    },
    {
      id: 'p162', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Rubinstein vs Alekhine, St Petersburg prel, 1914', masters: true,
      fen: 'r4r2/p4Nkp/Bp3np1/3P4/3Q4/Pq6/6PP/5R1K b - - 2 26',
      moves: ['f8f7', 'a6c4', 'b3a3', 'd5d6', 'a3c5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 713cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxf7 is the only move that keeps the advantage. The line runs 26...Rxf7 27.Bc4 Qxa3 28.d6 Qc5. Black finishes a piece up.'
    },
    {
      id: 'p163', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Smyslov vs Sokolsky, URS-ch18, 1950', masters: true,
      fen: '2rqk2r/4ppb1/p2p2p1/1ppn3p/8/P1BPP1PP/1P1QNP2/1R2K2R w Kk - 0 19',
      moves: ['c3g7', 'h8h7', 'e3e4', 'd5c7', 'g7c3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 602cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Bxg7 hits the rook on h8. The line runs 19.Bxg7 Rh7 20.e4 Nc7 21.Bc3. White finishes a piece up.'
    },
    {
      id: 'p164', rating: 1360, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Rubinstein vs Schlechter, Berlin m, 1918', masters: true,
      fen: 'r2b2k1/pp1r1ppp/1qpBnn2/8/2B3P1/2N2Q1P/PP3P2/R2R2K1 w - - 0 19',
      moves: ['c4e6', 'f7e6', 'g4g5', 'b6b2', 'a1b1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 241cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Bxe6 hits the rook on d7. The line runs 19.Bxe6 fxe6 20.g5 Qxb2 21.Rab1. The point is positional rather than material — Stockfish rates it +2.6 for white.'
    },
    {
      id: 'p165', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Schlechter vs Rubinstein, Berlin m, 1918', masters: true,
      fen: '2kr4/1p4pp/pp3pn1/1bp5/4P3/2N1B3/PPP2PPP/5RK1 b - - 1 17',
      moves: ['b5f1', 'g1f1', 'g6e7', 'g2g4', 'c8c7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 342cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Bxf1 is the only move that keeps the advantage. The line runs 17...Bxf1 18.Kxf1 Ne7 19.g4 Kc7. Black wins the exchange.'
    },
    {
      id: 'p166', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Bronstein vs Trifunovic, Amsterdam olm, 1954', masters: true,
      fen: '4r1k1/1b1n1pp1/2qp1P2/p2n3Q/PppB4/8/1P3PPP/2R2RK1 w - - 2 28',
      moves: ['f6g7', 'f7f6', 'h5e8', 'g8g7', 'c1c4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 757cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'fxg7 is the only move that keeps the advantage. The line runs 28.fxg7 f6 29.Qxe8+ Kxg7 30.Rxc4. White finishes a rook up.'
    },
    {
      id: 'p167', rating: 1360, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Novotelnov vs Smyslov, URS-ch19, 1951', masters: true,
      fen: 'r5k1/pp1b1ppp/5n2/n1rP4/3NP3/P2B4/qBQ2PPP/R5K1 w - - 0 19',
      moves: ['a1a2', 'c5c2', 'd3c2', 'a8c8', 'f2f3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 624cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rxa2 is the only move that keeps the advantage. The line runs 19.Rxa2 Rxc2 20.Bxc2 Rc8 21.f3. White finishes a rook up.'
    },
    {
      id: 'p168', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Harrwitz vs Anderssen, Breslau m, 1848', masters: true,
      fen: 'r1b2k2/ppp1n2p/2n2r2/3p3B/3P1q2/3N4/PPP2B1P/R2Q2KR b - - 8 20',
      moves: ['f4g5', 'f2g3', 'e7f5', 'd1g4', 'g5g4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 234cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qg5+ attacks the bishop on h5 and the king on g1 at the same time. The line runs 20...Qg5+ 21.Bg3 Nf5 22.Qg4 Qxg4. Black finishes a queen to the good.'
    },
    {
      id: 'p169', rating: 1370, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Anderssen vs Dufresne, Berlin m2, 1851', masters: true,
      fen: 'r1bqk2r/pp3ppp/3p2nn/b5NQ/2B5/B1Pp4/P4PPP/RN3RK1 w kq - 0 13',
      moves: ['f1e1', 'e8f8', 'h5f3', 'c8g4', 'f3d5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 328cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Re1+ comes with check, so Black has no time to reorganise. The line runs 13.Re1+ Kf8 14.Qf3 Bg4 15.Qd5. The point is positional rather than material — Stockfish rates it +2.8 for white.'
    },
    {
      id: 'p170', rating: 1370, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Meek vs Morphy, Mobile, 1855', masters: true,
      fen: 'r1bqr3/ppp2k1p/6p1/n7/3pP3/3Q4/PPP3PP/RNB1K2R b KQ - 0 14',
      moves: ['d8h4', 'e1f1', 'e8e4', 'd3g3', 'h4g4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 362cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qh4+ comes with check, so White has no time to reorganise. The line runs 14...Qh4+ 15.Kf1 Rxe4 16.Qg3 Qg4. Black comes out a pawn up with much the better position.'
    },
    {
      id: 'p171', rating: 1370, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Morphy vs Knight, New Orleans, 1856', masters: true,
      fen: 'r1b3nr/pp1nk2p/2p2q1b/4N2Q/3PPp1p/1P6/P1P3P1/RNB2RK1 w - - 1 13',
      moves: ['c1a3', 'e7d8', 'e5f7', 'd8c7', 'e4e5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 411cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Ba3+ comes with check, so Black has no time to reorganise. The line runs 13.Ba3+ Kd8 14.Nf7+ Kc7 15.e5. The point is positional rather than material — Stockfish rates it +3.3 for white.'
    },
    {
      id: 'p172', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Morphy vs Meek, New Orleans, 1857', masters: true,
      fen: 'r1bqk2r/ppp2ppp/3p4/3Pp3/1nB5/5N2/P4PPP/2RQ1RK1 w kq - 0 13',
      moves: ['d1a4', 'c7c6', 'a4b4', 'c6c5', 'b4b5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 396cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qa4+ attacks the knight on b4 and the king on e8 at the same time. The line runs 13.Qa4+ c6 14.Qxb4 c5 15.Qb5+. White finishes a piece up.'
    },
    {
      id: 'p173', rating: 1370, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Kliavinsh vs Tal, LAT-ch, 1954', masters: true,
      fen: 'r3k2r/p2b1pbp/1qpQ1np1/1B6/5P2/2N5/PPP3PP/1K1R3R w kq - 4 16',
      moves: ['h1e1', 'e8d8', 'b5c6', 'b6c7', 'd6e7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 749cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rhe1+ comes with check, so Black has no time to reorganise. The line runs 16.Rhe1+ Kd8 17.Bxc6 Qc7 18.Qe7+. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p174', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Deacon vs Morphy, London, 1858', masters: true,
      fen: '3q3k/p1p1nRb1/1r2B3/3pn3/3P4/2P2QP1/PP5P/6K1 w - - 4 28',
      moves: ['f3h5', 'h8g8', 'f7e7', 'b6e6', 'e7e6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 438cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qh5+ attacks the knight on e5 and the king on h8 at the same time. The line runs 28.Qh5+ Kg8 29.Rxe7+ Rxe6 30.Rxe6. White finishes a rook up.'
    },
    {
      id: 'p175', rating: 1370, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Tal vs Klasup, LAT-ch, 1955', masters: true,
      fen: '2kr3r/pp3p2/2n2q1p/2p2p2/2P1Q3/2P1P3/P3B2P/R1B2RK1 b - - 0 20',
      moves: ['f6g7', 'e4g2', 'g7c3', 'c1b2', 'c3b2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 509cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qg7+ comes with check, so White has no time to reorganise. The line runs 20...Qg7+ 21.Qg2 Qxc3 22.Bb2 Qxb2. Black finishes a piece up.'
    },
    {
      id: 'p176', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Barnes vs Morphy, London m1, 1858', masters: true,
      fen: 'r1b1k1nN/ppp3pp/2n1P3/2b5/2Bpp3/8/PPP2PqP/RN1QKR2 w Qq - 2 13',
      moves: ['d1h5', 'g7g6', 'h5h7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qh5+ attacks the bishop on c5 and the king on e8 at the same time. The line runs 13.Qh5+ g6 14.Qxh7. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p177', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Bannik vs Tal, URS-ch sf, 1955', masters: true,
      fen: '5rk1/p4p1p/3p2p1/7r/2P5/1PN3q1/P3P1Q1/2R2RK1 b - - 4 23',
      moves: ['g3e3', 'g2f2', 'e3h6', 'f2f6', 'h5g5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 250cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qe3+ attacks the rook on c1 and the knight on c3 at the same time. The line runs 23...Qe3+ 24.Qf2 Qh6 25.Qf6 Rg5+. The point is positional rather than material — Stockfish rates it +3.0 for black.'
    },
    {
      id: 'p178', rating: 1370, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Bisguier vs Fischer, New York Rosenwald, 1956', masters: true,
      fen: '4nk2/1p1q1p1p/p5p1/3p1r2/2P2N2/1P6/P5PP/Q4RK1 w - - 0 28',
      moves: ['a1h8', 'f8e7', 'f4d5', 'e7d8', 'f1d1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 502cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qh8+ comes with check, so Black has no time to reorganise. The line runs 28.Qh8+ Ke7 29.Nxd5+ Kd8 30.Rd1. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p179', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Grob vs Keres, Dresden, 1936', masters: true,
      fen: 'r3q1k1/p1p2pp1/3b1n1p/1P1P3b/1P2N2Q/2P2P2/P3rR1P/RNB3K1 b - - 10 20',
      moves: ['e2e1', 'f2f1', 'e1f1', 'g1f1', 'e8b5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 427cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Re1+ attacks the bishop on c1 and the knight on e4 at the same time. The line runs 20...Re1+ 21.Rf1 Rxf1+ 22.Kxf1 Qxb5+. Black comes out a pawn up with much the better position.'
    },
    {
      id: 'p180', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Schussler vs Kasparov, WchT U26, 1981', masters: true,
      fen: '3q2k1/pp3p1p/4p1p1/4P3/2Q5/5PP1/P6P/B6K b - - 0 26',
      moves: ['d8d1', 'h1g2', 'd1a1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qd1+ attacks the bishop on a1 and the king on h1 at the same time. The line runs 26...Qd1+ 27.Kg2 Qxa1. Black finishes a piece up.'
    },
    {
      id: 'p181', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Lehmann vs Spassky, EU-chT, 1957', masters: true,
      fen: 'r1b2r1k/ppp3pp/8/6B1/Nn1nN3/3P4/PP3PPP/2R2RK1 b - - 0 17',
      moves: ['d4e2', 'g1h1', 'e2c1', 'f1c1', 'b4d3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 307cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Ne2+ attacks the rook on c1 and the king on g1 at the same time. The line runs 17...Ne2+ 18.Kh1 Nxc1 19.Rxc1 Nxd3. Black finishes a piece up.'
    },
    {
      id: 'p182', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Spassky vs Nezhmetdinov, URS-chT, 1959', masters: true,
      fen: '3r2k1/p6p/1p1P2q1/1Pp4Q/3n4/3N4/P5PP/4R1K1 w - - 3 28',
      moves: ['h5d5', 'g8g7', 'd6d7', 'h7h6', 'd3f4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 401cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qd5+ attacks the knight on d4 and the king on g8 at the same time. The line runs 28.Qd5+ Kg7 29.d7 h6 30.Nf4. The point is positional rather than material — Stockfish rates it +4.5 for white.'
    },
    {
      id: 'p183', rating: 1370, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Fischer vs Bhend, Zuerich, 1959', masters: true,
      fen: '3r4/7k/2Q1rpp1/8/2P5/4q3/PP4PP/5R1K w - - 0 31',
      moves: ['c6c7', 'e6e7', 'c7d8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qc7+ attacks the rook on d8 and the king on h7 at the same time. The line runs 31.Qc7+ Re7 32.Qxd8. White finishes a rook up.'
    },
    {
      id: 'p184', rating: 1370, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Reti vs Rubinstein, Stockholm, 1919', masters: true,
      fen: '5rk1/ppp4p/1n3B2/3q4/8/1P2R3/P2P2PP/5RK1 w - - 0 25',
      moves: ['e3g3', 'g8f7', 'f6c3', 'f7e8', 'g3e3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 471cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rg3+ comes with check, so Black has no time to reorganise. The line runs 25.Rg3+ Kf7 26.Bc3+ Ke8 27.Re3+. The point is positional rather than material — Stockfish rates it +2.5 for white.'
    },
    {
      id: 'p185', rating: 1410, category: 'endgame',
      themes: ['endgame', 'from a real game'],
      game: 'Rubinstein vs Davidson, The Hague, 1921', masters: true,
      fen: '5k2/1R4pp/1p3n2/4P3/1P1N4/6rP/8/6K1 w - - 0 31',
      moves: ['g1h2', 'g3g6', 'e5f6', 'g6f6', 'b4b5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 317cp',
      hint: 'Few pieces left, so every tempo counts. Look for the forcing move.',
      explain: 'Kh2 hits the rook on g3. The line runs 31.Kh2 Rg6 32.exf6 Rxf6 33.b5. White wins the exchange.'
    },
    {
      id: 'p186', rating: 1480, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Capablanca vs Marshall, New York, 1910', masters: true,
      fen: '4q1k1/2r3pp/1p6/8/1b2N3/4R1P1/PP3P1P/R5K1 w - - 0 28',
      moves: ['e4f6', 'g7f6', 'e3e8', 'g8f7', 'e8e2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 905cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Nf6+ gives up material on purpose. Attacks the queen on e8 and the king on g8 at the same time. The line runs 28.Nf6+ gxf6 29.Rxe8+ Kf7 30.Re2. White finishes a rook up.'
    },
    {
      id: 'p187', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Alekhine vs Zubakin, Earl tourn, 1906', masters: true,
      fen: 'r1b1k2r/pp2bp1p/2p4q/4P1pn/3PNp1P/1P3N2/1PP2KP1/R1BQ3R b kq - 0 14',
      moves: ['g5g4', 'f3g5', 'h6g6', 'a1a5', 'e8g8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 251cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'g4 hits the knight on f3. The line runs 14...g4 15.Nfg5 Qg6 16.Ra5 O-O. The point is positional rather than material — Stockfish rates it +3.0 for black.'
    },
    {
      id: 'p188', rating: 1490, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Anderssen vs Harrwitz, Breslau m, 1848', masters: true,
      fen: '5rk1/4Qppp/2p5/3b2q1/P2P4/3B2nP/6P1/B3R1K1 b - - 2 29',
      moves: ['g5d2', 'd3f1', 'g3f1', 'e1e2', 'd2d1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 564cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qd2 attacks the rook on e1 and the bishop on d3 at the same time. The line runs 29...Qd2 30.Bf1 Nxf1 31.Re2 Qd1. Black finishes a piece up.'
    },
    {
      id: 'p189', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Morphy vs Morphy, New Orleans m, 1849', masters: true,
      fen: 'r4r2/pp3pk1/1b2P2p/3p1BPQ/8/8/P4PKP/q7 b - - 1 29',
      moves: ['g7g8', 'e6f7', 'f8f7', 'f5e6', 'a8f8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 755cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kg8 is the only move that keeps the advantage. The line runs 29...Kg8 30.exf7+ Rxf7 31.Be6 Rf8. The point is positional rather than material — Stockfish rates it +5.4 for black.'
    },
    {
      id: 'p190', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Anderssen vs Harrwitz, Breslau m, 1848', masters: true,
      fen: 'r6r/p1q3p1/2n3kp/1p2pb2/4NP2/8/PP2Q1PP/R1B2RK1 b - - 1 17',
      moves: ['c6d4', 'e2d3', 'c7c6', 'f1e1', 'd4c2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 251cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nd4 hits the queen on e2. The line runs 17...Nd4 18.Qd3 Qc6 19.Re1 Nc2. The point is positional rather than material — Stockfish rates it +2.5 for black.'
    },
    {
      id: 'p191', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Trcala vs Alekhine, Duesseldorf, 1908', masters: true,
      fen: 'r2n4/3q1bk1/p2p1pn1/2p1p1pN/1pP1P1P1/1B1P4/PP3P1R/5NRK b - - 0 32',
      moves: ['g7f8', 'f1e3', 'f7e6', 'h5f6', 'd7e7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 712cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kf8 is the only move that keeps the advantage. The line runs 32...Kf8 33.Ne3 Be6 34.Nxf6 Qe7. The point is positional rather than material — Stockfish rates it +2.7 for black.'
    },
    {
      id: 'p192', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Anderssen vs Dufresne, Berlin m2, 1851', masters: true,
      fen: '3kr3/1p2n1r1/pN1p4/3P1p1p/6bB/2R5/PPPK4/8 b - - 3 32',
      moves: ['f5f4', 'b6c4', 'g7g6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'f4 is the only move that keeps the advantage. The line runs 32...f4 33.Nc4 Rg6. The point is positional rather than material — Stockfish rates it +0.0 for black.'
    },
    {
      id: 'p193', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Vinokurov vs Tal, URS-chTJ, 1954', masters: true,
      fen: '2r2rk1/1p3ppp/3Q4/p1nPp3/P5B1/8/1q4PP/3R1R1K b - - 1 26',
      moves: ['c5e4', 'd6e7', 'c8e8', 'e7h4', 'e4d6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 457cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Ne4 hits the queen on d6. The line runs 26...Ne4 27.Qe7 Rce8 28.Qh4 Nd6. The point is positional rather than material — Stockfish rates it +2.5 for black.'
    },
    {
      id: 'p194', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Morphy vs Paulsen, USA-01.Congress, 1857', masters: true,
      fen: '2r4k/4Q1pp/1p3p2/8/4PP2/8/2P4P/r3K1R1 w - - 1 25',
      moves: ['e1f2', 'a1g1', 'f2g1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kf2 is the only move that keeps the advantage. The line runs 25.Kf2 Rxg1 26.Kxg1. The point is positional rather than material — Stockfish rates it +0.0 for white.'
    },
    {
      id: 'p195', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Capablanca vs Koksal, Prague sim, 1911', masters: true,
      fen: '4r1k1/ppp2ppp/2b5/2b2P2/8/3P3P/PP1B2P1/R2R3K b - - 0 23',
      moves: ['e8e2', 'd2c3', 'c6g2', 'h1h2', 'g2c6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 418cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Re2 hits the bishop on d2. The line runs 23...Re2 24.Bc3 Bxg2+ 25.Kh2 Bc6+. Black comes out a pawn up with much the better position.'
    },
    {
      id: 'p196', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Anderssen vs Kieseritzky, London m8, 1851', masters: true,
      fen: '4rRk1/ppp4p/8/3p2P1/8/8/P5PP/4rQ1K b - - 2 29',
      moves: ['g8g7', 'h2h4', 'e1f1', 'f8f1', 'd5d4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 816cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kg7 hits the rook on f8. The line runs 29...Kg7 30.h4 Rxf1+ 31.Rxf1 d4. Black finishes a piece up.'
    },
    {
      id: 'p197', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Corzo y Prinzipe vs Capablanca, Havana, 1913', masters: true,
      fen: '8/pbp1k1rp/1p1pP3/1P4p1/2P2q2/2Q2nP1/P4K1P/4RB1R b - - 4 29',
      moves: ['f4f8', 'h1g1', 'g7g6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qf8 is the only move that keeps the advantage. The line runs 29...Qf8 30.Rg1 Rg6. The point is positional rather than material — Stockfish rates it +0.0 for black.'
    },
    {
      id: 'p198', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Spassky vs Zurakhov, URS-ch sf, 1954', masters: true,
      fen: '1r5k/6p1/p1pQ1p1p/1q6/4N3/1P6/n1P2PPP/2KR4 w - - 0 28',
      moves: ['c1b2', 'a2b4', 'e4f6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kb2 hits the knight on a2. The line runs 28.Kb2 Nb4 29.Nxf6. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p199', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Keres vs Engels, Dresden, 1936', masters: true,
      fen: '7k/p5p1/1p3p2/3n3p/3P3P/1P3q2/PBQ2P1K/5R2 b - - 0 32',
      moves: ['d5f4', 'c2c8', 'h8h7', 'c8f5', 'g7g6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 651cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nf4 is the only move that keeps the advantage. The line runs 32...Nf4 33.Qc8+ Kh7 34.Qf5+ g6. The point is positional rather than material — Stockfish rates it +6.5 for black.'
    },
    {
      id: 'p200', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Botvinnik vs Stepanov, Leningrad-ch, 1930', masters: true,
      fen: '2b3k1/5rp1/p1p2n1p/p1b1BP2/Pn6/2Nr4/1P2Q1PP/3R1RK1 w - - 4 25',
      moves: ['g1h1', 'd3e3', 'd1d8', 'g8h7', 'e2c4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 421cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kh1 is the only move that keeps the advantage. The line runs 25.Kh1 Re3 26.Rd8+ Kh7 27.Qc4. The point is positional rather than material — Stockfish rates it +3.4 for white.'
    },
    {
      id: 'p201', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Goldhamer vs Fischer, Washington, 1956', masters: true,
      fen: '2r2rk1/4b1pp/pq1p4/1p1Bp1Pn/7P/1N6/PPPQ2K1/3R3R b - - 0 20',
      moves: ['g8h8', 'd1f1', 'h5f4', 'g2g3', 'b5b4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 682cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kh8 is the only move that keeps the advantage. The line runs 20...Kh8 21.Rdf1 Nf4+ 22.Kg3 b4. The point is positional rather than material — Stockfish rates it +3.3 for black.'
    },
    {
      id: 'p202', rating: 1490, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Botvinnik vs Lisitsin, Leningrad-ch, 1930', masters: true,
      fen: 'r3r3/1p4k1/3p2p1/p2N1b1p/2P5/1P3P2/P6P/3R1RK1 w - - 0 31',
      moves: ['d5c7', 'a5a4', 'c7e8', 'a8e8', 'f1e1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 359cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Nc7 attacks the rook on a8 and the rook on e8 at the same time. The line runs 31.Nc7 a4 32.Nxe8+ Rxe8 33.Rfe1. White wins the exchange.'
    },
    {
      id: 'p203', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Fischer vs Sherwin, East Orange, 1957', masters: true,
      fen: '1rb2rk1/p4ppn/1p1qp1n1/8/2pP3P/2P3P1/PPQ2PB1/R1B1R1K1 w - - 0 19',
      moves: ['h4h5', 'c8b7', 'h5g6', 'f7g6', 'g2b7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 469cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'h5 hits the knight on g6. The line runs 19.h5 Bb7 20.hxg6 fxg6 21.Bxb7. White finishes a rook up.'
    },
    {
      id: 'p204', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Botvinnik vs Savitsky, Leningrad-ch, 1932', masters: true,
      fen: 'r1b1k2r/p2p1pp1/1p2p2p/2P5/2P3Pq/Q1P5/P3PP1P/2R1KB1R w Kkq - 0 16',
      moves: ['f1g2', 'a8b8', 'a3a7', 'h4g5', 'e1g1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 364cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Bg2 hits the rook on a8. The line runs 16.Bg2 Rb8 17.Qxa7 Qg5 18.O-O. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p205', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Keres vs Book, Kemeri, 1937', masters: true,
      fen: '2rq1rk1/3n2pp/b1p1pb2/p1P5/1p1PN3/2B3P1/P4PBP/R2QR1K1 w - - 0 19',
      moves: ['c3b2', 'g8h8', 'd1c2', 'f6e7', 'a2a3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 265cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Bb2 is the only move that keeps the advantage. The line runs 19.Bb2 Kh8 20.Qc2 Be7 21.a3. The point is positional rather than material — Stockfish rates it +3.0 for white.'
    },
    {
      id: 'p206', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Keres vs Fine, Ostende, 1937', masters: true,
      fen: '2rr2k1/1bq2ppn/8/p2pP3/Pp5Q/1B2R3/5PPP/4R1K1 w - - 0 25',
      moves: ['e3h3', 'g8f8', 'h4h7', 'd8e8', 'h3g3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 494cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rh3 is the only move that keeps the advantage. The line runs 25.Rh3 Kf8 26.Qxh7 Re8 27.Rg3. White finishes a piece up.'
    },
    {
      id: 'p207', rating: 1490, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Keres vs Eliskases, Semmering/Baden, 1937', masters: true,
      fen: 'r3rk2/pp3pq1/7p/3n4/1p1P2Q1/3B4/P2B1PPP/1R4K1 w - - 0 28',
      moves: ['g4h5', 'd5f6', 'h5h4', 'h6h5', 'b1b4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 258cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qh5 hits the knight on d5. The line runs 28.Qh5 Nf6 29.Qh4 h5 30.Rxb4. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p208', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Tseshkovsky vs Kasparov, URS-ch49, 1981', masters: true,
      fen: '2r3k1/1p4pp/p1n1p3/8/P5P1/1NP3qP/1P3bQ1/R1B2K2 b - - 1 23',
      moves: ['g3e5', 'g2f2', 'c8f8', 'f2f8', 'g8f8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 408cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qe5 is the only move that keeps the advantage. The line runs 23...Qe5 24.Qxf2 Rf8 25.Qxf8+ Kxf8. Black comes out a pawn up with much the better position.'
    },
    {
      id: 'p209', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Fischer vs Tal, Candidats Tournament, 1959', masters: true,
      fen: 'r4r2/1q1nb1kp/p1b5/4pp2/NpP1Nn2/1B4Q1/PP3BPP/R3R1K1 b - - 1 23',
      moves: ['g7h8', 'a4c5', 'd7c5', 'e4c5', 'e7c5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 279cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kh8 is the only move that keeps the advantage. The line runs 23...Kh8 24.Nac5 Nxc5 25.Nxc5 Bxc5. Black finishes a piece up.'
    },
    {
      id: 'p210', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Spassky vs Fuchs, WchT U26, 1958', masters: true,
      fen: 'r7/p3nkBQ/bp2pN2/3pP3/3n2P1/P1qR1p2/2P2PKP/7R w - - 0 28',
      moves: ['g2h3', 'a6d3', 'c2d3', 'c3d3', 'h7d3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 710cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kh3 is the only move that keeps the advantage. The line runs 28.Kh3 Bxd3 29.cxd3 Qxd3 30.Qxd3. White finishes a rook up.'
    },
    {
      id: 'p211', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Keres vs Rojahn, Buenos Aires ol prel-D, 1939', masters: true,
      fen: '4r1k1/1p3ppq/p7/4p1Q1/4P1B1/2N3P1/PPP2PKr/R7 w - - 1 31',
      moves: ['g2f3', 'h2h1', 'a1h1', 'h7h1', 'f3e2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 700cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kf3 is the only move that keeps the advantage. The line runs 31.Kf3 Rh1 32.Rxh1 Qxh1+ 33.Ke2. The point is positional rather than material — Stockfish rates it +4.0 for white.'
    },
    {
      id: 'p212', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Mazel vs Botvinnik, URS-ch sf, 1938', masters: true,
      fen: 'r2qkb1r/pp1b1ppp/8/3pP3/1np2Pn1/P1N2N2/1P1P2PP/R1BQKB1R b KQkq - 3 11',
      moves: ['d8b6', 'd1e2', 'b4d3', 'e2d3', 'b6f2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 565cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qb6 is the only move that keeps the advantage. The line runs 11...Qb6 12.Qe2 Nd3+ 13.Qxd3 Qf2+. The point is positional rather than material — Stockfish rates it +6.3 for black.'
    },
    {
      id: 'p213', rating: 1490, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Wheatcroft vs Keres, Margate, 1939', masters: true,
      fen: '1k5r/1B1P2p1/p1N1b3/1pp1p3/6P1/2P5/P2K4/8 b - - 1 32',
      moves: ['b8c7', 'd7d8r', 'h8d8', 'c6d8', 'c7d8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 535cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Kc7 attacks the knight on c6 and the bishop on b7 at the same time. The line runs 32...Kc7 33.d8=R Rxd8+ 34.Nxd8 Kxd8. The point is positional rather than material — Stockfish rates it +3.9 for black.'
    },
    {
      id: 'p214', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Keres vs Menchik, Margate, 1939', masters: true,
      fen: 'r1b2b1r/pp1nk1pp/2n2p2/3pP2Q/3q1N2/3B4/PP1N1PPP/R1B1K2R w KQ - 0 13',
      moves: ['d2f3', 'd4a4', 'b2b3', 'a4b4', 'c1d2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 354cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Nf3 hits the queen on d4. The line runs 13.Nf3 Qa4 14.b3 Qb4+ 15.Bd2. The point is positional rather than material — Stockfish rates it +4.3 for white.'
    },
    {
      id: 'p215', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Bronstein vs Ragozin, URS-ch13, 1944', masters: true,
      fen: '8/p3q1k1/4r1p1/4p3/4Ppb1/2QN4/PPP5/2K4R w - - 5 31',
      moves: ['h1g1', 'e7h4', 'd3e5', 'h4f6', 'e5g4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 312cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rg1 hits the bishop on g4. The line runs 31.Rg1 Qh4 32.Nxe5 Qf6 33.Nxg4. White finishes a piece up.'
    },
    {
      id: 'p216', rating: 1490, category: 'forks',
      themes: ['fork', 'from a real game'],
      game: 'Sangla vs Karpov, URS-chT, 1968', masters: true,
      fen: 'r1b1k2r/pp1p1p1p/1qn1p3/6B1/3Pn3/1Q2P3/PP1N1PPP/R3KB1R b KQkq - 0 11',
      moves: ['b6a5', 'e1c1', 'e4d2', 'd1d2', 'a5g5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 418cp',
      hint: 'One square attacks two things at once. Find it.',
      explain: 'Qa5 attacks the knight on d2 and the bishop on g5 at the same time. The line runs 11...Qa5 12.O-O-O Nxd2 13.Rxd2 Qxg5. Black finishes a piece up.'
    },
    {
      id: 'p217', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Rubinstein vs Berger, Karlsbad, 1907', masters: true,
      fen: '2r3k1/R5pp/5p2/8/8/1P2RP2/P4P1P/3r2K1 w - - 1 28',
      moves: ['g1g2', 'g8h8', 'e3e7', 'c8g8', 'a2a4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 872cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kg2 is the only move that keeps the advantage. The line runs 28.Kg2 Kh8 29.Ree7 Rg8 30.a4. The point is positional rather than material — Stockfish rates it +3.6 for white.'
    },
    {
      id: 'p218', rating: 1490, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Smyslov vs Ragozin, Sverdlovsk, 1943', masters: true,
      fen: '5k1r/p4pbp/4r1p1/2n5/8/P7/1P1B1PPP/R4KNR w - - 0 25',
      moves: ['d2b4', 'g7f6', 'b4c5', 'f8g7', 'c5e3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 345cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Bb4 hits the knight on c5. The line runs 25.Bb4 Bf6 26.Bxc5+ Kg7 27.Be3. White finishes a piece up.'
    },
    {
      id: 'p219', rating: 1490, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Bronstein vs Kotov, Parnu, 1947', masters: true,
      fen: 'r5k1/1b2Qppp/pB2n1q1/1p2p3/4P3/P1N2B2/1PP3PP/6K1 b - - 1 26',
      moves: ['b7c6', 'b6e3', 'e6d4', 'e3d4', 'e5d4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 385cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Bc6 is the only move that keeps the advantage. The line runs 26...Bc6 27.Be3 Nd4 28.Bxd4 exd4. The point is positional rather than material — Stockfish rates it +3.1 for black.'
    },
    {
      id: 'p220', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Rubinstein vs Marshall, Lodz mt, 1908', masters: true,
      fen: '1n3k2/pb2qn2/1p2p1Qr/1Np1Pp2/P1B2P2/1P2B3/5RPP/6K1 w - - 3 25',
      moves: ['g6g3', 'b8c6', 'c4f1', 'h6h7', 'f2d2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 440cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Qg3 is the only move that keeps the advantage. The line runs 25.Qg3 Nc6 26.Bf1 Rh7 27.Rd2. The point is positional rather than material — Stockfish rates it +2.1 for white.'
    },
    {
      id: 'p221', rating: 1490, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Solntsev vs Smyslov, Moscow-ch, 1946', masters: true,
      fen: '3r2k1/1R3p1p/4pbp1/p7/2Q5/1Bp1PP1P/P4PK1/4q3 b - - 11 32',
      moves: ['d8d2', 'c4f1', 'e1e3', 'g2g1', 'e3f3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 560cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Rd2 is the only move that keeps the advantage. The line runs 32...Rd2 33.Qf1 Qxe3 34.Kg1 Qxf3. Black wins the exchange.'
    },
    {
      id: 'p222', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Tukmakov vs Karpov, Leningrad Interzonal, 1973', masters: true,
      fen: '1R4k1/4rpp1/2p2q1p/4pP2/8/1B4QP/P3rPP1/6K1 b - - 3 32',
      moves: ['g8h7', 'g3g4', 'e2e1', 'g1h2', 'e5e4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 840cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kh7 is the only move that keeps the advantage. The line runs 32...Kh7 33.Qg4 Re1+ 34.Kh2 e4. The point is positional rather than material — Stockfish rates it +3.2 for black.'
    },
    {
      id: 'p223', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Rubinstein vs Dus Chotimirsky, Vilnius, 1909', masters: true,
      fen: '2r4r/pp1bk1p1/4pp1p/B7/2PNn3/8/PP3PPP/3R1RK1 w - - 2 22',
      moves: ['f1e1', 'f6f5', 'f2f3', 'e6e5', 'd4b3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 277cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Rfe1 hits the knight on e4. The line runs 22.Rfe1 f5 23.f3 e5 24.Nb3. The point is positional rather than material — Stockfish rates it +3.4 for white.'
    },
    {
      id: 'p224', rating: 1490, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Marshall vs Rubinstein, Karlsbad, 1911', masters: true,
      fen: '3r1rk1/pp3pp1/4b2p/3N4/8/3Q2P1/qb2PPBP/1R1R2K1 w - - 0 19',
      moves: ['d3d2', 'a2b1', 'd1b1', 'b2e5', 'd2e3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 334cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Qd2 hits the bishop on b2. The line runs 19.Qd2 Qxb1 20.Rxb1 Be5 21.Qe3. White finishes a piece up.'
    },
    {
      id: 'p225', rating: 1490, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Rubinstein vs Spielmann, San Sebastian, 1912', masters: true,
      fen: '6k1/1p4pp/3pp3/p7/1PP1R3/P1QR2PK/5q1P/5r2 b - - 3 29',
      moves: ['f1h1', 'd3f3', 'f2h2', 'h3g4', 'h2h3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 368cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Rh1 is the only move that keeps the advantage. The line runs 29...Rh1 30.Rf3 Qxh2+ 31.Kg4 Qh3+. Black comes out a pawn up with much the better position.'
    },
    {
      id: 'p226', rating: 1490, category: 'pins',
      themes: ['pin', 'from a real game'],
      game: 'Rubinstein vs Leonhardt, San Sebastian, 1912', masters: true,
      fen: '1k1r4/pp1q3p/6p1/r7/2R5/1QP3P1/5P1P/1R4K1 w - - 0 31',
      moves: ['c4b4', 'b7b5', 'c3c4', 'd7c6', 'c4b5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 304cp',
      hint: 'Something on that line is not allowed to move.',
      explain: 'Rb4 is the only move that keeps the advantage. The line runs 31.Rb4 b5 32.c4 Qc6 33.cxb5. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p227', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Reti vs Rubinstein, Stockholm, 1919', masters: true,
      fen: '8/2Q3pp/2p2nk1/8/8/Br5P/4q1P1/5RK1 w - - 0 28',
      moves: ['a3f8', 'e2e3', 'g1h2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Bf8 is the only move that keeps the advantage. The line runs 28.Bf8 Qe3+ 29.Kh2. The point is positional rather than material — Stockfish rates it +0.0 for white.'
    },
    {
      id: 'p228', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Bogoljubow vs Rubinstein, Stockholm/Gothenburg m, 1920', masters: true,
      fen: '4r1k1/1p2r1pp/p1pqbp2/P1N5/1P1P4/4P1R1/3Q2PP/2R3K1 w - - 11 31',
      moves: ['c5e4', 'd6b8', 'e4f6', 'g8h8', 'f6e8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 303cp',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Ne4 hits the queen on d6. The line runs 31.Ne4 Qb8 32.Nxf6+ Kh8 33.Nxe8. White finishes a rook up.'
    },
    {
      id: 'p229', rating: 1490, category: 'tactics',
      themes: ['combination', 'from a real game'],
      game: 'Euwe vs Rubinstein, The Hague, 1921', masters: true,
      fen: 'r4rk1/pb4pp/1p6/2P3qP/1PB1p2R/4p2Q/P2N4/R3K3 b - - 1 32',
      moves: ['g8h8', 'h5h6', 'g5g1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'One move here is far better than the rest. It is a forcing one.',
      explain: 'Kh8 is the only move that keeps the advantage. The line runs 32...Kh8 33.h6 Qg1+. The point is positional rather than material — Stockfish rates it +0.0 for black.'
    },
    {
      id: 'p230', rating: 1500, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Morphy vs Rousseau, New Orleans, 1849', masters: true,
      fen: 'rnQ2bBr/pp2k3/2p4p/2qp4/5p1P/2N5/PPPP2P1/R1BK4 w - - 1 16',
      moves: ['c3d5', 'c5d5', 'g8d5', 'c6d5', 'c8b7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 734cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Nxd5+ gives up material on purpose. Comes with check, so black has no time to reorganise. The line runs 16.Nxd5+ Qxd5 17.Bxd5 cxd5 18.Qxb7+. White finishes a rook up.'
    },
    {
      id: 'p231', rating: 1500, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Mogilevsky vs Smyslov, Kuibyshev, 1942', masters: true,
      fen: '2rr2k1/pp3p2/4R1pQ/2q1n3/3p4/P5PB/1PP2P1P/1K1R4 b - - 2 23',
      moves: ['c5c2', 'b1a2', 'c2d1', 'h6g5', 'd1h5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 461cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Qxc2+ gives up material on purpose. Attacks the rook on d1 and the king on b1 at the same time. The line runs 23...Qxc2+ 24.Ka2 Qxd1 25.Qg5 Qh5. Black finishes a rook up.'
    },
    {
      id: 'p232', rating: 1500, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Ivkov vs Karpov, Caracas, 1970', masters: true,
      fen: '3qrknQ/pbr2ppB/1p5p/4bp2/3P4/P1p5/1P3PPP/3RR1K1 w - - 0 25',
      moves: ['h8g8', 'f8e7', 'e1e5', 'e7d7', 'h7f5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 736cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Qxg8+ gives up material on purpose. Comes with check, so black has no time to reorganise. The line runs 25.Qxg8+ Ke7 26.Rxe5+ Kd7 27.Bxf5+. White finishes a rook up.'
    },
    {
      id: 'p233', rating: 1500, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Rubinstein vs Leonhardt, Vienna, 1908', masters: true,
      fen: 'r1b1r1k1/ppqB1ppp/4p3/3pb3/1P6/2P5/P2NQPPP/R1B1R1K1 b - - 0 17',
      moves: ['e5h2', 'g1h1', 'c8d7', 'g2g3', 'h2g3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 558cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Bxh2+ gives up material on purpose. Comes with check, so white has no time to reorganise. The line runs 17...Bxh2+ 18.Kh1 Bxd7 19.g3 Bxg3. Black finishes a rook up.'
    },
    {
      id: 'p234', rating: 1500, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Smyslov vs Kasparian, URS-ch15, 1947', masters: true,
      fen: 'R6r/4kpp1/1q1bp2p/3n4/1p5P/6Q1/PP1B1PP1/1K2R3 w - - 3 28',
      moves: ['e1e6', 'e7e6', 'g3g4', 'f7f5', 'g4e2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 410cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rxe6+ gives up material on purpose. Attacks the bishop on d6 and the king on e7 at the same time. The line runs 28.Rxe6+ Kxe6 29.Qg4+ f5 30.Qe2+. The point is positional rather than material — Stockfish rates it +3.9 for white.'
    },
    {
      id: 'p235', rating: 1500, category: 'discovered',
      themes: ['discovered attack', 'sacrifice', 'from a real game'],
      game: 'Furman vs Smyslov, URS-ch17, 1949', masters: true,
      fen: '4r2k/p6p/bp2B1q1/3P1p2/2n5/2R5/PQ3PPP/6K1 w - - 0 31',
      moves: ['c3c4', 'g6g7', 'b2g7', 'h8g7', 'c4a4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 490cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rxc4+ gives up material on purpose. Is a discovered check — the check comes from the piece behind it. The line runs 31.Rxc4+ Qg7 32.Qxg7+ Kxg7 33.Ra4. White finishes a piece up.'
    },
    {
      id: 'p236', rating: 1600, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Szabo vs Anderssen, London2, 1851', masters: true,
      fen: 'Q6k/1pp3pp/3p4/6q1/5r2/3P3P/P4rP1/RN4NK b - - 2 23',
      moves: ['f4f8', 'a8f8', 'f2f8', 'g1f3', 'g5c1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 1251cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rf8 gives up material on purpose. Hits the queen on a8. The line runs 23...Rf8 24.Qxf8+ Rxf8 25.Nf3 Qc1+. Black finishes a piece up.'
    },
    {
      id: 'p237', rating: 1600, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Barshev vs Botvinnik, Leningrad NW Provincial sf, 1926', masters: true,
      fen: '6k1/pb4p1/1p2p2p/3q2P1/3Pp3/6B1/PPQ4P/4R1K1 b - - 0 29',
      moves: ['e4e3', 'e1e3', 'd5h1', 'g1f2', 'h1g2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 1015cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'e3 gives up material on purpose. Is the only move that keeps the advantage. The line runs 29...e3 30.Rxe3 Qh1+ 31.Kf2 Qg2+. The point is positional rather than material — Stockfish rates it +6.2 for black.'
    },
    {
      id: 'p238', rating: 1600, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Fischer vs Sherwin, USA-ch, 1957', masters: true,
      fen: '5rk1/5Rpp/3p4/3B2q1/R3P1n1/8/P3Q1PP/2r4K w - - 1 31',
      moves: ['e2f1', 'h7h5', 'f1c1', 'g5c1', 'f7f1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 1110cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Qf1 gives up material on purpose. Hits the rook on c1. The line runs 31.Qf1 h5 32.Qxc1 Qxc1+ 33.Rf1+. The point is positional rather than material — Stockfish rates it +5.1 for white.'
    },
    {
      id: 'p239', rating: 1600, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Furman vs Spassky, URS-ch24, 1957', masters: true,
      fen: '5rk1/pp3r1p/2np2p1/3Np3/1PP5/3B1n1q/PB3R1P/2RQ3K b - - 3 23',
      moves: ['f3e1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 22',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Ne1 gives up material on purpose. Hits the bishop on d3. The line runs 23...Ne1. The point is positional rather than material — Stockfish rates it +0.0 for black.'
    },
    {
      id: 'p240', rating: 1620, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Tal vs Lozov, Riga-ch, 1952', masters: true,
      fen: 'rn1r2k1/pbq2ppp/1p1bp3/2pPN3/4PB2/6PB/PPQ2P1P/R4RK1 w - - 5 16',
      moves: ['e5f7', 'c7f7', 'h3e6', 'f7e6', 'd5e6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 340cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Nxf7 gives up material on purpose. Attacks the rook on d8 and the bishop on d6 at the same time. The line runs 16.Nxf7 Qxf7 17.Bxe6 Qxe6 18.dxe6. White finishes a rook up.'
    },
    {
      id: 'p241', rating: 1620, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Loewenthal vs Anderssen, London m9, 1851', masters: true,
      fen: 'rn3k1r/ppp2pRp/8/3N4/2pPP1b1/5N1q/PPP2K2/R2Q4 w - - 5 19',
      moves: ['g7g4', 'h3g4', 'd1d2', 'c4c3', 'd2c3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 300cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rxg4 gives up material on purpose. Is the only move that keeps the advantage. The line runs 19.Rxg4 Qxg4 20.Qd2 c3 21.Qxc3. The point is positional rather than material — Stockfish rates it +3.3 for white.'
    },
    {
      id: 'p242', rating: 1620, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Mongredien vs Anderssen, London2, 1851', masters: true,
      fen: '3r2k1/ppp2bpp/2n3r1/1Q1P3q/5p2/2N2N2/PP3PPP/R3R2K b - - 5 20',
      moves: ['g6g2', 'b5f1', 'g2g6', 'f1e2', 'h5h3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 320cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rxg2 gives up material on purpose. Is the only move that keeps the advantage. The line runs 20...Rxg2 21.Qf1 Rg6 22.Qe2 Qh3. Black comes out a pawn up with much the better position.'
    },
    {
      id: 'p243', rating: 1620, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Kasparov vs Palatnik, URS-ch sf, 1978', masters: true,
      fen: 'r4rkn/3nq1b1/bp2p3/p3PppQ/P2PN3/2N5/1PB2RPP/R5K1 w - f6 0 25',
      moves: ['e4g5', 'f8f7', 'c2f5', 'f7f5', 'f2f5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 230cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Nxg5 gives up material on purpose. Is the only move that keeps the advantage. The line runs 25.Nxg5 Rf7 26.Bxf5 Rxf5 27.Rxf5. White finishes a piece up.'
    },
    {
      id: 'p244', rating: 1620, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Grigorian vs Kasparov, Baku, 1980', masters: true,
      fen: '4r1k1/1p6/p2p3b/2pP3p/P5nq/4P3/1P2QRB1/R4NK1 b - - 2 29',
      moves: ['h6e3', 'f1e3', 'h4h2', 'g1f1', 'g4e3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 499cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Bxe3 gives up material on purpose. Hits the rook on f2. The line runs 29...Bxe3 30.Nxe3 Qh2+ 31.Kf1 Nxe3+. Black comes out a pawn up with much the better position.'
    },
    {
      id: 'p245', rating: 1620, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Kramer vs Fischer, USA-ch, 1957', masters: true,
      fen: '2rq1rk1/p2bppbp/2n3p1/2B5/3P4/2Q3P1/P2N2BP/R3NRK1 b - - 0 20',
      moves: ['c6d4', 'c3b4', 'a7a5', 'b4d4', 'g7d4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 521cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Nxd4 gives up material on purpose. Is the only move that keeps the advantage. The line runs 20...Nxd4 21.Qb4 a5 22.Qxd4 Bxd4+. Black finishes a rook up.'
    },
    {
      id: 'p246', rating: 1620, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Karpov vs Vaganian, URS-ch U18 playoff, 1969', masters: true,
      fen: '8/p4pbk/1p4pp/7r/B2Pb3/4P1qP/PPR3P1/2Q2RK1 b - - 4 29',
      moves: ['h5h3', 'f1f7', 'g3h2', 'g1f1', 'h2h1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 377cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rxh3 gives up material on purpose. Is the only move that keeps the advantage. The line runs 29...Rxh3 30.Rxf7 Qh2+ 31.Kf1 Qh1+. The point is positional rather than material — Stockfish rates it +4.2 for black.'
    },
    {
      id: 'p247', rating: 1630, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Sliwa vs Spassky, Bucharest, 1953', masters: true,
      fen: '1q5r/3k1ppp/R2bp3/3n4/3Q4/8/PP3PPP/2R3K1 w - - 1 25',
      moves: ['a6a7', 'd7d8', 'd4a4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Ra7+ gives up material on purpose. Comes with check, so black has no time to reorganise. The line runs 25.Ra7+ Kd8 26.Qa4. The point is positional rather than material — Stockfish rates it +0.0 for white.'
    },
    {
      id: 'p248', rating: 1630, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Kasparov vs Butnorius, Moscow, 1978', masters: true,
      fen: 'b4rk1/p1n3p1/1p1rpP1q/7p/1P2PR1B/P4R2/6PP/5QK1 w - - 0 28',
      moves: ['f6f7', 'g8h7', 'h4e7', 'e6e5', 'e7f8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 398cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'f7+ gives up material on purpose. Comes with check, so black has no time to reorganise. The line runs 28.f7+ Kh7 29.Be7 e5 30.Bxf8. White finishes a rook up.'
    },
    {
      id: 'p249', rating: 1630, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Botvinnik vs Capablanca, AVRO, 1938', masters: true,
      fen: '8/p5kp/1p2Pnp1/3pQ3/2pP4/qnP3N1/6PP/6K1 w - - 0 31',
      moves: ['g3h5', 'g6h5', 'e5g5', 'g7h8', 'g5f6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 644cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Nh5+ gives up material on purpose. Attacks the knight on f6 and the king on g7 at the same time. The line runs 31.Nh5+ gxh5 32.Qg5+ Kh8 33.Qxf6+. The point is positional rather than material — Stockfish rates it +6.4 for white.'
    },
    {
      id: 'p250', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Morphy vs Mac Connel, New Orleans, 1849', masters: true,
      fen: 'rnb1kbnr/pp1p1ppp/2p5/4P3/3p4/2NB1N2/PPP2PqP/R1BQK2R w KQkq - 0 7',
      moves: ['h1g1', 'g2h3', 'g1g3', 'h3h5', 'g3g5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 424cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rg1 gives up material on purpose. Hits the queen on g2. The line runs 7.Rg1 Qh3 8.Rg3 Qh5 9.Rg5. The point is positional rather than material — Stockfish rates it +2.7 for white.'
    },
    {
      id: 'p251', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Tal vs Akmentin, LAT-ch, 1954', masters: true,
      fen: '4k2r/3n1ppp/2B1p3/4Q3/3P4/1qbKP3/5P1P/2B3R1 w k - 1 22',
      moves: ['e5b5', 'b3b5', 'c6b5', 'c3b4', 'g1g7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 268cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Qb5 gives up material on purpose. Hits the queen on b3. The line runs 22.Qb5 Qxb5+ 23.Bxb5 Bb4 24.Rxg7. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p252', rating: 1750, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Alekhine vs Romanovsky, All-Russian, 1909', masters: true,
      fen: 'r1bqk2r/ppp2pp1/3p1n1p/2b1pP2/N1BnP3/P2P4/1PP3PP/R1BQK1NR b KQkq - 2 8',
      moves: ['b7b5', 'a4c5', 'b5c4', 'c2c3', 'd6c5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 274cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'b5 gives up material on purpose. Attacks the knight on a4 and the bishop on c4 at the same time. The line runs 8...b5 9.Nxc5 bxc4 10.c3 dxc5. Black finishes a piece up.'
    },
    {
      id: 'p253', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Melik vs Tal, URS-chTJ, 1954', masters: true,
      fen: 'r5k1/p4rp1/q2p4/6Np/2pPP1nP/8/PPQ5/2K3RR b - - 0 26',
      moves: ['f7f2', 'h1h3', 'f2c2', 'c1c2', 'a8b8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 476cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rf2 gives up material on purpose. Hits the queen on c2. The line runs 26...Rf2 27.Rh3 Rxc2+ 28.Kxc2 Rb8. Black finishes a piece up.'
    },
    {
      id: 'p254', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Dufresne vs Anderssen, Berlin m2, 1851', masters: true,
      fen: '3r2k1/p4ppp/bbB5/2n1p3/2P1P3/6R1/P1QNqPPP/5RK1 w - - 0 25',
      moves: ['c6d5', 'b6a5', 'f1d1', 'c5e4', 'c2e4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 507cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Bd5 gives up material on purpose. Is the only move that keeps the advantage. The line runs 25.Bd5 Ba5 26.Rd1 Nxe4 27.Qxe4. White wins the exchange.'
    },
    {
      id: 'p255', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Podhajsky vs Capablanca, Prague sim, 1911', masters: true,
      fen: '6k1/pb1p2p1/1p1pp3/5r2/2PP2q1/P3P1PR/1P1Q3K/R7 b - - 2 29',
      moves: ['f5h5', 'h3h5', 'g4h5', 'h2g1', 'h5h1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 445cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rh5 gives up material on purpose. Hits the rook on h3. The line runs 29...Rh5 30.Rxh5 Qxh5+ 31.Kg1 Qh1+. The point is positional rather than material — Stockfish rates it +5.3 for black.'
    },
    {
      id: 'p256', rating: 1750, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Saigin vs Tal, Riga m, 1954', masters: true,
      fen: '3r2k1/6pp/1p1q1p2/p7/2P3b1/PPQ2NP1/1B1p2KP/3R4 b - - 3 32',
      moves: ['d6d3', 'c3d3', 'd8d3', 'f3e1', 'g4d1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 544cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Qd3 gives up material on purpose. Attacks the queen on c3 and the knight on f3 at the same time. The line runs 32...Qd3 33.Qxd3 Rxd3 34.Ne1 Bxd1. Black finishes a rook up.'
    },
    {
      id: 'p257', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Zytogorski vs Anderssen, London2, 1851', masters: true,
      fen: 'r1bk1r2/2pp2pp/2p2q2/p2B4/4PP2/2Q5/P5PP/2R2RK1 w - - 0 19',
      moves: ['e4e5', 'f6h6', 'c3c5', 'f8e8', 'd5c4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 306cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'e5 gives up material on purpose. Hits the queen on f6. The line runs 19.e5 Qh6 20.Qc5 Re8 21.Bc4. The point is positional rather than material — Stockfish rates it +2.5 for white.'
    },
    {
      id: 'p258', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Morphy vs Barnes, London m1, 1858', masters: true,
      fen: 'r3k1r1/ppp1b2p/2n1Q1b1/q2pp3/8/1BP1B3/PPP2PPP/3R1RK1 b q - 4 17',
      moves: ['g6f7', 'e6f5', 'a8d8', 'f5h7', 'd8d6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 689cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Bf7 gives up material on purpose. Hits the queen on e6. The line runs 17...Bf7 18.Qf5 Rd8 19.Qxh7 Rd6. The point is positional rather than material — Stockfish rates it +2.7 for black.'
    },
    {
      id: 'p259', rating: 1750, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Botvinnik vs Stoltz, Leningrad-Stockholm, 1926', masters: true,
      fen: 'r1b2rk1/p1Rn1ppp/1p1q4/1B6/3P4/4PQ2/PP3PPP/5RK1 w - - 1 16',
      moves: ['f3c6', 'd6b4', 'c6a8', 'c8a6', 'a8f8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 429cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Qc6 gives up material on purpose. Attacks the queen on d6 and the rook on a8 at the same time. The line runs 16.Qc6 Qb4 17.Qxa8 Ba6 18.Qxf8+. White finishes a queen to the good.'
    },
    {
      id: 'p260', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Sobel vs Fischer, CAN-op, 1956', masters: true,
      fen: 'r2r4/pp3pkp/4pnp1/3N4/2P3Pq/PP3P2/1Q4K1/R4R2 w - - 0 25',
      moves: ['f1h1', 'h4g5', 'h1h7', 'g7f8', 'b2f6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 583cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rh1 gives up material on purpose. Hits the queen on h4. The line runs 25.Rh1 Qg5 26.Rxh7+ Kf8 27.Qxf6. White finishes a piece up.'
    },
    {
      id: 'p261', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Keres vs Schmidt, EST-ch m, 1936', masters: true,
      fen: 'r4rk1/p1p1qpp1/1n3n2/1Q1P1b1p/1b2pP2/2N1P3/P2PN1PP/R1B1KB1R w KQ - 0 13',
      moves: ['d5d6', 'e7d6', 'b5f5', 'c7c5', 'e2g3'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 338cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'd6 gives up material on purpose. Hits the queen on e7. The line runs 13.d6 Qxd6 14.Qxf5 c5 15.Ng3. White wins the exchange.'
    },
    {
      id: 'p262', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Botvinnik vs Alatortsev, URS-ch07, 1931', masters: true,
      fen: 'r4rk1/p1p1n1b1/1p1p2p1/3Pp1Pn/2P1P1q1/1P2B1N1/P2QN1B1/2K4R w - - 0 25',
      moves: ['g2h3', 'g4h3', 'h1h3', 'f8f3', 'g3h5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 554cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Bh3 gives up material on purpose. Hits the queen on g4. The line runs 25.Bh3 Qxh3 26.Rxh3 Rf3 27.Nxh5. White finishes a queen to the good.'
    },
    {
      id: 'p263', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Goglidze vs Botvinnik, Moscow, 1935', masters: true,
      fen: 'r1r3k1/5p1p/pQ4p1/N2b4/3Pp3/R3P3/4qPPP/5RK1 b - - 0 26',
      moves: ['a8b8', 'b6b8', 'c8b8', 'a3c3', 'e2a2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 411cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rab8 gives up material on purpose. Hits the queen on b6. The line runs 26...Rab8 27.Qxb8 Rxb8 28.Rc3 Qa2. Black finishes a piece up.'
    },
    {
      id: 'p264', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Geller vs Kasparov, Moscow, 1981', masters: true,
      fen: 'r4r1k/p4ppp/2n5/3qn2Q/4N2R/1P6/P5PP/R6K b - - 1 23',
      moves: ['h7h6', 'a1d1', 'd5b5', 'h5g5', 'f7f6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 691cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'h6 gives up material on purpose. Is the only move that keeps the advantage. The line runs 23...h6 24.Rd1 Qb5 25.Qg5 f6. The point is positional rather than material — Stockfish rates it +3.6 for black.'
    },
    {
      id: 'p265', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Fine vs Keres, AVRO, 1938', masters: true,
      fen: '5k2/2p1b1pp/8/3N1p2/8/1p1n1P2/3R1PKP/8 b - - 3 32',
      moves: ['b3b2', 'd2d1', 'd3c1', 'd5c3', 'e7f6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 310cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'b2 gives up material on purpose. Is the only move that keeps the advantage. The line runs 32...b2 33.Rd1 Nc1 34.Nc3 Bf6. The point is positional rather than material — Stockfish rates it +3.5 for black.'
    },
    {
      id: 'p266', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Wexler vs Fischer, Mar del Plata, 1959', masters: true,
      fen: '5r1k/8/3pq2p/2pb1p2/P2b4/4pNP1/4Q1PP/3R1R1K b - - 0 32',
      moves: ['d5c4', 'f3d4', 'c5d4', 'e2b2', 'e3e2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 220cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Bc4 gives up material on purpose. Hits the queen on e2. The line runs 32...Bc4 33.Nxd4 cxd4 34.Qb2 e2. The point is positional rather than material — Stockfish rates it +3.0 for black.'
    },
    {
      id: 'p267', rating: 1750, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Spassky vs Vasiukov, Alekhine mem, 1959', masters: true,
      fen: '1r4k1/1ppq1p1p/p2p1npb/3P4/P2P2P1/1QN2N1P/1P3PK1/4R3 w - - 1 22',
      moves: ['g4g5', 'h6g5', 'f3g5', 'd7f5', 'g5e4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 264cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'g5 gives up material on purpose. Attacks the knight on f6 and the bishop on h6 at the same time. The line runs 22.g5 Bxg5 23.Nxg5 Qf5 24.Nge4. White wins the exchange.'
    },
    {
      id: 'p268', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Alatortsev vs Smyslov, Moscow-ch, 1942', masters: true,
      fen: '4r1k1/5pbp/p5p1/3Pn3/4P3/N1Q5/PP4qP/1K1R3R b - - 0 26',
      moves: ['e5c4', 'e4e5', 'g7e5', 'h1e1', 'e8c8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 355cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Nc4 gives up material on purpose. Hits the knight on a3. The line runs 26...Nc4 27.e5 Bxe5 28.Rhe1 Rc8. Black comes out a pawn up with much the better position.'
    },
    {
      id: 'p269', rating: 1750, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Rotlewi vs Rubinstein, Lodz1, 1907', masters: true,
      fen: '3r2k1/1b3ppp/pb2p3/1p2P3/1P2BPnP/P1r5/1B2Q2P/R4R1K b - - 0 23',
      moves: ['d8d2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 22',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rd2 gives up material on purpose. Attacks the queen on e2 and the bishop on b2 at the same time. The line runs 23...Rd2. The point is positional rather than material — Stockfish rates it +0.0 for black.'
    },
    {
      id: 'p270', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Znosko Borovsky vs Rubinstein, Ostende-B, 1907', masters: true,
      fen: 'r3k2r/1pp2ppp/p1pbb1q1/6B1/3PN1P1/8/PPP2P1P/R2QR1K1 w kq - 1 13',
      moves: ['f2f4', 'e8g8', 'f4f5', 'e6f5', 'g4f5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 277cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'f4 gives up material on purpose. Is the only move that keeps the advantage. The line runs 13.f4 O-O 14.f5 Bxf5 15.gxf5. White wins the exchange.'
    },
    {
      id: 'p271', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Smyslov vs Kottnauer, Groningen, 1946', masters: true,
      fen: '1q2kb1r/1r1n1ppp/2Q1p3/2p5/8/8/1PP2PPP/R1BR2K1 w k - 0 19',
      moves: ['c1f4', 'b8f4', 'c6c8', 'e8e7', 'c8b7'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 418cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Bf4 gives up material on purpose. Hits the queen on b8. The line runs 19.Bf4 Qxf4 20.Qc8+ Ke7 21.Qxb7. White wins the exchange.'
    },
    {
      id: 'p272', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Smyslov vs Baturinsky, Moscow-ch, 1946', masters: true,
      fen: '2k1r2r/pp1bn1Q1/5p2/3p1P2/P1pP4/2q3B1/2P3BP/4RR1K b - - 2 29',
      moves: ['e8g8', 'e1e7', 'g8g7', 'e7g7', 'c3c2'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 581cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Reg8 gives up material on purpose. Hits the queen on g7. The line runs 29...Reg8 30.Rxe7 Rxg7 31.Rxg7 Qxc2. Black wins the exchange.'
    },
    {
      id: 'p273', rating: 1750, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Rubinstein vs Spielmann, Vienna, 1908', masters: true,
      fen: '2q2r1k/ppp3pp/2n2p2/2N2n2/3P4/1B5Q/P4P1P/4R1K1 w - - 0 28',
      moves: ['b3e6', 'c8e8', 'h3f5', 'c6d4', 'f5e4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 361cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Be6 gives up material on purpose. Attacks the queen on c8 and the knight on f5 at the same time. The line runs 28.Be6 Qe8 29.Qxf5 Nxd4 30.Qe4. White wins the exchange.'
    },
    {
      id: 'p274', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Mieses vs Rubinstein, GER m, 1909', masters: true,
      fen: '3rr1k1/pp1q1ppp/4n3/2p2R2/7Q/3PB3/PPP3PP/R5K1 b - - 7 20',
      moves: ['e6d4', 'e3d4', 'd7f5', 'd4c3', 'f7f6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 309cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Nd4 gives up material on purpose. Hits the rook on f5. The line runs 20...Nd4 21.Bxd4 Qxf5 22.Bc3 f6. Black wins the exchange.'
    },
    {
      id: 'p275', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Ragozin vs Smyslov, URS-ch17, 1949', masters: true,
      fen: '4r1k1/q4pbp/2p1p1p1/p2n3n/Pr1PN1P1/5Q2/1PB1RP2/2BR2K1 b - - 0 29',
      moves: ['h5f6', 'b2b3', 'b4d4'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 20',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Nhf6 gives up material on purpose. Hits the knight on e4. The line runs 29...Nhf6 30.b3 Rxd4. Black comes out a pawn up with much the better position.'
    },
    {
      id: 'p276', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Rubinstein vs Nimzowitsch, San Sebastian, 1912', masters: true,
      fen: 'r5k1/pp3ppp/2p5/6P1/2PQq3/1P4P1/P4R1P/1N1Rr1K1 w - - 1 28',
      moves: ['f2f1', 'e1f1', 'g1f1', 'e4h1', 'd4g1'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 521cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Rf1 gives up material on purpose. Hits the rook on e1. The line runs 28.Rf1 Rxf1+ 29.Kxf1 Qh1+ 30.Qg1. The point is positional rather than material — Stockfish rates it +3.6 for white.'
    },
    {
      id: 'p277', rating: 1750, category: 'forks',
      themes: ['fork', 'sacrifice', 'from a real game'],
      game: 'Schlechter vs Rubinstein, Berlin m, 1918', masters: true,
      fen: '1r3rk1/2p2p1p/1b1p2p1/8/2BPPn1q/4NQ2/5PP1/R2R2K1 w - - 0 25',
      moves: ['g2g3', 'h4f6', 'f3f4', 'b6d4', 'f4f6'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 391cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'g3 gives up material on purpose. Attacks the queen on h4 and the knight on f4 at the same time. The line runs 25.g3 Qf6 26.Qxf4 Bxd4 27.Qxf6. White finishes a queen to the good.'
    },
    {
      id: 'p278', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Smyslov vs Moiseev, URS-ch sf, 1951', masters: true,
      fen: '3rr1k1/pb1n1ppp/1p1Bp3/8/2PP2q1/2RBQ3/P2N3P/4R1K1 w - - 0 28',
      moves: ['d6g3', 'd7f6', 'd2b3', 'e6e5', 'd4e5'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 248cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Bg3 gives up material on purpose. Is the only move that keeps the advantage. The line runs 28.Bg3 Nf6 29.Nb3 e5 30.dxe5. White comes out a pawn up with much the better position.'
    },
    {
      id: 'p279', rating: 1750, category: 'sacrifice',
      themes: ['sacrifice', 'sacrifice', 'from a real game'],
      game: 'Flohr vs Smyslov, URS-ch19, 1951', masters: true,
      fen: '3r2k1/1pb1qp1p/4pBp1/2p3P1/bpP5/4PN2/1PQKBP1P/r2R2R1 w - - 3 22',
      moves: ['e2d3', 'e7d6', 'b2b3', 'a4c6', 'f6d8'],
      goal: 'material',
      verified: 'stockfish 17.1 depth 16, best by 350cp',
      hint: 'Material comes back. Work out what happens after the capture.',
      explain: 'Bd3 gives up material on purpose. Is the only move that keeps the advantage. The line runs 22.Bd3 Qd6 23.b3 Bc6 24.Bxd8. White finishes a rook up.'
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
    { id: 'tactics', label: 'Mixed combinations' },
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
