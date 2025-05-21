"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const transformers_1 = require("@xenova/transformers");
const huggingface_transformers_1 = require("@langchain/community/embeddings/huggingface_transformers");
const qdrant_1 = require("@langchain/qdrant");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const textsplitters_1 = require("@langchain/textsplitters");
const worker = new bullmq_1.Worker('file-upload-queue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('🔔 Job received:', job.data);
    let data;
    try {
        data = JSON.parse(job.data);
        console.log('📂 Parsed job data:', data);
    }
    catch (err) {
        console.error('❌ Failed to parse job data:', err);
        return;
    }
    try {
        console.log('📥 Loading PDF from path:', data.path);
        const loader = new pdf_1.PDFLoader(data.path);
        const docs = yield loader.load();
        console.log(`📄 PDF loaded with ${docs.length} pages`);
        const splitter = new textsplitters_1.CharacterTextSplitter({
            separator: "\n",
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splitDocs = yield splitter.splitDocuments(docs);
        console.log(`✂️ Split into ${splitDocs.length} chunks`);
        // ✅ Correct way to load the model
        console.log('⚙️ Initializing HuggingFace embeddings (Xenova/all-MiniLM-L6-v2)');
        const extractor = yield (0, transformers_1.pipeline)("feature-extraction", "Xenova/all-MiniLM-L6-v2");
        const embeddings = new huggingface_transformers_1.HuggingFaceTransformersEmbeddings({
            model: extractor, // 👈 This bypasses incorrect type expectations
        });
        console.log('✅ Embeddings initialized');
        console.log('📡 Connecting to Qdrant and adding documents');
        const vectorStore = yield qdrant_1.QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
            url: 'http://localhost:6333',
            collectionName: 'langchainjs-testing',
        });
        console.log('✅ All docs added to vector store successfully');
    }
    catch (error) {
        console.error('❌ Error during processing:', error);
    }
}), {
    concurrency: 100,
    connection: {
        host: 'localhost',
        port: 6379,
    },
});
