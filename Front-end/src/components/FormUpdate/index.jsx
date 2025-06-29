import './styles.css'
import DropDownTimes from './DropdownUpdateTimes'
import DropDownJogos from './DropdownUpdateJogos'

function FormUpdate(){
    return(
        <>
            <DropDownTimes/>
            <DropDownJogos/>
            <div className="update-button">
                <button type="submit">Atualizar</button>
            </div>
        </>
    )
}

export default FormUpdate