<template>
  <Transition name="fade">
    <div 
      v-if="show" 
      class="holo-card-overlay" 
      :style="{
        '--holo-gradient-pos-lp': `${posLp}%`, 
        '--holo-gradient-pos-tp': `${posTp}%`, 
        '--holo-image': cardImage ? `url(${cardImage})` : null
      }" 
      @click="handleClickOutside"
      @mousemove="handleMove"
      @touchmove.prevent="handleTouchMove"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <Transition name="fade-fast">
        <div
          v-if="showInstructions"
          class="instruction-overlay"
        >
          <div class="instruction-content">
            <div class="pan-icon">
              <svg
                width="60px"
                height="60px"
                viewBox="0 0 512 512"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g
                  id="add"
                  fill="#ffffff"
                  transform="translate(85.333333, 42.666667)"
                >
                  <path
                    d="M206.413257,215.447893 L206.413257,130.666667 C206.413257,99.7915733 181.28835,74.6666667 150.413257,74.6666667 C119.538163,74.6666667 94.4132566,99.7915733 94.4132566,130.666667 L94.4132566,250.096427 C84.0473899,241.401173 71.1085099,236.468907 57.5200299,236.468907 C41.3429632,236.468907 25.8116566,243.323093 14.9470166,255.281493 C-6.06205009,278.304853 -4.69501009,313.828267 17.6045099,335.429973 C17.6330966,335.45856 17.6435499,335.48992 17.6721366,335.518507 L112,426.666667 L320,426.666667 L320,250.666667 L206.413257,215.447893 Z M277.333333,384 C277.333333,384 128.393387,384 128,384 C128,384 53.2621099,313.552 45.9912832,306.927147 C37.7177899,299.39072 37.1202432,286.573013 44.6579499,278.29696 C52.1969366,270.023467 65.0146432,269.4272 73.2894166,276.963627 C78.8286166,282.010453 115.241417,312 115.241417,312 L131.74659,303.46624 L131.74659,130.666667 C131.74659,120.356693 140.104563,112 150.413257,112 C160.72323,112 169.079923,120.356693 169.079923,130.666667 L169.079923,248.541653 L277.333333,282.666667 L277.333333,384 Z M24.1438166,163.708373 C21.3728299,153.1328 19.7465899,142.098987 19.7465899,130.666667 C19.7465899,58.6250667 78.3612032,7.10542736e-15 150.413257,7.10542736e-15 C222.46531,7.10542736e-15 281.079923,58.6250667 281.079923,130.666667 C281.079923,142.098987 279.453683,153.1328 276.682697,163.708373 L236.211443,149.69792 C237.574643,143.552 238.413257,137.218773 238.413257,130.666667 C238.413257,82.1431467 198.936777,42.6666667 150.413257,42.6666667 C101.889737,42.6666667 62.4132566,82.1431467 62.4132566,130.666667 C62.4132566,137.218773 63.2518699,143.552 64.6150699,149.69792 L24.1438166,163.708373 Z"
                    id="Shape"
                  />
                </g>
              </svg>
            </div>
            <span>Pan to inspect card</span>
          </div>
        </div>
      </Transition>

      <div 
        ref="holoCard" 
        class="holo-card" 
        :class="{ 'active': isActive }"
        @click.stop 
      />
    </div>
  </Transition>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  cardImage: { type: String, default: null },
  showInstructions: { type: Boolean, default: false }, // Controlled by parent
});

const emit = defineEmits(['click-outside', 'first-interaction']);

const posLp = ref(50);
const posTp = ref(50);
const isActive = ref(false);
const holoCard = ref(null);

watch(() => props.show, async (value) => {
  if (value) {
    isActive.value = false;
    await nextTick();
  }
});

function processInteraction (x, y) {
  if (!holoCard.value) {
    return;
  }

  if (props.showInstructions) {
    emit('first-interaction');
  }

  isActive.value = true;
  const { left, top, width, height } = holoCard.value.getBoundingClientRect();
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  const deltaX = (x - centerX) / (window.innerWidth / 2);
  const deltaY = (y - centerY) / (window.innerHeight / 2);

  const maxRot = 22;
  const rotY = deltaX * maxRot;
  const rotX = -deltaY * maxRot;

  posLp.value = 50 + (deltaX * 50);
  posTp.value = 50 + (deltaY * 50);

  holoCard.value.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(100px)`;
}

function handleTouchMove (e) {
  processInteraction(e.touches[0].clientX, e.touches[0].clientY);
}

function handleTouchStart () {
  isActive.value = true;
}

function handleTouchEnd () {
  isActive.value = false;
  if (holoCard.value) {
    holoCard.value.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }
}

function handleMove (e) {
  processInteraction(e.clientX, e.clientY);
}

function handleClickOutside () {
  emit('click-outside');
}
</script>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-fast-leave-active {
  transition: opacity 0.2s ease;
}
.fade-fast-leave-to {
  opacity: 0;
}

.holo-card-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.9);
  touch-action: none;
}

.instruction-overlay {
  position: absolute;
  top: 12%;
  z-index: 1000;
  pointer-events: none;
  
  .instruction-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: white;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    padding: 14px 28px;
    border-radius: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .pan-icon {
      width: 48px;
      height: 48px;
      animation: panIconMove 2.2s infinite ease-in-out;
      svg { width: 100%; height: 100%; }
    }

    span {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
}

@keyframes panIconMove {
  0%, 100% { transform: translateX(-20px) rotate(-5deg); }
  50% { transform: translateX(20px) rotate(5deg); }
}

.holo-card {
  width: 320px;
  height: 450px;
  background-color: #1a1a1a;
  background-image: var(--holo-image);
  background-size: cover;
  background-position: center;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  will-change: transform;
  transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px);
  transition: transform 0.15s ease-out;
  transform-style: preserve-3d;

  &::before {
    content: "";
    position: absolute;
    inset: -50%; 
    background-image: linear-gradient(
      115deg,
      transparent 30%,
      rgba(0, 231, 255, 0.6) 48%,
      rgba(255, 0, 231, 0.6) 52%,
      transparent 70%
    );
    background-size: 200% 200%;
    background-position: var(--holo-gradient-pos-lp) var(--holo-gradient-pos-tp);
    mix-blend-mode: color-dodge;
    opacity: 0;
    z-index: 1;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  &.active {
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
    &::before { opacity: 0.8; }
  }
}
</style>
