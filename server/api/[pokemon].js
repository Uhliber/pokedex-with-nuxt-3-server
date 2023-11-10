const cardRarityArray = [
  'Amazing Rare',
  'Illustration Rare',
  'Rare Holo VSTAR',
  'Rare Holo VMAX',
  'Rare Shiny GX',
  'Rare Rainbow',
  'Rare Secret',
  'Hyper Rare',
  'Special Illustration Rare',
  'Trainer Gallery Rare Holo',
  'Rare Holo GX',
  'Rare Holo EX',
  'Rare Holo LV.X',
  'Rare Holo Star',
  'Rare Holo V',
  'Rare Holo',
  'Rare Prism Star',
  'Rare Shining',
  'Rare Shiny',
  'Rare Ultra',
  'Rare ACE',
  'Rare BREAK',
  'Rare Prime',
  'Radiant Rare',
  'Ultra Rare',
  'Double Rare',
  'Rare',
  'Common',
  'Uncommon',
  'Classic Collection',
  'Promo',
  'LEGEND',
];

const cardRarityOrder = {};

cardRarityArray.forEach((value, index) => {
  cardRarityOrder[value] = index;
});

export default defineEventHandler(async event => {
  try {
    const { pokemon } = event.context.params;
    const response = await $fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon}`,
    );

    let responseName = response.name.toLowerCase();
    let tradingCards = [];
    let tradingCardsResponse = [];

    if (!response.is_default) {
      responseName = response.species.name;

      if (response.name.toLowerCase().includes('gmax')) {
        responseName = `${responseName}*vmax`;
      }

      if (response.name.toLowerCase().includes('galar')) {
        responseName = `galarian*${responseName}*`;
      }

    } else {
      responseName = responseName.replace('-', '*');
      responseName = `${responseName}%20-name:*vmax`;
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
