import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Header_bg from './components/Header_bg'
import Classificacao from './pages/Classificacao'
import Jogos from './pages/Jogos'
import Times from './pages/Times'
import Jogadores from './pages/Jogadores'

function App(){
    return (
        <>
            <Header />
            <Header_bg />
            <Routes>
                <Route path='/' element={<Classificacao />} />
                <Route path='/jogos' element={<Jogos />} />
                <Route path='/times' element={<Times />} />
                <Route path='/jogadores' element={<Jogadores />} />
            </Routes>
        </>
    )
}

export default App