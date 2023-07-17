import { PineconeClient } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import multer from 'multer';
import { VercelRequest, VercelResponse } from '@vercel/node';

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("avatar");

const myEnv = {
  pinecone: {
    environment: 'us-west4-gcp-free',
    apiKey: '6df035c5-7ede-4f2e-8a03-07e215c033c6'
  }
};

const pinecone = new PineconeClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, function (err) {
        if (err) {
          console.log(err);
          // Handle error during file upload
          return reject(err);
        } else {
          // Access the uploaded file using req.file
          const file = req['file'];
          res.status(200).json({ success: true, data: file });
          resolve(1);
        }
      });
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
}
