import { AuthProvider } from '@/context/AuthContext'
import { Slot } from 'expo-router'

export default function RootLayout() {

  console.log("enter here first...")


  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  )
}
