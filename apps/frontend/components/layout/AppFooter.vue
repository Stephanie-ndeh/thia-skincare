<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <footer class="bg-brand-dark text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-14">

        <!-- Brand column -->
        <div class="col-span-2 md:col-span-1">
          <NuxtLink to="/" class="font-heading text-2xl font-semibold text-white">
            Thia<span class="text-terracotta">.</span>
          </NuxtLink>
          <p class="font-body text-xs text-white/45 mt-3 leading-relaxed max-w-[190px]">
            {{ $t('footer.tagline') }}
          </p>
          <div class="flex gap-2 mt-5 flex-wrap">
            <div class="inline-flex items-center gap-1.5 bg-[#FFCB05] text-[#1a1a1a] px-3 py-1.5">
              <span class="font-body text-[10px] font-bold tracking-wider">MTN</span>
              <span class="font-body text-[10px]">MoMo</span>
            </div>
            <div class="inline-flex items-center gap-1.5 bg-[#F05A28] text-white px-3 py-1.5">
              <span class="font-body text-[10px] font-bold tracking-wider">Orange</span>
              <span class="font-body text-[10px]">Money</span>
            </div>
          </div>
        </div>

        <!-- Shop column -->
        <div>
          <p class="font-body text-[10px] tracking-[0.22em] uppercase text-white/35 mb-5">{{ $t('footer.shop_heading') }}</p>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/categories" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.shop_1') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/categories" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.shop_2') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/categories" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.shop_3') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/categories" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.shop_4') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/categories" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.shop_5') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Customer care column -->
        <div>
          <p class="font-body text-[10px] tracking-[0.22em] uppercase text-white/35 mb-5">{{ $t('footer.care_heading') }}</p>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/faq" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.care_1') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/faq" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.care_2') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/faq" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.care_3') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.care_4') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/account/orders" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.care_5') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Thia column -->
        <div>
          <p class="font-body text-[10px] tracking-[0.22em] uppercase text-white/35 mb-5">Thia</p>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/about" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.thia_1') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/about" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.thia_2') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/testimonials" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.thia_3') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/faq" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.thia_4') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="font-body text-sm text-white/65 hover:text-white transition-colors">
                {{ $t('footer.thia_5') }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-white/10 pt-6 flex items-center justify-between">
        <p class="font-body text-xs text-white/30">
          {{ $t('footer.copyright', { year: new Date().getFullYear() }) }}
        </p>
        <LanguageSwitcher />
      </div>
    </div>
  </footer>
</template>
