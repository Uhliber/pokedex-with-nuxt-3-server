export default defineEventHandler(async event => {
  try {
    const { pokemon } = event.context.params;
    const response = await $fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon}`,
    );

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
    };

    return idealResponse;
  } catch (error) {
    throw createError({
      statusCode: 404,
      message: 'Can\'t find the Pokemon!',
    });
  }
});
