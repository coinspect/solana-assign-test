### Setup

- Install [Node.js](https://nodejs.org) version 18
  - If you are using [nvm](https://github.com/creationix/nvm#installation) (recommended) running `nvm use` will automatically choose the right node version for you.
- Install [Yarn v1](https://yarnpkg.com/en/docs/install)
- Run `yarn setup` to install dependencies and run any required post-install scripts
  - **Warning:** Do not use the `yarn` / `yarn install` command directly. Use `yarn setup` instead. The normal install command will skip required post-install scripts, leaving your development environment in an invalid state.
- `yarn start` to run


### Attacker's smart contract deployment
1. Using [Solana Playground](https://beta.solpg.io/) is the simplest way to deploy
2. If connecting it to mainnet-beta fails (it happens), an easy alternative is creating an [Alchemy](https://www.alchemy.com/) account and launching a Solana mainnet node, then add `custom` endpoint to the settings
3. The IDE will create you an authority account for deploying the contract
4. It needs ~1.4SOL to do a first deploy (you get 0.4SOL back), so keep that in mind and make the transfer
5. Paste `take-over.ts`
6. Build & Deploy
7. Take your contract's address (program ID) and update the exploit code accordingly

### Exploit setup
1. Set up accounts for attacker and victim
2. Add public key for victim to `assign-test.js`
3. Add private key for attacker to `assign-test.js`

### Attack execution
1. Open browser with Wallet extension and navigate to `http://localhost:9011/`
2. Select the victim's wallet from accounts
3. [On DApp] click connect
4. [On DApp] click STAGE #1

- Now funds are transfered to victim. And victim's account is now owned by attacker's ProgramID `A3mayAzsbd4H1YFnLBbafAMxbygXYx56Dq2jKupWczM9`
- You can take TXID and check on explorer 
- You can put the victim's account on explorer, and see that it's owned by the attacker's contract, not System Program

5. Select the attacker's wallet from accounts
6. [On DApp] click STAGE #2

- Call to attacker's contract drains the victim's wallet into the attacker's account
- You can take TXID and check on explorer

