import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";


const queue = new Queue("file-upload-queue", {
    connection: {
        host: "localhost", 
        port: 6379
    },
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
  })
  
const upload = multer({ storage: storage }) 
const app = express()
app.use(cors());


app.get("/", (req, res) => {
    res.json({ status: "All Good"});
})

app.post("/upload/pdf", upload.single('pdf'), (req, res) => {
    queue.add('file-ready', JSON.stringify({
        filename: req.file?.originalname,
        destination: req.file?.destination,
        path: req.file?.path,
    }))
    res.json({ message: "uploaded" });
});



const PORT = 8000;
app.listen( PORT, () => {
    console.log(`Server started at PORT ${PORT}`);
    
}); 