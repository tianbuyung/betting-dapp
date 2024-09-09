"use client";

import {
  type BaseError,
  useClient,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { getBlock, waitForTransactionReceipt } from "viem/actions";
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

export function Lottery() {
  const [duration, setDuration] = useState("");
  const client = useClient();
  const { writeContract } = useWriteContract();
  const { data, error, isPending } = useReadContracts({
    contracts: [
      {
        ...lotteryContract,
        functionName: "betsOpen",
      },
      {
        ...lotteryContract,
        functionName: "betsClosingTime",
      },
    ],
  });
  const [betsOpen, betsClosingTime] = data || [];

  const changeDuration = (e: ChangeEvent<HTMLInputElement>) => {
    setDuration(e.target.value);
  };

  const openLottery = async () => {
    const currentBlock = await getBlock(client!);
    console.log(currentBlock);
    const timestamp = currentBlock?.timestamp ?? 0;
    writeContract(
      {
        ...lotteryContract,
        functionName: "openBets",
        args: [timestamp + BigInt(duration)],
      },
      {
        onSettled: () => {
          setDuration("");
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

  const closeLottery = async () => {
    writeContract(
      {
        ...lotteryContract,
        functionName: "closeLottery",
      },
      {
        onSuccess: async (data) => {
          const transactionReceipt = await waitForTransactionReceipt(client!, {
            hash: data,
          });
          alert(
            `Lottery closed successfully. Transaction hash: ${transactionReceipt.transactionHash}`
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
        <CardTitle>Lottery</CardTitle>
        <CardDescription>Run lottery and check state</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span>Lottery State:</span>
          <span className="font-bold">
            {betsOpen?.result ? "Open" : "Closed"}
          </span>
        </div>
        {(betsOpen?.result as boolean) && (
          <div className="text-center">
            <span className="font-bold">
              {`Lottery should close at ${new Date(
                Number(betsClosingTime?.result) * 1000
              ).toLocaleDateString()} : ${new Date(
                Number(betsClosingTime?.result) * 1000
              ).toLocaleTimeString()}`}
            </span>
          </div>
        )}
        <div className="mt-4 space-y-4">
          <Input
            type="number"
            name="duration"
            disabled={betsOpen?.result as boolean}
            placeholder="Duration (in seconds)"
            onChange={changeDuration}
            value={duration}
          />
          <Button
            className="w-full"
            disabled={betsOpen?.result as boolean}
            onClick={openLottery}
          >
            Open Lottery
          </Button>
        </div>
        <div className="mt-4 space-y-4">
          <Button
            className="w-full"
            disabled={!betsOpen?.result as boolean}
            onClick={closeLottery}
          >
            Close Lottery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
