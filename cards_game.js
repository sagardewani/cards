const numValue = {
	"A": 1,
  "2": 2,
	"3": 3,
	"4": 4,
	"5": 5,
	"6": 6,
	"7": 7,
	"8": 8,
	"9": 9,
	"10": 10,
	"J": 11,
	"Q": 12,
	"K": 13,
};

// Randomly Distribute the Cards to each player
var distribute = (playersCount) => {
	const stDeck = [];
	for(let i = 0; i < 52; i++) {
		stDeck.push(Object.keys(numValue)[i%13]);
	}

	const participants = [];
	let deck = new Array(0);
	let cards = stDeck;

	const Player = (trail) => {
		return trail;
	}
	// Sorting Trail To Quickly Announcing the results based on best card first

	const sortTrail = (trail) => {
		const sortedTrail = [];
		let mid = numValue[trail[1]] === 1 ? 14 : numValue[trail[1]];
		let left 	= numValue[trail[0]] === 1 ? 14 : numValue[trail[0]];
		let right = numValue[trail[2]] === 1 ? 14 : numValue[trail[2]];
		const numTrail = [left, mid, right].sort((a,b) => b - a);
		const leftIndex = numTrail.indexOf(left);
		const rightIndex = numTrail.indexOf(right);
		sortedTrail[leftIndex] = trail[0];
		// Left and Right Cards are same
		if(leftIndex === rightIndex) {
			sortedTrail[leftIndex+1] = trail[2];
			sortedTrail[3 - (leftIndex + leftIndex +1)] = trail[1];
			return sortedTrail;
		}
		sortedTrail[rightIndex] = trail[2];
		sortedTrail[3 - (leftIndex + rightIndex)] = trail[1];
		return sortedTrail;
	}

	const getRandomDeck = () => {
		const randomCard = Math.floor(Math.random()*(cards.length - 1));
		deck.push(cards[randomCard]);
		cards.splice(randomCard, 1);
		if(deck.length < 3) return getRandomDeck();
		return sortTrail(deck);
	}

	for(let i =0; i < playersCount; i++) {
  	const trail = getRandomDeck();
  	const playerCards = Player(trail);
		participants.push(playerCards);
		deck = [];
	}
	return participants;
}

// Heart of The Game
const gameEngine = (numOfPlayers) => {
	if(numOfPlayers > 4) return alert('Only 4 players allowed');
	// To Obtain the number of card for comparison purpose
	const numOfCard = (card) => card === 'A' ? 14: numValue[card];

	// Trio Rule
	const ruleTrio = deck => {
		const aimedScore = deck[0]*3;
		if(aimedScore === deck.reduce((acc, cV) => numOfCard(cV) + acc), 0) return aimedScore;
		return 0;
	}

	// Pair Rule
	const rulePair = deck => { 
		return ((deck[0] === deck[1] && deck[0]) || (deck[1] === deck[2] && deck[1]) || (deck[2] === deck[0] && deck[2]));
	}

	// Sequencing Rule with Exception
	const ruleSequence = deck => {
		if(deck[0] === 'A' && deck[1] === '2' && deck[2] === '3') { return true; }
		else {
			const result = numOfCard(deck[1]) + 1 === numOfCard(deck[0]) && numOfCard(deck[1]) - 1 === numOfCard(deck[2]);
			return result;
		} 
	}

	// Top Card Rule
	const ruleHighCard = (players, turn = 0) => {
		let topCard;
		let winningPlayers = [];
		for(let i=0; i<players.length; i++) {
			const deck = players[i];
			if(i === 0) { 
				topCard = deck[turn];
				winningPlayers[i];
				continue;
			}
			if(numOfCard(deck[turn]) > numOfCard(topCard))  {
				topCard = deck[turn];
				winningPlayers = [i];
			}
			else if(numOfCard(deck[turn]) === numOfCard(topCard)) {
				topCard = deck[turn];
				winningPlayers.push(i);
			}
		}
		if(winningPlayers.length > 1 && turn < 2) { 
			return ruleHighCard(winningPlayers.map(item => players[item]), turn++)
		}
		return winningPlayers;
	}

	// Assign Random Card to Participants -- Static Assign 4
	const participants = distribute(4);

	// Final winner will be stored there
	let winner;

	const playersScore = {
		trio: [],
		pair: [],
		sequence: [],
	};
	// Obtain player score based on satisfied rule and store in playersScore
	// Rules are in order of best match first
	for(let i =0; i < participants.length; i++) {
		const player =  participants[i];
		console.log(`Player ${i+1} Cards: ${player.toString()}`);
		if(ruleTrio(player)) {
			playersScore.trio.push({ index: i, deck: player });
		}
		else if(rulePair(player)) {
			playersScore.pair.push({ index: i, deck: player });
		}
		else if(ruleSequence(player)) {
			playersScore.sequence.push({ index: i, deck: player });
		}
	}
	const { trio, pair, sequence } = playersScore;

	let bestCard;
	let bestSeq = 0;
	
	if(trio.length) {
		// Winner is here 
		// Find the best card and declare the winner
		for(let i =0; i < trio.length; i++) {
			if(i === 0) { 
				bestCard = trio[i].deck[0];
				winner = trio[i].index; 
				continue;
			}
			if(numOfCard(bestCard) < numOfCard(trio[i].deck[0])) {
				bestCard = trio[i].deck[0]; 
				winner = trio[i].index; 
			}
		}
		return { winner: winner + 1, cause: 'trio' };
	}
	else if(pair.length) {
		// Winner is here 
		// Find the best card and declare the winner
		for(let i =0; i < pair.length; i++) {
			const pairCard = rulePair(pair[i].deck);
			if(i === 0) { 
				bestCard = pairCard; 
				winner = pair[i].index; 
				continue;
			}
			if(numOfCard(bestCard) < numOfCard(pairCard)) {
				bestCard = pairCard; 
				winner = pair[i].index; 
			}
		}
		return { winner: winner + 1, cause: 'pair' };
	}
	else if(sequence.length) {
		// Winner is here 
		// Find the best card and declare the winner
		for(let i =0; i < sequence.length; i++) {
			const deckSeq = numOfCard(sequence[i].deck[0]) + numOfCard(sequence[i].deck[0]);
			// Consider Exception AKQ, A23
			if(bestSeq < deckSeq) {
				bestSeq = deckSeq; 
				winner = sequence[i].index; 
			}
		}
		return { winner: winner + 1, cause: 'sequence' };
	}
	else {
		winner = ruleHighCard(participants, 0)[0] +1;
		return { winner: winner, cause: 'high score' };
	}
}

// Execute This method to play the game of cards
const playGame = () => {
	const winner = gameEngine(4);
	console.log(`Winner is Player ${winner.winner} because of ${winner.cause}`);
}

