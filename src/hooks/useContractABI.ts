import { useAppSelector } from '@/store'
import { selectContractABIByChain } from '@/store/contractABISlice'
import useChainId from './useChainId'

const useContractABI = () => {
  const chainId = useChainId()
  return useAppSelector((state) => selectContractABIByChain(state, chainId))
}

export default useContractABI
