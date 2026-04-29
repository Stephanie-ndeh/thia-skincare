<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'

defineProps<{
  description: string | null
  ingredients: string | null
  usage: string | null
}>()
</script>

<template>
  <TabsRoot default-value="description">
    <TabsList class="flex border-b border-brand-dark/10 mb-6">
      <TabsTrigger
        value="description"
        class="px-5 py-3 font-body text-sm font-medium text-text-muted border-b-2 border-transparent transition-colors data-[state=active]:text-brand-dark data-[state=active]:border-brand-dark -mb-px"
      >
        Description
      </TabsTrigger>
      <TabsTrigger
        value="ingredients"
        class="px-5 py-3 font-body text-sm font-medium text-text-muted border-b-2 border-transparent transition-colors data-[state=active]:text-brand-dark data-[state=active]:border-brand-dark -mb-px"
      >
        Ingredients
      </TabsTrigger>
      <TabsTrigger
        value="how-to-use"
        class="px-5 py-3 font-body text-sm font-medium text-text-muted border-b-2 border-transparent transition-colors data-[state=active]:text-brand-dark data-[state=active]:border-brand-dark -mb-px"
      >
        How to Use
      </TabsTrigger>
    </TabsList>

    <TabsContent value="description">
      <p v-if="description" class="font-body text-sm text-text-muted leading-relaxed whitespace-pre-line">
        {{ description }}
      </p>
      <p v-else class="font-body text-sm text-text-muted italic">No description available.</p>
    </TabsContent>

    <TabsContent value="ingredients">
      <p v-if="ingredients" class="font-body text-sm text-text-muted leading-relaxed whitespace-pre-line">
        {{ ingredients }}
      </p>
      <p v-else class="font-body text-sm text-text-muted italic">Ingredients list not available.</p>
    </TabsContent>

    <TabsContent value="how-to-use">
      <p v-if="usage" class="font-body text-sm text-text-muted leading-relaxed whitespace-pre-line">
        {{ usage }}
      </p>
      <p v-else class="font-body text-sm text-text-muted italic">Usage instructions not available.</p>
    </TabsContent>
  </TabsRoot>
</template>
