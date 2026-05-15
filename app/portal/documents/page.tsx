"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { documentCategories } from "@/lib/config"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  X, 
  AlertCircle,
  File,
  Image,
  FileSpreadsheet
} from "lucide-react"
import Link from "next/link"

// Mock uploaded documents
const mockUploaded = [
  {
    id: "1",
    category: "government_id",
    fileName: "drivers-license.pdf",
    fileSize: 245000,
    uploadedAt: "2025-01-15T10:30:00Z",
    verified: true,
  },
]

// Mock required categories for current intake path
const requiredCategories = ["w2", "government_id", "prior_return"]

type UploadingFile = {
  id: string
  file: File
  category: string
  progress: number
  status: "uploading" | "complete" | "error"
}

export default function DocumentsPage() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [uploadedDocs, setUploadedDocs] = useState(mockUploaded)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleFileSelect = (category: string) => {
    setSelectedCategory(category)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !selectedCategory) return

    Array.from(files).forEach((file) => {
      const uploadId = `upload-${Date.now()}-${Math.random()}`
      
      // Add to uploading state
      setUploadingFiles((prev) => [
        ...prev,
        {
          id: uploadId,
          file,
          category: selectedCategory,
          progress: 0,
          status: "uploading",
        },
      ])

      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          
          // Move to uploaded state
          setTimeout(() => {
            setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId))
            setUploadedDocs((prev) => [
              ...prev,
              {
                id: uploadId,
                category: selectedCategory,
                fileName: file.name,
                fileSize: file.size,
                uploadedAt: new Date().toISOString(),
                verified: false,
              },
            ])
          }, 500)
        }
        
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadId ? { ...f, progress: Math.min(progress, 100) } : f
          )
        )
      }, 200)
    })

    // Reset input
    e.target.value = ""
    setSelectedCategory(null)
  }

  const removeUploadedDoc = (docId: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== docId))
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <Image className="w-5 h-5" />
    }
    if (["xls", "xlsx", "csv"].includes(ext || "")) {
      return <FileSpreadsheet className="w-5 h-5" />
    }
    return <File className="w-5 h-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getCategoryDocs = (categoryId: string) => {
    return uploadedDocs.filter((d) => d.category === categoryId)
  }

  const isRequired = (categoryId: string) => requiredCategories.includes(categoryId)

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Documents
          </h1>
          <p className="text-muted-foreground">
            Securely upload your tax documents. All files are encrypted and protected.
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.csv"
        />

        {/* Upload Progress */}
        {uploadingFiles.length > 0 && (
          <Card className="mb-6 border-accent/30 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Uploading...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {uploadingFiles.map((upload) => (
                <div key={upload.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{upload.file.name}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(upload.progress)}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Document Categories */}
        <div className="space-y-4">
          {documentCategories.map((category) => {
            const docs = getCategoryDocs(category.id)
            const hasDoc = docs.length > 0
            const required = isRequired(category.id)

            return (
              <Card 
                key={category.id} 
                className={`bg-card/50 border-border transition-colors ${
                  hasDoc ? "border-success/30" : required ? "border-orange-500/30" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        hasDoc 
                          ? "bg-success/10 text-success" 
                          : required 
                          ? "bg-orange-500/10 text-orange-500"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {hasDoc ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {category.label}
                          {required && !hasDoc && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/30">
                              Required
                            </span>
                          )}
                          {hasDoc && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
                              Uploaded
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {getDocumentDescription(category.id)}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={hasDoc ? "outline" : "default"}
                      onClick={() => handleFileSelect(category.id)}
                      className="gap-2 flex-shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                      {hasDoc ? "Add More" : "Upload"}
                    </Button>
                  </div>
                </CardHeader>

                {/* Uploaded Files List */}
                {docs.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2 mt-2 pt-4 border-t border-border">
                      {docs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-muted-foreground">
                              {getFileIcon(doc.fileName)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{doc.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(doc.fileSize)} - Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.verified && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">
                                Verified
                              </span>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              onClick={() => removeUploadedDoc(doc.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-secondary/30 border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-2">Document Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Accepted formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX, CSV</li>
                  <li>Maximum file size: 10MB per file</li>
                  <li>Ensure all pages are clearly visible and readable</li>
                  <li>Personal information should not be obscured</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" asChild>
            <Link href="/portal">Back to Dashboard</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/portal/payments">
              Continue to Payment
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function getDocumentDescription(categoryId: string): string {
  const descriptions: Record<string, string> = {
    w2: "W-2 forms from your employer(s) showing wages and taxes withheld",
    "1099": "1099-NEC, 1099-K, 1099-MISC, or other 1099 income forms",
    government_id: "Valid driver's license, state ID, or passport",
    prior_return: "Previous year's tax return (helps ensure accuracy)",
    dependent_info: "Social Security cards and birth certificates for dependents",
    business_income: "Profit/loss statements, income records, invoices",
    business_expenses: "Categorized expense records and receipts",
    receipts: "Receipts for deductible expenses",
    bank_statements: "Business bank account statements",
    payroll_docs: "Payroll reports, 941 forms, W-3 summary",
    other: "Any additional supporting documents",
  }
  return descriptions[categoryId] || "Supporting tax documents"
}
