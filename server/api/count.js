export default defineEventHandler(async event => {
    try {
      const response = await $fetch(`https://pokeapi.co/api/v2/pokemon`)
  
      return response.count
    } catch (error) {
      throw createError({
        statusCode: 404,
        message: "Something went wrong!"
      })
    }
  })