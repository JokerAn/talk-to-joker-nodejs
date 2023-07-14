import type { VercelRequest, VercelResponse } from '@vercel/node'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';
import pdf from 'pdf-parse/lib/pdf-parse.js'
import multer from 'multer';

const myEnv= {
  pinecone:{
    environment: 'us-west4-gcp-free', 
    apiKey: '6df035c5-7ede-4f2e-8a03-07e215c033c6'
  },
}
const pinecone = new PineconeClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // await pinecone.init(myEnv.pinecone);
  // await multer().single('file')(req, res); // 处理文件上传
  try {
    const { fileName } = req.body;
    // const pdfData = await pdf(req.file.buffer);
    res.status(200).json({ code: 200, fileName });
  } catch (error) {
    res.status(200).json({ code: -1, req,res });
  }
   
}