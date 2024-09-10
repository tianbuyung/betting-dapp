import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tokens } from "../web3/tokens";
import { Bets } from "../web3/bets";
import { Lottery } from "../web3/lottery";
import { Prizes } from "../web3/prizes";
import { Admin } from "../web3/admin";

export function TabsMenu() {
  return (
    <Tabs defaultValue="tokens" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="tokens">Tokens</TabsTrigger>
        <TabsTrigger value="bets">Bets</TabsTrigger>
        <TabsTrigger value="lottery">Lottery</TabsTrigger>
        <TabsTrigger value="prizes">Prizes</TabsTrigger>
        <TabsTrigger value="admin">Admin</TabsTrigger>
      </TabsList>
      <TabsContent value="tokens">
        <Tokens />
      </TabsContent>
      <TabsContent value="bets">
        <Bets />
      </TabsContent>
      <TabsContent value="lottery">
        <Lottery />
      </TabsContent>
      <TabsContent value="prizes">
        <Prizes />
      </TabsContent>
      <TabsContent value="admin">
        <Admin />
      </TabsContent>
    </Tabs>
  );
}
