# Vue Shadcn UI Starter

A revolutionary approach to building modern websites using Vite + Vue 3 Shadcn UI in a BunJS environment. This starter kit turns traditional admin panel-centric ui/shadcn components into a versatile solution for creating stunning landing pages, multi-page applications, and reusable UI blocks.

## 🌟 Key Features

- **Advanced Design System**: Built on top of shadcn-vue with extended functionality for websites
- **BEM + Tailwind Methodology**: Centralized styling configuration with BEM naming convention
- **Dark Mode Support**: Seamless theme switching with persistent state
- **JAMstack Ready**: Content management through JSON files
- **Type-Safe**: Full TypeScript support
- **Performance Optimized**: Powered by Bun.js and Vite

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/alexy-os/vue-shadcn-starter

# Install dependencies
bun install

# Start development server
bun dev
```

## 🎨 Styling Architecture

The project introduces a unique styling approach that combines BEM methodology with Tailwind CSS, managed through a centralized configuration:

```typescript
// styles.config.ts example
export const styles = {
  'block': 'tailwind-classes',
  'block__element': 'tailwind-classes',
  'block__element--modifier': 'tailwind-classes'
}
```

### Usage in Components

```vue
<template>
  <div :class="getStyles('block')">
    <div :class="getStyles('block__element')">
      {{ content.title }}
    </div>
  </div>
</template>
```

## 📄 Content Management

The project uses a JSON-based content management system, making it perfect for JAMstack architectures:

```json
{
  "hero": {
    "title": "Your Title",
    "description": "Your Description"
  }
}
```

## 🛠️ Tech Stack

- Vue 3.5+
- Vite
- Bun.js
- TypeScript
- Tailwind CSS
- shadcn-vue
- Radix Vue

## 📦 Project Structure

```
src/
├── components/
│   └── ui/          # Shadcn components
├── config/
│   └── styles.config.ts  # Centralized styling
├── utils/
│   └── styles.ts    # Style utilities
├── assets/
│   └── index.css    # Global styles
└── App.vue          # Main application
```

## 🎯 Use Cases

- Landing Pages
- Marketing Websites
- Multi-page Applications
- Component Libraries
- Design Systems

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see the [MIT](LICENSE) file for details.

---

**Note**: This is an early preview of a larger ecosystem being developed for creating flexible, reusable UI components with shadcn-vue. Stay tuned for more blocks and components!

For more information, visit [shadcn-vue documentation](https://www.shadcn-vue.com/).