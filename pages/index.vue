<template>
  <div
    class="flex w-screen h-screen transition-all duration-500 bg-gradient-to-tl bg-size-200 overflow-hidden"
    :class="[ pokeColors[pokemon?.color ?? 'default'].gradient ]"
  >
    <div
      v-if="pokemon && pokemon.bgImage"
      class="absolute intro-opac-30 inset-0 z-0 top-0 left-[-10rem] h-screen w-screen overflow-hidden opacity-30 blur-sm"
    >
      <img
        :src="pokemon.bgImage"
        alt="pokemon"
        class="h-full transform scale-150"
      >
    </div>
    <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
    <div class="relative w-full max-w-7xl h-3/4 p-4 m-auto shadow-lg rounded-lg transition-colors bg-white/40 backdrop-blur-lg">
      <div
        v-if="isSearching"
        class="pokeball-wrapper transition-opacity duration-300"
        :class="[isSearching ? 'opacity-1' : 'opacity-0']"
      >
        <div class="pokeball" />
      </div>
      <div class="absolute flex gap-3 left-0 -top-[3rem] ">
        <input
          v-model="pokemonInput"
          name="pokemon"
          class="w-[15rem] block bg-white/50 rounded-md border-0 py-1.5 px-3 pr-12 text-gray-900 shadow-sm ring-1 xl:text-xl ring-inset ring-gray-300 placeholder:text-slate-800 sm:text-sm sm:leading-6"
          type="text"
          placeholder="Search Pokemon Name or ID"
          @keyup.enter="searchPokemon"
        >
        <button
          type="button"
          class="rounded-md bg-white/50 px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 xl:text-xl ring-inset ring-gray-300 hover:bg-white/60"
          @click.prevent="searchRandom"
        >
          Random
        </button>
      </div>
      <div
        v-if="pokemon"
        class="pointer-event-none"
      >
        <h1
          class="absolute top-4 font-bebas w-full overflow-hidden text-white/10 text-[18vw] leading-[0.8]"
          style="height: calc(100% - 32px);"
        >
          {{ pokemon?.name }}
        </h1>
        <div class="relative z-50">
          <h1
            class="-intro-x mt-[7rem] font-bebas w-full text-[10vw] leading-[0.8] drop-shadow-light"
            :class="[ pokeColors[pokemon?.color ?? 'default'].dark ]"
          >
            {{ pokemon?.name }}
          </h1>
          <p
            v-if="pokemon"
            class="-intro-x font-bebas -mt-[1.5rem] text-[4vw] text-neutral-800"
          >
            #{{ pokemon?.id }}
          </p>
          <div>
            <Teleport to="body">
              <HoloCardOverlay
                :show="showHoloCard && !!selectedHoloImage"
                :card-image="selectedHoloImage?.images?.large"
                @click-outside="handleHoloImageClose"
              />
            </Teleport>
          </div>
        </div>
        <div
          v-if="holoImages?.length"
          class="absolute -bottom-4 -left-4"
        >
          <h1
            class="pl-10 pb-10 uppercase font-black"
            :class="[ pokeColors[pokemon?.color ?? 'default'].dark ]"
          >
            Featured Cards
          </h1>
          <div class=" flex gap-4">
            <img
              v-for="(holoImage, index) in holoImages"
              :key="holoImage.id"
              class="w-28 z-holo shadow-md rounded-sm floating-holo-card cursor-pointer"
              :src="holoImage?.images?.small"
              @click="handleHoloImageClick(holoImage)"
              :style="{'animation-delay': `${500 + (500 * (index + 1))}ms`}"
            >
          </div>
        </div>
        <div class="fixed z-main-pokemon pointer-events-none h-full max-w-4xl bottom-0 right-0 pt-6 scale-125">
          <img
            v-if="pokemon"
            :src="pokemon.image"
            alt="pokemon"
            class="intro-y h-full w-full object-contain object-bottom drop-shadow-xl"
            :class="[{'brightness-0': !pokemon.hasImage}]"
          >
        </div>
      </div>
      <div v-if="notFound">
        <h1
          class="absolute top-4 font-bebas w-full overflow-hidden text-neutral-700/70 text-[18vw] leading-[0.8]"
          style="height: calc(100% - 32px);"
        >
          NOT FOUND!
        </h1>
      </div>
    </div>
  </div>
