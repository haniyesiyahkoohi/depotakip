import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import "./ChatWidget.css";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Merhaba! Ben Depo Takip asistanıyım. Stok durumu, kritik seviyedeki ürünler ya da kategoriler hakkında soru sorabilirsin.",
};

const SUGGESTIONS = [
  "Kritik stoktaki ürünler neler?",
  "Toplam kaç ürün var?",
  "Son stok hareketleri neler?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history = messages
      .filter((m) => m !== WELCOME_MESSAGE)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/chatbot/", { message: trimmed, history });
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      const msg = err.response?.data?.error || "Asistana ulaşılamadı, backend'in çalıştığından emin ol.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Depo asistanını aç/kapat"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-panel__header">
            <div>
              <div className="chat-panel__title">Depo Asistanı</div>
              <div className="chat-panel__subtitle">Yapay zeka destekli</div>
            </div>
          </div>

          <div className="chat-panel__body" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble--assistant chat-bubble--loading">
                <span className="chat-dot" />
                <span className="chat-dot" />
                <span className="chat-dot" />
              </div>
            )}
            {error && <div className="chat-error">{error}</div>}
          </div>

          {messages.length <= 1 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)} className="chat-suggestion">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="chat-panel__input-row" onSubmit={handleSubmit}>
            <input
              className="chat-panel__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir soru yaz..."
              disabled={loading}
            />
            <button className="chat-panel__send" type="submit" disabled={loading || !input.trim()}>
              Gönder
            </button>
          </form>
        </div>
      )}
    </>
  );
}
