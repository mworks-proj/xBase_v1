"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft, CheckCircle, FileText, Briefcase, Building2, Loader2 } from "lucide-react"
import Link from "next/link"
import type { FilingStatus, IntakePath } from "@/types/tax"
import { submitIntake } from "./actions"

const intakePaths = [
  {
    id: "w2" as IntakePath,
    title: "W-2 Employee",
    description: "I receive a W-2 from my employer",
    icon: FileText,
  },
  {
    id: "1099" as IntakePath,
    title: "Self-Employed / 1099",
    description: "I receive 1099 forms as a freelancer or contractor",
    icon: Briefcase,
  },
  {
    id: "business" as IntakePath,
    title: "Small Business",
    description: "I own a small business or LLC",
    icon: Building2,
  },
]

const filingStatuses: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married_filing_jointly", label: "Married Filing Jointly" },
  { value: "married_filing_separately", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
  { value: "qualifying_widow", label: "Qualifying Widow(er)" },
]

export default function IntakePage() {
  const [step, setStep] = useState(1)
  const [selectedPath, setSelectedPath] = useState<IntakePath | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    filingStatus: "" as FilingStatus | "",
    isReturningClient: false,
    hasDependents: false,
    dependentCount: "",
    // 1099 specific
    businessType: "",
    mileageTracked: false,
    homeOffice: false,
    // Business specific
    businessName: "",
    entityType: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    hasPayroll: false,
    issued1099s: false,
    consultationRequired: false,
  })

  const totalSteps = selectedPath === "w2" ? 3 : selectedPath === "1099" ? 4 : selectedPath === "business" ? 4 : 1

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (!selectedPath) return
    
    setError(null)
    startTransition(async () => {
      const result = await submitIntake({
        intakePath: selectedPath,
        ...formData,
      })
      
      if (result.error) {
        setError(result.error)
      } else {
        setStep(totalSteps + 1) // Go to success step
      }
    })
  }

  const renderPathSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">What type of taxes are you filing?</h2>
        <p className="text-muted-foreground">Select the option that best describes your situation</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {intakePaths.map((path) => {
          const Icon = path.icon
          const isSelected = selectedPath === path.id
          return (
            <Card
              key={path.id}
              className={`cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "border-accent bg-accent/10"
                  : "bg-card/50 border-border hover:border-accent/50"
              }`}
              onClick={() => setSelectedPath(path.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                  isSelected 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-secondary text-foreground"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{path.title}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
      {selectedPath && (
        <div className="flex justify-end mt-6">
          <Button onClick={() => setStep(2)} className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )

  const renderW2Form = () => (
    <div className="space-y-6">
      {step === 2 && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="John Doe"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john@example.com"
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filingStatus">Filing Status *</Label>
              <Select
                value={formData.filingStatus}
                onValueChange={(value) => handleInputChange("filingStatus", value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select filing status" />
                </SelectTrigger>
                <SelectContent>
                  {filingStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="returningClient"
              checked={formData.isReturningClient}
              onCheckedChange={(checked) => handleInputChange("isReturningClient", !!checked)}
            />
            <Label htmlFor="returningClient" className="text-sm">
              I am a returning client (filed with you before)
            </Label>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDependents"
                checked={formData.hasDependents}
                onCheckedChange={(checked) => handleInputChange("hasDependents", !!checked)}
              />
              <Label htmlFor="hasDependents" className="text-sm">
                I have dependents to claim
              </Label>
            </div>
            {formData.hasDependents && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="dependentCount">Number of Dependents</Label>
                <Input
                  id="dependentCount"
                  type="number"
                  min="1"
                  value={formData.dependentCount}
                  onChange={(e) => handleInputChange("dependentCount", e.target.value)}
                  placeholder="1"
                  className="bg-background/50 w-24"
                />
              </div>
            )}
          </div>
          <Card className="bg-secondary/30 border-border">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Direct deposit information will be collected securely during the filing process. Your tax preparer will contact you if additional information is needed.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )

  const render1099Form = () => (
    <div className="space-y-6">
      {step === 2 && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="John Doe"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john@example.com"
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business / Contractor Type *</Label>
              <Input
                id="businessType"
                value={formData.businessType}
                onChange={(e) => handleInputChange("businessType", e.target.value)}
                placeholder="e.g., Freelance Designer, Uber Driver"
                className="bg-background/50"
              />
            </div>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mileageTracked"
              checked={formData.mileageTracked}
              onCheckedChange={(checked) => handleInputChange("mileageTracked", !!checked)}
            />
            <Label htmlFor="mileageTracked" className="text-sm">
              I tracked business mileage this year
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="homeOffice"
              checked={formData.homeOffice}
              onCheckedChange={(checked) => handleInputChange("homeOffice", !!checked)}
            />
            <Label htmlFor="homeOffice" className="text-sm">
              I use a home office for my business
            </Label>
          </div>
        </div>
      )}

      {step === 4 && (
        <Card className="bg-secondary/30 border-border">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Please have the following documents ready to upload:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>1099-NEC, 1099-K, or 1099-MISC forms</li>
              <li>Income summary or profit/loss statement</li>
              <li>Expense receipts organized by category</li>
              <li>Mileage log (if applicable)</li>
              <li>Prior year tax return (if available)</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderBusinessForm = () => (
    <div className="space-y-6">
      {step === 2 && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                placeholder="Acme Corp LLC"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type *</Label>
              <Select
                value={formData.entityType}
                onValueChange={(value) => handleInputChange("entityType", value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                  <SelectItem value="llc_single">Single-Member LLC</SelectItem>
                  <SelectItem value="llc_multi">Multi-Member LLC</SelectItem>
                  <SelectItem value="s_corp">S Corporation</SelectItem>
                  <SelectItem value="c_corp">C Corporation</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Card className="bg-secondary/30 border-border">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> EIN (Employer Identification Number) will be collected securely during the document upload process.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {step === 3 && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner / Contact Name *</Label>
              <Input
                id="ownerName"
                value={formData.ownerName}
                onChange={(e) => handleInputChange("ownerName", e.target.value)}
                placeholder="John Doe"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner Email *</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => handleInputChange("ownerEmail", e.target.value)}
                placeholder="john@acmecorp.com"
                className="bg-background/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPhone">Owner Phone</Label>
            <Input
              id="ownerPhone"
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => handleInputChange("ownerPhone", e.target.value)}
              placeholder="(555) 123-4567"
              className="bg-background/50"
            />
          </div>
        </>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasPayroll"
              checked={formData.hasPayroll}
              onCheckedChange={(checked) => handleInputChange("hasPayroll", !!checked)}
            />
            <Label htmlFor="hasPayroll" className="text-sm">
              My business has employees / runs payroll
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="issued1099s"
              checked={formData.issued1099s}
              onCheckedChange={(checked) => handleInputChange("issued1099s", !!checked)}
            />
            <Label htmlFor="issued1099s" className="text-sm">
              I issued 1099s to contractors this year
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="consultationRequired"
              checked={formData.consultationRequired}
              onCheckedChange={(checked) => handleInputChange("consultationRequired", !!checked)}
            />
            <Label htmlFor="consultationRequired" className="text-sm">
              I would like a consultation call with a tax professional
            </Label>
          </div>
        </div>
      )}
    </div>
  )

  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-success" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Intake Complete!</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Your information has been submitted. Next, please upload your required tax documents.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild className="gap-2">
          <Link href="/portal/documents">
            Upload Documents
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/portal">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Tax Intake Form
          </h1>
          <p className="text-muted-foreground">
            Complete this form so your tax preparer can begin working on your return
          </p>
        </div>

        {/* Progress Indicator */}
        {step <= totalSteps && selectedPath && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Select Tax Type"}
              {step === 2 && (selectedPath === "business" ? "Business Information" : "Personal Information")}
              {step === 3 && (selectedPath === "w2" ? "Dependents & Additional Info" : selectedPath === "business" ? "Contact Information" : "Business Deductions")}
              {step === 4 && (selectedPath === "1099" ? "Document Checklist" : "Additional Information")}
              {step > totalSteps && "Complete"}
            </CardTitle>
            {step <= totalSteps && (
              <CardDescription>
                {step === 1 && "Select the type of taxes you need to file"}
                {step === 2 && "Enter your basic information"}
                {step === 3 && "Additional details for your return"}
                {step === 4 && "Final questions before submission"}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {step === 1 && renderPathSelection()}
            {step > 1 && step <= totalSteps && selectedPath === "w2" && renderW2Form()}
            {step > 1 && step <= totalSteps && selectedPath === "1099" && render1099Form()}
            {step > 1 && step <= totalSteps && selectedPath === "business" && renderBusinessForm()}
            {step > totalSteps && renderSuccess()}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            {step > 1 && step <= totalSteps && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                {step < totalSteps ? (
                  <Button onClick={() => setStep(step + 1)} className="gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Intake
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
