import formidable from "formidable-serverless";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import pdf from "pdf-parse/lib/pdf-parse.js";

import { Document } from "langchain/document";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PineconeClient } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
const myEnv = {
  pinecone: {
    environment: "us-west4-gcp-free",
    apiKey: "6df035c5-7ede-4f2e-8a03-07e215c033c6",
  },
  openai: {
    openAIApiKey: "",
  },
};

export const config = {
  api: {
    externalResolver: true,
  },
};

const processDocuments = async (docs, fileName, index) => {
  // console.log(fileName)
  try {
    const embeddings = new OpenAIEmbeddings(myEnv.openai);
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: fileName,
      textKey: "text",
    });
    console.log("writeToFile complete:" + fileName);
    return true;
  } catch (error) {
    console.log("error", error);
  }
};
export default async (req, res) => {
  if (!req.query.pathName) {
    res.send({ code: -1, data: [], error: "pathName is required" });
    return;
  }
  console.log(req.query);
  return res.send({ code: 200, files: [] });
  const pinecone = new PineconeClient();
  await pinecone.init(myEnv.pinecone);
  const index = await pinecone.Index("pdf");
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    console.log(files);
    const pdfData = await pdf(files.file.path);
    console.log(pdfData);
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments([new Document({ pageContent: pdfData.text })]);
    console.log(docs);
    await processDocuments(docs, "anshunli-1212", index);
    res.send({ code: 200, files });
  });
};
