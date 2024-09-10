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
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { lotteryContract, lotteryTokenContract } from "@/assets";
import { Input } from "../ui/input";

export function Bets() {
  const [times, setTimes] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const client = useClient();
  const { address } = useAccount();
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
      {
        ...lotteryTokenContract,
        functionName: "balanceOf",
        args: [address],
      },
    ],
  });
  const [betPrice, betFee, prizePool, balance] = data || [];

  const changeTimes = (e: ChangeEvent<HTMLInputElement>) => {
    setTimes(e.target.value);
  };

  const approveTokens = () => {
    writeContract(
      {
        ...lotteryTokenContract,
        functionName: "approve",
        args: [
          lotteryContract.address,
          parseEther((1.2 * Number(times)).toString()),
        ],
      },
      {
        onSettled: () => {
          setIsLoading(true);
        },
        onSuccess: async (data) => {
          const transactionReceipt = await waitForTransactionReceipt(client!, {
            hash: data,
          });
          setIsApproved(true);
          setIsLoading(false);
          alert(
            `Tokens approved tx hash: ${transactionReceipt.transactionHash}`,
          );
        },
        onError: (error) => {
          setIsApproved(false);
          setIsLoading(false);
          alert(error.message);
        },
      },
    );
  };

  const placeBet = () => {
    let placeBetOptions;

    if (times === "1") {
      placeBetOptions = {
        ...lotteryContract,
        functionName: "bet",
      };
    } else {
      placeBetOptions = {
        ...lotteryContract,
        functionName: "betMany",
        args: [BigInt(times)],
      };
    }

    writeContract(placeBetOptions, {
      onSuccess: async (data) => {
        const transactionReceipt = await waitForTransactionReceipt(client!, {
          hash: data,
        });
        setIsApproved(false);
        alert(`Tokens approved tx hash: ${transactionReceipt.transactionHash}`);
      },
      onError: (error) => {
        setIsApproved(true);
        alert(error.message);
      },
    });
  };

  if (isPending) return <p>Loading...</p>;

  if (error)
    return <p>Error: {(error as BaseError).shortMessage || error.message}</p>;

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
              {formatEther((betPrice?.result as bigint) || BigInt(0))} LEGIT
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Fee</span>
            <span className="font-bold">
              {formatEther((betFee?.result as bigint) || BigInt(0))} LEGIT
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Prize Pool</span>
            <span className="font-bold">
              {formatEther((prizePool?.result as bigint) || BigInt(0))} LEGIT
            </span>
          </div>

          {!balance?.result && (
            <div className="text-center">
              <p className="text-red-600 font-bold">
                Please buy some tokens to place a bet
              </p>
            </div>
          )}

          <div className="w-full space-y-4">
            <Input
              type="number"
              name="times"
              disabled={isApproved || !balance?.result || isLoading}
              placeholder="How many times you want to bet?"
              onChange={changeTimes}
              value={times}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="grid w-full grid-cols-2 space-x-4">
          <Button
            variant={isApproved ? "outline" : "default"}
            disabled={isApproved || !balance?.result || isLoading}
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
