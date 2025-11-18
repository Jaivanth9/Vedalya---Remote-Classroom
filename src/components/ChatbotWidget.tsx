// src/components/ChatbotWidget.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Minimize2, Maximize2, Plus } from "lucide-react";
import { chatAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// key used to persist conv id locally
const STORAGE_KEY = "vedlya_chat_conv";

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isMinimized]);

  // Helper: load existing conversation id (localStorage -> server fallback)
  const ensureConversationLoaded = async (): Promise<string | null> => {
    // 1) try localStorage
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      setConversationId(local);
      await loadMessagesForConversation(local).catch(() => {});
      return local;
    }

    // 2) try to fetch user's conversations and pick the latest
    try {
      const convs: any = await chatAPI.getConversations();
      if (Array.isArray(convs) && convs.length > 0) {
        // prefer most recent by createdAt/updatedAt if available
        convs.sort((a: any, b: any) => {
          const ta = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
          const tb = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
          return tb - ta;
        });
        const chosen = convs[0];
        const id = chosen._id ?? chosen.id ?? null;
        if (id) {
          localStorage.setItem(STORAGE_KEY, String(id));
          setConversationId(String(id));
          await loadMessagesForConversation(String(id)).catch(() => {});
          return String(id);
        }
      }

      // no conversation -> create one
      const created: any = await chatAPI.createConversation("New Conversation");
      const createdId = created?._id ?? created?.id ?? null;
      if (createdId) {
        localStorage.setItem(STORAGE_KEY, String(createdId));
        setConversationId(String(createdId));
        // created new conversation -> no messages to load
        setMessages([]);
        return String(createdId);
      }
    } catch (err) {
      console.warn("ensureConversationLoaded error", err);
    }
    return null;
  };

  // fetch messages for conversation and populate state
  const loadMessagesForConversation = async (convId: string) => {
    try {
      const msgs: any[] = await chatAPI.getMessages(convId);
      if (!Array.isArray(msgs)) return;
      // normalize to local Message[]
      const norm: Message[] = msgs.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? m.message ?? m.text ?? ""),
      }));
      setMessages(norm);
    } catch (err) {
      console.error("loadMessagesForConversation error", err);
      // ignore — will show empty
    }
  };

  // persist a single message to server (best-effort)
  const persistMessage = async (convId: string | null, role: "user" | "assistant", content: string) => {
    if (!convId) return;
    try {
      await chatAPI.saveMessage(convId, role, content);
    } catch (err) {
      console.warn("Failed to save message:", err);
    }
  };

  // creates a new conversation (server-side) and returns id
  const createConversationOnServer = async (): Promise<string | null> => {
    try {
      const data: any = await chatAPI.createConversation("New Conversation");
      const id = data?._id ?? data?.id ?? null;
      if (id) {
        localStorage.setItem(STORAGE_KEY, String(id));
        setConversationId(String(id));
        setMessages([]); // start fresh
        return String(id);
      }
    } catch (err) {
      console.error("createConversation error:", err);
    }
    return null;
  };

  // called when widget opens
  useEffect(() => {
    if (!isOpen) return;
    // lazily load conversation & messages
    (async () => {
      setIsLoading(true);
      try {
        await ensureConversationLoaded();
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // send message to assistant
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // ensure conversation exists
      let convId = conversationId;
      if (!convId) {
        convId = await ensureConversationLoaded();
        if (!convId) convId = (await createConversationOnServer()) ?? null;
      }

      // append user message locally & persist
      const userMsgObj: Message = { role: "user", content: userMessage };
      setMessages((prev) => [...prev, userMsgObj]);
      await persistMessage(convId, "user", userMessage);

      // build context for assistant from current messages
      const context = [...messages, userMsgObj].map((m) => ({ role: m.role, content: m.content }));

      // call assistant API; wrapper returns { message, raw } or similar normalized shape
      const resp: any = await chatAPI.chatAssistant(context);

      // response normalization - handle multiple shapes
      let assistantText = "";
      if (!resp) {
        assistantText = "Sorry, I couldn't generate a response.";
      } else if (typeof resp === "string") {
        assistantText = resp;
      } else if (typeof resp === "object") {
        assistantText = String(resp.message ?? resp.text ?? resp.answer ?? resp?.raw?.message ?? "");
        if (!assistantText && resp.raw) {
          // try known nested shapes
          assistantText =
            String(resp.raw?.message ?? resp.raw?.output?.[0]?.content?.[0]?.text ?? resp.raw?.candidates?.[0]?.content ?? "");
        }
      }
      assistantText = assistantText || "Sorry, I couldn't generate a response.";

      // append assistant message locally & persist
      const assistantMsgObj: Message = { role: "assistant", content: assistantText };
      setMessages((prev) => [...prev, assistantMsgObj]);
      await persistMessage(convId, "assistant", assistantText);
    } catch (err: any) {
      console.error("Error sending message:", err);

      // apiFetch attaches status on error object in our api.ts
      const status = err?.status ?? (err?.response?.status ?? null);
      let description = err?.message || "Failed to send message. Try again.";

      if (status === 502) {
        description = "AI Model is under Development, We will let you know after Integration.";
      } else if (status === 401) {
        description = "Authentication issue — please sign in again.";
      } else if (status === 400) {
        description = "Invalid request sent to AI server.";
      }

      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // small UI helpers
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
        size="icon"
        aria-label="Open assistant"
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

        <div className="flex gap-2 items-center">
          {/* New conversation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                // clear current conv and start new one
                setConversationId(null);
                setMessages([]);
                localStorage.removeItem(STORAGE_KEY);
                const newId = await createConversationOnServer();
                if (newId) {
                  setConversationId(newId);
                  toast({ title: "New Conversation", description: "Started fresh chat." });
                } else {
                  toast({ title: "Error", description: "Failed to create conversation.", variant: "destructive" });
                }
              } catch (err) {
                console.error(err);
                toast({ title: "Error", description: "Could not start new conversation.", variant: "destructive" });
              }
            }}
            aria-label="New conversation"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Minimize / maximize */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized((v) => !v)}
            aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>

          {/* Close */}
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close chat">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {isLoading && messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">Loading conversation…</div>
              )}

              {!isLoading && messages.length === 0 && (
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
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  );
};
