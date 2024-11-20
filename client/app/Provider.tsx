import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from './redux/store'

interface ProviderProps {
  //change type to any if error emerges
  children: ReactNode
}

export function Providers({ children }: ProviderProps) {
  return <Provider store={store}>{children}</Provider>
}

export default Providers
