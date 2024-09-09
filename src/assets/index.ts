import { Address } from "viem";
import lottery from "./Lottery.json";
import lotteryToken from "./LotteryToken.json";

export const lotteryContract = {
  address: process.env.NEXT_PUBLIC_LOTTERY_CONTRACT as Address,
  abi: lottery.abi,
} as const;

export const lotteryTokenContract = {
  address: process.env.NEXT_PUBLIC_LOTTERY_TOKEN_CONTRACT as Address,
  abi: lotteryToken.abi,
} as const;
