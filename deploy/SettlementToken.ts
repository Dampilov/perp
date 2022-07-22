import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const Name = "USDC"
    const Symbol = "USDC"
    const Decimals = 6

    await deploy(`${Name}`, {
        contract: "ERC20Test",
        from: deployer,
        args: [Name, Symbol, Decimals],
        log: true,
    })
}

module.exports.tags = ["SettlementToken"]
