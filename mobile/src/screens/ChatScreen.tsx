import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import messageService, { Message, Thread } from '../services/messageService';
import { useAuth } from '../contexts/AuthContext';

interface ChatScreenProps {
    route: any;
    navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
    const { threadId, thread: initialThread, otherUserName } = route.params;
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [thread, setThread] = useState<Thread | null>(initialThread || null);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        try {
            const response = await messageService.getMessages(threadId);
            setMessages(response.messages || []);

            // Mark thread as read
            await messageService.markThreadRead(threadId);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [threadId]);

    // Fetch thread details if not provided
    const fetchThread = useCallback(async () => {
        if (!initialThread) {
            try {
                const threadData = await messageService.getThread(threadId);
                setThread(threadData);
            } catch (error) {
                console.error('Error fetching thread:', error);
            }
        }
    }, [threadId, initialThread]);

    useEffect(() => {
        fetchMessages();
        fetchThread();

        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages, fetchThread]);

    // Send message
    const handleSend = async () => {
        if (!inputText.trim() || isSending) return;

        const messageText = inputText.trim();
        setInputText('');
        setIsSending(true);

        // Optimistic update
        const tempMessage: Message = {
            _id: `temp-${Date.now()}`,
            threadId,
            sender: {
                _id: user?._id || '',
                name: user?.name || user?.firstName || 'You',
            },
            content: messageText,
            createdAt: new Date().toISOString(),
            isRead: true,
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const sentMessage = await messageService.sendMessage(threadId, messageText);
            // Replace temp message with real one
            setMessages(prev => prev.map(m =>
                m._id === tempMessage._id ? sentMessage : m
            ));
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove temp message on error
            setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
            setInputText(messageText); // Restore input
        } finally {
            setIsSending(false);
        }
    };

    // Format timestamp
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get other participant name
    const getHeaderTitle = () => {
        if (otherUserName) return otherUserName;
        if (thread?.participants) {
            const other = thread.participants.find(p => p._id !== user?._id);
            return other?.name || 'Chat';
        }
        return 'Chat';
    };

    // Check if message is from current user
    const isOwnMessage = (message: Message) => {
        return message.sender._id === user?._id;
    };

    // Render message bubble
    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isOwn = isOwnMessage(item);
        const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender._id !== item.sender._id);

        return (
            <View style={[
                styles.messageRow,
                isOwn ? styles.messageRowOwn : styles.messageRowOther
            ]}>
                {!isOwn && showAvatar && (
                    <View style={styles.messageSenderAvatar}>
                        {item.sender.profilePhoto ? (
                            <Image
                                source={{ uri: item.sender.profilePhoto }}
                                style={styles.avatarSmall}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholderSmall}>
                                <Text style={styles.avatarTextSmall}>
                                    {item.sender.name?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
                {!isOwn && !showAvatar && <View style={{ width: 32 }} />}

                <View style={[
                    styles.messageBubble,
                    isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther
                ]}>
                    <Text style={[
                        styles.messageText,
                        isOwn ? styles.messageTextOwn : styles.messageTextOther
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.messageTime,
                        isOwn ? styles.messageTimeOwn : styles.messageTimeOther
                    ]}>
                        {formatTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.glassButtonWrapper}
                    onPress={() => navigation.goBack()}
                >
                    <GlassView style={styles.glassButton}>
                        <Ionicons name="chevron-back" size={22} color="#db4a2b" />
                    </GlassView>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {getHeaderTitle()}
                    </Text>
                    {thread?.listing && (
                        <View style={styles.listingBadge}>
                            <Ionicons name="home" size={12} color={COLORS.primary} />
                            <Text style={styles.listingText} numberOfLines={1}>
                                {thread.listing.title}
                            </Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={20} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    inverted={false}
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubble-outline" size={40} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Send a message to start the conversation</Text>
                        </View>
                    }
                />
            )}

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <SafeAreaView edges={['bottom']} style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            placeholderTextColor={COLORS.textMuted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={1000}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isSending) && styles.sendButtonDisabled
                            ]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || isSending}
                        >
                            {isSending ? (
                                <ActivityIndicator size="small" color={COLORS.card} />
                            ) : (
                                <Ionicons name="send" size={20} color={COLORS.card} />
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    backButton: {
        padding: SPACING.xs,
        marginRight: SPACING.sm,
    },
    glassButtonWrapper: {
        borderRadius: 24,
        overflow: 'hidden',
        marginRight: SPACING.sm,
    },
    glassButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    listingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    listingText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
        fontWeight: '500',
    },
    moreButton: {
        padding: SPACING.xs,
    },

    // Messages List
    messagesList: {
        padding: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },

    // Message Row
    messageRow: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
        alignItems: 'flex-end',
    },
    messageRowOwn: {
        justifyContent: 'flex-end',
    },
    messageRowOther: {
        justifyContent: 'flex-start',
    },
    messageSenderAvatar: {
        marginRight: SPACING.xs,
    },
    avatarSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    avatarPlaceholderSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarTextSmall: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.card,
    },

    // Message Bubble
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.lg,
    },
    messageBubbleOwn: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
        backgroundColor: COLORS.backgroundSecondary,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: FONT_SIZES.md,
        lineHeight: 20,
    },
    messageTextOwn: {
        color: COLORS.card,
    },
    messageTextOther: {
        color: COLORS.text,
    },
    messageTime: {
        fontSize: FONT_SIZES.xs,
        marginTop: 4,
    },
    messageTimeOwn: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },
    messageTimeOther: {
        color: COLORS.textMuted,
    },

    // Input
    inputContainer: {
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        maxHeight: 100,
        minHeight: 40,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.textMuted,
    },
});

export default ChatScreen;
