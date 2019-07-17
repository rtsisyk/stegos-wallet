// @flow
import { clipboard } from 'electron';
import * as qrcode from 'qrcode-generator';
import React, { Component } from 'react';
import type { Account } from '../../reducers/types';
import Alert from '../Alert/Alert';
import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';
import Steps from '../common/Steps/Steps';
import RecoveryPhrase from './RecoveryPhraze/RecoveryPhrase';
import styles from './RestoreAccount.css';

type Props = {
  account: Account,
  visible: boolean,
  onRestored: () => void,
  onClose: () => void
};

export default class RestoreAccount extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.alertRef = React.createRef<Alert>();
  }

  state = {
    phrase: [],
    step: 0,
    qrcodeDataUrl: null
  };

  alertRef = null;

  handleRecoveryChange(phrase: string[]) {
    this.setState({
      phrase
    });
  }

  close() {
    this.setState({
      phrase: [],
      step: 0,
      qrcodeDataUrl: null
    });
    const { onClose } = this.props;
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  restore() {
    const { phrase } = this.state;
    if (!phrase.length) {
      this.alertRef.current.show({
        body:
          'The recovery phrase is incorrect. Please verify it, correct and try again.'
      });
    } else {
      const { account } = this.props;
      const qr = qrcode(4, 'L');
      qr.addData(account.id);
      qr.make();
      const qrcodeDataUrl = qr.createDataURL();
      this.setState({ qrcodeDataUrl, step: 1 });
      this.setState({
        step: 1
      });
    }
  }

  copyAddressStep() {
    const { qrcodeDataUrl } = this.state;
    const { account } = this.props;
    return (
      <div className={styles.QrcodeContainer} key="Qrcode">
        <img
          src={qrcodeDataUrl}
          alt={account.address}
          className={styles.Qrcode}
        />
        <span className={styles.AccountAddress}>
          {account.id} Address for account <b>{account.name}</b>
        </span>
      </div>
    );
  }

  addressCopiedStep() {
    const { qrcodeDataUrl } = this.state;
    const { account } = this.props;
    return (
      <div className={styles.QrcodeContainer} key="Qrcode">
        <img
          src={qrcodeDataUrl}
          alt={account.address}
          className={styles.Qrcode}
        />
        <span className={styles.AccountAddress}>
          <span style={{ color: '#EE6920' }}>Address copied</span> Address for
          account <b>{account.name}</b>
        </span>
      </div>
    );
  }

  copyAddressToClipboard() {
    const { account } = this.props;
    clipboard.writeText(account.id);
    this.setState({ step: 2 });
    const { onRestored } = this.props;
    if (typeof onRestored === 'function') {
      onRestored();
    }
  }

  render() {
    const { phrase, step } = this.state;
    const { visible } = this.props;
    return (
      <Modal
        options={{
          title: 'Restore Account',
          subtitle:
            'In order to restore your existing account, please fill all words from the recovery phrase in correct order.',
          type: 'big',
          visible,
          onClose: this.close.bind(this)
        }}
        style={{ width: '55%' }}
      >
        <div className={styles.Container}>
          <Steps
            steps={['Accout', 'Copy Address', 'Receive']}
            activeStep={step}
          />
          {step === 0 && (
            <RecoveryPhrase
              wordsCount={12}
              phrase={phrase}
              onChange={e => this.handleRecoveryChange(e)}
            />
          )}
          {step === 1 && this.copyAddressStep()}
          {step === 2 && this.addressCopiedStep()}
        </div>
        {step === 0 && (
          <div className={styles.ActionsContainer}>
            <Button type="OutlineDisabled" onClick={() => this.close()}>
              Cancel
            </Button>
            <Button type="OutlinePrimary" onClick={() => this.restore()}>
              Restore
            </Button>
          </div>
        )}
        {step === 1 && (
          <div className={styles.ActionsContainer}>
            <Button
              type="OutlinePrimary"
              style={{ margin: 'auto' }}
              onClick={() => this.copyAddressToClipboard()}
            >
              Copy address to clipboard
            </Button>
          </div>
        )}
        {step === 2 && (
          <div className={styles.ActionsContainer}>
            <Button
              type="OutlinePrimary"
              style={{ margin: 'auto' }}
              onClick={() => this.close()}
            >
              close
            </Button>
          </div>
        )}
        <Alert ref={this.alertRef} />
      </Modal>
    );
  }
}
