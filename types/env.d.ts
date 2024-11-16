/// <reference types="vue" />
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Глобальные типы
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // добавьте другие переменные окружения по необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}