export default defineEventHandler(async event => {
  try {
    const { pokemon } = event.context.params
    const response = await $fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon}`
    )

    const idealResponse = {
      id: response.id,
      name: response.name,
      image: response.sprites.other['dream_world'].front_default,
      sprite: response.sprites.front_default
    }

    return idealResponse
  } catch (error) {
    throw createError({
      statusCode: 404,
      message: "Can't find the Pokemon!"
    })
  }
})