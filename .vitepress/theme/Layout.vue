<template>
    <NotFound v-if="page.isNotFound" />
    <Home v-else-if="frontmatter.layout === 'home'" />
    <Page v-else />
</template>

<script setup lang="ts">
import { useData } from 'vitepress';
import { Home, NotFound, Page } from './components'
const { page, frontmatter } = useData()

</script>

<style scoped></style>