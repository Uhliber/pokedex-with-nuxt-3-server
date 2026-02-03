import TCGdex, { Query } from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');

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
  farfetchd: 'farfetch*d',
  'nidoran-f': 'nidoran evolvesTo:nidorina',
  'nidoran-m': 'nidoran evolvesTo:nidorino',
  slowking: 'slowking -types:darkness',
  castform: (name) => {
    let nameNew = name;
    if (name === 'castform-rainy') {
      nameNew = 'castform-rain';
    }
    if (name === 'castform-snowy') {
      nameNew = 'castform-snow';
    }
    return reverseNameWithDash(nameNew).replace('-', '*');
  },
  rotom: (name) => reverseNameWithDash(name).replace('-', '*'),
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

const ignoredSuffixes = ['altered'];

const cardRarityOrder = {};
cardRarityArray.forEach((value, index) => {
  cardRarityOrder[value] = index;
});

function reverseNameWithDash (name) {
  if (!name.includes('-')) {
    return name;
  }
  return name.split('-').reverse().join('-');
}

function buildTCGDexQuery (responseName, fill = false) {
  let trimmed = responseName.trim();

  if (fill) {
    trimmed = trimmed.split('-')
      .map(w => capitalize(w))
      .join(' ');
  }

  const variantPrefixes = [
    'Mega', 'Vmax', 'Galarian', 'Alolan', 'Black', 'White', 'Therian',
    'Origin', 'Primal', 'Hisuian', 'Ice Rider', 'Crowned Sword', 'Amped', 'Stretchy',
  ];

  const isVariant = variantPrefixes.some(prefix => trimmed.startsWith(prefix));

  if (isVariant || fill) {
    const words = trimmed.split(' ').filter(Boolean);
    let query = Query.create();
    words.forEach(word => {
      query = query.contains('name', capitalize(word));
    });
    return query.sort('localId', 'ASC').paginate(1, 50);
  }

  const equalName = trimmed
    .split('-')
    .map(w => capitalize(w))
    .join(' ');

  return Query.create().equal('name', equalName).sort('localId', 'ASC').paginate(1, 50);
}

function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default defineEventHandler(async (event) => {
  try {
    const { pokemon } = event.context.params;

    let response;
    try {
      response = await $fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    } catch (err) {
      throw createError({
        statusCode: 502,
        message: `Failed to fetch Pokémon data from PokeAPI: ${err.message}`,
      });
    }

    let responseName = response.name.toLowerCase();
    const specieName = response.species.name;

    let tradingCards = [];
    let tradingCardsResponse = [];

    if (specieName in customQuery) {
      responseName =
        typeof customQuery[specieName] === 'function'
          ? customQuery[specieName](responseName)
          : customQuery[specieName];
    } else if (
      ignoredSuffixes.some((i) => responseName.includes(i)) ||
      getSpecieDefault.some((p) => responseName.includes(p)) ||
      !response.is_default
    ) {
      responseName = response.species.name;

      if (response.name.includes('gmax')) {
        responseName = `${responseName} vmax`;
      }
      if (response.name.includes('mega')) {
        responseName = `Mega ${responseName}`;
      }
      if (response.name.includes('galar')) {
        responseName = `Galarian ${responseName}`;
      }
      if (response.name.includes('alola')) {
        responseName = `Alolan ${responseName}`;
      }
      if (response.name.includes('black')) {
        responseName = `Black ${responseName}`;
      }
      if (response.name.includes('white')) {
        responseName = `White ${responseName}`;
      }
      if (response.name.includes('therian')) {
        responseName = `Therian ${responseName}`;
      }
      if (response.name.includes('origin')) {
        responseName = `Origin ${responseName}`;
      }
      if (response.name.includes('primal')) {
        responseName = `Primal ${responseName}`;
      }
      if (response.name.includes('hisuian')) {
        responseName = `Hisuian ${responseName}`;
      }
      if (response.name.includes('ice rider')) {
        responseName = `Ice Rider ${responseName}`;
      }
      if (response.name.includes('crowned sword')) {
        responseName = `Crowned Sword ${responseName}`;
      }
      if (response.name.includes('amped')) {
        responseName = `Amped ${responseName}`;
      }
      if (response.name.includes('stretchy')) {
        responseName = `Stretchy ${responseName}`;
      }
    }

    // ---- TCGdex fetch (soft-fail) ----

    try {
      let query;
      let rawCards = [];

      query = buildTCGDexQuery(responseName);

      rawCards = await tcgdex.card.list(query);

      if (!rawCards.length) {
        query = buildTCGDexQuery(responseName, true);
        rawCards = await tcgdex.card.list(query);
      }

      tradingCardsResponse = (rawCards ?? [])
        .map(card => {
          const low = card?.getImageURL?.('low', 'webp');
          const high = card?.getImageURL?.('high', 'png');

          if (!low || !high || low.includes('undefined') || high.includes('undefined')) {
            return null;
          }

          return {
            id: card.id,
            name: card.name,
            rarity: card.rarity || undefined,
            images: { low, high },
          };
        })
        .filter(Boolean);

    } catch (err) {
      console.error('[TCGdex] card fetch failed:', {
        pokemon: responseName,
        message: err?.message || err,
      });

      tradingCardsResponse = [];
    }

    tradingCards = tradingCardsResponse;

    let responseSpecie;
    try {
      responseSpecie = await $fetch(response.species.url);
    } catch (err) {
      throw createError({
        statusCode: 502,
        message: `Failed to fetch Pokémon species info: ${err.message}`,
      });
    }

    const image =
      response.sprites.other.dream_world.front_default ??
      response.sprites.other['official-artwork'].front_default;

    const fallbackImages = {
      image:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/132.svg',
      bgImage:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png',
      sprite:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png',
    };

    return {
      id: response.id,
      name: response.name,
      image: image ?? fallbackImages.image,
      bgImage: response.sprites.other['official-artwork'].front_default,
      sprite: response.sprites.front_default ?? fallbackImages.sprite,
      color: responseSpecie.color.name,
      hasImage: image,
      tradingCard: Array.isArray(tradingCards) ? tradingCards : [],
    };
  } catch (error) {
    throw createError({
      statusCode: error?.statusCode || 404,
      message: error?.message || 'Can\'t find the Pokémon!',
    });
  }
});
