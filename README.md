# Lesson We3 Blockchain App

## Installation

### smart contract の setup

```sh
cd smart_contract
yarn add hardhat @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers
```

```sh
npx hardhat
❯ Create a basic sample project
```

1. `Transactions.sol`を作成
2. `deploy.js`を作成
3. Alchemy でいろいろして`hardhat.config.js`を変更
4. `test/sample-test.js`を削除
5. `npx hardhat run scripts/deploy.js --network ropsten`
6. 発行された ContractAddress を client で使用するので控えておく

### client（Next.js）の setup

```sh
yarn create next-app --typescript client
yarn add ethers
```

1. 作成された`artifacts/contracts/Transactions.json`を client に複製
2.

## References

- https://www.youtube.com/watch?v=Wn_Kb3MR_cU
