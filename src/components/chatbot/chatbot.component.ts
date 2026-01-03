import { ChangeDetectionStrategy, Component, ElementRef, input, signal, viewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { Chat } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatbotComponent {
  context = input.required<string>();
  
  // FIX: Use Angular's dependency injection to get the GeminiService instance
  // instead of creating a new one, which would fail to get its own dependencies.
  private geminiService = inject(GeminiService);
  private chat: Chat | null = null;
  
  userInput = signal('');
  messages = signal<ChatMessage[]>([]);
  isLoading = signal(false);

  chatContainer = viewChild<ElementRef>('chatContainer');

  constructor() {
    effect(() => {
      const newContext = this.context();
      if (newContext) {
        this.messages.set([]);
        this.chat = this.geminiService.startChat(newContext);
      }
    });
    effect(() => {
      if (this.messages()) {
        this.scrollToBottom();
      }
    });
  }

  async sendMessage(): Promise<void> {
    const messageText = this.userInput().trim();
    if (!messageText || this.isLoading() || !this.chat) return;

    this.messages.update(m => [...m, { role: 'user', text: messageText }]);
    this.userInput.set('');
    this.isLoading.set(true);

    try {
      this.messages.update(m => [...m, { role: 'model', text: '' }]);
      const stream = await this.geminiService.sendMessageStream(this.chat, messageText);
      
      for await (const chunk of stream) {
        this.messages.update(m => {
          const lastMessage = m[m.length - 1];
          lastMessage.text += chunk.text;
          return [...m];
        });
      }
    } catch (e) {
      console.error('Error sending message:', e);
      this.messages.update(m => {
        const lastMessage = m[m.length - 1];
        lastMessage.text = 'Sorry, I encountered an error. Please try again.';
        return [...m];
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const element = this.chatContainer()?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 0);
  }
}
