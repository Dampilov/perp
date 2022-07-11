import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const Name = "BaseToken"
    const Symbol = "BTT"
    //kovan chainlink
    const priceFeedAddress = "0x6135b13325bfC4B00278B4abC5e20bbce2D6580e"

    await deploy("BaseToken", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [Name, Symbol, priceFeedAddress],
                },
            },
        },
        log: true,
    })
}

module.exports.tags = ["BaseToken"]
