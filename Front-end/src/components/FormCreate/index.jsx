import './styles.css'
import DropDownCampeonato from './DropdownCampeonato'
import DropDownTimes from './DropdownTimes'
import DropDownJogos from './DropdownJogos'

function FormCreate(){
    return(
        <>
            <DropDownCampeonato/>
            <DropDownTimes/>
            <DropDownJogos/>
            <div className="create-button">
                <button type="submit">Criar</button>
            </div>
        </>
    )
}

export default FormCreate