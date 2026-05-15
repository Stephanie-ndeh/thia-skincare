const STORAGE_KEY = 'admin-sidebar-collapsed'

export function useAdminSidebar() {
  const isCollapsed = useState<boolean>('admin-sidebar-collapsed', () => false)

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      isCollapsed.value = stored === 'true'
    }
  })

  function toggle() {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem(STORAGE_KEY, String(isCollapsed.value))
  }

  return { isCollapsed, toggle }
}
