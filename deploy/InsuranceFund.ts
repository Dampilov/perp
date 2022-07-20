import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    let settlementTokenAddress

    if ((await hre.getChainId()) == "4") {
        //Rinkeby USDC
        settlementTokenAddress = "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926"
    } else if ((await hre.getChainId()) == "97") {
        //Binance USDC
        settlementTokenAddress = "0x90c069C4538adAc136E051052E14c1cD799C41B7"
    }

    await deploy("InsuranceFund", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [settlementTokenAddress],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["InsuranceFund"]
