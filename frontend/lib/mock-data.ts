// Enhanced Mock Data for Phase 2 - Dynamic Agentic Systems
// This file contains comprehensive mock data for all query types and scenarios

import type { QueryType, ChatMessage, Citation, QueryTrace, SuggestedQuery, UploadedFile } from './types'

// Sample documents for different scenarios
export const mockDocuments = [
  {
    id: 'financial_report_q3',
    title: 'Financial_Report_Q3.pdf',
    type: 'financial',
    pages: 45,
    sections: ['Executive Summary', 'Revenue Analysis', 'Market Performance', 'Risk Assessment', 'Future Outlook'],
    chunks: 89,
    indexed: true
  },
  {
    id: 'legal_contract_2024',
    title: 'Legal_Contract_2024.pdf',
    type: 'legal',
    pages: 23,
    sections: ['Terms and Conditions', 'Data Privacy', 'Breach Clauses', 'Termination', 'Liability'],
    chunks: 45,
    indexed: true
  },
  {
    id: 'stock_data_2024',
    title: 'Stock_Prices_2024.csv',
    type: 'database',
    pages: 1,
    sections: ['MSFT', 'AAPL', 'GOOGL', 'TSLA', 'NVDA'],
    chunks: 365,
    indexed: true
  }
]

// Mock responses for different query types and personas
export const mockResponses = {
  // Financial Analyst responses
  'Financial Analyst': {
    mathematical: [
      {
        query: 'moving average',
        response: `Based on the stock market data from March to May 2024, MSFT's 20-day moving average shows a consistent upward trend:

**March 2024**: $412.50 (20-day MA)
**April 2024**: $428.75 (20-day MA) 
**May 2024**: $441.20 (20-day MA)

The stock demonstrated strong momentum with a 6.96% increase in the moving average over this period. Key drivers include:
- Strong quarterly earnings in Q1 2024
- Increased Azure cloud revenue (+31% YoY)
- AI integration announcements boosting investor confidence

The moving average crossed above the 200-day MA on April 15th, 2024, indicating a strong bullish signal.`,
        citations: [
          { title: 'Stock_Prices_2024.csv', page: 1, section: 'MSFT', screenshot: '/placeholder.svg?height=400&width=300' },
          { title: 'Financial_Report_Q3.pdf', page: 15, section: 'Revenue Analysis', screenshot: '/placeholder.svg?height=400&width=300' }
        ],
        processingTrace: [
          { step: 'Router Node', duration: 120 },
          { step: 'Database Node', duration: 340 },
          { step: 'Math Node', duration: 890 },
          { step: 'Answer Formatter', duration: 200 }
        ]
      }
    ],
    factual: [
      {
        query: 'revenue growth',
        response: `According to the Q3 Financial Report, the company achieved exceptional revenue growth across multiple segments:

**Overall Revenue Growth**: 15.2% YoY increase to $3.8B
**Key Growth Drivers**:
- Technology Services: +23.4% ($1.2B)
- Cloud Infrastructure: +31.8% ($890M)
- Software Licensing: +8.9% ($1.1B)
- Professional Services: +12.1% ($620M)

**Geographic Performance**:
- North America: +18.2%
- Europe: +14.7%
- Asia-Pacific: +21.3%

The growth was primarily driven by increased market share in cloud computing and successful product launches in the AI/ML space.`,
        citations: [
          { title: 'Financial_Report_Q3.pdf', page: 8, section: 'Executive Summary', screenshot: '/placeholder.svg?height=400&width=300' },
          { title: 'Financial_Report_Q3.pdf', page: 15, section: 'Revenue Analysis', screenshot: '/placeholder.svg?height=400&width=300' },
          { title: 'Financial_Report_Q3.pdf', page: 23, section: 'Market Performance', screenshot: '/placeholder.svg?height=400&width=300' }
        ],
        processingTrace: [
          { step: 'Router Node', duration: 95 },
          { step: 'Document Node', duration: 1200 },
          { step: 'Answer Formatter', duration: 180 }
        ]
      }
    ],
    conversational: [
      {
        query: 'general financial',
        response: `I'm here to help you analyze financial data and documents. I can assist with:

**Financial Analysis**:
- Revenue and profit trend analysis
- Moving averages and technical indicators
- Growth rate calculations
- Market performance comparisons

**Document Analysis**:
- Financial report summaries
- Key metric extraction
- Risk assessment reviews
- Competitive analysis

What specific financial information would you like me to analyze for you?`,
        citations: [],
        processingTrace: [
          { step: 'Router Node', duration: 80 },
          { step: 'Persona Selector', duration: 45 },
          { step: 'Answer Formatter', duration: 120 }
        ]
      }
    ]
  },

  // Legal Advisor responses
  'Legal Advisor': {
    factual: [
      {
        query: 'data breach retention',
        response: `According to the Legal Contract 2024, data breach retention is governed by Section 4.2 "Data Privacy and Security":

**Breach Notification Requirements**:
- Immediate notification (within 24 hours) to all affected parties
- Detailed incident report within 72 hours
- Regulatory compliance reporting as required by jurisdiction

**Data Retention During Breach Investigation**:
- All affected data must be preserved for minimum 2 years
- Forensic copies maintained in secure, isolated environment
- Access restricted to authorized investigation personnel only

**Retention Policies**:
- Personal data: 7 years post-breach resolution
- Transaction records: 10 years as per regulatory requirements
- Communication logs: 5 years for audit purposes

**Compliance Standards**:
- GDPR Article 33 and 34 compliance
- SOX requirements for financial data
- Industry-specific regulations (HIPAA, PCI-DSS as applicable)`,
        citations: [
          { title: 'Legal_Contract_2024.pdf', page: 12, section: 'Data Privacy', screenshot: '/placeholder.svg?height=400&width=300' },
          { title: 'Legal_Contract_2024.pdf', page: 14, section: 'Breach Clauses', screenshot: '/placeholder.svg?height=400&width=300' }
        ],
        processingTrace: [
          { step: 'Router Node', duration: 110 },
          { step: 'Document Node', duration: 980 },
          { step: 'Answer Formatter', duration: 160 }
        ]
      }
    ],
    conversational: [
      {
        query: 'legal compliance',
        response: `I'm your Legal Advisor, specializing in contract analysis and compliance matters. I can help you with:

**Contract Analysis**:
- Terms and conditions review
- Liability and risk assessment
- Breach clause interpretation
- Termination procedures

**Compliance Guidance**:
- Data privacy regulations (GDPR, CCPA)
- Industry-specific compliance requirements
- Risk mitigation strategies
- Legal document interpretation

How can I assist you with your legal and compliance questions today?`,
        citations: [],
        processingTrace: [
          { step: 'Router Node', duration: 75 },
          { step: 'Persona Selector', duration: 55 },
          { step: 'Answer Formatter', duration: 100 }
        ]
      }
    ]
  },

  // General Assistant responses
  'General Assistant': {
    conversational: [
      {
        query: 'general help',
        response: `Hello! I'm your General Assistant, capable of handling a wide range of queries across different domains. I can help you with:

**Document Analysis**:
- PDF content extraction and summarization
- Key information identification
- Cross-document comparisons

**Data Analysis**:
- CSV data interpretation
- Basic calculations and trends
- Data visualization insights

**Multi-Domain Support**:
- Financial document review
- Legal contract analysis
- General research assistance

**Specialized Features**:
- Citation tracking with page numbers
- Screenshot references
- Suggested follow-up queries

What would you like to explore today? I can switch to specialized personas (Financial Analyst or Legal Advisor) for more focused expertise.`,
        citations: [],
        processingTrace: [
          { step: 'Router Node', duration: 65 },
          { step: 'Persona Selector', duration: 40 },
          { step: 'Answer Formatter', duration: 95 }
        ]
      }
    ]
  }
}

