import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    role:     string
    tenantId: number
  }
  interface Session {
    user: {
      id:       string
      email:    string
      name:     string
      role:     string
      tenantId: number
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role:     string
    tenantId: number
  }
}