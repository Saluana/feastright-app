import { ref, computed } from 'vue';

const isOnline = ref(true);
const isProduction = ref(false);
const backendDevelopmentHost = ref('http://localhost:4200');
const backendProductionHost = ref('https://api.feastright.com');
const host = computed(() =>
    isProduction.value
        ? backendProductionHost.value
        : backendDevelopmentHost.value
);

console.log(host.value);

export { isOnline, isProduction, host };
