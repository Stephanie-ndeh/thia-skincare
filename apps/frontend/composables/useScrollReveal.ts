export function useScrollReveal() {
  const observedElements = ref<Element[]>([])
  let observer: IntersectionObserver | null = null

  if (process.client) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            entry.target.querySelectorAll('.stagger-children').forEach(el => el.classList.add('visible'))
            observer!.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )
  }

  function observe(el: Element | null) {
    if (!el || !observer) return
    observer.observe(el)
    observedElements.value.push(el)
  }

  onUnmounted(() => {
    observedElements.value.forEach(el => observer?.unobserve(el))
  })

  return { observe }
}
