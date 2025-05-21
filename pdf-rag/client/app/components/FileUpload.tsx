"use client"
import { Upload } from "lucide-react"

export const FileUpload: React.FC = () => {

    const handleFileUploadButtonClick = () => {
        const el = document.createElement("input");
        el.setAttribute("type", "file");
        el.setAttribute("accept", "application/pdf");
        el.addEventListener("change", async (ev) => {
            if(el.files && el.files.length > 0) {
                const file = el.files.item(0)
                
                if(file) {
                    const formData = new FormData();
                    formData.append('pdf', file);

                    await fetch("http://localhost:8000/upload/pdf", {
                        method: "POST",     
                        body: formData
                    })
                    console.log('File Uploaded')
                }
            }

        })
        el.click();
    }
    return (
        <div onClick={handleFileUploadButtonClick}
            className="flex w-44 h-20 justify-center items-center
                       rounded-2xl px-4 cursor-pointer
                       border border-red-800
                       bg-gradient-to-br from-[#8B0000] to-[#3B0000]
                       backdrop-blur-md
                       shadow-[0_0_15px_rgba(255,23,68,0.3)]
                       transition-all duration-300
                       hover:shadow-[0_0_25px_rgba(255,23,68,0.6)]
                       hover:border-[#FF1744]"
        >
            <Upload className="text-[#FF1744]" />
        </div>
    )
}
