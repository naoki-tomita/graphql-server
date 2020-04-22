import { GraphQLClient } from "graphql-request";
import { getSdk } from "./generated/graphql";

const sdk = getSdk(new GraphQLClient("http://localhost:8080"));

async function main() {
  const result = await sdk.getUsers();
  console.log(result);
}

main();
