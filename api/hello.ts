import type { VercelRequest, VercelResponse } from '@vercel/node'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';

const myEnv= {
  pinecone:{
    environment: 'us-west4-gcp-free', 
    apiKey: '6df035c5-7ede-4f2e-8a03-07e215c033c6'
  },
}
const pinecone = new PineconeClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await pinecone.init(myEnv.pinecone);
  if(!req.query.code){
    res.send({ code: -1,data:[],error:"code is required"});
    return;
  }
  
  try {
    const index = pinecone.Index("pdf");
    const indexStats = await index.describeIndexStats({
      describeIndexStatsRequest: {
        filter: {},
      },
    });
    // console.log(Object.keys(indexStats.namespaces));
    res.send({ code: 200,data:Object.keys(indexStats.namespaces).filter(item=>{
      return item.startsWith(req.query.code)
    })});
  } catch (error) {
    res.send({ code: -1,data:[],error});
  }
}