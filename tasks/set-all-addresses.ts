import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

task("perp.setAllAddresses")
    .addParam("clearinghouse", "Contract address")
    .addParam("accountbalance", "Contract address")
    .addParam("vault", "Contract address")
    .addParam("exchange", "Contract address")
    .addParam("marketregistry", "Contract address")
    .addParam("orderbook", "Contract address")
    .addParam("collateralmanager", "Contract address")
    .addParam("insurencefund", "Contract address")
    .setAction(
        async (
            {
                clearinghouse,
                accountbalance,
                vault,
                exchange,
                marketregistry,
                orderbook,
                collateralmanager,
                insurencefund,
            },
            hre: HardhatRuntimeEnvironment,
        ) => {
            const { ethers } = hre

            const AccountBalance = (await ethers.getContractFactory("AccountBalance")).attach(accountbalance)
            const Vault = (await ethers.getContractFactory("Vault")).attach(vault)
            const Exchange = (await ethers.getContractFactory("Exchange")).attach(exchange)
            const MarketRegistry = (await ethers.getContractFactory("MarketRegistry")).attach(marketregistry)
            const OrderBook = (await ethers.getContractFactory("OrderBook")).attach(orderbook)
            const InsuranceFund = (await ethers.getContractFactory("InsuranceFund")).attach(insurencefund)

            let tx = await (await AccountBalance.setClearingHouse(clearinghouse)).wait()
            console.log(`AccountBalance.setClearingHouse: ${tx.transactionHash}`)

            tx = await (await AccountBalance.setVault(vault)).wait()
            console.log(`AccountBalance.setVault: ${tx.transactionHash}`)

            tx = await (await Exchange.setClearingHouse(clearinghouse)).wait()
            console.log(`Exchange.setClearingHouse: ${tx.transactionHash}`)

            tx = await (await Exchange.setAccountBalance(accountbalance)).wait()
            console.log(`Exchange.setAccountBalance: ${tx.transactionHash}`)

            tx = await (await MarketRegistry.setClearingHouse(clearinghouse)).wait()
            console.log(`MarketRegistry.setClearingHouse: ${tx.transactionHash}`)

            tx = await (await OrderBook.setClearingHouse(clearinghouse)).wait()
            console.log(`OrderBook.setClearingHouse: ${tx.transactionHash}`)

            tx = await (await OrderBook.setExchange(exchange)).wait()
            console.log(`OrderBook.setExchange: ${tx.transactionHash}`)

            tx = await (await Vault.setClearingHouse(clearinghouse)).wait()
            console.log(`Vault.setClearingHouse: ${tx.transactionHash}`)

            tx = await (await Vault.setCollateralManager(collateralmanager)).wait()
            console.log(`Vault.setCollateralManager: ${tx.transactionHash}`)

            tx = await (await InsuranceFund.setBorrower(vault)).wait()
            console.log(`InsuranceFund.setBorrower: ${tx.transactionHash}`)
        },
    )
