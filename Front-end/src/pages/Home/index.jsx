import './styles.css'
import Header from '../../components/Header'

function Home(){
    return(
        <>
            <Header />
            <div className='home-content'>
                <div className='content'>
                    <h3>Seja bem vindo ao <b>Web Futebol!</b></h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus fuga voluptatem delectus reprehenderit cum doloremque perferendis veniam saepe quia veritatis totam nam magni voluptate, non fugit. Non sed nobis ducimus.</p>
                </div>
            </div>
        </>
    )
}

export default Home