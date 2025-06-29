import './styles.css'
import DropDownCampeonato from './DropdownDeleteCampeonato'
import DropDownTimes from './DropdownDeleteTimes'
import DropDownJogador from './DropdownDeleteJogador'
import DropDownJogos from './DropdownDeleteJogos'
import DropDownGols from './DropdownDeleteGols'
import DropDownCartao from './DropdownDeleteCartao'

function FormDelete(){
    return(
        <>
            <DropDownCampeonato/>
            <DropDownTimes/>
            <DropDownJogador/>
            <DropDownJogos/>
            <DropDownGols/>
            <DropDownCartao/>
            <div className="delete-button">
                <button type="submit">Deletar</button>
            </div>
        </>
    )
}

export default FormDelete