import React from 'react'
import ReactDOM from 'react-dom'
import './stylesheets/index.css'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()

// Global error handler, because couldn't figure out how else to catch :(
window.addEventListener('unhandledrejection', function (e) {
    if(e.reason.message.indexOf('Cannot create instance of Contract')>-1) {
        this.alert('Invalid contract parameters. Please make sure the URL is correct, and Metamask is connected to Mainnet');
    }
})
