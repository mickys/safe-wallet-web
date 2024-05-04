import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import pickBy from 'lodash/pickBy'
import { validateAddress } from '@/utils/validation'
import type { RootState } from '.'

export type ContractABIEntry = {
  chainId: string
  address: string
  abi: any
}

export type ContractABI = { [address: string]: [] }

export type ContractABIState = { [chainId: string]: ContractABI }

const initialState: ContractABIState = {}

export const contractABISlice = createSlice({
  name: 'contractABI',
  initialState,
  reducers: {

    setABI: (_, action: PayloadAction<ContractABIState>): ContractABIState => {
      return action.payload
    },

    upsertABIEntry: (state, action: PayloadAction<ContractABIEntry>) => {
      const { chainId, address, abi } = action.payload
      if (!state[chainId]) state[chainId] = {}
      state[chainId][address] = abi
    },
  },
})

export const { setABI, upsertABIEntry } = contractABISlice.actions

export const selectAllContractABIs = (state: RootState): ContractABIState => {
  return state[contractABISlice.name]
}

export const selectContractABIByChain = createSelector(
  [selectAllContractABIs, (_, chainId: string) => chainId],
  (allContractABIs, chainId): ContractABI => {
    const chainAddresses = allContractABIs[chainId]
    const validAddresses = pickBy(chainAddresses, (_, key) => validateAddress(key) === undefined)
    return chainId ? validAddresses || {} : {}
  },
)

