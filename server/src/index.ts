import { ApolloServer, gql } from "apollo-server";
import { User, Document, Image, Tweet, Resolvers } from "./generated/types";
import { readFile } from "fs";

async function readFileAsync(path: string): Promise<string> {
  return new Promise((ok, ng) => readFile(path, (err, data) => err ? ng(err): ok(data.toString())));
}

type NullType = null | undefined;
function isNullType(obj: any): obj is NullType {
  return obj == null;
}
type NotNullType = string | number | object | any[]
function isNonNullType(obj: any): obj is NotNullType {
  return obj != null;
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
    })) as User[];
  }
  function findUser(id: string): User | null {
    return (findUsers().find(it => it.id === id) || null);
  }
  function findUserByDocumentId(id: string) {
    const document = documents.map((it, id) => ({ ...it, id: id.toString() })).find(it => it.id === id);
    return findUser(document?.user.toString() || "");
  }
  function findUserByTweetId(id: string) {
    const tweet = tweets.map((it, id) => ({ ...it, id: id.toString() })).find(it => it.id === id);
    return findUser(tweet?.user.toString() || "");
  }
  function findDocuments(userId?: string): Document[] {
    return documents
      .filter(it => (userId == null || it.user.toString() === userId))
      .map(({ content, title }, id) => ({
        id: id.toString(),
        title, content,
      })) as Document[];
  }
  function findTweets(userId?: string): Tweet[] {
    return tweets
      .filter(it => (userId == null || it.user.toString() === userId))
      .map(({ content, image }, id) => ({
        id: id.toString(),
        content,
      })) as Tweet[];
  }
  function findImages() {
    return images.map((url, id) => ({ id: id.toString(), url }));
  }
  function findImage(id: number): Image | null {
    return findImages().find(it => it.id === id.toString()) ?? null;
  }

  function isImage(el: Image | null): el is Image {
    return el != null;
  }

  const resolvers: Resolvers = {
    Query: {
      users(): User[] {
        return findUsers();
      },
      user(_, { id }): User | null {
        return findUsers().find(it => it.id === id) || null;
      },
      documents(): Document[] {
        return findDocuments();
      },
      images(): Image[] {
        return findImages();
      },
      tweets(): Tweet[] {
        return findTweets();
      }
    },
    User: {
      documents(user): Document[] {
        return findDocuments(user.id);
      },
      tweets(user): Tweet[] {
        return findTweets(user.id);
      }
    },
    Document: {
      user(document): User {
        return findUserByDocumentId(document.id)!;
      },
      images(document): Image[] {
        const images = documents.map((it, id) => ({ ...it, id: id.toString() })).find(it => it.id === document.id)!.images;
        return images.map(it => findImage(it)).filter<Image>(isImage);
      }
    },
    Tweet: {
      user(tweet): User {
        return findUserByTweetId(tweet.id)!;
      },
      image(tweet): Image | null {
        const image = tweets.map((it, id) => ({ ...it, id: id.toString() })).find(it => it.id === tweet.id)!.image;
        return findImage(image || -1) || null;
      }
    }
  }

  const server = new ApolloServer({ typeDefs, resolvers: resolvers as any, playground: true });
  server.listen(process.env.PORT || 8080);
}

main();
