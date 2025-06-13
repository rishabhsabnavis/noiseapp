import { ThemeProvider } from "@/components/theme-provider";

import { FileUpload } from "./components/FileUpload";
function App() {
  return (

    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">NOI$E</h1>
    
        <FileUpload 
          onUpload={async (file: File, location: string) => {
            // TODO: Implement file upload logic
            console.log('Uploading:', { file, location });
          }} 
        />
      </div>
    </div>
    </ThemeProvider>
    
  )
}

export default App
