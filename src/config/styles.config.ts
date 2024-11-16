export const styles = {
  // Layout
  'app': 'flex items-center justify-center h-screen',
  'app__background': 'bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-900 dark:to-purple-900',
  
  // Card
  'card': 'max-w-5xl p-8 m-8 text-center shadow-lg backdrop-blur-md bg-white/30 dark:bg-black/30 border border-white/20 rounded-lg',
  'card__title': 'text-3xl font-bold text-white',
  'card__description': 'mt-4 text-lg text-white',
  'card__actions': 'mt-6 flex justify-center space-x-4',
  
  // Buttons
  'button': {
    base: 'transition-colors duration-200',
    primary: 'bg-green-600 text-white hover:bg-green-700',
    secondary: 'bg-white !text-gray-900 dark:bg-gray-900 dark:!text-white hover:bg-gray-100 dark:hover:bg-gray-800',
    theme: 'absolute top-4 right-4 text-white'
  }
} as const

export type StylesConfig = typeof styles 