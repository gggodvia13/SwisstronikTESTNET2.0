const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Get the RPC link from the network configuration
  const rpcLink = hre.network.config.url;

  const [encryptedData] = await encryptDataField(rpcLink, data);

  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = "0x8B1F52975641363966b84060c800C443DE72bd3E";

  const [signer] = await ethers.getSigners();

  const contractFactory = await ethers.getContractFactory('PERC20Sample');
  const contract = contractFactory.attach(contractAddress);

  const functionName = 'mint';
  const setMessageTx = await sendShieldedTransaction(
    //@ts-ignore
    signer,
    contractAddress,
    contract.interface.encodeFunctionData(functionName),
    0
  );
  await setMessageTx.wait();

  console.log('Transaction hash: ', `https://explorer-evm.testnet.swisstronik.com/tx/${setMessageTx.hash}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})