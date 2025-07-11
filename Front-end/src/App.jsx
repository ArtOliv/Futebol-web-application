import { Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header'
import HeaderBg from './components/HeaderBg'
import Footer from './components/Footer'
import Classificacao from './pages/Classificacao'
import Jogos from './pages/Jogos'
import Times from './pages/Times'
import Jogadores from './pages/Jogadores'
import Estatisticas from './pages/Estatisticas'
import Admin from './pages/Admin'

function App(){
    const location = useLocation()
    const isAdminPage = location.pathname.startsWith('/administrador')

    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')

    return (
        <>
            {!isAdminPage && <Header />}
            {!isAdminPage && <HeaderBg />}
            <Routes>
                <Route path='/' element={<Classificacao />} />
                <Route path='/jogos' element={<Jogos />} />
                <Route path='/times' element={<Times />} />
                <Route path='/jogadores' element={<Jogadores />} />
                <Route path='/estatisticas' element={<Estatisticas />} />
                <Route path='/administrador' element={<Admin />} />
                <Route path='/administrador/criar' element={<Admin mode="create"/>} />
                <Route path='/administrador/atualizar' element={<Admin mode="update"/>} />
                <Route path='/administrador/deletar' element={<Admin mode="delete"/>} />
            </Routes>
            {!isAdminPage && <Footer email={email} setEmail={setEmail} senha={senha} setSenha={setSenha}/>}
        </>
    )
}

export default App