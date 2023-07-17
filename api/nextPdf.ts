import formidable from 'formidable-serverless';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import pdf from 'pdf-parse/lib/pdf-parse.js'

import { Document } from "langchain/document";
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PineconeClient } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const config = {
	api: {
	  externalResolver: true,
	},
  }

const processDocuments = async (docs, fileName,index) => {
	// console.log(fileName)
	try {
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
	}
};
function getUrlParamsFor(url = "", name: string) {
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
export default async(req, res) => {
  
	let fileName: string = getUrlParamsFor(req.url, "fileName");
	let openAIApiKey: string = getUrlParamsFor(req.url, "openAIApiKey");
	let pineconeApiKey: string = getUrlParamsFor(req.url, "pineconeApiKey");
	let pineconeEnvironment: string = getUrlParamsFor(req.url, "environment");
  if (!fileName||!openAIApiKey||!pineconeApiKey||!pineconeEnvironment) {
    res.send({ code: -1, data: [], error: "fileName\openAIApiKey\pineconeApiKey\pineconeEnvironment is required" });
    return;
  }
  const myEnv = {
    pinecone: {
      environment: pineconeEnvironment,
      apiKey: pineconeApiKey
    },
    openai: {
      openAIApiKey: openAIApiKey
    }
  }
	console.log(req.query)
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
	console.log(pdfData)
	const textSplitter = new RecursiveCharacterTextSplitter({
		chunkSize: 1000,
		chunkOverlap: 200,
	});

	const docs = await textSplitter.splitDocuments([
		new Document({ pageContent: pdfData.text }),
	]);
	console.log(docs);
	await processDocuments(docs, fileName,index);
	res.send({ code: 200,files });
  });
}