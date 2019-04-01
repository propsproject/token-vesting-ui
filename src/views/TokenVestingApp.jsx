import React, { Component } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import { getTokenVesting, getSimpleToken } from '../contracts'

import Header from './Header'
import VestingDetails from './VestingDetails'
import VestingSchedule from './VestingSchedule'
import Spinner from './Spinner'

import '../stylesheets/TokenVestingApp.css'
import Network from '../network';


class TokenVestingApp extends Component {
  constructor() {
    super()
    this.state = { name: 'Token', loading: true }
  }

  componentDidMount() {
    this.getData()
  }

  render() {
    const { address, token } = this.props
    return (
      <div className="TokenVestingApp">

        { this.state.loading ? <Spinner /> : null }

        <Header address={ address } token={ token } tokenName={ this.state.name } />

        <Grid>
          <Row>
            <Col xs={12} md={6}>
              <VestingDetails
                address={ address }
                token={ token }
                details={ this.state }
                getData={ () => this.getData() }
                setLoader={ x => this.setLoader(x) }
              />
            </Col>

            <Col xs={12} md={6}>
              <VestingSchedule details={ this.state } />
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }

  setLoader(loading) {
    this.setState({ loading })
  }

  async getVestedAmount(start, duration, cliff, total) {    
    let totalBalance = total;   
    const web3 = await Network.web3(); 
    const latestBlock = await web3.eth.getBlock('latest');    
    const timestamp =latestBlock.timestamp;
    
    // console.log(`cliff=${cliff},timestamp=${timestamp}, start=${start}, duration=${duration}, start+duration=${start.plus(duration)}`);
    // console.log(`cliff=${typeof cliff},timestamp=${typeof timestamp}, start=${typeof start}, duration=${typeof duration}, start+duration=${start.plus(duration)}`);
    if (timestamp < cliff) { 
      console.log('less than cliff');
      return 0;
    } else if (timestamp >= start.plus(duration)) {
      return totalBalance;
    } else {
      return totalBalance.times(timestamp-start).div(duration);
    }
  }

  async getData() {
    const { address, token, percent } = this.props    
    const tokenVesting = await getTokenVesting(address)
    const tokenContract = await getSimpleToken(token)
    const start = await tokenVesting.start()
    const duration = await tokenVesting.duration()
    const end = start.plus(duration)

    const balance  = await tokenContract.balanceOf(address)
    const released = await tokenVesting.released(token)
    const total = balance.plus(released)
    const grandTotal = (percent > 0 ? total.times(100).div(percent) : 0);
    const transferred = grandTotal.minus(total);
    const cliff = await tokenVesting.cliff();    
    this.setState({
      start,
      end,
      cliff,
      transferred,
      grandTotal,
      total,
      released,      
      vested: await this.getVestedAmount(start, duration, cliff, total),
      decimals: await tokenContract.decimals(),
      beneficiary: await tokenVesting.beneficiary(),
      owner: await tokenVesting.owner(),
      revocable: await tokenVesting.revocable(),
      revoked: await tokenVesting.revoked(token),
      name: await tokenContract.name(),
      symbol: await tokenContract.symbol(),
      loading: false
    })
  }
}


export default TokenVestingApp