</template>

<script setup>
const pokemonInput = ref('');
const pokemon = ref(null);
const isSearching = ref(false);
const notFound = ref(false);
const holoImages = ref(null);
const showHoloCard = ref(false);
const selectedHoloImage = ref(null);

const pokeColors = {
  black: { default: 'bg-pokeblack', light: 'bg-pokeblack-light/50', gradient: 'from-pokeblack-dark via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokeblack-dark' },
  blue: { default: 'bg-pokeblue', light: 'bg-pokeblue-light/50', gradient: 'from-pokeblue-dark via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokeblue-dark' },
  brown: { default: 'bg-pokebrown', light: 'bg-pokebrown-light/50', gradient: 'from-pokebrown-dark via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokebrown-dark' },
  gray: { default: 'bg-pokegray', light: 'bg-pokegray-light/50', gradient: 'from-pokegray-dark via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokegray-dark' },
  green: { default: 'bg-pokegreen', light: 'bg-pokegreen-light/50', gradient: 'from-pokegreen-dark via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokegreen-dark' },
  pink: { default: 'bg-pokepink', light: 'bg-pokepink-light/50', gradient: 'from-pokepink-dark via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokepink-dark' },
  purple: { default: 'bg-pokepurple', light: 'bg-pokepurple-light/50', gradient: 'from-pokepurple-dark via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokepurple-dark' },
  red: { default: 'bg-pokered', light: 'bg-pokered-light/50', gradient: 'from-pokered-dark via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokered-dark' },
  white: { default: 'bg-pokewhite', light: 'bg-pokewhite-light/50', gradient: 'from-pokewhite-light via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokewhite-dark' },
  yellow: { default: 'bg-pokeyellow', light: 'bg-pokeyellow-light/50', gradient: 'from-pokeyellow-dark via-neutral-700 to-neutral-900 bg-pos-100', dark: 'text-pokeyellow-dark' },
  default: { default: 'bg-slate-500', light: 'bg-slate-300', gradient: 'from-neutral-600 via-neutral-700 to-neutral-900 bg-pos-0', dark: 'text-slate-700' },
};

onMounted(async () => {
  await nextTick();
  searchRandom();
});

const searchRandom = async () => {
  const randomPokemonNumber = getRandomNumber();
  pokemonInput.value = randomPokemonNumber;
  await searchPokemon();
};

const searchPokemon = async () => {
  pokemon.value = null;
  holoImages.value = null;
  isSearching.value = true;
  notFound.value = false;

  try {
    const transformedInput = transformInput(`${pokemonInput.value}`);
    const { data } = await useFetch(`/api/${transformedInput}`);
    if (data.value.tradingCard.length > 3) {
      const [topCard, ...rest] = data.value.tradingCard;
      const shuffled = shuffleCards(rest);
      holoImages.value = [
        topCard,
        shuffled[0],
        shuffled[1],
      ];
    } else {
      holoImages.value = data.value.tradingCard;
    }
    pokemon.value = data.value;
  } catch (error) {
    notFound.value = true;
  } finally {
    isSearching.value = false;
  }
};

function handleHoloImageClick (holoImage) {
  selectedHoloImage.value = holoImage;
  showHoloCard.value = true;
}

function handleHoloImageClose () {
  selectedHoloImage.value = null;
  showHoloCard.value = false;
}

function shuffleCards (array) {
  const newArray = [...array]; // Create a shallow copy of the original array

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap newArray[i] and newArray[j]
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}
</script>
