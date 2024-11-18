import { cva } from 'class-variance-authority'

export const heroVariants = cva(
  'relative overflow-hidden',
  {
    variants: {
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
      },
      size: {
        sm: 'py-12 md:py-16',
        md: 'py-16 md:py-24',
        lg: 'py-24 md:py-32'
      }
    },
    defaultVariants: {
      align: 'center',
      size: 'lg'
    }
  }
)

export interface HeroVariants {
  align?: 'left' | 'center' | 'right'
  size?: 'sm' | 'md' | 'lg'
} 