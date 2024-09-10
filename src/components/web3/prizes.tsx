"use client";

import {
  type BaseError,
  useAccount,
  useClient,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
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
import { lotteryContract } from "@/assets";

export function Prizes() {
  const [amount, setAmount] = useState("");
  const client = useClient();
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  const { data, error, isPending } = useReadContracts({
    contracts: [
      {
        ...lotteryContract,
        functionName: "prize",
        args: [address],
      },
    ],
  });
  const [prize] = data || [];

  const changeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const claimPrize = async () => {
    writeContract(
      {
        ...lotteryContract,
        functionName: "prizeWithdraw",
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
          alert(
            `Tokens purchased tx hash: ${transactionReceipt.transactionHash}`,
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
        <CardTitle>Prizes</CardTitle>
        <CardDescription>View and claim your prizes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span>Prize</span>
          <span className="font-bold">
            {formatEther((prize?.result as bigint) || BigInt(0))} LEGIT
          </span>
        </div>
        <div className="mt-4 space-y-4">
          <Input
            type="number"
            name="amount"
            placeholder="Amount"
            onChange={changeAmount}
            value={amount}
          />
          <Button className="w-full" disabled={false} onClick={claimPrize}>
            Claim
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
