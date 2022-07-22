import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const Pair = "ETHUSD"
    let Aggregator

    if ((await hre.getChainId()) == "4") {
        // Rinkeby
        Aggregator = "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e"
    } else {
        // BNB testnet
        Aggregator = "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    }

    await deploy(`${Pair}ChainlinkPriceFeed`, {
        from: deployer,
        contract: "ChainlinkPriceFeed",
        args: [Aggregator],
        log: true,
    })
}

module.exports.tags = ["ETHUSDChainlinkPriceFeed"]
