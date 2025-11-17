// src/components/ChatbotWidget.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { chatAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isMinimized]);

  // creates a new conversation on the server and returns its id (or null)
  const createConversationOnServer = async (): Promise<string | null> => {
    try {
      const data: any = await chatAPI.createConversation("New Conversation");
      // api may return different shapes: data._id, data.id or the whole object
      const id = data?._id ?? data?.id ?? (typeof data === "string" ? data : null);
      return id || null;
    } catch (err) {
      console.error("createConversation error:", err);
      return null;
    }
  };

  // persist message to server (best-effort)
  const persistMessage = async (convId: string | null, role: "user" | "assistant", content: string) => {
    if (!convId) return;
    try {
      await chatAPI.saveMessage(convId, role, content);
    } catch (err) {
      console.warn("Failed to save message:", err);
    }
  };

  // send message (non-streaming): uses chatAPI.chatAssistant which returns parsed JSON
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // ensure conversation exists
      let convId = conversationId;
      if (!convId) {
        convId = await createConversationOnServer();
        if (convId) setConversationId(convId);
      }

      // append user message locally & persist
      const userMsgObj: Message = { role: "user", content: userMessage };
      setMessages((prev) => [...prev, userMsgObj]);
      await persistMessage(convId, "user", userMessage);

      // call assistant API (use existing chatAPI.chatAssistant)
      // Provide the conversation messages + current user message for context.
      // The shape of the response may vary depending on your backend — we handle a few common cases.
      const context = [...messages, userMsgObj];
      const response: any = await chatAPI.chatAssistant(context);

      // Extract assistant text from common response shapes, with fallbacks
      const extractAssistantText = (resp: any): string => {
        if (!resp) return "";
        // common: { text: "..." } or { message: "..." }
        if (typeof resp === "string") return resp;
        if (resp.text) return resp.text;
        if (resp.message) return resp.message;
        if (resp.answer) return resp.answer;
        // OpenAI-like shape: { choices: [ { message: { content: "..." } } ] }
        if (Array.isArray(resp.choices) && resp.choices[0]) {
          const c = resp.choices[0];
          if (c.message && c.message.content) return c.message.content;
          if (c.text) return c.text;
        }
        // Some assistant endpoints return { assistant: { content: "..." } }
        if (resp.assistant && (resp.assistant.content || resp.assistant.text)) {
          return resp.assistant.content ?? resp.assistant.text ?? "";
        }
        // lastly try top-level .content
        if (resp.content && typeof resp.content === "string") return resp.content;
        // Unknown shape — try JSON-stringify fallback
        try {
          return JSON.stringify(resp);
        } catch {
          return "";
        }
      };

      const assistantText = extractAssistantText(response) || "Sorry, I couldn't generate a response.";

      // append assistant message locally & persist
      const assistantMsgObj: Message = { role: "assistant", content: assistantText };
      setMessages((prev) => [...prev, assistantMsgObj]);
      await persistMessage(convId, "assistant", assistantText);
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast({
        title: "Error",
        description: err?.message || "Failed to send message. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

  };

  // render minimized button
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed ${isMinimized ? "bottom-6 right-6 w-80" : "bottom-6 right-6 w-96"} ${
        isMinimized ? "h-14" : "h-[600px]"
      } shadow-2xl flex flex-col transition-all z-50`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Veदlya Assistant</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p>Hi! I'm Veदlya Assistant.</p>
                  <p className="text-sm">Ask me anything about your studies!</p>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100" />
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question..." disabled={isLoading} />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  );
};
