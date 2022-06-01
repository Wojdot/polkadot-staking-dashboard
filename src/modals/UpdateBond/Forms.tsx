// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { faArrowAltCircleUp } from '@fortawesome/free-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useModal } from 'contexts/Modal';
import { useBalances } from 'contexts/Balances';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { BondInputWithFeedback } from 'library/Form/BondInputWithFeedback';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { Warning } from 'library/Form/Warning';
import { useStaking } from 'contexts/Staking';
import { planckBnToUnit } from 'Utils';
import { APIContextInterface } from 'types/api';
import { ConnectContextInterface } from 'types/connect';
import { usePools } from 'contexts/Pools';
import { ContentWrapper } from './Wrappers';
import { FooterWrapper, Separator, NotesWrapper } from '../Wrappers';

export const Forms = forwardRef((props: any, ref: any) => {
  const { setSection, task } = props;

  const { api, network } = useApi() as APIContextInterface;
  const { units } = network;
  const { setStatus: setModalStatus, setResize, config }: any = useModal();
  const { activeAccount } = useConnect() as ConnectContextInterface;
  const { staking, getControllerNotImported } = useStaking();
  const { getBondOptions, getBondedAccount, getAccountNominations }: any =
    useBalances();
  const { getPoolBondOptions, stats } = usePools();
  const { target } = config;
  const controller = getBondedAccount(activeAccount);
  const nominations = getAccountNominations(activeAccount);
  const controllerNotImported = getControllerNotImported(controller);
  const { minNominatorBond } = staking;
  const stakeBondOptions = getBondOptions(activeAccount);
  const poolBondOptions = getPoolBondOptions(activeAccount);
  const { minJoinBond } = stats;
  const isStaking = target === 'stake';
  const isPooling = target === 'pool';
  const isBondTask = task === 'bond_some' || task === 'bond_all';
  const isUnbondTask = task === 'unbond_some' || task === 'unbond_all';

  const { freeToBond } = isPooling ? poolBondOptions : stakeBondOptions;
  const { freeToUnbond } = isPooling ? poolBondOptions : stakeBondOptions;
  const { totalPossibleBond } = isPooling ? poolBondOptions : stakeBondOptions;

  // local bond value
  const [bond, setBond] = useState(freeToBond);

  // bond valid
  const [bondValid, setBondValid]: any = useState(false);

  // get the max amount available to unbond
  const freeToUnbondToMin = isPooling
    ? Math.max(freeToUnbond - planckBnToUnit(minJoinBond, units), 0)
    : Math.max(freeToUnbond - planckBnToUnit(minNominatorBond, units), 0);

  // unbond all validation
  const unbondAllValid = isPooling
    ? true
    : totalPossibleBond > 0 &&
      nominations.length === 0 &&
      !controllerNotImported;

  // unbnd some validation
  const unbondSomeValid = isPooling ? true : !controllerNotImported;

  // update bond value on task change
  useEffect(() => {
    const _bond = isBondTask
      ? freeToBond
      : task === 'unbond_some'
      ? freeToUnbondToMin
      : totalPossibleBond;

    setBond({ bond: _bond });

    if (task === 'bond_all') {
      if (freeToBond > 0) {
        setBondValid(true);
      } else {
        setBondValid(false);
      }
    }
    if (task === 'unbond_all') {
      if (unbondAllValid) {
        setBondValid(true);
      } else {
        setBondValid(false);
      }
    }
    if (task === 'unbond_some') {
      if (unbondSomeValid) {
        setBondValid(true);
      } else {
        setBondValid(false);
      }
    }
  }, [task]);

  // modal resize on form update
  useEffect(() => {
    setResize();
  }, [bond]);

  // tx to submit
  const tx = () => {
    let _tx = null;
    if (!bondValid || !api || !activeAccount) {
      return _tx;
    }

    // stake unbond: controller must be imported
    if (isStaking && isUnbondTask && controllerNotImported) {
      return _tx;
    }
    // remove decimal errors
    const bondToSubmit = Math.floor(bond.bond * 10 ** units).toString();

    // determine _tx
    if (isPooling) {
      if (isBondTask) {
        _tx = api.tx.nominationPools.bondExtra({ FreeBalance: bondToSubmit });
      } else {
        _tx = api.tx.nominationPools.unbond(activeAccount, bondToSubmit);
      }
    } else if (isStaking) {
      if (isBondTask) {
        _tx = api.tx.staking.bondExtra(bondToSubmit);
      } else {
        _tx = api.tx.staking.unbond(bondToSubmit);
      }
    }
    return _tx;
  };

  const { submitTx, estimatedFee, submitting }: any = useSubmitExtrinsic({
    tx: tx(),
    from: isPooling
      ? activeAccount
      : task === 'bond_some' || task === 'bond_all'
      ? activeAccount
      : controller,
    shouldSubmit: bondValid,
    callbackSubmit: () => {
      setModalStatus(0);
    },
    callbackInBlock: () => {},
  });

  const TxFee = (
    <p>Estimated Tx Fee: {estimatedFee === null ? '...' : `${estimatedFee}`}</p>
  );

  return (
    <ContentWrapper ref={ref}>
      <div className="items">
        {task === 'bond_some' && (
          <>
            <BondInputWithFeedback
              target={target}
              unbond={false}
              listenIsValid={setBondValid}
              defaultBond={freeToBond}
              setters={[
                {
                  set: setBond,
                  current: bond,
                },
              ]}
            />
            <NotesWrapper>{TxFee}</NotesWrapper>
          </>
        )}
        {task === 'bond_all' && (
          <>
            {freeToBond === 0 && (
              <Warning text={`You have no free ${network.unit} to bond.`} />
            )}
            <h4>Amount to bond:</h4>
            <h2>
              {freeToBond} {network.unit}
            </h2>
            <p>
              This amount of {network.unit} will be added to your current bonded
              funds.
            </p>
            <Separator />
            <h4>New total bond:</h4>
            <h2>
              {totalPossibleBond} {network.unit}
            </h2>
            <NotesWrapper>{TxFee}</NotesWrapper>
          </>
        )}
        {task === 'unbond_some' && (
          <>
            <BondInputWithFeedback
              target={target}
              unbond
              listenIsValid={setBondValid}
              defaultBond={freeToUnbondToMin}
              setters={[
                {
                  set: setBond,
                  current: bond,
                },
              ]}
            />
            <NotesWrapper>
              <p>
                Once unbonding, you must wait 28 days for your funds to become
                available.
              </p>
              {TxFee}
            </NotesWrapper>
          </>
        )}
        {task === 'unbond_all' && (
          <>
            {isStaking && controllerNotImported ? (
              <Warning text="You must have your controller account imported to unbond." />
            ) : (
              <></>
            )}
            {isStaking && nominations.length ? (
              <Warning text="Stop nominating before unbonding all funds." />
            ) : (
              <></>
            )}
            <h4>Amount to unbond:</h4>
            <h2>
              {freeToUnbond} {network.unit}
            </h2>
            <Separator />
            <NotesWrapper>
              <p>
                Once unbonding, you must wait 28 days for your funds to become
                available.
              </p>
              {bondValid && TxFee}
            </NotesWrapper>
          </>
        )}
      </div>
      <FooterWrapper>
        <div>
          <button
            type="button"
            className="submit"
            onClick={() => setSection(0)}
          >
            <FontAwesomeIcon transform="shrink-2" icon={faChevronLeft} />
            Back
          </button>
        </div>
        <div>
          <button
            type="button"
            className="submit"
            onClick={() => submitTx()}
            disabled={submitting || !bondValid}
          >
            <FontAwesomeIcon
              transform="grow-2"
              icon={faArrowAltCircleUp as IconProp}
            />
            Submit
            {submitting && 'ting'}
          </button>
        </div>
      </FooterWrapper>
    </ContentWrapper>
  );
});
