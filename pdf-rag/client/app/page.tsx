import { FileUpload } from "./components/FileUpload";
export default function Home() {
  return (
   <div className="h-screen w-screen flex">
    <div className="h-screen w-48 bg-teal-600 justify-center items-center flex"> <FileUpload></FileUpload> </div>
    <div className="h-screen w-48 border-amber-400">2</div>
   </div>
  );
}
