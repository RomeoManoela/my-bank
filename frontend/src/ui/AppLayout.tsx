import { Navigation, Outlet, useNavigation } from 'react-router-dom'
import Header from './Header.tsx'
import Loader from './Loader.tsx'

function AppLayout() {
  const navigation: Navigation = useNavigation()
  const isLoading: boolean = navigation.state === 'loading'
  return (
    <div className={'min-h-screen bg-[#031a09] p-5'}>
      {/*<div className={'min-h-[95vh] rounded-lg border border-[#294e28] shadow-lg'}>*/}
      {isLoading && <Loader />}
      <Header />
      <main className={'mx-auto w-[95%] p-5'}>
        <Outlet />
      </main>
      {/*</div>*/}
    </div>
  )
}

export default AppLayout
