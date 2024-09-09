"use client";

import {
  type BaseError,
  useClient,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { useState } from "react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { lotteryContract, lotteryTokenContract } from "@/assets";

export function Bets() {
  const [isApproved, setIsApproved] = useState(false);
  const client = useClient();
  const { writeContract } = useWriteContract();
  const { data, error, isPending } = useReadContracts({
    contracts: [
      {
        ...lotteryContract,
        functionName: "betPrice",
      },
      {
        ...lotteryContract,
        functionName: "betFee",
      },
      {
        ...lotteryContract,
        functionName: "prizePool",
      },
    ],
  });
  const [betPrice, betFee, prizePool] = data || [];

  if (isPending) return <p>Loading...</p>;

  if (error)
    return <p>Error: {(error as BaseError).shortMessage || error.message}</p>;

  const approveTokens = () => {
    writeContract(
      {
        ...lotteryTokenContract,
        functionName: "approve",
        args: [lotteryContract.address, parseEther("1.2")],
      },
      {
        onSuccess: async (data) => {
          const transactionReceipt = await waitForTransactionReceipt(client!, {
            hash: data,
          });
          setIsApproved(true);
          alert(
            `Tokens approved tx hash: ${transactionReceipt.transactionHash}`
          );
        },
        onError: (error) => alert(error.message),
      }
    );
  };

  const placeBet = () => {
    writeContract(
      {
        ...lotteryContract,
        functionName: "bet",
      },
      {
        onSuccess: async (data) => {
          const transactionReceipt = await waitForTransactionReceipt(client!, {
            hash: data,
          });
          setIsApproved(false);
          alert(
            `Tokens approved tx hash: ${transactionReceipt.transactionHash}`
          );
        },
        onError: (error) => alert(error.message),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bets</CardTitle>
        <CardDescription>View and place bets</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Price</span>
            <span className="font-bold">
              {formatEther(betPrice?.result as bigint)} LEGIT
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Fee</span>
            <span className="font-bold">
              {formatEther(betFee?.result as bigint)} LEGIT
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Prize Pool</span>
            <span className="font-bold">
              {formatEther(prizePool?.result as bigint)} LEGIT
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid w-full grid-cols-2 space-x-4">
          <Button
            variant={isApproved ? "outline" : "default"}
            disabled={isApproved}
            onClick={approveTokens}
          >
            Approve Tokens
          </Button>

          <Button
            variant={!isApproved ? "outline" : "default"}
            disabled={!isApproved}
            onClick={placeBet}
          >
            Place Bet
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
