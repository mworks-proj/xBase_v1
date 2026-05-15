export interface TaxService {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
}

// Tax preparation service products
export const TAX_SERVICES: TaxService[] = [
  {
    id: "individual-simple",
    name: "Simple Tax Return",
    description: "W-2 income only, standard deduction",
    priceInCents: 9900, // $99
    features: [
      "W-2 income",
      "Standard deduction",
      "Basic credits (EIC, Child Tax Credit)",
      "E-file included",
      "Audit support",
    ],
  },
  {
    id: "individual-itemized",
    name: "Itemized Tax Return",
    description: "W-2 income with itemized deductions",
    priceInCents: 14900, // $149
    features: [
      "Everything in Simple",
      "Itemized deductions",
      "Mortgage interest",
      "Charitable donations",
      "Medical expenses",
      "State & local taxes",
    ],
  },
  {
    id: "individual-complex",
    name: "Complex Tax Return",
    description: "Multiple income sources, investments, rental income",
    priceInCents: 24900, // $249
    features: [
      "Everything in Itemized",
      "1099 income (freelance, contract)",
      "Investment income (stocks, crypto)",
      "Rental property income",
      "Schedule C (self-employment)",
      "Schedule E (rental/royalty)",
    ],
  },
  {
    id: "business-sole-prop",
    name: "Sole Proprietor / LLC",
    description: "Small business or single-member LLC",
    priceInCents: 34900, // $349
    features: [
      "Schedule C business income",
      "Business expenses & deductions",
      "Home office deduction",
      "Vehicle expenses",
      "Quarterly estimated taxes",
      "Business asset depreciation",
    ],
  },
  {
    id: "business-partnership",
    name: "Partnership / Multi-Member LLC",
    description: "Form 1065 partnership return",
    priceInCents: 59900, // $599
    features: [
      "Form 1065 preparation",
      "K-1 distribution",
      "Partner allocations",
      "Business deductions",
      "Entity-level reporting",
    ],
  },
  {
    id: "business-scorp",
    name: "S-Corporation",
    description: "Form 1120-S corporate return",
    priceInCents: 79900, // $799
    features: [
      "Form 1120-S preparation",
      "Shareholder K-1s",
      "Officer compensation",
      "Corporate deductions",
      "State filing coordination",
    ],
  },
]

// Helper to get a service by ID
export function getServiceById(id: string): TaxService | undefined {
  return TAX_SERVICES.find((service) => service.id === id)
}

// Helper to format price
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100)
}
