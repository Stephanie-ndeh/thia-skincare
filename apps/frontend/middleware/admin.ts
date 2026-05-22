export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/auth/login')
  }

  const supabase = useSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.value.id)
    .single()

  if (!data || (data as { role: string }).role !== 'admin') {
    return navigateTo('/')
  }
})
