# Hermes Agent Terminal Usage Guide

This guide explains how to interact with the Hermes AI agent via terminal to accomplish various tasks, including the actual bash commands Hermes would execute and how to use the Hermes CLI itself.

## Using the Hermes CLI

The Hermes agent provides a command-line interface with various options:

### Starting Interactive Chat
```bash
hermes
```
Starts an interactive chat session where you can converse naturally with Hermes.

### Single Query Mode (-q flag)
```bash
hermes chat -q "Your question or task here"
```
Executes a single query and exits. Perfect for quick tasks or commands.

Examples:
```bash
hermes chat -q "Create a Python script that sorts a list of dictionaries by a specific key"
hermes chat -q "Search for the latest news about climate change"
hermes chat -q "Read the contents of config.json and show me the database settings"
hermes chat -q "Set up a basic Express.js server with one endpoint"
```

### Resuming Sessions
```bash
hermes -c              # Resume the most recent session
hermes -c "my project" # Resume a session by name (latest in lineage)
hermes --resume <session_id>  # Resume a specific session by ID
```

### Preloading Skills
```bash
hermes -s hermes-agent-dev,github-auth  # Preload specific skills
```

### Other Useful Options
```bash
hermes --yolo          # Bypass dangerous command approval prompts (use with caution)
hermes --version       # Show version information
hermes setup           # Run the interactive setup wizard
hermes model           # Select default model and provider
hermes config          # View and edit configuration
hermes sessions list   # List past sessions
```

## Starting a Conversation

To begin chatting with Hermes, simply send a message in the terminal interface. Hermes is designed to understand natural language requests and can perform tasks using its available tools.

## Basic Interaction Patterns

### Asking for Information
You can ask Hermes to search for information:
- "What's the latest news about AI agents?"
- "Find documentation for Python's requests library"
- "Search for tutorials on machine learning with PyTorch"

### Requesting Actions
Hermes can perform actions using its tools:
- "Create a Python script that calculates Fibonacci numbers"
- "Set up a basic web server with Node.js"
- "Analyze this CSV file for trends"
- "Deploy a simple application to a cloud service"

### File Operations
Hermes can read, write, and modify files:
- "Read the contents of config.json"
- "Create a new file called todo.txt with my tasks"
- "Update the README.md file with installation instructions"
- "Search for all Python files in the project directory"

## Available Tool Categories

Hermes has access to various toolsets that enable different capabilities:

### Terminal & System
- Execute shell commands, run scripts, manage processes
- Install packages, build projects, system administration

### File Operations
- Read, write, search, and modify files
- Search file contents, find files by name/pattern

### Web Capabilities
- Search the web for information
- Extract content from web pages
- Navigate and interact with websites (when needed)

### Development Tools
- Git operations, code review, debugging
- Testing, building, deployment workflows

### Data & Analysis
- Data science tools, Jupyter notebooks
- Machine learning operations, model training/inference

### Communication
- Email management, messaging platforms
- Social media interactions (when configured)

## Example Workflows with Actual Commands

### 1. Creating a New Python Web Scraper Project
```
User: "Create a new Python project for a web scraper"
Hermes would execute:
mkdir -p web-scraper/{src,tests,docs}
cd web-scraper
python3 -m venv venv
source venv/bin/activate
pip install requests beautifulsoup4 lxml
cat > src/scraper.py << 'EOF'
import requests
from bs4 import BeautifulSoup
import sys

def scrape_website(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        return soup.get_text()
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python scraper.py <url>")
        sys.exit(1)
    print(scrape_website(sys.argv[1]))
EOF
cat > requirements.txt << 'EOF'
requests==2.31.0
beautifulsoup4==4.12.2
lxml==4.9.3
EOF
cat > README.md << 'EOF'
# Web Scraper

A simple Python web scraper using requests and BeautifulSoup.

## Installation
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Usage
```bash
python src/scraper.py https://example.com
```
EOF
git init
git add .
git commit -m "Initial commit: web scraper project"
```

