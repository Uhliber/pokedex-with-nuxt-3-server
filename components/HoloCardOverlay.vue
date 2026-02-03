<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="holo-card-overlay"
      :style="{'--holo-gradient-pos-lp': `${posLp}%`, '--holo-gradient-pos-tp': `${posTp}%`, '--holo-image': cardImage ? `url(${cardImage})` : null}"
      @click="handleClickOutside"
    >
      <Transition name="fade-fast">
        <div
          v-if="showInstructions"
          class="instruction-overlay"
        >
          <div class="instruction-content">
            <div
              class="pan-icon"
              :class="{ 'is-mobile': isMobile }"
            >
              <svg
                width="60px"
                height="60px"
                viewBox="0 0 512 512"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g
                  fill="#ffffff"
                  transform="translate(85.333333, 42.666667)"
                >
                  <path d="M206.413257,215.447893 L206.413257,130.666667 C206.413257,99.7915733 181.28835,74.6666667 150.413257,74.6666667 C119.538163,74.6666667 94.4132566,99.7915733 94.4132566,130.666667 L94.4132566,250.096427 C84.0473899,241.401173 71.1085099,236.468907 57.5200299,236.468907 C41.3429632,236.468907 25.8116566,243.323093 14.9470166,255.281493 C-6.06205009,278.304853 -4.69501009,313.828267 17.6045099,335.429973 C17.6330966,335.45856 17.6435499,335.48992 17.6721366,335.518507 L112,426.666667 L320,426.666667 L320,250.666667 L206.413257,215.447893 Z M277.333333,384 C277.333333,384 128.393387,384 128,384 C128,384 53.2621099,313.552 45.9912832,306.927147 C37.7177899,299.39072 37.1202432,286.573013 44.6579499,278.29696 C52.1969366,270.023467 65.0146432,269.4272 73.2894166,276.963627 C78.8286166,282.010453 115.241417,312 115.241417,312 L131.74659,303.46624 L131.74659,130.666667 C131.74659,120.356693 140.104563,112 150.413257,112 C160.72323,112 169.079923,120.356693 169.079923,130.666667 L169.079923,248.541653 L277.333333,282.666667 L277.333333,384 Z M24.1438166,163.708373 C21.3728299,153.1328 19.7465899,142.098987 19.7465899,130.666667 C19.7465899,58.6250667 78.3612032,7.10542736e-15 150.413257,7.10542736e-15 C222.46531,7.10542736e-15 281.079923,58.6250667 281.079923,130.666667 C281.079923,142.098987 279.453683,153.1328 276.682697,163.708373 L236.211443,149.69792 C237.574643,143.552 238.413257,137.218773 238.413257,130.666667 C238.413257,82.1431467 198.936777,42.6666667 150.413257,42.6666667 C101.889737,42.6666667 62.4132566,82.1431467 62.4132566,130.666667 C62.4132566,137.218773 63.2518699,143.552 64.6150699,149.69792 L24.1438166,163.708373 Z" />
                </g>
              </svg>
            </div>
            <span>{{ isMobile ? 'Tilt phone to inspect card' : 'Hover over card to inspect' }}</span>
          </div>
        </div>
      </Transition>

      <div
        ref="holoCard"
        class="holo-card"
        @click.stop
      />
    </div>
  </Transition>
</template>

<script setup>
import { nextTick, ref, watch, onBeforeUnmount } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  cardImage: { type: String, default: null },
  showInstructions: { type: Boolean, default: true }, // Controlled by parent
});

const emit = defineEmits(['click-outside', 'first-interaction']);
const posLp = ref(0);
const posTp = ref(0);
const holoCard = ref(null);
const isMobile = ref(false);

watch(() => props.show, async (value) => {
  await nextTick();
  
  if (value) {
    isMobile.value = /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Desktop Mouse Events
    holoCard.value.addEventListener('mousemove', handleMouseMoveEffect);
    holoCard.value.addEventListener('mouseout', handleMouseOutEffect);
    holoCard.value.addEventListener('mouseover', onHover);
    holoCard.value.addEventListener('mouseout', onOut);

    // Android Gyro Events
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientationChange, false);
    }
  } else {
    removeEvents();
  }
});

function triggerFirstInteraction () {
  if (props.showInstructions) {
    emit('first-interaction');
  }
}

function handleMouseMoveEffect (e) {
  triggerFirstInteraction();
  const l = e.offsetX;
  const t = e.offsetY;
  const h = this.clientHeight;
  const w = this.clientWidth;
  posLp.value = Math.abs(Math.floor((100 / w) * l) - 100);
  posTp.value = Math.abs(Math.floor((100 / h) * t) - 100);
  this.classList.add('active');
}

function handleMouseOutEffect () {
  this.classList.remove('active');
}

function onHover (ev) {
  ev.target.addEventListener('mousemove', onCardMove);
}

