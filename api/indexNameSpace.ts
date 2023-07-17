import type { VercelRequest, VercelResponse } from '@vercel/node'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';
import cors from 'cors';
let myEnv:any= {}
const pinecone = new PineconeClient();
function getUrlParamsFor(url = "", name?: string) {
  const queryParams: any = url.split("?")[1] || [];
  let finallyData: any = {};
  var vars = queryParams.length > 0 ? queryParams.split("&") : [];
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    finallyData[pair[0]] = pair[1];
  }
  if (name) {
    return finallyData[name];
  }
  return finallyData;
}
export default async function handler(req: any, res: any) {
  await new Promise((resolve, reject) => {
    cors()(req, res, (err) => {
      if (err) {
				console.log('cors error',err)
        reject(err);
      } else {
        resolve(req);
      }
    });
  });
  let paramss:any=getUrlParamsFor(req.url);
  console.log(paramss)
	let code: string = getUrlParamsFor(req.url, "code");
	let pineconeApiKey: string = getUrlParamsFor(req.url, "pineconeApiKey");
	let pineconeEnvironment: string = getUrlParamsFor(req.url, "environment");
  if (!code||!pineconeApiKey||!pineconeEnvironment) {
    res.send({ code: -1, data: [], error: "code\pineconeApiKey\pineconeEnvironment is required" });
    return;
  }
  myEnv = {
    pinecone: {
      environment: pineconeEnvironment,
      apiKey: pineconeApiKey
    }
  }
  await pinecone.init(myEnv.pinecone);
  try {
    const index = pinecone.Index("pdf");
    const indexStats:any = await index.describeIndexStats({
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