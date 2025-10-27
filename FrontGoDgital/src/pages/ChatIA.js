import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { Card, CardHeader } from "../components/Card"
import { Button } from "../components/Button"

const ChatContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: calc(100vh - 120px);
  gap: 20px;
`

const MessagesContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`

const MessagesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`

const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  
  &.user {
    flex-direction: row-reverse;
    
    .message-content {
      background-color: ${(props) => props.theme.colors.primary};
      color: white;
      margin-left: 60px;
    }
  }
  
  &.assistant {
    .message-content {
      background-color: #f8f9fa;
      color: ${(props) => props.theme.colors.textPrimary};
      margin-right: 60px;
    }
  }
  
  .message-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    
    &.user {
      background-color: ${(props) => props.theme.colors.primary};
      color: white;
    }
    
    &.assistant {
      background-color: #e9ecef;
      color: ${(props) => props.theme.colors.textPrimary};
    }
  }
  
  .message-content {
    padding: 12px 16px;
    border-radius: 18px;
    max-width: 70%;
    word-wrap: break-word;
    line-height: 1.4;
    
    .message-time {
      font-size: 12px;
      opacity: 0.7;
      margin-top: 4px;
    }
  }
`

const InputContainer = styled(Card)`
  padding: 20px;
`

const InputForm = styled.form`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`

const MessageInput = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 22px;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  outline: none;
  
  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.2);
  }
  
  &::placeholder {
    color: #999;
  }
`

const SendButton = styled(Button)`
  border-radius: 50px;
  width: 35px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`

const SuggestionChip = styled.button`
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e9ecef;
    border-color: ${(props) => props.theme.colors.primary};
  }
`

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  
  .typing-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  
  .typing-dots {
    display: flex;
    gap: 4px;
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #999;
      animation: typing 1.4s infinite ease-in-out;
      
      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
    }
  }
  
  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`

const suggestions = [
  "Como estão as vendas hoje?",
  "Quais produtos estão com estoque baixo?",
  "Previsão de demanda para amanhã",
  "Relatório financeiro do mês",
  "Produtos mais vendidos",
  "Sugestões para aumentar vendas"
]

export const ChatIA = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content: "Olá! Sou o assistente inteligente da Synvia Platform. Como posso ajudá-lo hoje? Posso fornecer informações sobre vendas, estoque, previsões de demanda e muito mais!",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion)
  }

  const generateAIResponse = async (userMessage) => {
    try {
      // Simula chamada para o serviço de IA
      const response = await fetch("http://localhost:5002/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: "synvia_management"
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response
      } else {
        // Fallback para respostas baseadas em palavras-chave
        return generateFallbackResponse(userMessage)
      }
    } catch (error) {
      console.error("Erro ao conectar com IA:", error)
      return generateFallbackResponse(userMessage)
    }
  }

  const generateFallbackResponse = (userMessage) => {
    const message = userMessage.toLowerCase()
    
    if (message.includes("vendas") || message.includes("venda")) {
      return "Para consultar informações sobre vendas, você pode acessar o relatório de vendas no menu principal. Lá você encontrará dados detalhados sobre faturamento, produtos mais vendidos e histórico completo."
    }
    
    if (message.includes("estoque") || message.includes("produto")) {
      return "Para verificar o estoque, acesse a seção de Gestão de Estoque. Lá você pode ver quais produtos estão com estoque baixo e precisam de reposição."
    }
    
    if (message.includes("previsão") || message.includes("demanda")) {
      return "As previsões de demanda são calculadas usando inteligência artificial baseada no histórico de vendas. Acesse o módulo de IA para ver as previsões para os próximos dias."
    }
    
    if (message.includes("financeiro") || message.includes("dinheiro") || message.includes("lucro")) {
      return "Para informações financeiras, consulte o Dashboard Financeiro onde você encontra receitas, despesas, lucro e fluxo de caixa detalhado."
    }
    
    if (message.includes("cliente") || message.includes("fidelidade")) {
      return "No módulo de Clientes você pode gerenciar o programa de fidelidade, consultar pontos dos clientes e histórico de compras."
    }
    
    return "Entendi sua pergunta! Para obter informações mais específicas, recomendo navegar pelos módulos do sistema: Dashboard, Vendas, Estoque, Financeiro ou Relatórios. Cada seção tem dados detalhados sobre diferentes aspectos do negócio."
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputValue.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    setLoading(true)

    try {
      // Simula delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const aiResponse = await generateAIResponse(userMessage.content)
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Erro ao processar mensagem:", error)
      
      const errorMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <ChatContainer>
      <CardHeader>
        <h2>🤖 Chat com IA - Assistente Inteligente</h2>
        <p>Converse com nosso assistente para obter insights sobre seu negócio</p>
      </CardHeader>

      <MessagesContainer>
        <MessagesList>
          {messages.map((message) => (
            <Message key={message.id} className={message.type}>
              <div className={`message-avatar ${message.type}`}>
                {message.type === "user" ? "👤" : "🤖"}
              </div>
              <div className="message-content">
                {message.content}
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </Message>
          ))}
          
          {isTyping && (
            <TypingIndicator>
              <div className="typing-avatar">🤖</div>
              <div className="typing-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </TypingIndicator>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesList>
      </MessagesContainer>

      <InputContainer>
        {messages.length === 1 && (
          <SuggestionsContainer>
            {suggestions.map((suggestion, index) => (
              <SuggestionChip
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </SuggestionChip>
            ))}
          </SuggestionsContainer>
        )}
        
        <InputForm onSubmit={handleSubmit}>
          <MessageInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta sobre a Synvia..."
            disabled={loading}
          />
          <SendButton
            type="submit"
            variant="primary"
            disabled={!inputValue.trim() || loading}
          >
            {loading ? "⏳" : "📤"}
          </SendButton>
        </InputForm>
      </InputContainer>
    </ChatContainer>
  )
}
