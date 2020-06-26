import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import React from 'react'

import { actions } from 'data'
import { getData } from './selectors'
import Error from './template.error'
import Loading from './template.loading'
import Success from './template.success'

class SecondStepContainer extends React.PureComponent {
  render() {
    const { coin, coinDisplayName, data, actions } = this.props
    return data.cata({
      Success: value => (
        <Success
          {...value}
          coin={coin}
          coinDisplayName={coinDisplayName}
          handleBack={actions.sendEthSecondStepCancelClicked}
          handleSubmit={actions.sendEthSecondStepSubmitClicked}
        />
      ),
      Failure: message => <Error>{message}</Error>,
      Loading: () => <Loading />,
      NotAsked: () => <Loading />
    })
  }
}

const mapStateToProps = (state, ownProps) => ({
  data: getData(state, ownProps.coin)
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions.components.sendEth, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(SecondStepContainer)
