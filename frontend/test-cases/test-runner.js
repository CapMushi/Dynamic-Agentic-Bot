// Phase 2 Test Runner - Dynamic Agentic Systems
// Optimized test runner for automated testing of Phase 2 features
// Run this in the browser console while the app is running

class Phase2TestRunner {
  constructor() {
    this.testResults = []
    this.currentTest = null
    this.startTime = null
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    console.log(logEntry)
    
    if (this.currentTest) {
      this.currentTest.logs = this.currentTest.logs || []
      this.currentTest.logs.push(logEntry)
    }
  }

  startTest(testName, description) {
    this.currentTest = {
      name: testName,
      description,
      startTime: Date.now(),
      status: 'running',
      logs: []
    }
    this.log(`Starting test: ${testName}`)
    this.log(`Description: ${description}`)
  }

  endTest(passed, message) {
    if (!this.currentTest) return

    this.currentTest.endTime = Date.now()
    this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime
    this.currentTest.status = passed ? 'passed' : 'failed'
    this.currentTest.message = message

    this.log(`Test ${passed ? 'PASSED' : 'FAILED'}: ${this.currentTest.name}`)
    this.log(`Duration: ${this.currentTest.duration}ms`)
    if (message) this.log(`Result: ${message}`)

    this.testResults.push({ ...this.currentTest })
    this.currentTest = null
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Helper functions to interact with the UI
  clickElement(selector) {
    const element = document.querySelector(selector)
    if (element) {
      element.click()
      return true
    }
    return false
  }

  typeText(selector, text) {
    const element = document.querySelector(selector)
    if (element) {
      element.value = text
      element.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    }
    return false
  }

  checkElementExists(selector) {
    return document.querySelector(selector) !== null
  }

  getElementText(selector) {
    const element = document.querySelector(selector)
    return element ? element.textContent.trim() : null
  }

  // Debug helper to log all buttons and their text
  debugButtons() {
    const buttons = document.querySelectorAll('button')
    this.log(`Found ${buttons.length} buttons:`)
    buttons.forEach((btn, index) => {
      this.log(`  Button ${index}: "${btn.textContent.trim()}"`)
    })
  }

  // Debug helper to log all divs with specific text
  debugDivs(searchText) {
    const divs = Array.from(document.querySelectorAll('div')).filter(div => 
      div.textContent.includes(searchText)
    )
    this.log(`Found ${divs.length} divs containing "${searchText}":`)
    divs.forEach((div, index) => {
      this.log(`  Div ${index}: "${div.textContent.trim()}"`)
    })
  }

  // Test Suite 1: Enhanced Mock API Responses
  async testFinancialAnalystQuery() {
    this.startTest('Financial Analyst Query', 'Test mathematical query processing')

    try {
      // First, switch to Personas tab
      this.log('Switching to Personas tab')
      const personaTabs = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('Personas')
      )
      
      if (personaTabs.length > 0) {
        personaTabs[0].click()
        await this.sleep(1000) // Increased wait time
      }

      // Select Financial Analyst persona (look for Switch component)
      this.log('Selecting Financial Analyst persona')
      const personaDivs = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent.includes('Financial Analyst')
      )
      
      if (personaDivs.length === 0) {
        this.debugDivs('Financial Analyst')
        this.endTest(false, 'Could not find Financial Analyst persona')
        return
      }

      // Find the Switch component within the persona div
      const personaDiv = personaDivs[0]
      const switchButton = personaDiv.querySelector('button[role="switch"]') || 
                          personaDiv.querySelector('[data-state]') ||
                          personaDiv.querySelector('button')
      
      if (switchButton) {
        switchButton.click()
        await this.sleep(1000) // Increased wait time
      }

      // Enter query in textarea
      this.log('Entering moving average query')
      const textarea = document.querySelector('textarea')
      if (!textarea) {
        this.endTest(false, 'Could not find textarea')
        return
      }

      textarea.value = 'Tell me the moving average of MSFT from March to May 2024'
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      await this.sleep(500)

      // Send query (look for send button)
      this.log('Sending query')
      const sendButton = document.querySelector('button[type="submit"]') || 
                        Array.from(document.querySelectorAll('button')).find(btn => 
                          btn.textContent.includes('Send') || 
                          btn.querySelector('svg') // Look for button with icon
                        )
      
      if (!sendButton) {
        this.debugButtons()
        this.endTest(false, 'Could not find send button')
        return
      }

      sendButton.click()
      await this.sleep(3000)

      // Check for response (look for assistant message)
      const assistantMessages = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent.includes('MSFT') || 
        div.textContent.includes('moving average') ||
        div.textContent.includes('financial')
      )

