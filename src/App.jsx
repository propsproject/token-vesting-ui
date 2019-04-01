import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Web3 from 'web3'

import TokenVestingApp from './views/TokenVestingApp'

const App = () => (
  <Router>
    <Switch>
      <Route path="/:address/:token/:percent" component={ Main }/>
      <Route component={ MissingAddress } />
    </Switch>
  </Router>
)

const Main = function({ match }) {
  let web3 = new Web3()
  let { address, token, percent } = match.params

  // TODO validate TokenVesting address
  return web3.utils.isAddress(address)
    ? <TokenVestingApp address={ address } token={ token } percent= { percent } />
    : <MissingAddress />
}

const MissingAddress = () => (
  <p>This is not a TokenVesting address :(</p>
)

export default App