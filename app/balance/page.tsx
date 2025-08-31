'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';

import {
  useAccount,
  useChainId,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { formatUnits, parseUnits } from 'viem';

import DefaultClose from '../assets/button-cancel.svg';

interface StartPopupProps {
  open: boolean;
  onClose: () => void;
  stakeAmount?: string | number;
  closeImageSrc?: StaticImport | string;
  onGameStart?: () => void; // Callback when game should start
  roomId?: string; // Room ID for the game
}

/** ------- Network / addresses ------- */
const SEPOLIA_CHAIN_ID = 11155111;
const TOKEN_ADDRESS = '0x1Bc07dB7Aea904379680Ff53FfC88E8dBa5C2619' as const;
const POLL_ACCOUNT = '0xf06D8c7558AF7BEb88A28714ab157fa782869368' as const;

/** ------- Minimal ERC-20 ABI ------- */
const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'decimals',  stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'symbol',    stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'approve',   stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'transfer',  stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const;

export default function StartPopup({ open, onClose, stakeAmount, closeImageSrc, onGameStart, roomId }: StartPopupProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-40" onClick={onClose} />

      {/* Modal Window */}
      <div className="relative z-50 bg-[#2D334A] border-2 border-white rounded-3xl w-full max-w-2xl overflow-hidden">
        {/* Header with title and close button */}
        <div className="p-3 relative flex items-center justify-center border-b border-white">
          <h1
            className="text-3xl font-semibold text-white text-center tracking-wider"
            style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 2px rgba(0,0,0,0.3), 1px -1px 2px rgba(0,0,0,0.3), -1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            SQUAD SETUP
          </h1>
          <button
            className="absolute -top-3 -right-3 hover:cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <Image
              src={closeImageSrc ?? DefaultClose}
              alt="Close"
              width={32}
              height={32}
              className="text-transparent overflow-inherit fixed"
              style={{ width: '63px', marginLeft: '-59px' }}
            />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col gap-6">
          <Inner stakeAmount={stakeAmount} onGameStart={onGameStart} roomId={roomId} />
        </div>
      </div>
    </div>
  );

  // Portal prevents parent stacking/overflow issues
  return createPortal(modal, document.body);
}

