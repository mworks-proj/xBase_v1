export interface TaxService {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  isCustomQuote?: boolean
}

// Tax preparation service products
// Prices are validated server-side - clients cannot manipulate these values
export const TAX_SERVICES: TaxService[] = [
  {
    id: "simple-w2",
    name: "Simple W-2 Return",
    description: "W-2 income only, standard deduction",
    priceInCents: 14900, // $149
    features: [
      "W-2 income only",
      "Standard deduction",
      "Basic credits (EIC, Child Tax Credit)",
      "E-file included",
      "Audit support",
    ],
  },
  {
    id: "w2-dependents",
    name: "W-2 + Dependents",
    description: "W-2 income with dependents and credits",
    priceInCents: 19900, // $199
    features: [
      "Everything in Simple W-2",
      "Dependent credits",
      "Child Tax Credit optimization",
      "Education credits",
      "Childcare expense credits",
    ],
  },
  {
    id: "self-employed",
    name: "1099 / Self-Employed Return",
    description: "Freelance, contract, or gig economy income",
    priceInCents: 29900, // $299
    features: [
      "1099-NEC / 1099-MISC income",
      "Schedule C (self-employment)",
      "Business expense deductions",
      "Home office deduction",
      "Quarterly estimated tax guidance",
      "Vehicle/mileage deductions",
    ],
  },
  {
    id: "small-business",
    name: "Small Business Tax Prep",
    description: "LLC, S-Corp, or Partnership returns",
    priceInCents: 0, // Custom quote - do not create checkout
    isCustomQuote: true,
    features: [
      "Business entity returns (1120-S, 1065)",
      "K-1 preparation",
      "Business deductions",
      "Payroll tax coordination",
      "State filing included",
      "Year-round support",
    ],
  },
]

// Helper to get a service by ID
export function getServiceById(id: string): TaxService | undefined {
  return TAX_SERVICES.find((service) => service.id === id)
}

// Helper to format price
export function formatPrice(priceInCents: number): string {
  if (priceInCents === 0) {
    return "Custom Quote"
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100)
}

// Check if a service requires a custom quote
export function isCustomQuote(serviceId: string): boolean {
  const service = getServiceById(serviceId)
  return service?.isCustomQuote === true
}
