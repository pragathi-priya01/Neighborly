import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  MessageSquare,
  Send,
  User,
  Calendar,
  IndianRupee,
  Clock,
  ArrowLeft,
  CheckCheck,
  Check,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedConvId = searchParams.get('conversationId');

  const { user, token } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch conversations list
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoadingConvs(true);
    try {
      const res = await api.get('/chat/conversations');
      const list = res.data || [];
      setConversations(list);

      // Select conversation from URL param or first available
      if (requestedConvId) {
        const target = list.find((c) => c._id === requestedConvId);
        if (target) {
          setActiveConversation(target);
        } else {
          // If conversation ID was provided but not in list, fetch it directly
          try {
            const singleRes = await api.get(`/chat/conversations/${requestedConvId}`);
            setActiveConversation(singleRes.data);
          } catch {
            if (list.length > 0) setActiveConversation(list[0]);
          }
        }
      } else if (list.length > 0) {
        setActiveConversation(list[0]);
      }
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConvs(false);
    }
  };

  // 2. Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await api.get(`/chat/conversations/${activeConversation._id}/messages`);
        setMessages(res.data?.messages || []);
      } catch (err) {
        toast.error('Failed to load chat history');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Setup Socket.IO listeners
    const socket = getSocket(token);
    socket.emit('join_conversation', { conversationId: activeConversation._id });

    const handleReceive = (incomingMsg) => {
      if (incomingMsg.conversation === activeConversation._id) {
        setMessages((prev) => [...prev, incomingMsg]);
      }
    };

    const handleTyping = (data) => {
      if (data.conversationId === activeConversation._id && data.userId !== user?.id) {
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.conversationId === activeConversation._id) {
        setOtherUserTyping(false);
      }
    };

    socket.on('receive_message', handleReceive);
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopTyping);

    return () => {
      socket.emit('leave_conversation', { conversationId: activeConversation._id });
      socket.off('receive_message', handleReceive);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
    };
  }, [activeConversation?._id]);

  // 3. Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  // Handle typing indicator
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!activeConversation) return;

    const socket = getSocket(token);
    socket.emit('typing_start', {
      conversationId: activeConversation._id,
      userName: user?.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: activeConversation._id });
    }, 1500);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/chat/conversations/${activeConversation._id}/messages`, {
        text,
      });

      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);

      // Update last message in conversation sidebar
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConversation._id
            ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      toast.error('Failed to send message');
      setInputText(text); // restore
    } finally {
      setSending(false);
    }
  };

  const otherPerson = activeConversation?.otherParticipant ||
    activeConversation?.participants?.find((p) => p._id !== user?.id) || {};

  const booking = activeConversation?.booking;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-12rem)] min-h-[500px] flex flex-col md:flex-row">
      {/* Sidebar: Conversations List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
          activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <span>Neighbourly Messages</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">{conversations.length}</span>
          </div>
        </div>

        {/* Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingConvs ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="sm" />
              <p className="text-xs text-slate-400 mt-2">Loading threads...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-600">No conversations yet.</p>
              <p className="text-[11px] text-slate-400">
                Chats are automatically created when you book or receive a service offer.
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = conv.otherParticipant ||
                conv.participants?.find((p) => p._id !== user?.id) || {};
              const isActive = activeConversation?._id === conv._id;

              return (
                <button
                  key={conv._id}
                  onClick={() => {
                    setActiveConversation(conv);
                    setSearchParams({ conversationId: conv._id });
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                    isActive
                      ? 'bg-brand-50/80 border-l-4 border-brand-600'
                      : 'hover:bg-slate-100/80'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">
                    {other.name?.charAt(0) || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{other.name}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage || 'Started conversation'}
                    </p>

                    {conv.booking && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-medium mt-1 truncate max-w-full">
                        {conv.booking.serviceCategory}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col bg-white ${
          !activeConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Room Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
                  {otherPerson.name?.charAt(0) || 'U'}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{otherPerson.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      {otherPerson.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{otherPerson.neighborhood || 'Local Neighbor'}</span>
                  </p>
                </div>
              </div>

              {booking && (
                <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-800">{booking.serviceCategory}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">₹{booking.amount}</span>
                  <Link
                    to={`/resident/bookings/${booking._id}`}
                    className="text-brand-600 hover:underline font-semibold ml-1"
                  >
                    View
                  </Link>
                </div>
              )}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/40">
              {loadingMessages ? (
                <div className="py-12 text-center">
                  <LoadingSpinner size="sm" />
                  <p className="text-xs text-slate-400 mt-2">Loading chat history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">No messages exchanged yet.</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Say hello, confirm address specifics, or discuss scheduling arrival.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender?._id === user?.id || msg.sender === user?.id;

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                          isMe
                            ? 'bg-brand-600 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                            isMe ? 'text-brand-200' : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && (
                            msg.read ? (
                              <CheckCheck className="w-3 h-3 text-brand-200" />
                            ) : (
                              <Check className="w-3 h-3 text-brand-300" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {otherUserTyping && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 italic bg-white px-3 py-1.5 rounded-full border border-slate-200 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">{otherPerson.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={`Message ${otherPerson.name || 'neighbor'}...`}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Select a Conversation</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Choose an active thread from the sidebar to chat with verified neighbors or service
              providers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
