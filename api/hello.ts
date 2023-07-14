import type { VercelRequest, VercelResponse } from '@vercel/node'
import multer from 'multer';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import pdf from 'pdf-parse/lib/pdf-parse.js'

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from "langchain/document";
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';

const myEnv= {
  pinecone:{
    environment: 'us-west4-gcp-free', 
    apiKey: '6df035c5-7ede-4f2e-8a03-07e215c033c6'
  },
}
const pinecone = new PineconeClient();
await pinecone.init(myEnv.pinecone);
export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const index = pinecone.Index("pdf"); //change to your own index name
    const embeddings = new OpenAIEmbeddings(myEnv.openai);
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: fileName,
      textKey: 'text',
    });
    console.log('writeToFile complete:' + fileName);
    return true;
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
}