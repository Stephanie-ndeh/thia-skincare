<script setup lang="ts">
const { el: sectionEl, visible: sectionVisible } = useFadeUp()
</script>

<template>
  <section
    ref="sectionEl"
    class="fade-up py-16 px-4 sm:px-8 bg-cream"
    :class="{ visible: sectionVisible }"
  >
    <div class="max-w-4xl mx-auto border border-brand-dark/11 rounded-xl p-8 sm:p-12">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
        <div class="flex-1">
          <p class="font-body text-[10px] tracking-[0.25em] uppercase text-terracotta mb-4 flex items-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-terracotta" />
            {{ $t('home.payment_eyebrow') }}
          </p>
          <h2 class="font-heading text-2xl sm:text-3xl font-semibold text-brand-dark mb-3 leading-tight">
            {{ $t('home.mobile_money') }}
          </h2>
          <p class="font-body text-sm text-text-muted leading-relaxed max-w-sm">
            {{ $t('home.payment_body') }}
          </p>
        </div>
        <div class="flex lg:flex-col gap-2 shrink-0">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-[#FFCB05] text-brand-primary rounded-lg">
            <span class="font-body text-xs font-bold tracking-wider">MTN</span>
            <span class="font-body text-xs">MoMo</span>
          </div>
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-[#F05A28] text-white rounded-lg">
            <span class="font-body text-xs font-bold tracking-wider">Orange</span>
            <span class="font-body text-xs">Money</span>
          </div>
          <div class="inline-flex items-center gap-2 px-4 py-2 border border-brand-dark/20 text-brand-dark rounded-lg">
            <span class="font-body text-[10px] text-text-muted">✕</span>
            <span class="font-body text-xs">COD</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
