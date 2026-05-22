export function useCountUp(target: number, duration = 1400) {
  const current = ref(0)
  const el = ref<HTMLElement>()

  onMounted(() => {
    if (!el.value) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      current.value = target
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        const start = performance.now()
        function tick(now: number) {
          const p = Math.min((now - start) / duration, 1)
          // cubic ease-out: 1-(1-p)^3
          const eased = 1 - Math.pow(1 - p, 3)
          current.value = Math.round(eased * target)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    observer.observe(el.value)
  })

  return { el, current }
}
