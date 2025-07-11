/**
 * AI Service for Educational Tutoring
 * Provides intelligent, educational responses using Hugging Face API
 * Falls back to smart educational content when API is unavailable
 */

interface AIResponse {
  content: string;
  topic: string;
  suggestedTopics: string[];
}

interface ConversationContext {
  previousMessages?: string[];
  learningLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredStyle?: 'explanatory' | 'examples' | 'practice';
}

export class AITutorService {
  private apiKey: string | undefined;
  private baseUrl = 'https://api-inference.huggingface.co/models';
  
  constructor() {
    this.apiKey = process.env.HUGGING_FACE_API_KEY;
  }

  async generateResponse(message: string, context?: ConversationContext): Promise<AIResponse> {
    const topic = this.categorizeTopic(message);
    
    // Try Hugging Face API first if available
    if (this.apiKey) {
      try {
        const aiResponse = await this.callHuggingFaceAPI(message, context);
        if (aiResponse) {
          return {
            content: this.formatEducationalResponse(aiResponse, message),
            topic,
            suggestedTopics: this.getSuggestedTopics(topic)
          };
        }
      } catch (error) {
        console.error('Hugging Face API error:', error);
      }
    }

    // Fallback to intelligent educational responses
    return this.getEducationalResponse(message, topic);
  }

