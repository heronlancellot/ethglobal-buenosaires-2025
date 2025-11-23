import { createPublicClient, http } from 'viem';
import { worldchain } from 'viem/chains';
import { NextRequest, NextResponse } from 'next/server';

const publicClient = createPublicClient({
  chain: worldchain,
  transport: http('https://worldchain-mainnet.g.alchemy.com/public	'),
});

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    console.log('Checking transaction confirmation for:', transactionId);

    const receipt = await publicClient.getTransactionReceipt({
      hash: transactionId as `0x${string}`,
    });

    if (!receipt) {
      return NextResponse.json({
        status: 'pending',
        transactionId,
        message: 'Transaction not yet confirmed',
      });
    }

    return NextResponse.json({
      status: receipt.status === 'success' ? 'confirmed' : 'failed',
      transactionId,
      blockNumber: Number(receipt.blockNumber),
      blockHash: receipt.blockHash,
      timestamp: Date.now(),
      gasUsed: receipt.gasUsed.toString(),
      confirmations: receipt.status,
    });
  } catch (error) {
    console.error('Error in transaction confirmation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
