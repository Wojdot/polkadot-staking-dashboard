// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* Import your SVG Here.
 * Use upper camel-case for your SVG import, lower camel case for the svg.
 * import { ReactComponent as ValidatorEntityName } from './thumbnails/validatorEntityName.svg';
 */
import { ReactComponent as Amforc } from './thumbnails/amforc.svg';
import { ReactComponent as Wojdot } from './thumbnails/wojdot.svg';

export const VALIDATOR_COMMUNITY = [
  {
    name: 'Amforc',
    Thumbnail: Amforc,
    bio: 'We are a independent and experienced staking provider from Switzerland. We run our validators in a hybrid cloud setup across multiple geographical locations. Our validators run significantly above average and close to no blocks are missed as para-validator.',
    email: 'staking@amforc.com',
    twitter: '@amforcag',
    website: 'https://amforc.com/',
    validators: {
      polkadot: ['1y6CPLgccsysCEii3M7jQF834GZsz9A3HMcZz3w7RjGPpBL'],
      kusama: [
        'DVUNoinHdSNfismcrFaBwdJfysxc7A48QkNvTDnTSPXPw3q',
        'DpLatoXXBiSAPooF17bzUZGo7huNB7USfRqd2SgL6RBy2zr',
        'E8zY6KdAH1vuKKMaPdHYLAziht32v2BLqXk6qBw7WtiV2Dv',
        'Ff3xdNrXA47svhiTJHj9uNhxLo29PYjYcJ9cUseAd9FK6iQ',
      ],
    },
  },
  
  {
    name: 'WOJDOT ʕ •ᴥ•ʔ',
    Thumbnail: Wojdot,
    bio: 'Independent Polkadot Validator. We run our service on bare metal machines via a cloud service with the ability to spin up validator nodes in different regions within a matter of minutes.',
    email: 'wojdot@wojdot.com',
    twitter: '@wojdot',
    validators: {
      polkadot: ['13kz33kotYa3M75u5avMS367zJY3Fx2y5ZYASEPunqfEeCjD'],
    },
  },
];
