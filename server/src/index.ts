import { ApolloServer, gql } from "apollo-server";
import { QueryResolvers, User, Document, Image, Tweet } from "./generated/types";
import { readFile } from "fs";

async function readFileAsync(path: string): Promise<string> {
  return new Promise((ok, ng) => readFile(path, (err, data) => err ? ng(err): ok(data.toString())));
}

async function main() {
  const users = ["今村清", "上田次郎", "山田奈緒子"];
  const documents = [
    { title: "タイトル1", content: "本文1", user: 0, images: [0, 1] },
    { title: "タイトル2", content: "本文2", user: 1, images: [1] },
    { title: "タイトル3", content: "本文3", user: 2, images: [2, 0] },
    { title: "タイトル4", content: "本文4", user: 2, images: [0] },
    { title: "タイトル5", content: "本文5", user: 1, images: [] },
    { title: "タイトル6", content: "本文6", user: 0, images: [3, 4] },
  ]
  const tweets = [
    { content: "つぶやき1", user: 0, image: null },
    { content: "つぶやき2", user: 0, image: 1 },
    { content: "つぶやき3", user: 2, image: 3 },
    { content: "つぶやき4", user: 2, image: 2 },
    { content: "つぶやき5", user: 1, image: null },
    { content: "つぶやき6", user: 2, image: null },
    { content: "つぶやき7", user: 1, image: 4 },
    { content: "つぶやき8", user: 0, image: null },
  ];
  const images = [
    "http://example.com/image0",
    "http://example.com/image1",
    "http://example.com/image2",
    "http://example.com/image3",
    "http://example.com/image4",
  ];

  const typeDefs = gql(await readFileAsync("./graphql/schema.graphql"));

  function findUsers(): User[] {
    return users.map((name, id) => ({
      id: id.toString(),
      name,
      documents: findDocuments(id),
      tweets: findTweets(id),
    }));
  }
  function findDocuments(userId?: number): Document[] {
    return documents
      .filter(it => (userId == null || it.user === userId))
      .map(({ content, images, title }, id) => ({
        id: id.toString(),
        title, content,
        images: images.map(id => findImage(id))
      }));
  }
  function findTweets(userId?: number): Tweet[] {
    return tweets
      .filter(it => (userId == null || it.user === userId))
      .map(({ content, image }, id) => ({
        id: id.toString(),
        content,
        image: (image != null ? findImage(image) : null)
      }));
  }
  function findImages() {
    return images.map((url, id) => ({ id: id.toString(), url }));
  }
  function findImage(id: number): Image | null {
    return findImages().find(it => it.id === id.toString()) ?? null;
  }

  const Query: Required<QueryResolvers> = {
    users() {
      return findUsers();
    },
    documents() {
      return findDocuments();
    },
    images() {
      return findImages();
    },
    tweets() {
      return findTweets();
    }
  }

  const server = new ApolloServer({ typeDefs, resolvers: { Query } });
  server.listen(8080);
}

main();
