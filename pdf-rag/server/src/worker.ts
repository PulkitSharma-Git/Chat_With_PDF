import { Worker } from 'bullmq';
import { pipeline } from "@xenova/transformers";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { QdrantVectorStore } from '@langchain/qdrant';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CharacterTextSplitter } from '@langchain/textsplitters';

const worker = new Worker(
  'file-upload-queue',
  async (job) => {
    console.log('🔔 Job received:', job.data);
    let data;
    try {
      data = JSON.parse(job.data);
      console.log('📂 Parsed job data:', data);
    } catch (err) {
      console.error('❌ Failed to parse job data:', err);
      return;
    }

    try {
      console.log('📥 Loading PDF from path:', data.path);
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();
      console.log(`📄 PDF loaded with ${docs.length} pages`);
      
      const splitter = new CharacterTextSplitter({
        separator: "\n",
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const splitDocs = await splitter.splitDocuments(docs);
      console.log(`✂️ Split into ${splitDocs.length} chunks`);
      
      // ✅ Correct way to load the model
      console.log('⚙️ Initializing HuggingFace embeddings (Xenova/all-MiniLM-L6-v2)');
      const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

      const embeddings = new HuggingFaceTransformersEmbeddings({
        model: extractor as any, // 👈 This bypasses incorrect type expectations
      });
      console.log('✅ Embeddings initialized');
      
      console.log('📡 Connecting to Qdrant and adding documents');
      const vectorStore = await QdrantVectorStore.fromDocuments(
        splitDocs,
        embeddings,
        {
          url: 'http://localhost:6333',
          collectionName: 'langchainjs-testing',
        }
      );
      console.log('✅ All docs added to vector store successfully');
    } catch (error) {
      console.error('❌ Error during processing:', error);
    }
  },
  {
    concurrency: 100,
    connection: {
      host: 'localhost',
      port: 6379,
    },
  }
);
