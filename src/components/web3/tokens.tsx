"use client";

import {
  type BaseError,
  useAccount,
  useClient,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { formatUnits, parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { ChangeEvent, useState } from "react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { lotteryContract, lotteryTokenContract } from "@/assets";

export function Tokens() {
  const [amount, setAmount] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const client = useClient();
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const { data, error, isPending } = useReadContracts({
    contracts: [
      {
        ...lotteryTokenContract,
        functionName: "balanceOf",
        args: [address],
      },
      {
        ...lotteryTokenContract,
        functionName: "decimals",
      },
      {
        ...lotteryTokenContract,
        functionName: "symbol",
      },
    ],
  });
  const [balance, decimals, symbol] = data || [];

  const changeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const buyTokens = async () => {
    writeContract(
      {
        ...lotteryContract,
        functionName: "purchaseTokens",
        value: parseEther(amount),
      },
      {
        onSettled: () => {
          setAmount("");
        },
        onSuccess: async (data) => {
          const transactionReceipt = await waitForTransactionReceipt(client!, {
            hash: data,
          });
          alert(
            `Tokens purchased tx hash: ${transactionReceipt.transactionHash}`,
          );
        },
        onError: (error) => alert(error.message),
      },
    );
  };

  const approveTokens = async () => {
    writeContract(
      {
        ...lotteryTokenContract,
        functionName: "approve",
        args: [lotteryContract.address, parseEther(amount)],
      },
      {
        onSuccess: async (data) => {
          const transactionReceipt = await waitForTransactionReceipt(client!, {
            hash: data,
          });
          setIsApproved(true);
          alert(
            `Tokens approved tx hash: ${transactionReceipt.transactionHash}`,
          );
        },
        onError: (error) => alert(error.message),
      },
    );
  };

  const returnTokens = async () => {
    writeContract(
      {
        ...lotteryContract,
        functionName: "returnTokens",
        args: [parseEther(amount)],
      },
      {
        onSettled: () => {
          setAmount("");
        },
        onSuccess: async (data) => {
          const transactionReceipt = await waitForTransactionReceipt(client!, {
            hash: data,
          });
          setIsApproved(false);
          alert(
            `Tokens returned tx hash: ${transactionReceipt.transactionHash}`,
          );
        },
        onError: (error) => alert(error.message),
      },
    );
  };

  if (isPending) return <p>Loading...</p>;

  if (error)
    return <p>Error: {(error as BaseError).shortMessage || error.message}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Management</CardTitle>
        <CardDescription>Buy or return tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span>Current Balance:</span>
          <span className="font-bold">{`${formatUnits(
            (balance?.result as bigint) || BigInt(0),
            decimals?.result as number,
          )} ${symbol?.result || "LEGIT"}`}</span>
        </div>

        <div className="mt-4 space-y-4">
          <Input
            type="number"
            name="amount"
            disabled={isApproved}
            placeholder="Amount to buy in ETH or to withdraw in LEGIT"
            onChange={changeAmount}
            value={amount}
          />

          <div className="grid w-full grid-cols-2 space-x-4">
            <Button onClick={buyTokens}>Buy Tokens</Button>
            {isApproved ? (
              <Button variant="outline" onClick={returnTokens}>
                Withdraw Tokens
              </Button>
            ) : (
              <Button variant="outline" onClick={approveTokens}>
                Approve to Withdraw
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
