<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'

defineProps<{
  description: string | null
  ingredients: string | null
  usage: string | null
  productId: string
  isAuthenticated: boolean
}>()

const reviewListRef = useTemplateRef<{ refresh: () => Promise<void> }>('reviewList')
</script>

<template>
  <TabsRoot default-value="description">
    <!-- Tab list -->
    <TabsList class="flex border-b border-brand-dark/10 mb-8 overflow-x-auto">
      <TabsTrigger
        value="description"
        class="px-5 py-3.5 font-body text-xs tracking-[0.15em] uppercase text-text-muted border-b-2 border-transparent transition-colors whitespace-nowrap data-[state=active]:text-brand-dark data-[state=active]:border-espresso -mb-px"
      >
        Description
      </TabsTrigger>
      <TabsTrigger
        value="ingredients"
        class="px-5 py-3.5 font-body text-xs tracking-[0.15em] uppercase text-text-muted border-b-2 border-transparent transition-colors whitespace-nowrap data-[state=active]:text-brand-dark data-[state=active]:border-espresso -mb-px"
      >
        Ingredients
      </TabsTrigger>
      <TabsTrigger
        value="how-to-use"
        class="px-5 py-3.5 font-body text-xs tracking-[0.15em] uppercase text-text-muted border-b-2 border-transparent transition-colors whitespace-nowrap data-[state=active]:text-brand-dark data-[state=active]:border-espresso -mb-px"
      >
        How to Use
      </TabsTrigger>
      <TabsTrigger
        value="reviews"
        class="px-5 py-3.5 font-body text-xs tracking-[0.15em] uppercase text-text-muted border-b-2 border-transparent transition-colors whitespace-nowrap data-[state=active]:text-brand-dark data-[state=active]:border-espresso -mb-px"
      >
        Reviews
      </TabsTrigger>
    </TabsList>

    <!-- Description tab: drop cap -->
    <TabsContent value="description">
      <p
        v-if="description"
        class="font-body text-sm leading-loose text-text-muted max-w-2xl
          first-letter:text-[4.5rem] first-letter:font-heading first-letter:font-semibold
          first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8]
          first-letter:text-espresso first-letter:mt-1"
      >
        {{ description }}
      </p>
      <p v-else class="font-body text-sm text-text-muted italic">No description available.</p>
    </TabsContent>

    <!-- Ingredients tab -->
    <TabsContent value="ingredients">
      <p v-if="ingredients" class="font-body text-sm text-text-muted leading-relaxed whitespace-pre-line max-w-2xl">
        {{ ingredients }}
      </p>
      <p v-else class="font-body text-sm text-text-muted italic">Ingredients list not available.</p>
    </TabsContent>

    <!-- How to Use tab -->
    <TabsContent value="how-to-use">
      <p v-if="usage" class="font-body text-sm text-text-muted leading-relaxed whitespace-pre-line max-w-2xl">
        {{ usage }}
      </p>
      <p v-else class="font-body text-sm text-text-muted italic">Usage instructions not available.</p>
    </TabsContent>

    <!-- Reviews tab -->
    <TabsContent value="reviews">
      <ReviewList ref="reviewList" :product-id="productId" />
      <div class="mt-8 border-t border-brand-dark/10 pt-8">
        <WriteReviewForm
          v-if="isAuthenticated"
          :product-id="productId"
          @submitted="reviewListRef?.refresh()"
        />
        <p v-else class="font-body text-sm text-text-muted">
          <NuxtLink
            to="/auth/login"
            class="font-medium text-brand-dark hover:underline"
          >
            Sign in
          </NuxtLink>
          to write a review
        </p>
      </div>
    </TabsContent>
  </TabsRoot>
</template>
