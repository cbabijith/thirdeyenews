import { createBrowserSupabaseClient } from './browserClient'

export const authService = {
  async signIn(email: string, password: string) {
    return createBrowserSupabaseClient().auth.signInWithPassword({ email, password })
  },

  async signOut() {
    return createBrowserSupabaseClient().auth.signOut()
  },

  async signUp(email: string, password: string) {
    return createBrowserSupabaseClient().auth.signUp({ email, password })
  },

  async getUser() {
    return createBrowserSupabaseClient().auth.getUser()
  },
}
