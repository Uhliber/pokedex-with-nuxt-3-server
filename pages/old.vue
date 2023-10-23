<template>
    <div class="container">
    <div class="left-screen">
      <div class="left-screen__top">
        <div class="light-container">
          <div class="light light--blue">
          </div>
        </div>
        <div class="light light--yellow"></div>
        <div class="light light--yellow"></div>
        <div class="light light--yellow"></div>
      </div>
      <div class="left-screen__bottom">
        <div class="main-screen">
          <div class="main-screen__top-lights">
          </div>
          <div id="display" class="main-screen__display">
            <img v-if="pokemon" :src="pokemon.sprite" alt="pokemon"/>
            <div v-if="isSearching" class="search-message">Searching...</div>
            <div v-if="notFound" class="not-found-message">Pokemon <br>Not Found</div>
            <div v-if="!pokemon && !isSearching && !notFound" class="pokemon-image"></div>
          </div>
          <div class="main-screen__speaker-light"></div>
          <div class="main-screen__speaker">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
      <div class="left-screen__joint">
        <div class="joint"></div>
        <div class="joint"></div>
        <div class="joint"></div>
        <div class="joint"></div>
        <div class="joint__reflextion"></div>
      </div>
    </div>
    <div class="right-screen">
      <div class="right-screen__top">
        <div></div>
      </div>
      <div class="right-screen__bottom">
        <div class="info-container">
          <input v-model="pokemonInput" name="pokemon" type="text" class="info-input" placeholder="Search Pokemon Name or ID" @keyup.enter="searchPokemon">
          <section class="info-screen">
            <div id="species" class="info">
              <div class="label">Name:</div>
              <div class="desc">{{ pokemon?.name ?? '...' }}</div>
            </div>
            <div id="type" class="info">
              <div class="label">Type:</div>
              <div class="desc">...</div>
            </div>
            <div id="height" class="info">
              <div class="label">Height:</div>
              <div class="desc">...</div>
            </div>
            <div id="weight" class="info">
              <div class="label">Weight:</div>
              <div class="desc">...</div>
            </div>
            <div id="evolution" class="info">
              <div class="label">Evolution Chain:</div>
              <div class="desc">...</div>
            </div>
            <div id="bio" class="info">
              <div class="label">Biology:</div>
              <div class="desc">...</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const pokemonInput = ref('');
const pokemon = ref(null);
const isSearching = ref(false);
const notFound = ref(false);

const searchPokemon = async () => {
  pokemon.value = null;
  isSearching.value = true;
  notFound.value = false;

  const transformedInput = transformInput(pokemonInput.value);
  const { data, error } = await useFetch(`/api/${transformedInput}`)

  await setTimeout(() => {
    pokemon.value = data.value;

    if (error.value) {
      notFound.value = true;
    }

    isSearching.value = false;
  }, 500);
}

const transformInput = (input) => {
  const lowercased = input.toLowerCase();
  const kebabCased = lowercased.replace(/[^a-z0-9]+/g, '-');
  return kebabCased.replace(/^-+|-+$/g, '');
}
</script>