/** ------- Inner functional component (Wagmi hooks live here) ------- */
function Inner({ stakeAmount, onGameStart, roomId }: { stakeAmount?: string | number; onGameStart?: () => void; roomId?: string }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const wrongChain = isConnected && chainId !== SEPOLIA_CHAIN_ID;

  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (stakeAmount !== undefined && stakeAmount !== null) {
      setAmount(String(stakeAmount));
    } else {
      setAmount('10'); // Default amount
    }
  }, [stakeAmount]);

  const base = { address: TOKEN_ADDRESS, abi: ERC20_ABI } as const;
  const contracts = useMemo(() => {
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

  const { writeContract: writeApprove, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isSuccess: approveOk, isLoading: approveWaiting } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: writeTransfer, data: transferHash, isPending: isTransferring } = useWriteContract();
  const { isSuccess: transferOk, isLoading: transferWaiting } = useWaitForTransactionReceipt({ hash: transferHash });

  const approvingRef = useRef(false);
  const transferringRef = useRef(false);

  const parsedAmount = (() => {
    try { return amount ? parseUnits(amount, decimals) : null; } catch { return null; }
  })();

  function onApprove() {
    if (!isConnected || wrongChain || !parsedAmount) return;
    if (approvingRef.current) return;
    approvingRef.current = true;
    setStatus('Processing approval...');
    try {
      writeApprove({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [POLL_ACCOUNT, parsedAmount],
      });
    } catch (error) {
      setStatus('Approval failed');
      approvingRef.current = false;
    }
  }

  function onTransferNow() {
    if (!isConnected || wrongChain || !parsedAmount) return;
    if (transferringRef.current) return;
    transferringRef.current = true;
    setStatus('Processing transfer...');
    try {
      writeTransfer({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [POLL_ACCOUNT, parsedAmount],
      });
    } catch (error) {
      setStatus('Transfer failed');
      transferringRef.current = false;
    }
  }

  useEffect(() => {
    if (approveOk) { 
      setStatus('✅ Approve confirmed! Starting transfer...'); 
      refetch(); 
      setTimeout(() => {
        if (parsedAmount) {
          writeTransfer({
            address: TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [POLL_ACCOUNT, parsedAmount],
          });
        }
      }, 2000);
    }
  }, [approveOk, refetch, parsedAmount, writeTransfer]);

  useEffect(() => {
    if (transferOk) { 
      setStatus('✅ Transfer confirmed! Ready to start game.'); 
      refetch(); 
    }
  }, [transferOk, refetch]);

  const showError =
    error ? (error as any)?.message :
    wrongChain ? 'Switch to Sepolia (11155111)' :
    !isConnected ? 'Connect wallet' : '';

  const canApprove  = isConnected && !wrongChain && !!parsedAmount && !isApproving && !approveWaiting && !approveOk;
  const canTransfer = isConnected && !wrongChain && !!parsedAmount && !isTransferring && !transferWaiting && approveOk;
  const canStartGame = approveOk && transferOk;

  return (
    <>
      {/* Amount input */}
      <div className="flex flex-col gap-1 mt-6">
        <label
          className="text-white text-2xl font-medium tracking-wider pl-1"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 2px rgba(0,0,0,0.3), 1px -1px 2px rgba(0,0,0,0.3), -1px 1px 2px rgba(0,0,0,0.3)' }}
        >
          Amount ({symbol || 'tokens'})
        </label>
        <input
          type="text"
          value={amount}
          readOnly
          className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 text-lg border-2 border-gray-300 focus:outline-none cursor-not-allowed"
        />
      </div>

      {!!showError && (
        <p className="mt-2 text-red-300 font-normal" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
          {showError}
        </p>
      )}

      {/* Transaction buttons */}
      {!canStartGame && (
        <div className="grid grid-cols-2 gap-6 mt-6">
          <button
            onClick={onApprove}
            disabled={!canApprove}
            className={`relative py-3 flex items-center justify-center ${!canApprove ? 'opacity-60' : ''}`}
            style={{ filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.5))' }}
          >
            <div className="absolute inset-0 bg-yellow-400 rounded-lg border-b-4 border-yellow-600" />
            <span
              className="relative z-10 text-xl font-semibold tracking-wider"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 2px rgba(0,0,0,0.3), 1px -1px 2px rgba(0,0,0,0.3), -1px 1px 2px rgba(0,0,0,0.3)' }}
            >
              {isApproving || approveWaiting ? 'Approving…' : 'Approve'}
            </span>
          </button>

          <button
            onClick={onTransferNow}
            disabled={!canTransfer}
            className={`relative py-3 flex items-center justify-center ${!canTransfer ? 'opacity-60' : ''}`}
            style={{ filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.5))' }}
          >
            <div className="absolute inset-0 bg-yellow-400 rounded-lg border-b-4 border-yellow-600" />
            <span
              className="relative z-10 text-xl font-semibold tracking-wider"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 2px rgba(0,0,0,0.3), 1px -1px 2px rgba(0,0,0,0.3), -1px 1px 2px rgba(0,0,0,0.3)' }}
            >
              {isTransferring || transferWaiting ? 'Transferring…' : 'Transfer Now'}
            </span>
          </button>
        </div>
      )}

      {/* Start Game button - only shown after both transactions are complete */}
      {canStartGame && (
        <div className="mt-6">
          <button
            onClick={onGameStart}
            className="relative py-4 flex items-center justify-center w-full"
            style={{ filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.5))' }}
          >
            <div className="absolute inset-0 bg-green-500 rounded-lg border-b-4 border-green-700" />
            <span
              className="relative z-10 text-2xl font-bold tracking-wider"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 2px rgba(0,0,0,0.3), 1px -1px 2px rgba(0,0,0,0.3), -1px 1px 2px rgba(0,0,0,0.3)' }}
            >
              🎮 START GAME
            </span>
          </button>
          {roomId && (
            <p className="text-center text-white text-sm mt-2">
              Room: {roomId}
            </p>
          )}
        </div>
      )}

      {status && (
        <div className="mt-3 p-3 rounded-lg bg-blue-100 text-blue-700 text-center">
          {status}
        </div>
      )}

      {/* Transaction Hash Display */}
      {(approveHash || transferHash) && (
        <div className="mt-4 p-4 rounded-lg bg-gray-800 border border-gray-600">
          <h3 className="text-white text-lg font-medium mb-2">Transaction Details</h3>
          
          {approveHash && (
            <div className="mb-3">
              <p className="text-gray-300 text-sm mb-1">Approve Transaction:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={approveHash}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(approveHash)}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Copy
                </button>
                <a
                  href={`https://sepolia.etherscan.io/tx/${approveHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  View
                </a>
              </div>
              {approveOk && <p className="text-green-400 text-xs mt-1">✅ Confirmed</p>}
            </div>
          )}
          
          {transferHash && (
            <div>
              <p className="text-gray-300 text-sm mb-1">Transfer Transaction:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={transferHash}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(transferHash)}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Copy
                </button>
                <a
                  href={`https://sepolia.etherscan.io/tx/${transferHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  View
                </a>
              </div>
              {transferOk && <p className="text-green-400 text-xs mt-1">✅ Confirmed</p>}
            </div>
          )}
        </div>
      )}
    </>
  );
}
