import { AuthProvider } from '@/context/AuthContext'
import { Slot } from 'expo-router'
import { PaperProvider } from 'react-native-paper'

export default function RootLayout() {

  console.log("enter here first...")


  return (
    <PaperProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </PaperProvider>
  )
}
