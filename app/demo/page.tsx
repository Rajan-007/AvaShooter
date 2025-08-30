'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useAccount,
  useChainId,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { formatUnits, parseUnits } from 'viem';

// ------- Network / addresses -------
const SEPOLIA_CHAIN_ID = 11155111;
const TOKEN_ADDRESS = '0x1Bc07dB7Aea904379680Ff53FfC88E8dBa5C2619' as const;
const POLL_ACCOUNT = '0xf06D8c7558AF7BEb88A28714ab157fa782869368' as const;

// ------- Minimal ERC-20 ABI -------
const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'decimals',  stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'symbol',    stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'approve',   stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'transfer',  stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const;

// ------- Parent gates mounting to avoid hydration drift -------
export default function Page() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <Inner /> : null;
}

// ------- All wagmi hooks live here (order never changes) -------
function Inner() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const wrongChain = isConnected && chainId !== SEPOLIA_CHAIN_ID;

  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  // Prepare reads: symbol, decimals, (balance, allowance) when connected
  const contracts = useMemo(() => {
    const base = { address: TOKEN_ADDRESS, abi: ERC20_ABI } as const;
    const list: any[] = [
      { ...base, functionName: 'symbol' },
      { ...base, functionName: 'decimals' },
    ];
    if (isConnected && address) {
      list.push({ ...base, functionName: 'balanceOf', args: [address] as const });
      list.push({ ...base, functionName: 'allowance', args: [address, POLL_ACCOUNT] as const });
    }
    return list;
  }, [address, isConnected]);

  const { data, isFetching, error, refetch } = useReadContracts({
    allowFailure: false,
    contracts,
    query: { enabled: !wrongChain && contracts.length > 0 },
  });

  // Unpack reads safely
  let symbol = '';
  let decimals = 18;
  let rawBalance: bigint | null = null;
  let rawAllowance: bigint | null = null;

  if (data && data.length >= 2) {
    symbol = data[0] as string;
    decimals = data[1] as number;
    if (isConnected && data.length >= 4) {
      rawBalance = data[2] as bigint;
      rawAllowance = data[3] as bigint;
    }
  }

  const balanceText =
    rawBalance !== null ? `${formatUnits(rawBalance, decimals)} ${symbol}` :
    isFetching ? 'Fetching…' : '—';

  const allowanceText =
    rawAllowance !== null ? `${formatUnits(rawAllowance, decimals)} ${symbol}` :
    isFetching ? 'Fetching…' : '—';

  // Writers
  const { writeContract: writeApprove, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isSuccess: approveOk, isLoading: approveWaiting } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: writeTransfer, data: transferHash, isPending: isTransferring } = useWriteContract();
  const { isSuccess: transferOk, isLoading: transferWaiting } = useWaitForTransactionReceipt({ hash: transferHash });

  const approvingRef = useRef(false);
  const transferringRef = useRef(false);

  const parsedAmount = (() => {
    try { return amount ? parseUnits(amount, decimals) : null; } catch { return null; }
  })();

  async function onApprove() {
    if (!isConnected || wrongChain || !parsedAmount) return;
    if (approvingRef.current) return;
    approvingRef.current = true;
    setStatus('');
    try {
      writeApprove({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [POLL_ACCOUNT, parsedAmount],
      });
    } finally {
      approvingRef.current = false;
    }
  }

  async function onTransferNow() {
    if (!isConnected || wrongChain || !parsedAmount) return;
    if (transferringRef.current) return;
    transferringRef.current = true;
    setStatus('');
    try {
      writeTransfer({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [POLL_ACCOUNT, parsedAmount],
      });
    } finally {
      transferringRef.current = false;
    }
  }

  useEffect(() => {
    if (approveOk) {
      setStatus('✅ Approve confirmed');
      refetch();
    }
  }, [approveOk, refetch]);

  useEffect(() => {
    if (transferOk) {
      setStatus('✅ Transfer confirmed');
      refetch();
    }
  }, [transferOk, refetch]);

  const showError =
    error ? (error as any)?.message :
    wrongChain ? 'Switch to Sepolia (11155111)' :
    !isConnected ? 'Connect wallet' : '';

  const canApprove  = isConnected && !wrongChain && !!parsedAmount && !isApproving   && !approveWaiting;
  const canTransfer = isConnected && !wrongChain && !!parsedAmount && !isTransferring && !transferWaiting;

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Send Tokens to Poll Account (Sepolia)</h1>
        <ConnectButton />
      </div>

      <section style={{ marginTop: 16, padding: 16, border: '1px solid #e5e5e5', borderRadius: 10 }}>
        <p><strong>Token:</strong> <code>{TOKEN_ADDRESS}</code></p>
        <p><strong>Poll account:</strong> <code>{POLL_ACCOUNT}</code></p>
        <p><strong>Account:</strong> {isConnected ? address : '—'}</p>
        <p><strong>Balance:</strong> {balanceText}</p>
        <p><strong>Allowance → poll:</strong> {allowanceText}</p>

        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Amount ({symbol || 'tokens'})</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                inputMode="decimal"
                style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
              />
              <button
                type="button"
                onClick={() => rawBalance !== null && setAmount(formatUnits(rawBalance, decimals))}
                disabled={rawBalance === null}
                style={{ padding: '8px 12px' }}
              >
                Max
              </button>
            </div>
          </label>

          {!!showError && <p style={{ color: 'crimson', margin: 0 }}>{showError}</p>}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <button type="button" onClick={onApprove} disabled={!canApprove} style={{ padding: '10px 14px' }}>
              {isApproving || approveWaiting ? 'Approving…' : 'Approve (set allowance)'}
            </button>

            <button type="button" onClick={onTransferNow} disabled={!canTransfer} style={{ padding: '10px 14px' }}>
              {isTransferring || transferWaiting ? 'Transferring…' : 'Transfer Now'}
            </button>

            <button type="button" onClick={() => refetch()} style={{ padding: '10px 14px' }}>
              Refresh
            </button>
          </div>

          {status && <p style={{ marginTop: 8 }}>{status}</p>}

          {approveHash && (
            <p style={{ marginTop: 6, fontSize: 12 }}>
              Approve tx: <code>{approveHash}</code> {approveOk && '✔️ Confirmed'}
            </p>
          )}
          {transferHash && (
            <p style={{ marginTop: 2, fontSize: 12 }}>
              Transfer tx: <code>{transferHash}</code> {transferOk && '✔️ Confirmed'}
            </p>
          )}
        </div>

        <details style={{ marginTop: 12 }}>
          <summary>Why approve + transfer?</summary>
          <p style={{ marginTop: 8 }}>
            Approve sets an allowance for the poll account (so a backend/contract can pull later via <code>transferFrom</code>).
            Transfer Now pushes tokens directly to the poll account immediately from your wallet.
          </p>
        </details>
      </section>
    </main>
  );
}
