import { styles } from '@/config/styles.config'
import type { StylesConfig } from '@/config/styles.config'

type StyleKey = keyof StylesConfig
type ButtonVariant = keyof StylesConfig['button']

export function getStyles(key: StyleKey): string {
  return styles[key] as string
}

export function getButtonStyles(variant: ButtonVariant): string {
  const buttonStyles = styles.button
  return `${buttonStyles.base} ${buttonStyles[variant]}`
} 