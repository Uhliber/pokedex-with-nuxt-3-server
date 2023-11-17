const cardRarityArray = [
  'Rare Holo VSTAR',
  'Rare Holo EX',
  'Rare Holo GX',
  'Rare Holo LV.X',
  'Rare Holo V',
  'Rare Holo Star',
  'Rare Holo',
  'Amazing Rare',
  'Hyper Rare',
  'Double Rare',
  'Illustration Rare',
  'Special Illustration Rare',
  'Rare Secret',
  'Rare Prism Star',
  'Rare Ultra',
  'Rare ACE',
  'Rare BREAK',
  'Rare Prime',
  'Radiant Rare',
  'Ultra Rare',
  'Rare',
  'Rare Holo VMAX',
  'Trainer Gallery Rare Holo',
  'Rare Shining',
  'Rare Shiny GX',
  'Rare Shiny',
  'Rare Rainbow',
  'Common',
  'Uncommon',
  'Classic Collection',
  'Promo',
  'LEGEND',
];

const customQuery = {
  'farfetchd': 'farfetch*d',
  'nidoran-f': 'nidoran%20evolvesTo:nidorina',
  'nidoran-m': 'nidoran%20evolvesTo:nidorino',
  'slowking': 'slowking%20-types:darkness',
  'castform': (name) => {
    let nameNew = name;
    switch (name) {
      case 'castform-rainy':
        nameNew = 'castform-rain';
        break;
      case 'castform-snowy':
        nameNew = 'castform-snow';
        break;
    
      default:
        break;
    }
    
    return `${reverseNameWithDash(nameNew)}`.replace('-', '*');
  },
  'rotom': (name) => {
    return `${reverseNameWithDash(name)}`.replace('-', '*');
  },
};

const getSpecieDefault = [
  'eiscue-ice',
  'enamorus-incarnate',
  'basculegion-male',
  'basculegion-female',
  'minior-red-meteor',
  'lycanroc-midday',
  'wishiwashi-solo',
  'meowstic-male',
  'meowstic-female',
];

const cardRarityOrder = {};

const ignoredSuffixes = [
  'altered',
];

cardRarityArray.forEach((value, index) => {
  cardRarityOrder[value] = index;
});

function reverseNameWithDash (name) {
  if (name.includes('-')) {
    const substrings = name.split('-');
    const reversedString = substrings.reverse().join('-');
    return reversedString;
  } else {
    return name;
  }
}

export default defineEventHandler(async event => {
  try {
    const { pokemon } = event.context.params;
    const response = await $fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon}`,
    );

    let responseName = response.name.toLowerCase();
    const specieName = response.species.name;
    let tradingCards = [];
    let tradingCardsResponse = [];

    if (specieName in customQuery) {
      if (typeof customQuery[specieName] === 'function') {
        const customQueryFunc = customQuery[specieName];
        responseName = customQueryFunc(responseName);
      } else {
        responseName = customQuery[specieName];
      }
    } else if (
      ignoredSuffixes.some(ignore => responseName.includes(ignore))
        || getSpecieDefault.some(p => responseName.includes(p))
        || !response.is_default
    ) {
      responseName = response.species.name;

      if (response.name.toLowerCase().includes('gmax')) {
        responseName = `${responseName}*vmax`;
      }

      if (response.name.toLowerCase().includes('mega')) {
        responseName = `M*${responseName}`;
      }

      if (response.name.toLowerCase().includes('galar')) {
        responseName = `galarian*${responseName}*`;
      }

      if (response.name.toLowerCase().includes('alola')) {
        responseName = `alolan*${responseName}*`;
      }

      if (response.name.toLowerCase().includes('black')) {
        responseName = `black*${responseName}*`;
      }

      if (response.name.toLowerCase().includes('white')) {
        responseName = `white*${responseName}*`;
      }

    } else {
      responseName = responseName.replace('-', '*');
      responseName = `${responseName}%20-name:*vmax%20-name:galarian*`;
    }

    const { data: cardResponse } = await $fetch(
      `https://api.pokemontcg.io/v2/cards?q=name:${responseName}%20-rarity:Promo%20-rarity:Common%20-supertype:trainer%20-subtypes:tag&pageSize=100&select=id,name,rarity,images`,
    );

    if (cardResponse.length <= 3) {
      const { data: cardResponseCommon } = await $fetch(
        `https://api.pokemontcg.io/v2/cards?q=name:${responseName}%20&pageSize=100&select=id,name,rarity,images`,
      );
      tradingCards = cardResponseCommon;
    } else {
      tradingCardsResponse = cardResponse;
      const hasRarityCards = tradingCardsResponse.filter(card => card.rarity !== undefined);
        
      const cardsNotStartingWithSearchTerm = hasRarityCards.filter(card => !card.name.toLowerCase().startsWith(responseName));
      const cardsRegular = hasRarityCards.filter(card => card.name.toLowerCase().startsWith(responseName));

      const sortedIrregularCards = cardsNotStartingWithSearchTerm.sort((a, b) => cardRarityOrder[a.rarity] - cardRarityOrder[b.rarity]) ?? [];
      const sortedCards = cardsRegular.sort((a, b) => cardRarityOrder[a.rarity] - cardRarityOrder[b.rarity]) ?? [];

      tradingCards = [
        ...sortedCards,
        ...sortedIrregularCards,
      ];
    }


    const speciesUrl = response.species.url;
    const responseSpecie = await $fetch(speciesUrl);
    const image = response.sprites.other['dream_world'].front_default ?? response.sprites.other['official-artwork'].front_default;
    const fallbackImages = {
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/132.svg',
      bgImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png',
    };
    const idealResponse = {
      id: response.id,
      name: response.name,
      image: image ?? fallbackImages.image,
      bgImage: response.sprites.other['official-artwork'].front_default,
      sprite: response.sprites.front_default ?? fallbackImages.sprite,
      color: responseSpecie.color.name,
      hasImage: image,
      tradingCard: tradingCards,
    };

    return idealResponse;
  } catch (error) {
    throw createError({
      statusCode: 404,
      message: 'Can\'t find the Pokemon!',
    });
  }
});
