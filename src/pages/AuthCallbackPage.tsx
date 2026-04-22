import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.access_token) {
        navigate('/auth')
        return
      }
      try {
        const resp = await authApi.googleAuth(session.access_token)
        if (resp.status === 206) {
          localStorage.setItem('cps_google_pending', JSON.stringify(resp.data))
          navigate('/auth?complete=true')
        } else {
          setUser(resp.data.user, resp.data.token)
          navigate('/home')
        }
      } catch {
        navigate('/auth')
      }
    })
  }, [])

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      height: '100vh', background: '#FDF8F4',
      fontFamily: 'DM Sans, sans-serif', color: '#8B3A62', fontSize: 16 
    }}>
      Conectando com Google... 💕
    </div>
  )
}