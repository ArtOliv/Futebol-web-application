import './styles.css'
import Header from '../../components/Header'

function Home(){
    return(
        <>
            <Header />
            <div className='home-content'>
                <div className='content'>
                    <h3>Seja bem vindo ao <b>Web Futebol</b>!</h3>
                    <p>Com vários campeonatos, acompanhe os jogos do seu time favorito, com tabelas de classificação atualizadas e simulação de jogos.</p>
                </div>
            </div>
        </>
    )
}

export default Home