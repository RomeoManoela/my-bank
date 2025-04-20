import { Outlet } from 'react-router-dom'
import Header from './Header.tsx'

function AppLayout() {
  return (
    <div className={'min-h-screen bg-[#031a09] p-5'}>
      {/*<div className={'min-h-[95vh] rounded-lg border border-[#294e28] shadow-lg'}>*/}
      <Header />
      <main className={'mx-auto w-[95%] p-5'}>
        <Outlet />
      </main>
      {/*</div>*/}
    </div>
  )
}

export default AppLayout