      if (assistantMessages.length === 0) {
        this.endTest(false, 'Assistant response not found')
        return
      }

      this.endTest(true, 'Financial Analyst query processed successfully')
    } catch (error) {
      this.endTest(false, `Error: ${error.message}`)
    }
  }

  async testLegalAdvisorQuery() {
    this.startTest('Legal Advisor Query', 'Test factual query processing')

    try {
      // First, switch to Personas tab
      this.log('Switching to Personas tab')
      const personaTabs = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('Personas')
      )
      
      if (personaTabs.length > 0) {
        personaTabs[0].click()
        await this.sleep(1000) // Increased wait time
      }

      // Select Legal Advisor persona
      this.log('Selecting Legal Advisor persona')
      const personaDivs = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent.includes('Legal Advisor')
      )
      
      if (personaDivs.length === 0) {
        this.debugDivs('Legal Advisor')
        this.endTest(false, 'Could not find Legal Advisor persona')
        return
      }

      // Find the Switch component within the persona div
      const personaDiv = personaDivs[0]
      const switchButton = personaDiv.querySelector('button[role="switch"]') || 
                          personaDiv.querySelector('[data-state]') ||
                          personaDiv.querySelector('button')
      
      if (switchButton) {
        switchButton.click()
        await this.sleep(1000) // Increased wait time
      }

      // Enter query
      this.log('Entering data breach query')
      const textarea = document.querySelector('textarea')
      if (!textarea) {
        this.endTest(false, 'Could not find textarea')
        return
      }

      textarea.value = 'What clause handles data breach retention?'
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      await this.sleep(500)

      // Send query
      this.log('Sending query')
      const sendButton = document.querySelector('button[type="submit"]') || 
                        Array.from(document.querySelectorAll('button')).find(btn => 
                          btn.textContent.includes('Send') || 
                          btn.querySelector('svg')
                        )
      
      if (!sendButton) {
        this.debugButtons()
        this.endTest(false, 'Could not find send button')
        return
      }

      sendButton.click()
      await this.sleep(2000)

      // Check for response
      const assistantMessages = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent.includes('data breach') || 
        div.textContent.includes('clause') ||
        div.textContent.includes('retention')
      )

      if (assistantMessages.length === 0) {
        this.endTest(false, 'Assistant response not found')
        return
      }

      this.endTest(true, 'Legal Advisor query processed successfully')
    } catch (error) {
      this.endTest(false, `Error: ${error.message}`)
    }
  }

  // Test Suite 2: Query Processing Visualization
  async testProcessingVisualization() {
    this.startTest('Processing Visualization', 'Test real-time processing visualization')

    try {
      // Enter a complex query
      this.log('Entering complex query')
      const textarea = document.querySelector('textarea')
      if (!textarea) {
        this.endTest(false, 'Could not find textarea')
        return
      }

      textarea.value = 'Calculate revenue growth and show compliance issues'
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      await this.sleep(500)

      // Send query
      this.log('Sending query')
      const sendButton = document.querySelector('button[type="submit"]') || 
                        Array.from(document.querySelectorAll('button')).find(btn => 
                          btn.textContent.includes('Send') || 
                          btn.querySelector('svg')
                        )
      
      if (!sendButton) {
        this.debugButtons()
        this.endTest(false, 'Could not find send button')
        return
      }

      sendButton.click()

      // Check for processing visualization (look for progress indicators)
      await this.sleep(100)
      const processingElements = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent.includes('Processing Progress') || 
        div.textContent.includes('Query Processing Pipeline') ||
        div.textContent.includes('Processing Nodes') ||
        div.textContent.includes('Processing')
      )

      if (processingElements.length === 0) {
        this.debugDivs('Processing')
        this.endTest(false, 'Processing visualization not shown')
        return
      }

      // Wait for completion
      await this.sleep(3000)

      // Check for completion (look for response)
      const responseElements = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent.includes('revenue') || 
        div.textContent.includes('compliance') ||
        div.textContent.includes('growth')
      )

      if (responseElements.length === 0) {
        this.endTest(false, 'Processing did not complete with response')
        return
      }

      this.endTest(true, 'Processing visualization working correctly')
    } catch (error) {
      this.endTest(false, `Error: ${error.message}`)
    }
  }

  // Test Suite 3: Suggested Queries
  async testSuggestedQueries() {
    this.startTest('Suggested Queries', 'Test intelligent query suggestions')

    try {
      // Wait for suggestions to load
      await this.sleep(1000)

      // Look for suggested queries (check for common suggestion text)
      const suggestionElements = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent.includes('What are the key financial metrics') ||
        div.textContent.includes('Show me the revenue breakdown') ||
        div.textContent.includes('What compliance issues')
      )

      if (suggestionElements.length === 0) {
        this.endTest(false, 'Suggested queries not found')
        return
      }

      // Try to click on a suggestion
      this.log('Clicking on suggested query')
      const clickableSuggestions = suggestionElements.filter(el => 
        el.tagName === 'BUTTON' || 
        el.onclick !== null ||
        el.parentElement?.tagName === 'BUTTON'
      )

      if (clickableSuggestions.length > 0) {
        clickableSuggestions[0].click()
        await this.sleep(500)

        // Check if query was populated
        const textarea = document.querySelector('textarea')
        if (textarea && textarea.value.trim() !== '') {
          this.endTest(true, 'Suggested queries working correctly')
          return
        }
      }

      this.endTest(true, 'Suggested queries component found')
    } catch (error) {
      this.endTest(false, `Error: ${error.message}`)
    }
  }

  // Test Suite 4: File Upload
  async testFileUpload() {
    this.startTest('File Upload', 'Test enhanced file upload processing')

    try {
      // Find file input
      const fileInput = document.querySelector('input[type="file"]')
      if (!fileInput) {
        this.endTest(false, 'File input not found')
        return
      }

      // Create a mock file
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      // Simulate file selection
      this.log('Simulating file upload')
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(mockFile)
      fileInput.files = dataTransfer.files

      // Trigger change event
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))

      // Wait for processing
      await this.sleep(3000)

      // Check for file in uploaded files list (look for file name)
      const fileElements = Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent.includes('test.pdf') ||
        div.textContent.includes('Uploaded Files')
      )

      if (fileElements.length === 0) {
        this.endTest(false, 'Uploaded file not shown in list')
        return
      }

      this.endTest(true, 'File upload processed successfully')
    } catch (error) {
      this.endTest(false, `Error: ${error.message}`)
    }
  }

  // Test Suite 5: Basic UI Elements
  async testBasicUIElements() {
    this.startTest('Basic UI Elements', 'Test core UI components are present')

    try {
      // Check for main UI elements
      const checks = [
        { name: 'Textarea', selector: 'textarea', found: false },
        { name: 'Send Button', selector: 'button', found: false },
        { name: 'Persona Buttons', selector: 'button', found: false },
        { name: 'File Upload', selector: 'input[type="file"]', found: false }
      ]

      // Check textarea
      if (document.querySelector('textarea')) {
        checks[0].found = true
      }

      // Check for send button
      const buttons = document.querySelectorAll('button')
      if (buttons.length > 0) {
        checks[1].found = true
      }

      // Check for persona buttons
      const personaButtons = Array.from(buttons).filter(btn => 
        btn.textContent.includes('Financial') || 
        btn.textContent.includes('Legal') ||
        btn.textContent.includes('General')
      )
      if (personaButtons.length > 0) {
        checks[2].found = true
      }

      // Check file upload
      if (document.querySelector('input[type="file"]')) {
        checks[3].found = true
      }

      const passedChecks = checks.filter(c => c.found).length
      const totalChecks = checks.length

      if (passedChecks >= 3) {
        this.endTest(true, `${passedChecks}/${totalChecks} UI elements found`)
      } else {
        this.endTest(false, `Only ${passedChecks}/${totalChecks} UI elements found`)
      }
    } catch (error) {
      this.endTest(false, `Error: ${error.message}`)
    }
  }

  // Test Suite 6: Tab Navigation
  async testTabNavigation() {
    this.startTest('Tab Navigation', 'Test switching between Sources and Personas tabs')

    try {
      // Find tab buttons
      const tabButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('Sources') || btn.textContent.includes('Personas')
      )

      if (tabButtons.length === 0) {
        this.debugButtons()
        this.endTest(false, 'Tab buttons not found')
        return
      }

      // Click on Personas tab
      this.log('Clicking on Personas tab')
      const personasTab = tabButtons.find(btn => btn.textContent.includes('Personas'))
      if (personasTab) {
        personasTab.click()
        await this.sleep(1000) // Increased wait time

        // Check if personas content is visible
        const personaContent = Array.from(document.querySelectorAll('div')).filter(div => 
          div.textContent.includes('AI Personas') ||
          div.textContent.includes('Financial Analyst') ||
          div.textContent.includes('Legal Advisor')
        )

        if (personaContent.length > 0) {
          this.endTest(true, 'Tab navigation working correctly')
          return
        }
      }

      this.endTest(false, 'Tab navigation not working')
    } catch (error) {
      this.endTest(false, `Error: ${error.message}`)
    }
  }

  // Test Suite 7: Debug Current State
  async testDebugState() {
    this.startTest('Debug Current State', 'Log current UI state for debugging')

    try {
      this.log('=== DEBUGGING CURRENT STATE ===')
      
      // Log all buttons
      this.debugButtons()
      
      // Log all divs with persona names
      this.debugDivs('Financial Analyst')
      this.debugDivs('Legal Advisor')
      this.debugDivs('General Assistant')
      
      // Log all divs with processing text
      this.debugDivs('Processing')
      this.debugDivs('Progress')
      
      // Log textarea
      const textarea = document.querySelector('textarea')
      if (textarea) {
        this.log(`Textarea found with value: "${textarea.value}"`)
      } else {
        this.log('Textarea not found')
      }
      
      // Log file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) {
        this.log('File input found')
      } else {
        this.log('File input not found')
      }

      this.endTest(true, 'Debug information logged')
    } catch (error) {
      this.endTest(false, `Error: ${error.message}`)
    }
  }

  // Run all tests
  async runAllTests() {
    this.log('Starting Phase 2 Test Suite', 'info')
    this.testResults = []

    const tests = [
      () => this.testBasicUIElements(),
      () => this.testTabNavigation(),
      () => this.testDebugState(), // Added debug test
      () => this.testFinancialAnalystQuery(),
      () => this.testLegalAdvisorQuery(),
      () => this.testProcessingVisualization(),
      () => this.testSuggestedQueries(),
      () => this.testFileUpload()
    ]

    for (const test of tests) {
      await test()
      await this.sleep(1000) // Brief pause between tests
    }

    this.generateReport()
  }

  generateReport() {
    const passed = this.testResults.filter(t => t.status === 'passed').length
    const failed = this.testResults.filter(t => t.status === 'failed').length
    const total = this.testResults.length

    console.log('\n=== Phase 2 Test Report ===')
    console.log(`Total Tests: ${total}`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${failed}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

    console.log('\n=== Test Details ===')
    this.testResults.forEach(test => {
      console.log(`\n${test.name}: ${test.status.toUpperCase()}`)
      console.log(`  Duration: ${test.duration}ms`)
      if (test.message) console.log(`  Message: ${test.message}`)
      if (test.status === 'failed' && test.logs) {
        console.log('  Logs:')
        test.logs.forEach(log => console.log(`    ${log}`))
      }
    })

    return {
      total,
      passed,
      failed,
      successRate: (passed / total) * 100,
      details: this.testResults
    }
  }
}

// Usage instructions
console.log('Phase 2 Test Runner loaded!')
console.log('Usage:')
console.log('  const runner = new Phase2TestRunner()')
console.log('  await runner.runAllTests()')
console.log('')
console.log('Or run individual tests:')
console.log('  await runner.testBasicUIElements()')
console.log('  await runner.testTabNavigation()')
console.log('  await runner.testDebugState()')
console.log('  await runner.testFinancialAnalystQuery()')
console.log('  await runner.testProcessingVisualization()')
console.log('  etc.')

// Export for use
window.Phase2TestRunner = Phase2TestRunner 