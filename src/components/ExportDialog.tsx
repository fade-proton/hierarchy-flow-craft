
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FlowExport } from "@/utils/flowUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Copy, Upload } from "lucide-react";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportData: FlowExport;
  onImport: (importData: FlowExport) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  exportData,
  onImport
}) => {
  const [importText, setImportText] = useState("");
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  
  // Format the JSON for display
  const formattedJson = JSON.stringify(exportData, null, 2);
  
  // Copy JSON to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(formattedJson);
    toast.success("JSON copied to clipboard");
  };
  
  // Download JSON as a file
  const handleDownloadJson = () => {
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flow-structure.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("JSON downloaded");
  };
  
  // Handle import from JSON text
  const handleImport = () => {
    try {
      const importData = JSON.parse(importText);
      // Basic validation
      if (!importData.structures || !Array.isArray(importData.structures)) {
        toast.error("Invalid import data: missing structures array");
        return;
      }
      
      // Import the data
      onImport(importData);
      toast.success("Flow imported successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#1A1F2C] text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Flow Structure JSON</DialogTitle>
          <DialogDescription className="text-gray-300">
            {activeTab === 'export' 
              ? "Export your flow structure as JSON to save or share." 
              : "Import a flow structure from JSON."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex border-b border-gray-700 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'export' ? 'text-[#0FA0CE] border-b-2 border-[#0FA0CE]' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('export')}
          >
            Export
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'import' ? 'text-[#0FA0CE] border-b-2 border-[#0FA0CE]' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('import')}
          >
            Import
          </button>
        </div>
        
        {activeTab === 'export' ? (
          <>
            <ScrollArea className="h-[300px] rounded-md border border-gray-700 bg-[#0D1117] p-4 font-mono text-sm">
              <pre>{formattedJson}</pre>
            </ScrollArea>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={handleCopyJson}
                className="bg-[#242938] text-white hover:bg-[#2A304A] border-gray-700"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button 
                onClick={handleDownloadJson}
                className="bg-[#0FA0CE] text-white hover:bg-[#0C8CAE]"
              >
                <Download className="mr-2 h-4 w-4" />
                Download JSON
              </Button>
            </div>
          </>
        ) : (
          <>
            <textarea
              className="w-full h-[300px] p-4 bg-[#0D1117] text-white font-mono text-sm rounded-md border border-gray-700 focus:border-[#0FA0CE] focus:ring-1 focus:ring-[#0FA0CE] focus:outline-none"
              placeholder="Paste JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="bg-[#242938] text-white hover:bg-[#2A304A] border-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                className="bg-[#0FA0CE] text-white hover:bg-[#0C8CAE]"
                disabled={!importText.trim()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
