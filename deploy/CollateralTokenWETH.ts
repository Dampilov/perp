import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const Name = "WETH"
    const Symbol = "WETH"
    const Decimals = 18

    await deploy(`${Name}`, {
        contract: "ERC20Test",
        from: deployer,
        args: [Name, Symbol, Decimals],
        log: true,
    })
}

module.exports.tags = ["WETH"]
