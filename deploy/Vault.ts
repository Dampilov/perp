import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, ethers } = hre
    const { deploy } = deployments

    const { deployer } = await getNamedAccounts()

    const clearingHouseConfigAddress = (await deployments.get("ClearingHouseConfig")).address
    const exchangeAddress = (await deployments.get("Exchange")).address
    const accountBalanceAddress = (await deployments.get("AccountBalance")).address
    const insuranceFundAddress = (await deployments.get("InsuranceFund")).address

    const vault = await deploy("Vault", {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [insuranceFundAddress, clearingHouseConfigAddress, accountBalanceAddress, exchangeAddress],
                },
            },
        },
        log: true,
    })

    const AccountBalance = (await ethers.getContractFactory("AccountBalance")).attach(accountBalanceAddress)
    await (await AccountBalance.setVault(vault.address)).wait()

    const InsuranceFund = (await ethers.getContractFactory("InsuranceFund")).attach(insuranceFundAddress)
    await (await InsuranceFund.setBorrower(vault.address)).wait()
}

module.exports.tags = ["Vault"]
module.exports.dependencies = ["ClearingHouseConfig", "Exchange", "AccountBalance", "InsuranceFund"]
