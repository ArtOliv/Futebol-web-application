import React, { useState } from 'react'; 
import ArrowIcon from '../../../assets/Arrow_icon.png';


function DropDownCampeonato({
    nomeCampeonato, 
    anoCampeonato,  
    onNomeChange,   
    onAnoChange     
}) {
    const [aberto, setAberto] = useState(false); 


    return(
        <>
            <div className="dropdown">
                <button type='button' className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Adicionar campeonato</span>
                </button>
                {aberto && (
                    <div className="input-container">
 
                        <div className="form-group"> 
                            <label htmlFor='nomeCampeonato'>Nome:</label>
                            <input
                                type="text"
                                id="nomeCampeonato"
                                value={nomeCampeonato} 
                                onChange={onNomeChange} 
                                autoComplete="off"
                            />
                        </div>
                        
                        <div className="form-group"> 
                            <label htmlFor="anoCampeonato">Ano:</label>
                            <input
                                type="number"
                                id="anoCampeonato"
                                value={anoCampeonato} 
                                onChange={onAnoChange} 
                                min = "0"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default DropDownCampeonato;
