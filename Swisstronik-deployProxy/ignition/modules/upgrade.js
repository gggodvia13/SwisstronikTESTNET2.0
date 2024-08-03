const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Get the RPC link from the network configuration
  const rpcLink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpcLink, data)

  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
    gasLimit: 2000000,
  })
}

async function main() {
  const [signer] = await ethers.getSigners()
  const SWTRProxy = await ethers.getContractAt('SWTRProxy', "0x72CD5895999C05C724975f2EfeE52A733F2FDDb4")

  const SWTRImplementation = await ethers.deployContract('SWTRImplementation')
  await SWTRImplementation.waitForDeployment()
  console.log(`SWTRImplementation deployed to ${SWTRImplementation.target}`)

  const proxyAdmin = await ethers.getContractAt('ProxyAdmin', "0xEa2a409eA5A9E8D6658A5222CD2b0a1c8214a1E7")

  const tx = await sendShieldedTransaction(
    signer,
    proxyAdmin.target,
    proxyAdmin.interface.encodeFunctionData('upgradeTo', [
      SWTRProxy.target,
      SWTRImplementation.target,
    ]),
    '0'
  )

  const upgradeTx = await tx.wait();
  console.log("Tx hash:", upgradeTx.hash);
  console.log('Contract upgraded successfully!');
  console.log("Transaction hash: ", `https://explorer-evm.testnet.swisstronik.com/tx/${upgradeTx.hash}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