// Suggested queries based on context and query type
export const suggestedQueries: Record<string, SuggestedQuery[]> = {
  'Financial Analyst': [
    { id: '1', text: 'What are the key financial metrics for Q3?', category: 'factual', confidence: 0.9 },
    { id: '2', text: 'Show me the revenue breakdown by segment', category: 'factual', confidence: 0.85 },
    { id: '3', text: 'Calculate the 50-day moving average for AAPL', category: 'mathematical', confidence: 0.8 },
    { id: '4', text: 'When did MSFT cross its 200-day MA in 2024?', category: 'mathematical', confidence: 0.75 },
    { id: '5', text: 'Compare YoY growth rates across all segments', category: 'mathematical', confidence: 0.7 }
  ],
  'Legal Advisor': [
    { id: '6', text: 'What compliance issues should I be aware of?', category: 'factual', confidence: 0.9 },
    { id: '7', text: 'Are there penalties for breach of NDA clauses?', category: 'factual', confidence: 0.85 },
    { id: '8', text: 'What are the termination procedures in the contract?', category: 'factual', confidence: 0.8 },
    { id: '9', text: 'How long is personal data retained after breach?', category: 'factual', confidence: 0.75 },
    { id: '10', text: 'What are the liability limits in our agreement?', category: 'factual', confidence: 0.7 }
  ],
  'General Assistant': [
    { id: '11', text: 'Summarize the key points from all documents', category: 'conversational', confidence: 0.9 },
    { id: '12', text: 'What documents have been uploaded?', category: 'conversational', confidence: 0.85 },
    { id: '13', text: 'Switch to Financial Analyst persona', category: 'conversational', confidence: 0.8 },
    { id: '14', text: 'Help me understand the data structure', category: 'conversational', confidence: 0.75 },
    { id: '15', text: 'What can you help me with?', category: 'conversational', confidence: 0.7 }
  ]
}

