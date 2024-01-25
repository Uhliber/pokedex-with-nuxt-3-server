<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="holo-card-overlay"
      :style="{'--holo-gradient-pos-lp': `${posLp}%`, '--holo-gradient-pos-tp': `${posTp}%`, '--holo-image': cardImage ? `url(${cardImage})` : null}"
      @click="handleClickOutside"
    >
      <div
        ref="holoCard"
        class="holo-card"
        @click.stop
      />
    </div>
  </Transition>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  cardImage: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['click-outside']);
const posLp = ref(0);
const posTp = ref(0);
const holoCard = ref(null);

watch(() => props.show, async (value) => {
  await nextTick();

  if (value) {
    holoCard.value.addEventListener('mousemove', function (e) {
      const l = e.offsetX;
      const t = e.offsetY;
      const h = this.clientHeight;
      const w = this.clientWidth;
      const lp = Math.abs(Math.floor((100 / w) * l) - 100);
      const tp = Math.abs(Math.floor((100 / h) * t) - 100);

      posLp.value = lp;
      posTp.value = tp;
      holoCard.value.classList.remove('active');
      this.classList.add('active');
    });

    holoCard.value.addEventListener('mouseout', function () {
      holoCard.value.classList.remove('active');
    });

    //
    // 3d hover magic
    //
    const resetTransform = (el, perspective = 800) =>
      (el.style.transform = `translate3d(0%, 0%, -${perspective / 2}px) rotateX(0deg) rotateY(0deg)`);

    const onMove = (ev, el) => {
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

    const parentPerspective = getComputedStyle(holoCard.value.parentElement)
      .getPropertyValue('perspective')
      .replace('px', '') || 800;

    const onCardMove = ev => onMove(ev, ev.target);
    const onHover = ev => ev.target.addEventListener('mousemove', onCardMove);
    const onOut = ev => {
      resetTransform(ev.target, parentPerspective); // reset card
      ev.target.removeEventListener('mousemove', onCardMove);
    };

    holoCard.value.addEventListener('mouseover', onHover);
    holoCard.value.addEventListener('mouseout', onOut);

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientationChange, false);
    }
  }
});

function handleClickOutside () {
  emit('click-outside');
}

function handleOrientationChange (event) {
  if (event.beta !== null && event.gamma !== null) {
    const rawBeta = event.beta || 0;
    const rawGamma = -(event.gamma || 0);
    
    const maxRotation = 30;
    const minRotation = -30;

    const gamma = Math.min(maxRotation, Math.max(minRotation, rawGamma));

    const initialBetaRotation = -40;
    const beta = Math.min(40, Math.max(-40, rawBeta + initialBetaRotation));

    const adjustedBeta = rawBeta > 90 ? 90 : rawBeta < -90 ? -90 : rawBeta;
    const adjustedGamma = rawGamma > 90 ? 90 : rawGamma < -90 ? -90 : rawGamma;

    const el = holoCard.value;

    const convertedBeta = (adjustedBeta + 70) / 180 * 100;
    const convertedGamma = (adjustedGamma + 70) / 180 * 100;

    posLp.value = Math.abs(Math.floor(convertedGamma));
    posTp.value = Math.abs(Math.floor(convertedBeta));

    el.classList.remove('active');
    el.classList.add('active');
    el.style.transform = `rotateX(${beta}deg) rotateY(${gamma}deg)`;
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.holo-card-overlay {
    position: fixed;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: grid;
    align-items: center;
    justify-content: center;
    perspective-origin: 50% 50%;
    perspective: 800px;
    background-color: rgba(0, 0, 0, 0.75);
}
  
.holo-card {
    width: 340px;
    height: 470px;
    background-color: #211799;
    background-image: var(--holo-image, url(https://images.pokemontcg.io/smp/SM156.png));
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 12px;
    box-shadow: 0 0 6px 2px rgba(255, 230, 0, 0.75), 0 35px 25px -15px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
    display: inline-block;
    margin: 20px 10px;
    
    // Animation ready
    will-change: transform;
    
    transition: transform 100ms ease;
    transition-property: transform;
    
    transform-style: preserve-3d;
    transform-origin: 50% 50%;
    
    transform: translate3d(0%, 0%, -400px);
    
    &:hover {
      z-index: 2;
    }
}
  
  .holo-card:before,
    .holo-card:after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      background-image: linear-gradient(
        115deg,
        transparent 0%,
        rgb(0, 231, 255) 30%,
        rgb(255, 0, 231) 70%,
        transparent 100%
      );
      background-position: 0% 0%;
      background-repeat: no-repeat;
      background-size: 300% 300%;
      mix-blend-mode: color-dodge;
      opacity: 0;
      z-index: 1;
      transform: translate3d(0,0,0);
      animation: holoGradient 15s ease infinite;
    }
    .holo-card:after {
      background-image: url("https://s3-us-west-2.amazonaws.com/s.cdpn.io/13471/sparkles.gif");
      background-position: center;
      background-size: 180%;
      mix-blend-mode: color-dodge;
      opacity: 0;
      z-index: 2;
      animation: holoSparkle 20s ease infinite;
    }
  
    .holo-card.active:before {
      opacity: 0.5;
      animation: none;
      transition: none;
      background-image: linear-gradient(
        115deg,
        transparent 0%,
        transparent 25%,
        rgb(0, 231, 255) 45%,
        rgb(255, 0, 231) 55%,
        transparent  70%,
        transparent 100%
      );
      background-position: var(--holo-gradient-pos-lp) var(--holo-gradient-pos-tp);
    }
  
    @keyframes holoSparkle {
      0% {
        opacity: 0;
      }
      12% {
        opacity: 1;
      }
      70% {
        opacity: 0.5;
      }
      95% {
        opacity: 0.2;
      }
    }
  
    @keyframes holoGradient {
      3% {
        opacity: 0;
      }
      5% {
        background-position: 0% 0%;
      }
      7% {
        opacity: 0.5;
      }
      9% {
        background-position: 100% 100%;
      }
      11% {
        opacity: 0;
      }
      50% {
        opacity: 0;
        background-position: 100% 100%;
      }
      55% {
        opacity: 0.3;
      }
      70% {
        opacity: 0;
        background-position: 0% 0%;
      }
    }
</style>
