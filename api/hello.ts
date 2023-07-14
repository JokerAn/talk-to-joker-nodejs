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
// 添加CORS中间件
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // 允许所有源
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
const processDocuments = async (docs, fileName) => {
  // console.log(fileName)
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
};
// 上传文件
app.post('/upload', multer().single('file'), async (req, res, err) => {
  try {
    if (err) {
      console.log(err);
    }
    console.log(req.body.fileName)
  
  } catch (error) {
    res.send({ code: -1, data:null,error });
  }
});
export default function handler(req: VercelRequest, res: VercelResponse) {
  let a=multer().single('file');
  a(req,res,(err)=>{

    // 解析PDF文件
    const pdfData = await pdf(req.file.buffer);
    console.log('pdfData--', pdfData);
  
    const doc = {
      metadata: {
        source: 'blob', // Set the source of the document to the file name
        ...pdfData.metadata
      },
      text: pdfData.text, // Read the file content as text
    };
  
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  
    const docs = await textSplitter.splitDocuments([
      new Document({ pageContent: pdfData.text }),
    ]);
  
    // console.log('docs--', docs);
    await processDocuments(docs,req.body.fileName);
    res.send({ code: 200, indexNames });
  })
}