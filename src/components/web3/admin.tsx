"use client";

import {
  type BaseError,
  useClient,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { ChangeEvent, useState } from "react";
import { waitForTransactionReceipt } from "viem/actions";

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

export function Admin() {
  const [amount, setAmount] = useState("");
  const client = useClient();
  const { writeContract } = useWriteContract();
  const { data, error, isPending } = useReadContracts({
    contracts: [
      {
        ...lotteryContract,
        functionName: "ownerPool",
      },
    ],
  });
  const [ownerPool] = data || [];

  const changeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const claimOwnerPool = async () => {
    writeContract(
      {
        ...lotteryContract,
        functionName: "ownerWithdraw",
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
            `Tokens purchased tx hash: ${transactionReceipt.transactionHash}`
          );
        },
        onError: (error) => alert(error.message),
      }
    );
  };

  if (isPending) return <p>Loading...</p>;

  if (error)
    return <p>Error: {(error as BaseError).shortMessage || error.message}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
        <CardDescription>Manage lottery settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span>Owner Pool</span>
          <span className="font-bold">
            {formatEther(ownerPool?.result as bigint)} LEGIT
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
          <Button className="w-full" disabled={false} onClick={claimOwnerPool}>
            Claim
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
