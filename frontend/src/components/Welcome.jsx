const prompts = [
  'Tell me about your experience',
  'What are your key skills?',
  'Describe your recent projects',
  'Why should we hire you?',
]

export function Welcome({ onPromptClick }) {
  return (
    <div className="welcome">
      <div className="welcome-logo">Y</div>
      <h1>How can I help you today?</h1>
      <p>Ask questions about Yogeeshwar's experience, skills, projects, and education.</p>
      <div className="prompt-grid">
        {prompts.map((prompt) => (
          <button key={prompt} onClick={(event) => onPromptClick(event, prompt)}>
            {prompt}
            <span>&rarr;</span>
          </button>
        ))}
      </div>
    </div>
  )
}
