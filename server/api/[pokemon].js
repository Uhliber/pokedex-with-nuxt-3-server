const cardRarityOrder = {
  'Amazing Rare': 0,
  'Illustration Rare': 1,
  'LEGEND': 2,
  'Rare Holo VSTAR': 3,
  'Rare Holo VMAX': 4,
  'Rare Shiny GX': 5,
  'Rare Rainbow': 6,
  'Rare Secret': 7,
  'Hyper Rare': 8,
  'Special Illustration Rare': 9,
  'Trainer Gallery Rare Holo': 10,
  'Rare Holo GX': 11,
  'Rare Holo EX': 12,
  'Rare Holo LV.X': 13,
  'Rare Holo Star': 14,
  'Rare Holo V': 15,
  'Rare Holo': 16,
  'Rare Prism Star': 17,
  'Rare Shining': 18,
  'Rare Shiny': 19,
  'Rare Ultra': 20,
  'Rare ACE': 21,
  'Rare BREAK': 22,
  'Rare Prime': 23,
  'Radiant Rare': 24,
  'Ultra Rare': 25,
  'Double Rare': 26,
  'Rare': 27,
  'Common': 28,
  'Uncommon': 29,
  'Classic Collection': 30,
  'Promo': 31,
};

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
    } else {
      responseName = `${responseName}%20-name:*vmax`;
    }

    const { data: cardResponse } = await $fetch(
      `https://api.pokemontcg.io/v2/cards?q=name:${responseName}%20-rarity:Promo%20-rarity:Common&pageSize=100&select=id,name,rarity,images`,
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