  private async callHuggingFaceAPI(message: string, context?: ConversationContext): Promise<string | null> {
    const models = [
      'microsoft/DialoGPT-large',
      'microsoft/DialoGPT-medium',
      'facebook/blenderbot-400M-distill'
    ];

    for (const model of models) {
      try {
        const response = await fetch(`${this.baseUrl}/${model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: this.buildEducationalPrompt(message, context),
            parameters: {
              max_new_tokens: 200,
              temperature: 0.7,
              do_sample: true,
              return_full_text: false
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data[0] && data[0].generated_text) {
            return data[0].generated_text;
          }
        }
      } catch (error) {
        console.warn(`Model ${model} failed:`, error);
        continue;
      }
    }

    return null;
  }

  private buildEducationalPrompt(message: string, context?: ConversationContext): string {
    const level = context?.learningLevel || 'beginner';
    const style = context?.preferredStyle || 'explanatory';
    
    let prompt = `You are an expert, patient tutor. A ${level} student asks: "${message}"\n\n`;
    
    if (style === 'examples') {
      prompt += 'Provide a clear explanation with practical examples. ';
    } else if (style === 'practice') {
      prompt += 'Explain the concept and suggest practice exercises. ';
    } else {
      prompt += 'Provide a clear, step-by-step explanation. ';
    }
    
    prompt += 'Keep your response under 150 words and focus on understanding.';
    
    return prompt;
  }

  private formatEducationalResponse(aiResponse: string, originalMessage: string): string {
    let formatted = aiResponse.trim();
    
    // Clean up common AI artifacts
    formatted = formatted.replace(/^\s*assistant:\s*/i, '');
    formatted = formatted.replace(/^\s*ai:\s*/i, '');
    formatted = formatted.replace(/^\s*tutor:\s*/i, '');
    
    // Ensure educational framing
    if (!formatted.toLowerCase().includes('learn') && 
        !formatted.toLowerCase().includes('understand') && 
        !formatted.toLowerCase().includes('concept') &&
        !formatted.toLowerCase().includes('example')) {
      formatted = `Let me help you understand this concept. ${formatted}`;
    }
    
    return formatted;
  }

  private getEducationalResponse(message: string, topic: string): AIResponse {
    const responses = {
      'Python Programming': this.getPythonResponse(message),
      'Web Development': this.getWebDevResponse(message),
      'Data Science': this.getDataScienceResponse(message),
      'Mathematics': this.getMathResponse(message),
      'General': this.getGeneralResponse(message)
    };

    return {
      content: responses[topic as keyof typeof responses] || responses.General,
      topic,
      suggestedTopics: this.getSuggestedTopics(topic)
    };
  }

  private getPythonResponse(message: string): string {
    if (message.toLowerCase().includes('variable')) {
      return "Variables in Python are like labeled boxes that store data. For example: `name = 'Alice'` stores the text 'Alice' in a variable called 'name'. You can then use `print(name)` to display it. Variables can hold different types of data like numbers, text, or lists. What specific aspect of variables would you like to explore?";
    }
    if (message.toLowerCase().includes('function')) {
      return "Functions are reusable blocks of code that perform specific tasks. Think of them like recipes - you define the steps once, then use them whenever needed. For example: `def greet(name): return f'Hello, {name}!'` creates a function that greets someone. You call it with `greet('Alice')`. Would you like to learn about parameters or return values?";
    }
    if (message.toLowerCase().includes('loop')) {
      return "Loops let you repeat code multiple times. A `for` loop is like saying 'do this for each item': `for i in range(5): print(i)` prints numbers 0-4. A `while` loop continues until a condition is false: `while x < 10: x += 1`. Which type of loop would you like to practice with?";
    }
    return "Python is a beginner-friendly programming language. It uses simple, readable syntax that's close to English. You can use it for web development, data analysis, automation, and more. What specific Python concept would you like to learn about - variables, functions, loops, or data structures?";
  }

  private getWebDevResponse(message: string): string {
    if (message.toLowerCase().includes('html')) {
      return "HTML is the structure of web pages, like the skeleton of a building. Tags like `<h1>Title</h1>` create headings, `<p>text</p>` creates paragraphs, and `<div>` groups content. Think of it as marking up your content to tell the browser what each piece is. Would you like to learn about specific HTML elements or how to create your first webpage?";
    }
    if (message.toLowerCase().includes('css')) {
      return "CSS styles your HTML, like decorating a room. You can change colors, fonts, layouts, and more. For example: `h1 { color: blue; font-size: 24px; }` makes all headings blue and large. CSS selectors target elements, and properties define how they look. Would you like to learn about selectors, the box model, or layouts?";
    }
    if (message.toLowerCase().includes('javascript')) {
      return "JavaScript adds interactivity to websites. It can respond to clicks, validate forms, and change content dynamically. For example: `document.getElementById('myButton').onclick = function() { alert('Hello!'); }` makes a button show a message when clicked. Would you like to learn about variables, functions, or DOM manipulation?";
    }
    return "Web development involves creating websites and web applications. You'll need HTML for structure, CSS for styling, and JavaScript for interactivity. Modern development also uses frameworks like React. What aspect interests you most - the basics of HTML/CSS, JavaScript programming, or modern frameworks?";
  }

  private getDataScienceResponse(message: string): string {
    if (message.toLowerCase().includes('data')) {
      return "Data science is about extracting insights from data. You collect, clean, analyze, and visualize data to find patterns and make predictions. Python libraries like pandas (for data manipulation) and matplotlib (for visualization) are essential tools. What type of data analysis interests you most?";
    }
    return "Data science combines statistics, programming, and domain knowledge to understand data. You'll work with datasets, create visualizations, and build predictive models. Python and R are popular languages for this field. Would you like to start with data basics, statistics, or programming tools?";
  }

  private getMathResponse(message: string): string {
    if (message.toLowerCase().includes('algebra')) {
      return "Algebra is about finding unknown values using equations. Variables (like x) represent unknown numbers, and you solve for them using mathematical operations. For example: if 2x + 3 = 7, then 2x = 4, so x = 2. It's like solving puzzles with numbers. What algebra concept would you like to explore?";
    }
    return "Mathematics is the foundation of logical thinking and problem-solving. Different areas like algebra, geometry, and statistics each have unique applications. Algebra works with variables and equations, geometry deals with shapes and space, and statistics analyzes data. Which area interests you most?";
  }

  private getGeneralResponse(message: string): string {
    return `I'd be happy to help you learn about "${message}". To provide the best explanation, could you tell me:
    
    1. What's your current knowledge level with this topic?
    2. Are you looking for a general overview or specific details?
    3. Do you prefer explanations with examples or step-by-step instructions?
    
    This will help me tailor my response to your learning style!`;
  }

  private categorizeTopic(message: string): string {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('python') || messageLower.includes('programming') || 
        messageLower.includes('code') || messageLower.includes('function') || 
        messageLower.includes('variable') || messageLower.includes('loop')) {
      return 'Python Programming';
    }
    
    if (messageLower.includes('web') || messageLower.includes('html') || 
        messageLower.includes('css') || messageLower.includes('javascript') || 
        messageLower.includes('react') || messageLower.includes('frontend')) {
      return 'Web Development';
    }
    
    if (messageLower.includes('data') || messageLower.includes('science') || 
        messageLower.includes('analytics') || messageLower.includes('statistics') || 
        messageLower.includes('machine learning')) {
      return 'Data Science';
    }
    
    if (messageLower.includes('math') || messageLower.includes('mathematics') || 
        messageLower.includes('algebra') || messageLower.includes('geometry') || 
        messageLower.includes('calculus')) {
      return 'Mathematics';
    }
    
    return 'General';
  }

  private getSuggestedTopics(topic: string): string[] {
    const suggestions = {
      'Python Programming': ['Variables and Data Types', 'Functions and Methods', 'Loops and Conditionals', 'Lists and Dictionaries'],
      'Web Development': ['HTML Structure', 'CSS Styling', 'JavaScript Basics', 'Responsive Design'],
      'Data Science': ['Data Analysis', 'Data Visualization', 'Statistics Basics', 'Python for Data Science'],
      'Mathematics': ['Algebra Basics', 'Geometry Fundamentals', 'Statistics', 'Problem Solving'],
      'General': ['Study Techniques', 'Learning Strategies', 'Problem Solving', 'Critical Thinking']
    };
    
    return suggestions[topic as keyof typeof suggestions] || suggestions['General'];
  }

  // Public method to check if API is available
  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // Public method to get API status
  public getApiStatus(): { available: boolean; message: string } {
    if (this.apiKey) {
      return { 
        available: true, 
        message: 'Hugging Face API is configured and ready for advanced AI tutoring.' 
      };
    } else {
      return { 
        available: false, 
        message: 'Using smart educational responses. Add HUGGING_FACE_API_KEY for enhanced AI tutoring.' 
      };
    }
  }
}

// Export singleton instance
export const aiTutorService = new AITutorService();