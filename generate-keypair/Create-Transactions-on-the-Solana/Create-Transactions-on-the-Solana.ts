import {
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const suppliedToPubkey = process.argv[2] || null;

if (!suppliedToPubkey) {
  console.log(`Please provide a public key to send to`);
  process.exit(1);
}

const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const toPubkey = new PublicKey(suppliedToPubkey);

// Check if receiver account is initialized (has funds)
const receiverAccountInfo = await connection.getAccountInfo(toPubkey);
if (receiverAccountInfo === null) {
  console.log(
    "Receiver account is not initialized. Initializing by sending SOL..."
  );

  // Send a small amount (like 2 SOL) to initialize the receiver account
  const transaction = new Transaction();
  const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: senderKeypair.publicKey,
    toPubkey,
    lamports: 1 * LAMPORTS_PER_SOL, // Send 2 SOL to ensure the account is rent-exempt
  });

  transaction.add(sendSolInstruction);

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    senderKeypair,
  ]);
  console.log(
    `Receiver account initialized with 2 SOL. Transaction signature: ${signature}`
  );
} else {
  console.log(
    `Receiver account already initialized with ${
      receiverAccountInfo.lamports / LAMPORTS_PER_SOL
    } SOL`
  );
}

// Now you can send the desired amount of SOL to the receiver
const transaction = new Transaction();
const LAMPORTS_TO_SEND = 5000; // Amount to send (5,000 lamports = 0.000005 SOL)

const sendSolInstruction = SystemProgram.transfer({
  fromPubkey: senderKeypair.publicKey,
  toPubkey,
  lamports: LAMPORTS_TO_SEND,
});

transaction.add(sendSolInstruction);

// Send the transaction
const signature = await sendAndConfirmTransaction(connection, transaction, [
  senderKeypair,
]);

console.log(`💸 Sent ${LAMPORTS_TO_SEND} lamports to ${toPubkey}.`);
console.log(`Transaction signature: ${signature}`);