// Enhanced query processing simulation
export const simulateQueryProcessing = (query: string, persona: string): {
  queryType: QueryType,
  estimatedDuration: number,
  nodeSequence: string[]
} => {
  const lowerQuery = query.toLowerCase()
  
  // Determine query type based on content
  let queryType: QueryType = 'conversational'
  let nodeSequence: string[] = ['Router Node', 'Persona Selector']
  
  if (lowerQuery.includes('average') || lowerQuery.includes('calculate') || lowerQuery.includes('trend') || lowerQuery.includes('growth rate')) {
    queryType = 'mathematical'
    nodeSequence = ['Router Node', 'Database Node', 'Math Node', 'Answer Formatter']
  } else if (lowerQuery.includes('clause') || lowerQuery.includes('section') || lowerQuery.includes('page') || lowerQuery.includes('document')) {
    queryType = 'factual'
    nodeSequence = ['Router Node', 'Document Node', 'Answer Formatter']
  } else {
    nodeSequence = ['Router Node', 'Persona Selector', 'Suggestion Node', 'Answer Formatter']
  }
  
  // Estimate duration based on complexity
  const baseDuration = 1000
  const complexityMultiplier = queryType === 'mathematical' ? 2.5 : queryType === 'factual' ? 1.8 : 1.2
  const estimatedDuration = baseDuration * complexityMultiplier
  
  return { queryType, estimatedDuration, nodeSequence }
}

// File processing simulation
export const mockFileProcessing = (file: File): Promise<{
  chunks: number,
  indexed: boolean,
  processingTime: number,
  extractedSections: string[]
}> => {
  return new Promise((resolve) => {
    const processingTime = Math.random() * 3000 + 2000 // 2-5 seconds
    
    setTimeout(() => {
      const chunks = Math.floor(Math.random() * 100) + 20
      const sections = file.name.includes('financial') 
        ? ['Executive Summary', 'Revenue Analysis', 'Market Performance']
        : file.name.includes('legal')
        ? ['Terms and Conditions', 'Data Privacy', 'Breach Clauses']
        : ['Data Overview', 'Key Metrics', 'Trends']
      
      resolve({
        chunks,
        indexed: true,
        processingTime,
        extractedSections: sections
      })
    }, processingTime)
  })
} 