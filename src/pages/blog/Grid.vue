<script setup lang="ts">
import { MainNavigation } from '@/components/sections/navbar'
import { BlogGrid, BlogCard } from '@/components/sections/blog'
import { Container } from '@/components/layout'

const posts = [
  {
    title: 'Building Modern Web Applications',
    description: 'Learn how to create scalable and maintainable web applications using the latest technologies.',
    category: 'Development',
    date: '2024-03-15',
    href: '#'
  },
  {
    title: 'The Future of AI',
    description: 'Exploring the latest advancements in artificial intelligence and machine learning.',
    category: 'Technology',
    date: '2024-03-14',
    href: '#'
  },
  {
    title: 'Design Systems Evolution',
    description: 'How design systems are changing the way we build and maintain user interfaces.',
    category: 'Design',
    date: '2024-03-13',
    href: '#'
  }
]
</script>

<template>
  <MainNavigation />
  <Container>
    <!-- Grid Layout -->
    <BlogGrid class="mb-16">
      <BlogCard
        v-for="post in posts"
        :key="post.title"
        v-bind="post"
        class="h-[400px]"
      />
    </BlogGrid>

    <!-- Featured Layout -->
    <BlogGrid layout="featured" :columns="2" class="mb-16">
      <BlogCard
        v-for="post in posts.slice(0, 2)"
        :key="post.title"
        v-bind="post"
        class="h-[400px]"
      />
    </BlogGrid>

    <!-- Single Column Layout -->
    <BlogGrid layout="list" :columns="1">
      <BlogCard
        v-for="post in posts"
        :key="post.title"
        v-bind="post"
        class="h-[300px]"
      />
    </BlogGrid>
  </Container>
</template> 