function onOut (ev) {
  const perspective = 800;
  ev.target.style.transform = `translate3d(0%, 0%, -${perspective / 2}px) rotateX(0deg) rotateY(0deg)`;
  ev.target.removeEventListener('mousemove', onCardMove);
}

const onCardMove = (ev) => {
  const el = ev.target;
  const { pageX, pageY } = ev;
  const { offsetWidth, offsetHeight } = el;
  const { left, top } = el.getBoundingClientRect();
  const cardX = left + offsetWidth / 2;
  const cardY = top + offsetHeight / 2;
  const angle = 25;
  const rotX = (cardY - pageY) / angle;
  const rotY = (cardX - pageX) / -angle;
  el.style.transform = `translate3d(0%, 0%, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
};

function handleOrientationChange (event) {
  if (event.beta !== null && event.gamma !== null) {
    // Hide instructions if phone tilts significantly
    if (Math.abs(event.beta - 40) > 8 || Math.abs(event.gamma) > 8) {
      triggerFirstInteraction();
    }

    const rawBeta = event.beta || 0;
    const rawGamma = -(event.gamma || 0);
    const maxRotation = 30;
    const minRotation = -30;

    const gamma = Math.min(maxRotation, Math.max(minRotation, rawGamma));
    const initialBetaRotation = -40;
    const beta = Math.min(40, Math.max(-40, rawBeta + initialBetaRotation));

    const adjustedBeta = rawBeta > 90 ? 90 : rawBeta < -90 ? -90 : rawBeta;
    const adjustedGamma = rawGamma > 90 ? 90 : rawGamma < -90 ? -90 : rawGamma;

    posLp.value = Math.abs(Math.floor(((adjustedGamma + 70) / 140) * 100));
    posTp.value = Math.abs(Math.floor(((adjustedBeta + 70) / 140) * 100));

    if (holoCard.value) {
      holoCard.value.classList.add('active');
      holoCard.value.style.transform = `rotateX(${beta}deg) rotateY(${gamma}deg)`;
    }
  }
}

function handleClickOutside () {
  emit('click-outside');
}

function removeEvents () {
  window.removeEventListener('deviceorientation', handleOrientationChange);
  if (holoCard.value) {
    holoCard.value.removeEventListener('mousemove', handleMouseMoveEffect);
    holoCard.value.removeEventListener('mouseout', handleMouseOutEffect);
  }
}

onBeforeUnmount(removeEvents);
</script>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.fade-fast-leave-active { transition: opacity 0.2s ease; }
.fade-fast-leave-to { opacity: 0; }

.holo-card-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: grid;
    align-items: center;
    justify-content: center;
    perspective: 800px;
    background-color: rgba(0, 0, 0, 0.85);
}

.instruction-overlay {
  position: absolute;
  top: 10%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
  
  .instruction-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: white;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    padding: 16px 32px;
    border-radius: 50px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .pan-icon {
      width: 48px;
      height: 48px;
      &.is-mobile { animation: tiltHint 2.5s infinite ease-in-out; }
      &:not(.is-mobile) { animation: hoverHint 2.5s infinite ease-in-out; }
      svg { width: 100%; height: 100%; }
    }

    span {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.2rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
}

@keyframes tiltHint {
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(15deg); }
}

@keyframes hoverHint {
  0%, 100% { transform: translate(-20px, -10px); }
  50% { transform: translate(20px, 10px); }
}

.holo-card {
    width: 340px;
    height: 470px;
    background-color: #211799;
    background-image: var(--holo-image);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 12px;
    box-shadow: 0 0 6px 2px rgba(255, 230, 0, 0.75), 0 35px 25px -15px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
    will-change: transform;
    transition: transform 100ms ease;
    transform-style: preserve-3d;
    transform: translate3d(0%, 0%, -400px);
}
  
.holo-card:before, .holo-card:after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: linear-gradient(115deg, transparent 0%, rgb(0, 231, 255) 30%, rgb(255, 0, 231) 70%, transparent 100%);
    background-size: 300% 300%;
    mix-blend-mode: color-dodge;
    opacity: 0;
    z-index: 1;
    animation: holoGradient 15s ease infinite;
}

.holo-card:after {
    background-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/13471/sparkles.gif");
    background-size: 180%;
    z-index: 2;
    animation: holoSparkle 20s ease infinite;
}

.holo-card.active:before {
    opacity: 0.8;
    animation: none;
    background-image: linear-gradient(115deg, transparent 0%, transparent 25%, rgb(0, 231, 255) 45%, rgb(255, 0, 231) 55%, transparent 70%, transparent 100%);
    background-position: var(--holo-gradient-pos-lp) var(--holo-gradient-pos-tp);
}

@keyframes holoSparkle { 0%, 100% { opacity: 0; } 12% { opacity: 1; } 70% { opacity: 0.5; } }
@keyframes holoGradient { 0%, 100% { opacity: 0; } 5% { background-position: 0% 0%; opacity: 0.5; } 10% { background-position: 100% 100%; opacity: 0; } }
</style>
