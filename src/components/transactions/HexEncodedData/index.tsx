import { shortenText } from '@/utils/formatters'
import { Box, Link } from '@mui/material'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import css from './styles.module.css'
import { TransactionDescription, Interface as ethersInterface, formatEther } from 'ethers'
import { upsertABIEntry, selectContractABIByChain } from '@/store/contractABISlice'
import { useCurrentChain } from '@/hooks/useChains'
import { useAppDispatch } from '@/store'
import useContractABI from '@/hooks/useContractABI'

interface Props {
  hexData: string
  title?: string
  tx?: any
  limit?: number
}

interface TransactionParameter {
  name: string
  type: string
  value: any
}

interface TransactionDetails {
  name: string;
  selector: string;
  signature: string;
  value: bigint;
  args: TransactionParameter[]
}

export const HexEncodedData = ({ hexData, title, tx, limit = 20 }: Props): ReactElement => {
  const dispatch = useAppDispatch()
  const contractABI = useContractABI()

  const [showTxData, setShowTxData] = useState(false)
  const chain = useCurrentChain()
  const showExpandBtn = hexData.length > limit
  const toggleExpanded = () => {
    setShowTxData((val) => !val)
  }

  const [thisABI, setThisABI] = useState([])
  const [thisTXN, setThisTXN] = useState<TransactionDetails>()


  useEffect(() => {

    const fetchAbi = async (chainId: string, contractAddress: string) => {
      const apiKey = "YourApiKeyToken"
      const uri = "https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=" + contractAddress + "&apikey=" + apiKey;
      const response = await fetch(uri)
      if (!response.ok) {
        throw new Error(`Error fetching ABI from etherscan api ${uri}`)
      }
      const json = await response.json()
      const data = json.data || json.result || json

      return {
        chainId: chainId,
        address: contractAddress,
        abi: data
      }
    }

    if (chain && tx) {
      if (typeof contractABI[tx.to] === "undefined") {
        console.log("1 - Fetching abi for contract", tx.to);
        const abi = fetchAbi(chain.chainId, tx.to);
        Promise.resolve(abi).then((value: any) => {
          console.log("2 - Loaded new abi for contract", value.address);
          dispatch(upsertABIEntry({ ...value }))
        });
      } else {
        console.log("1 - ABI Exists for contract", tx.to);
        setThisABI(contractABI[tx.to])
      }
    }
  }, [contractABI, chain, tx])

  useEffect(() => {
    if (typeof thisABI[0] === "string") {
      console.log('HexEncodedData->hexData', title, hexData)

      const cinterface = new ethersInterface(thisABI);
      const res = cinterface.parseTransaction(tx);

      const transaction: TransactionDetails = {
        name: "Function Name",
        selector: "selector",
        signature: "tuple(type,type)",
        value: BigInt(0),
        args: []
      }

      if (res) {
        transaction.name = res.name;
        transaction.selector = res.selector;
        transaction.signature = res.signature;
        transaction.value = res.value;

        const args = res.args.toObject();
        const keys = Object.keys(args);
        const values = Object.values(args);
        for (let i = 0; i < keys.length; i++) {
          transaction.args.push({
            type: "unknown",
            name: keys[i],
            value: values[i],
          })
        }

        console.log("transaction.args", transaction.args)
        // transaction.args = res.args;

        // const decoded = cinterface.decodeFunctionData(res.signature, tx.data)
        // console.log("decoded", decoded);
        // console.log("decoded", decoded.toObject());

        // decodeFunctionData

        // cinterface._decodeParams()
      }

      setThisTXN(transaction);
      console.log(transaction);


      // res.args


    }
  }, [thisABI]);


  // if (contractABI !== "") {
  //   console.log("contractABI", typeof (contractABI), contractABI);
  //   const cinterface = new ethersInterface(contractABI);
  //   const res = cinterface.parseTransaction(tx);
  //   console.log("res", res);
  // }


  // async function decodeData() {
  //   const apiKey = "YourApiKeyToken"
  //   const contractAddress = tx.to;
  //   const url = "https://api.etherscan.io/api?module=contract&action=getabi&address="+contractAddress+"&apikey="+apiKey;

  //   const abi = 

  // }



  return (
    <>
      <Box data-testid="tx-hexData" className={css.encodedData}>
        {title && (
          <span>
            <b>{title}: </b>
          </span>
        )}
        {showExpandBtn ? (
          <>
            {showTxData ? hexData : shortenText(hexData, 25)}{' '}
            <Link component="button" onClick={toggleExpanded} type="button" sx={{ verticalAlign: 'text-top' }}>
              Show {showTxData ? 'less' : 'more'}
            </Link>
          </>
        ) : (
          <span>{hexData}</span>
        )}
      </Box>

      <Box className={css.encodedData}>
        <br />
      </Box>

      <Box className={css.encodedData}>
        <span><b>Decoding:</b></span>
      </Box>
      <Box data-testid="tx-hexData-thisTXN-signature" className={css.encodedData}>
        <>
          <span>
            <b>Method Signature: </b>
          </span>
          {thisTXN ? (
            <span> {thisTXN.signature}</span>
          ) : (
            <span>Loading...</span>
          )}
        </>
      </Box>

      <Box data-testid="tx-hexData-thisTXN-value" className={css.encodedData}>
        <>
          <span>
            <b>ETH Value: </b>
          </span>
          {thisTXN ? (
            <span> {formatEther(thisTXN.value.toString())} ETH</span>
          ) : (
            <span>Loading...</span>
          )}
        </>
      </Box>

      <Box data-testid="tx-hexData-thisTXN-name" className={css.encodedData}>
        <>
          <span>
            <b>Method Name: </b>
          </span>
          {thisTXN ? (
            <span> {thisTXN.name}</span>
          ) : (
            <span>Loading...</span>
          )}
        </>
      </Box>

      <Box data-testid="tx-hexData-thisTXN-args" className={css.encodedData}>
        <>
          {/* <span>
            <b>Args: </b>
          </span> */}
          {thisTXN ? (
            <>
              <table>
                <tr>
                  {/* <td>ID</td>
                  <td>TYPE</td> */}
                  <td>Argument Name</td>
                  <td>Value</td>
                </tr>
                {thisTXN.args.map((item, idx) => {
                  return (
                    // { console.log("gen item:", idx, item) }
                    <>
                      <tr>
                        {/* <td>{idx} </td>
                        <td>{item.type}</td> */}
                        <td>{item.name}</td>
                        <td>{item.value.toString()}</td>
                      </tr>
                    </>
                  )
                })}

              </table>
            </>
          ) : (
            <span>Loading...</span>
          )}
        </>
      </Box>
    </>
  )
}
