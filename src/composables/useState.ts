import { ref } from "vue"

const isOnline = ref(true)
const isProduction = ref(false)
const backendDevelopmentHost = ref('http://localhost:4200')
const backendProductionHost = ref('https://api.feastright.com')
const host = ref(isProduction.value ? backendProductionHost.value : backendDevelopmentHost.value)

export  {
    isOnline,
    isProduction,
    host
}
    