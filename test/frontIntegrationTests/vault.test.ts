import { expect, use } from "chai"
import { parseEther, parseUnits } from "ethers/lib/utils"
import { ethers, waffle } from "hardhat"
import { prepareSigners, prepareVault } from "./utils/prepare-vault"

use(waffle.solidity)

describe("Vault deposit test", function () {
    let usdcDecimals: number

    beforeEach(async function () {
        await prepareSigners(this)
        await prepareVault(this, this.owner)

        usdcDecimals = await this.USDC.decimals() // usdcDecimals = 6
        const amount = parseUnits("1000", usdcDecimals) // amount = 1000 * 10^6

        await this.USDC.connect(this.tema).mint(this.tema.address, amount)
        await this.USDC.connect(this.tema).approve(this.vault.address, amount)
    })

    describe("deposit settlement token(USDC)", async function () {
        it("deposit settlement token", async function () {
            const amount = parseUnits("100", usdcDecimals)

            // check event has been sent
            await expect(this.vault.connect(this.tema).deposit(this.USDC.address, amount))
                .to.emit(this.vault, "Deposited")
                .withArgs(this.USDC.address, this.tema.address, amount)

            // reduce tema balance
            expect(await this.USDC.balanceOf(this.tema.address)).to.eq(parseUnits("900", usdcDecimals))

            // increase vault balance
            expect(await this.USDC.balanceOf(this.vault.address)).to.eq(amount)

            // update sender's balance in vault
            expect(await this.vault.getBalance(this.tema.address)).to.eq(amount)
        })

        it("should fail, not enough balance", async function () {
            const amount = parseUnits("1100", usdcDecimals) // 1100, because tema's balance is 1000^6 USDC tokens
            await expect(this.vault.connect(this.tema).deposit(this.USDC.address, amount)).to.be.revertedWith(
                "revert ERC20: transfer amount exceeds balance",
            )
        })

        it("should fail, zero amount", async function () {
            await expect(this.vault.connect(this.tema).deposit(this.USDC.address, "0")).to.be.revertedWith("V_ZA")
        })

        describe("settlement token balance cap", async function () {
            beforeEach(async function () {
                // Set max balance for settlement token
                await this.clearingHouseConfig.setSettlementTokenBalanceCap(100)
            })

            it("should fail, when it's over settlementTokenBalanceCap", async function () {
                await expect(this.vault.connect(this.tema).deposit(this.USDC.address, 101)).to.be.revertedWith(
                    "V_GTSTBC",
                )
            })

            it("should fail, when the total balance is over cap", async function () {
                await expect(this.vault.connect(this.tema).deposit(this.USDC.address, 100)).not.be.reverted
                await expect(this.vault.connect(this.tema).deposit(this.USDC.address, 1)).to.be.revertedWith("V_GTSTBC")
            })

            it("should fail, cannot deposit when settlementTokenBalanceCap == 0", async function () {
                await this.clearingHouseConfig.setSettlementTokenBalanceCap(0)
                await expect(this.vault.connect(this.tema).deposit(this.USDC.address, 1)).to.be.revertedWith("V_GTSTBC")
                await expect(this.vault.connect(this.tema).deposit(this.USDC.address, 101)).to.be.revertedWith(
                    "V_GTSTBC",
                )
            })
        })
    })

    describe("deposit collateral tokens(WETH, ETH, BTC)", async function () {
        let wbtcDecimals: number

        beforeEach(async function () {
            // prepare collaterals

            await this.WETH9.connect(this.tema).deposit({ value: parseEther("300") })
            await this.WETH9.connect(this.misha).deposit({ value: parseEther("300") })
            await this.WETH9.connect(this.tema).approve(this.vault.address, ethers.constants.MaxUint256)
            await this.WETH9.connect(this.misha).approve(this.vault.address, ethers.constants.MaxUint256)

            wbtcDecimals = await this.wbtc.decimals()
            await this.wbtc.mint(this.tema.address, parseUnits("2000", wbtcDecimals))
            await this.wbtc.mint(this.misha.address, parseUnits("2000", wbtcDecimals))
            await this.wbtc.connect(this.tema).approve(this.vault.address, ethers.constants.MaxUint256)
            await this.wbtc.connect(this.misha).approve(this.vault.address, ethers.constants.MaxUint256)
        })

        it("deposit WETH and BTC token", async function () {
            // Should haven't collateral tokens, if never having depositing
            expect(await this.vault.getCollateralTokens(this.tema.address)).to.be.deep.eq([])
            expect(await this.vault.getCollateralTokens(this.misha.address)).to.be.deep.eq([])

            // Deposit WETH, and then check event
            await expect(this.vault.connect(this.tema).deposit(this.WETH9.address, parseEther("100"))) // depositing 100 * 10^18 ETH
                .to.emit(this.vault, "Deposited")
                .withArgs(this.WETH9.address, this.tema.address, parseEther("100"))

            // Check balances, should have changes
            expect(await this.WETH9.balanceOf(this.tema.address)).to.eq(parseEther("200"))
            expect(await this.WETH9.balanceOf(this.vault.address)).to.eq(parseEther("100"))
            expect(await this.vault.getBalanceByToken(this.tema.address, this.WETH9.address)).to.eq(parseEther("100"))

            // Deposit WBTC
            await expect(this.vault.connect(this.misha).deposit(this.wbtc.address, parseUnits("100", wbtcDecimals)))
                .to.emit(this.vault, "Deposited")
                .withArgs(this.wbtc.address, this.misha.address, parseUnits("100", wbtcDecimals))

            // Check balances, should have changes
            expect(await this.wbtc.balanceOf(this.misha.address)).to.eq(parseUnits("1900", wbtcDecimals))
            expect(await this.wbtc.balanceOf(this.vault.address)).to.eq(parseUnits("100", wbtcDecimals))
            expect(await this.vault.getBalanceByToken(this.misha.address, this.wbtc.address)).to.eq(
                parseUnits("100", wbtcDecimals),
            )

            // Should have base tokens, after deposit for collateral tokens
            expect(await this.vault.getCollateralTokens(this.tema.address)).to.be.deep.eq([this.WETH9.address])
            expect(await this.vault.getCollateralTokens(this.misha.address)).to.be.deep.eq([this.wbtc.address])
        })

        it("deposit ETH", async function () {
            // Should haven't collateral tokens, if never having depositing
            expect(await this.vault.getCollateralTokens(this.tema.address)).to.be.deep.eq([])
            expect(await this.vault.getCollateralTokens(this.misha.address)).to.be.deep.eq([])

            // Tema's wallet balance before deposit
            const temaETHBalanceBefore = await this.tema.getBalance()

            // Deposit ETH, then no need to approve. After, check event
            const tx1 = await this.vault.connect(this.tema).depositEther({ value: parseEther("100") })
            await expect(tx1)
                .to.emit(this.vault, "Deposited")
                .withArgs(this.WETH9.address, this.tema.address, parseEther("100"))

            // After deposit ETH, in WETH9, tema's balance shouldn't have changes
            expect(await this.WETH9.balanceOf(this.tema.address)).to.eq(parseEther("300"))

            // And balance of vault in WETH9 should have increase
            expect(await this.WETH9.balanceOf(this.vault.address)).to.eq(parseEther("100"))

            // Balance of user should increase in vault
            expect(await this.vault.getBalanceByToken(this.tema.address, this.WETH9.address)).to.eq(parseEther("100"))

            // Check tema's balance before and after, with calculated spent gas
            const tx1Receipt = await tx1.wait()
            const totalGasUsed = tx1Receipt.gasUsed.mul(tx1.gasPrice)
            const temaETHBalanceAfter = await this.tema.getBalance()
            expect(temaETHBalanceBefore.sub(temaETHBalanceAfter)).to.eq(parseEther("100").add(totalGasUsed))

            // 600 (originally, 300 tema's + 300 misha's) + 100 (tema deposit 100 ETH) = 700
            expect(await ethers.provider.getBalance(this.WETH9.address)).to.be.eq(parseEther("700"))
            // 0, because ETH transfering to WETH9
            expect(await ethers.provider.getBalance(this.vault.address)).to.be.eq(parseEther("0"))

            // Check collateral tokens for depositing user
            expect(await this.vault.getCollateralTokens(this.tema.address)).to.be.deep.eq([this.WETH9.address])
        })

        it("force error, deposit token is not a collateral token", async function () {
            // Deposit of wrong address of token, as marketRegistry is not a collateral
            await expect(
                this.vault.connect(this.tema).deposit(this.marketRegistry.address, parseEther("100")),
            ).to.be.revertedWith("V_OSCT")

            // WETH is set with a wrong address
            await this.vault.setWETH9(this.marketRegistry.address)
            await expect(this.vault.connect(this.tema).depositEther({ value: parseEther("100") })).to.be.revertedWith(
                "V_WINAC",
            )
        })

        it("force error, max collateral tokens per account exceeded", async function () {
            // Set max collateral tokens per account equal 1
            await this.collateralManager.setMaxCollateralTokensPerAccount(1)

            // Should have success
            await expect(this.vault.connect(this.tema).depositEther({ value: parseEther("100") }))
                .to.emit(this.vault, "Deposited")
                .withArgs(this.WETH9.address, this.tema.address, parseEther("100"))

            // Should fail, because it's secont collateral for one user
            await expect(
                this.vault.connect(this.tema).deposit(this.wbtc.address, parseUnits("100", wbtcDecimals)),
            ).to.be.revertedWith("V_CTNE")
        })

        it("force error, non-settlement amount exceeds deposit cap", async function () {
            // Set max balance for WETH9
            await this.collateralManager.setDepositCap(this.WETH9.address, parseEther("100"))

            // Should have success
            await expect(this.vault.connect(this.tema).deposit(this.WETH9.address, parseEther("100"))).to.emit(
                this.vault,
                "Deposited",
            )

            // Should fail, because balance greeter than max
            await expect(this.vault.connect(this.tema).deposit(this.WETH9.address, parseEther("1"))).to.be.revertedWith(
                "V_GTDC",
            )
            // Should fail, because balance greeter than max
            await expect(this.vault.connect(this.tema).depositEther({ value: parseEther("1") })).to.be.revertedWith(
                "V_GTDC",
            )
        })
    })
})
