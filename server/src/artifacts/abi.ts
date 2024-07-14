export const FACTORY_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_chainlinkNode',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_pairOracle',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Deposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'paidTo',
        type: 'address',
      },
    ],
    name: 'OppRewardPaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'opportunity',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
    ],
    name: 'OpportunityCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'opportunity',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'OpportunityVerified',
    type: 'event',
  },
  {
    inputs: [],
    name: 'addFunds',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'chainlinkNode',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'string',
            name: 'id',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'subject',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'rewardPercentage',
            type: 'uint256',
          },
        ],
        internalType: 'struct OpportunityConfig.OppConfig',
        name: 'details',
        type: 'tuple',
      },
    ],
    name: 'createOpportunity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
    ],
    name: 'getManagerMainWallet',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
    ],
    name: 'isManagerVerified',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'oppId',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256',
      },
    ],
    name: 'issueReward',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'managerPersonalWallet',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pairOracle',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
    ],
    name: 'registerManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'wallet',
        type: 'address',
      },
    ],
    name: 'registerPersonalWallet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_chainlinkNode',
        type: 'address',
      },
    ],
    name: 'setConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_pairOracle',
        type: 'address',
      },
    ],
    name: 'setOracle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'verifiedManagers',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'manager',
        type: 'address',
      },
      {
        internalType: 'string',
        name: 'oppId',
        type: 'string',
      },
    ],
    name: 'verifyStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawToOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
