import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import './styles/GlobalStyles.css'
import App from './App'
import Scroll from './Scroll'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Scroll />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
