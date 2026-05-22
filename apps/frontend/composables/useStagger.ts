export function useStagger() {
  const containerEl = ref<HTMLElement>()
  const visible = ref(false)

  onMounted(() => {
    if (!containerEl.value) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      visible.value = true
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible.value = true
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.14 },
    )
    observer.observe(containerEl.value)
  })

  return { containerEl, visible }
}
