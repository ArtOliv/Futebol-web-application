import { useState } from 'react'
import './styles.css'
import ArrowIcon from '../../assets/Arrow_icon.png'

function FormUpdate(){
    const [aberto, setAberto] = useState({
        times: false,
        jogos: false,
    })

    const toggleDropdown = (chave) => {
        setAberto(prev => ({...prev, [chave]: !prev[chave]}))
    }

    const dropdowns = [
        {chave: 'times', texto: 'Atualizar times'},
        {chave: 'jogos', texto: 'Atualizar jogos'},
    ]

    return(
        <>
            {dropdowns.map(({chave, texto}) => (
                <div className="dropdown" key={chave}>
                    <button className='dropdown-button' onClick={() => toggleDropdown(chave)}>
                        <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto[chave] ? 'rotate' : ''}`}/>
                        <span className="dropdown-text">{texto}</span>
                    </button>
                    {aberto[chave] && (
                        <div className="input-container">
                            <textarea rows={8} cols={80}></textarea>
                        </div>
                    )}
                </div>
            ))}
            <div className="update-button">
                <button type="submit">Atualizar</button>
            </div>
        </>
    )
}

export default FormUpdate