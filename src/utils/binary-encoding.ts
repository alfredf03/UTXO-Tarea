import { Transaction, TransactionInput, TransactionOutput } from '../types';

/**
 * Encode a transaction to binary format for space-efficient storage
 * @param {Transaction} transaction - The transaction to encode
 * @returns {Buffer} The binary representation
 */
export function encodeTransaction(transaction: Transaction): Buffer {
  // BONUS CHALLENGE: Implement binary encoding for transactions
  // This should create a compact binary representation instead of JSON

  // Suggested approach:
  // 1. Use fixed-size fields where possible (e.g., 8 bytes for amounts, timestamps)
  // 2. Use length-prefixed strings for variable-length data (id, signatures, public keys)
  // 3. Use compact representations for counts (e.g., 1 byte for number of inputs/outputs if < 256)

  throw new Error('Binary encoding not implemented - this is a bonus challenge!');
}

/**
 * Decode a transaction from binary format
 * @param {Buffer} buffer - The binary data to decode
 * @returns {Transaction} The reconstructed transaction object
 */
export function decodeTransaction(buffer: Buffer): Transaction {
  // BONUS CHALLENGE: Implement binary decoding for transactions
  // This should reconstruct a Transaction object from the binary representation

  throw new Error('Binary decoding not implemented - this is a bonus challenge!');
}

/**
 * Compare encoding efficiency between JSON and binary representations
 * @param {Transaction} transaction - The transaction to analyze
 * @returns {object} Size comparison and savings information
 */
export function getEncodingEfficiency(transaction: Transaction): {
  jsonSize: number;
  binarySize: number;
  savings: string;
} {
  const jsonSize = Buffer.from(JSON.stringify(transaction)).length;
  try {
    const binarySize = encodeTransaction(transaction).length;
    const savingsPercent = (((jsonSize - binarySize) / jsonSize) * 100).toFixed(1);
    return {
      jsonSize,
      binarySize,
      savings: `${savingsPercent}%`
    };
  } catch {
    return {
      jsonSize,
      binarySize: -1,
      savings: 'Not implemented'
    };
  }
}
