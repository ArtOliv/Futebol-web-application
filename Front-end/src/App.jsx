import { Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header'
import Header_bg from './components/Header_bg'
import Footer from './components/Footer'
import Classificacao from './pages/Classificacao'
import Jogos from './pages/Jogos'
import Times from './pages/Times'
import Jogadores from './pages/Jogadores'
import Admin from './pages/Admin'

function App(){
    const location = useLocation()
    const isAdminPage = location.pathname === '/administrador'

    const [cpf, setCpf] = useState('')
    const [senha, setSenha] = useState('')

    return (
        <>
            {!isAdminPage && <Header />}
            {!isAdminPage && <Header_bg />}
            <Routes>
                <Route path='/' element={<Classificacao />} />
                <Route path='/jogos' element={<Jogos />} />
                <Route path='/times' element={<Times />} />
                <Route path='/jogadores' element={<Jogadores />} />
                <Route path='/administrador' element={<Admin />} />
            </Routes>
            {!isAdminPage && <Footer cpf={cpf} setCpf={setCpf} senha={senha} setSenha={setSenha}/>}
        </>
    )
}

export default App