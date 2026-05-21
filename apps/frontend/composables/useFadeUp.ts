export function useFadeUp(delay = 0) {
  const el = ref<HTMLElement>()
  const visible = ref(false)

  onMounted(() => {
    if (!el.value) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      visible.value = true
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            visible.value = true
          }, delay)
          observer.disconnect()
        }
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.14,
      },
    )
    observer.observe(el.value)
  })

  return { el, visible }
}