### 2. Research Task: Latest Quantum Computing Developments
```
User: "Research the latest developments in quantum computing"
Hermes would execute:
# Search for recent articles
curl -s "https://news.google.com/rss/search?q=quantum+computing+2024" | grep -E "<title>|<pubDate>" | head -20
# Search arXiv for recent papers
curl -s "http://export.arxiv.org/api/query?search_query=all:quantum+computing&start=0&max_results=5&sortBy=submittedDate&sortOrder=desc" | grep -E "<title>|<published>" | head -10
# Create research summary
cat > quantum_research_summary.md << 'EOF'
# Quantum Computing Research Summary - $(date +%Y-%m-%d)

## Recent News
[News items would be populated here from web search]

## Recent arXiv Papers
[Paper titles and dates would be populated here]

## Key Trends
- Error correction advances
- Quantum advantage demonstrations
- Industry partnerships growing
EOF
```

### 3. Debugging Assistance: Python Import Error
```
User: "My Python script is failing with an import error"
Hermes would execute:
# First, ask to see the error and code (simulated here)
cat > broken_script.py << 'EOF'
import nonexistent_module
print("Hello World")
EOF
python3 broken_script.py 2>&1
# Then fix it
cat > fixed_script.py << 'EOF'
# Fixed version - removed invalid import
print("Hello World")
EOF
python3 fixed_script.py
# Or if it was a path issue:
# export PYTHONPATH="${PYTHONPATH}:/path/to/modules}"
# python3 script.py
```

## Common Bash Commands Hermes Uses

### File Operations
```bash
# Read files
cat filename.txt
head -20 filename.txt
tail -20 filename.txt

# Write files
cat > newfile.txt << 'EOF'
content here
EOF

# Search files
grep -r "pattern" .
find . -name "*.py" -type f
find . -type f -name "*.txt" -exec grep -l "pattern" {} \;

# Directory operations
mkdir -p project/{src,docs,tests}
ls -la
pwd
cd /path/to/directory
```

### Development Workflows
```bash
# Git operations
git init
git add .
git commit -m "Initial commit"
git status
git log --oneline -10

# Python
python3 -m venv venv
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt
python3 script.py
python3 -m pytest tests/

# Node.js
npm init -y
npm install express
node server.js

# Build tools
make
cmake .
gcc -o program program.c
```

### System Administration
```bash
# Package management (Ubuntu/Debian)
sudo apt update
sudo apt install package-name

# Package management (CentOS/RHEL)
sudo yum install package-name

# Service management
systemctl status service-name
systemctl start service-name
systemctl enable service-name

# Process management
ps aux | grep process-name
kill -9 PID
top
htop

# Networking
curl -I https://example.com
wget https://example.com/file.zip
netstat -tulnp
ssh user@server
```

### Data Processing
```bash
# CSV processing
cut -d, -f1,3 data.csv
awk -F, '{print $1}' data.csv
sort -t, -k2 data.csv
uniq -c data.csv

# JSON processing (if jq is installed)
jq '.key' data.json
jq '.items[].name' data.json

# Text processing
sed 's/old/new/g' file.txt
tr '[:lower:]' '[:upper:]' < file.txt
wc -l file.txt
```

## Tips for Effective Communication

1. **Be Specific**: Clearly describe what you want accomplished
2. **Provide Context**: Share relevant details about your project or environment
3. **Iterate**: If the first attempt isn't perfect, provide feedback for refinement
4. **Use Natural Language**: Talk to Hermes like you would to a knowledgeable colleague
5. **Ask for Clarification**: If Hermes seems unsure, it will ask questions to better understand

## What Hermes Can Do

- **Code Generation**: Write scripts, applications, and utilities in multiple languages
- **System Administration**: Manage servers, install software, configure systems
- **Research & Analysis**: Gather information, analyze data, create reports
- **Automation**: Create workflows, schedule tasks, build pipelines
- **Learning & Teaching**: Explain concepts, create tutorials, help with learning

## Limitations

- Hermes operates in a secure sandbox environment
- Some tools may require specific configurations or credentials
- Very long-running tasks may need to be broken into smaller steps
- For security reasons, certain dangerous operations are restricted

## Getting Help

If you're unsure how to proceed or want to explore capabilities:
- Ask: "What can you help me with?"
- Request examples: "Show me some examples of what you can do"
- Explore skills: "What specialized skills do you have available?"

Remember: Hermes learns from interactions and can remember preferences and useful patterns across sessions when appropriate.

Start by telling Hermes what you'd like to accomplish, either through interactive chat or using `hermes chat -q "your task"` for quick commands!