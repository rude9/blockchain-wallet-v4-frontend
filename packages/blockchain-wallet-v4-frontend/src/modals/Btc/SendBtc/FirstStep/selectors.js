import { createDeepEqualSelector } from 'services/ReselectHelper'
import { FormattedMessage } from 'react-intl'
import { isEmpty, length, path, pathOr, prop } from 'ramda'
import { model, selectors } from 'data'
import Bitcoin from 'bitcoinjs-lib'
import React from 'react'

export const getData = createDeepEqualSelector(
  [
    selectors.components.sendBtc.getFeePerByteToggled,
    selectors.components.sendBtc.getPayment,
    selectors.core.common.btc.getActiveHDAccounts,
    selectors.core.common.btc.getActiveAddresses,
    selectors.core.kvStore.lockbox.getDevices,
    selectors.core.walletOptions.getBtcNetwork,
    selectors.form.getFormValues(model.components.sendBtc.FORM),
    selectors.core.walletOptions.getCoinAvailability
  ],
  (
    feePerByteToggled,
    paymentR,
    btcAccountsR,
    btcAddressesR,
    lockboxDevicesR,
    networkTypeR,
    formValues,
    coinAvailabilityR
  ) => {
    const btcAccountsLength = length(btcAccountsR.getOrElse([]))
    const btcAddressesLength = length(btcAddressesR.getOrElse([]))
    const networkType = networkTypeR.getOrElse('bitcoin')
    const excludeLockbox = !prop(
      'lockbox',
      coinAvailabilityR('BTC').getOrElse({})
    )
    const enableToggle =
      btcAccountsLength + btcAddressesLength > 1 ||
      !isEmpty(lockboxDevicesR.getOrElse([]))
    const feePerByte = prop('feePerByte', formValues)
    const destination = prop('to', formValues)
    const from = prop('from', formValues)

    const transform = payment => {
      const regularFeePerByte = path(['fees', 'regular'], payment)
      const priorityFeePerByte = path(['fees', 'priority'], payment)
      const minFeePerByte = path(['fees', 'limits', 'min'], payment)
      const maxFeePerByte = path(['fees', 'limits', 'max'], payment)
      const totalFee = pathOr('0', ['selection', 'fee'], payment)
      const effectiveBalance = prop('effectiveBalance', payment)
      const feePerByteElements = [
        {
          group: '',
          items: [
            {
              text: (
                <FormattedMessage
                  id='modals.sendbtc.firststep.fee.regular'
                  defaultMessage='Regular'
                />
              ),
              value: regularFeePerByte
            },
            {
              text: (
                <FormattedMessage
                  id='modals.sendbtc.firststep.fee.priority'
                  defaultMessage='Priority'
                />
              ),
              value: priorityFeePerByte
            }
          ]
        }
      ]
      const watchOnly = prop('watchOnly', from)
      const network = Bitcoin.networks[networkType]

      return {
        from,
        network,
        enableToggle,
        feePerByte,
        feePerByteToggled,
        feePerByteElements,
        effectiveBalance,
        minFeePerByte,
        maxFeePerByte,
        regularFeePerByte,
        priorityFeePerByte,
        destination,
        totalFee,
        watchOnly,
        excludeLockbox
      }
    }

    return paymentR.map(transform)
  }
)

export const getBtcData = selectors.core.common.btc.getHDAccounts