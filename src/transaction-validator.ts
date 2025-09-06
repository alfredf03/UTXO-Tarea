import { Transaction, TransactionInput } from './types';
import { UTXOPoolManager } from './utxo-pool';
import { verify } from './utils/crypto';
import {
  ValidationResult,
  ValidationError,
  VALIDATION_ERRORS,
  createValidationError
} from './errors';

export class TransactionValidator {
  constructor(private utxoPool: UTXOPoolManager) {}

  /**
   * Validate a transaction
   * @param {Transaction} transaction - The transaction to validate
   * @returns {ValidationResult} The validation result
   */
  validateTransaction(transaction: Transaction): ValidationResult {
  const errors: ValidationError[] = [];// Check if UTXOs exist
  const seenUTXOs = new Set<string>();
  transaction.inputs.forEach(input => {
    const utxo = this.utxoPool.getUTXO(input.utxoId.txId, input.utxoId.outputIndex);
    if (!utxo) {
      errors.push(createValidationError(VALIDATION_ERRORS.UTXO_NOT_FOUND, `UTXO not found: ${input.utxoId.txId}:${input.utxoId.outputIndex}`));
    }// Verify amounts
    let totalOutputValue = 0;
    let totalInputValue = 0;
    transaction.outputs.forEach((output) => {
      if (output.amount <= 0) {
        errors.push(createValidationError(VALIDATION_ERRORS.NEGATIVE_AMOUNT, `Output amount must be positive: ${output.amount}`));
      }
      totalOutputValue += output.amount;});
    transaction.inputs.forEach(input => {
      let utxo = this.utxoPool.getUTXO(input.utxoId.txId, input.utxoId.outputIndex);
      if (utxo) {
        if (utxo.amount <= 0) {
          errors.push(createValidationError(VALIDATION_ERRORS.NEGATIVE_AMOUNT, `UTXO amount must be positive: ${utxo.id}`));
        }
        totalInputValue += utxo.amount;
    }});
    if (totalInputValue != totalOutputValue) {
      errors.push(createValidationError(VALIDATION_ERRORS.AMOUNT_MISMATCH, `Input value ${totalInputValue} is different than output value ${totalOutputValue}`));
    }
    transaction.inputs.forEach(input => {
      const utxo = this.utxoPool.getUTXO(input.utxoId.txId, input.utxoId.outputIndex);
      if (utxo) {
          // Verify signatures
        const transactionData = this.createTransactionDataForSigning(transaction);
        const isValid = verify(transactionData, input.signature, utxo.recipient);
        if (!isValid) {
          errors.push(createValidationError(VALIDATION_ERRORS.INVALID_SIGNATURE, `Invalid signature for UTXO: ${input.utxoId.txId}:${input.utxoId.outputIndex}`));
        }
      }
    });
    const utxoKey = `${input.utxoId.txId}:${input.utxoId.outputIndex}`;
    if (seenUTXOs.has(utxoKey)) {
      errors.push(createValidationError(
        VALIDATION_ERRORS.DOUBLE_SPENDING,
        `UTXO used more than once: ${utxoKey}`
      ));
    }
    seenUTXOs.add(utxoKey);
  });
  return {
    valid: errors.length === 0,
    errors
  };
}

  /**
   * Create a deterministic string representation of the transaction for signing
   * This excludes the signatures to prevent circular dependencies
   * @param {Transaction} transaction - The transaction to create a data for signing
   * @returns {string} The string representation of the transaction for signing
   */
  private createTransactionDataForSigning(transaction: Transaction): string {
    const unsignedTx = {
      id: transaction.id,
      inputs: transaction.inputs.map(input => ({
        utxoId: input.utxoId,
        owner: input.owner
      })),
      outputs: transaction.outputs,
      timestamp: transaction.timestamp
    };

    return JSON.stringify(unsignedTx);
  }
}