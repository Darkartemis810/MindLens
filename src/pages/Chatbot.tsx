import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Loader2, AlertTriangle, Phone } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Msg = { role: "user" | "assistant"; content: string };

export default function Chatbot() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your MindLens wellbeing companion. How are you feeling today? I'm here to listen and offer support. 💙" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const emergencyKeywords = ["suicide", "kill myself", "want to die", "end it all", "end my life", "no reason to live", "can't go on"];

  const checkEmergency = (text: string) => {
    const lowerText = text.toLowerCase();
    return emergencyKeywords.some(keyword => lowerText.includes(keyword));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    if (checkEmergency(input)) {
      setShowEmergency(true);
    }

    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wellbeing-chat`;

    try {
      // Simulated mock stream for the demo
      const mockResponses = [
        "That sounds like a lot to carry. I'm here to listen. Would you like to explore what's causing these feelings?",
        "It's completely normal to feel this way under high cognitive load. Remember to grant yourself some grace today.",
        "I understand. Taking a short 10-minute grounding break away from screens might give you a fresh perspective. How does that sound?",
        "This sounds like early signs of burnout. Let's focus on prioritizing rest and resetting your baseline tonight.",
        "I hear you. Focus on controlling what's immediately in front of you. You've got this."
      ];
      const responseText = mockResponses[Math.floor(Math.random() * mockResponses.length)] + " 💙";

      for (let i = 0; i < responseText.length; i++) {
        assistantSoFar += responseText[i];

        setMessages(prev => {
          const last = prev[prev.length - 1];
          // If the last message is already from the assistant for this turn, update it
          if (last?.role === "assistant" && prev.length > newMessages.length) {
            return prev.map((m, idx) => idx === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          // Otherwise, append a new assistant message
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });

        // Artificial delay for realistic streaming effect
        await new Promise(r => setTimeout(r, 30));
      }
    } catch (err) {
      console.error("Chat streaming error caught:", err);
      if (!assistantSoFar) {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
      }
    }
    setLoading(false);
  };

  return (
    <div className="container max-w-3xl py-8 space-y-6 relative min-h-[calc(100vh-4rem)]">
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/10 mb-4 shadow-sm">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">
          Wellbeing <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Chatbot</span>
        </h1>
        <p className="text-muted-foreground text-lg">Have a supportive conversation about your wellbeing.</p>
      </div>

      <Card className="h-[600px] flex flex-col bg-card/60 backdrop-blur-xl border-primary/10 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden relative">
        <CardContent className="flex-1 overflow-y-auto pt-6 space-y-4 px-6 pb-24 scroll-smooth scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed shadow-sm ${m.role === "user"
                ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-br-sm"
                : "bg-background/80 backdrop-blur-sm border border-primary/10 text-foreground rounded-bl-sm prose prose-sm dark:prose-invert max-w-none"
                }`}>
                {m.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-semibold text-primary" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="" {...props} />,
                      a: ({ node, ...props }) => <a className="text-primary underline underline-offset-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="font-semibold text-lg mt-4 mb-2" {...props} />
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {loading && !messages[messages.length - 1]?.content && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-background/80 backdrop-blur-sm border border-primary/10 rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </CardContent>

        {/* Floating Input Area */}
        <div className="absolute bottom-6 inset-x-6">
          <div className="bg-background/80 backdrop-blur-xl border border-primary/20 p-2 rounded-full flex gap-2 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              disabled={loading}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-4 text-base placeholder:text-muted-foreground/50 h-10 w-full"
            />
            <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="h-10 w-10 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:scale-105 transition-transform">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {showEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full border-destructive/50 shadow-2xl shadow-destructive/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" /> Emergency Alert Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                We noticed signs of severe distress in your message. Please know that you are not alone and help is available right now. We strongly encourage you to reach out.
              </p>

              <div className="bg-muted p-4 rounded-xl border border-destructive/20 space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-semibold">National Crisis Lifeline</p>
                    <a href="tel:988" className="text-xl font-bold text-destructive hover:underline">988</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-semibold">Local Emergency Police</p>
                    <a href="tel:911" className="text-xl font-bold text-destructive hover:underline">911</a>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowEmergency(false)}>Close</Button>
                <Button variant="destructive" onClick={() => window.location.href = "tel:988"}>
                  <Phone className="h-4 w-4 mr-2" /> Call Help Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
