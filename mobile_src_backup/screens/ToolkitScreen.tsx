import React, { useState, useCallback, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';

interface ToolkitScreenProps {
    navigation?: any;
}

interface ChecklistItem {
    id: string;
    title: string;
    completed: boolean;
    category: string;
}

interface Expense {
    id: string;
    title: string;
    amount: number;
    date: string;
    category: string;
}

const defaultChecklist: ChecklistItem[] = [
    { id: '1', title: 'Review and sign lease agreement', completed: false, category: 'Documents' },
    { id: '2', title: 'Set up utilities (electric, gas, water)', completed: false, category: 'Utilities' },
    { id: '3', title: 'Set up internet service', completed: false, category: 'Utilities' },
    { id: '4', title: 'Get renters insurance', completed: false, category: 'Insurance' },
    { id: '5', title: 'Change address with USPS', completed: false, category: 'Documents' },
    { id: '6', title: 'Transfer or register vehicle', completed: false, category: 'Documents' },
    { id: '7', title: 'Do a walkthrough and document condition', completed: false, category: 'Move-in' },
    { id: '8', title: 'Change locks or get new keys', completed: false, category: 'Move-in' },
    { id: '9', title: 'Clean before unpacking', completed: false, category: 'Move-in' },
    { id: '10', title: 'Set up bedroom and essential rooms first', completed: false, category: 'Move-in' },
];

const ToolkitScreen: React.FC<ToolkitScreenProps> = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('checklist');
    const [hasChosenTemplate, setHasChosenTemplate] = useState(false);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [newExpenseTitle, setNewExpenseTitle] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const tabs = [
        { id: 'checklist', label: 'Move-In', icon: 'clipboard-outline' },
        { id: 'expenses', label: 'Expenses', icon: 'wallet-outline' },
        { id: 'timeline', label: 'Timeline', icon: 'calendar-outline' },
    ];

    const toggleChecklistItem = (id: string) => {
        setChecklist(prev =>
            prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
        );
    };

    const addExpense = () => {
        if (!newExpenseTitle.trim() || !newExpenseAmount.trim()) {
            Alert.alert('Error', 'Please enter both title and amount');
            return;
        }
        const amount = parseFloat(newExpenseAmount);
        if (isNaN(amount)) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }
        const newExpense: Expense = {
            id: Date.now().toString(),
            title: newExpenseTitle.trim(),
            amount,
            date: new Date().toISOString(),
            category: 'General',
        };
        setExpenses(prev => [newExpense, ...prev]);
        setNewExpenseTitle('');
        setNewExpenseAmount('');
    };

    const useTemplate = () => {
        setChecklist(defaultChecklist);
        setHasChosenTemplate(true);
    };

    const startFresh = () => {
        setChecklist([]);
        setHasChosenTemplate(true);
    };

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask: ChecklistItem = {
            id: Date.now().toString(),
            title: newTaskTitle.trim(),
            completed: false,
            category: 'Custom',
        };
        setChecklist(prev => [...prev, newTask]);
        setNewTaskTitle('');
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const completedTasks = checklist.filter(i => i.completed).length;
    const progress = checklist.length > 0 ? (completedTasks / checklist.length) * 100 : 0;

    const renderChecklist = () => (
        <View>
            {/* Template Choice - show if no checklist yet */}
            {!hasChosenTemplate ? (
                <View style={styles.templateChoiceCard}>
                    <Text style={styles.templateChoiceTitle}>How would you like to start?</Text>
                    <Text style={styles.templateChoiceSubtitle}>
                        Choose a pre-made checklist or create your own
                    </Text>
                    <TouchableOpacity style={styles.templateBtn} onPress={useTemplate}>
                        <View style={styles.templateBtnIcon}>
                            <Ionicons name="clipboard" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.templateBtnContent}>
                            <Text style={styles.templateBtnTitle}>Use Template</Text>
                            <Text style={styles.templateBtnDesc}>10 essential move-in tasks</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.templateBtn} onPress={startFresh}>
                        <View style={[styles.templateBtnIcon, { backgroundColor: '#E0E7FF' }]}>
                            <Ionicons name="add-circle" size={24} color="#6366F1" />
                        </View>
                        <View style={styles.templateBtnContent}>
                            <Text style={styles.templateBtnTitle}>Start Fresh</Text>
                            <Text style={styles.templateBtnDesc}>Create your own checklist</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    {/* Progress */}
                    <View style={styles.progressCard}>
                        <Text style={styles.progressTitle}>Move-In Progress</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{completedTasks} of {checklist.length} completed</Text>
                    </View>

                    {/* Add New Task */}
                    <View style={styles.addTaskCard}>
                        <TextInput
                            style={styles.addTaskInput}
                            placeholder="Add a new task..."
                            placeholderTextColor={COLORS.textMuted}
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            onSubmitEditing={addTask}
                        />
                        <TouchableOpacity style={styles.addTaskBtn} onPress={addTask}>
                            <Ionicons name="add" size={20} color={COLORS.card} />
                        </TouchableOpacity>
                    </View>

                    {/* Checklist Items */}
                    {checklist.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.checklistItem}
                            onPress={() => toggleChecklistItem(item.id)}
                        >
                            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                                {item.completed && <Ionicons name="checkmark" size={16} color={COLORS.card} />}
                            </View>
                            <View style={styles.checklistContent}>
                                <Text style={[styles.checklistTitle, item.completed && styles.checklistTitleCompleted]}>
                                    {item.title}
                                </Text>
                                <Text style={styles.checklistCategory}>{item.category}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {checklist.length === 0 && (
                        <View style={styles.emptyChecklist}>
                            <Ionicons name="clipboard-outline" size={40} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>Add your first task above</Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );

    const renderExpenses = () => (
        <View>
            {/* Total */}
            <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Total Expenses</Text>
                <Text style={styles.totalAmount}>${totalExpenses.toFixed(2)}</Text>
            </View>

            {/* Add Expense */}
            <View style={styles.addExpenseCard}>
                <TextInput
                    style={styles.expenseInput}
                    placeholder="Expense title"
                    placeholderTextColor={COLORS.textMuted}
                    value={newExpenseTitle}
                    onChangeText={setNewExpenseTitle}
                />
                <TextInput
                    style={[styles.expenseInput, styles.expenseInputSmall]}
                    placeholder="$0.00"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={newExpenseAmount}
                    onChangeText={setNewExpenseAmount}
                />
                <TouchableOpacity style={styles.addExpenseBtn} onPress={addExpense}>
                    <Ionicons name="add" size={20} color={COLORS.card} />
                </TouchableOpacity>
            </View>

            {/* Expense List */}
            {expenses.length === 0 ? (
                <View style={styles.emptyExpenses}>
                    <Ionicons name="wallet-outline" size={40} color={COLORS.textMuted} />
                    <Text style={styles.emptyText}>No expenses yet</Text>
                </View>
            ) : (
                expenses.map(expense => (
                    <View key={expense.id} style={styles.expenseItem}>
                        <View style={styles.expenseIconContainer}>
                            <Ionicons name="receipt" size={18} color={COLORS.primary} />
                        </View>
                        <View style={styles.expenseContent}>
                            <Text style={styles.expenseTitle}>{expense.title}</Text>
                            <Text style={styles.expenseDate}>
                                {new Date(expense.date).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                    </View>
                ))
            )}
        </View>
    );

    const renderTimeline = () => (
        <View>
            <View style={styles.timelineCard}>
                <Text style={styles.sectionTitle}>Your Timeline</Text>
                <Text style={styles.timelineText}>
                    Keep track of important dates like lease signing, move-in day, and more.
                </Text>

                {/* Sample Timeline Items */}
                <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineItemContent}>
                        <Text style={styles.timelineItemTitle}>Move-In Day</Text>
                        <Text style={styles.timelineItemDate}>Set your move-in date</Text>
                    </View>
                    <TouchableOpacity style={styles.timelineAddBtn}>
                        <Ionicons name="add" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineItemContent}>
                        <Text style={styles.timelineItemTitle}>Lease Start</Text>
                        <Text style={styles.timelineItemDate}>Set your lease start date</Text>
                    </View>
                    <TouchableOpacity style={styles.timelineAddBtn}>
                        <Ionicons name="add" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                {/* Header */}
                <LinearGradient
                    colors={[COLORS.primary, '#E85A3A']}
                    style={styles.header}
                >
                    <TouchableOpacity
                        style={styles.glassButtonWrapper}
                        onPress={() => navigation?.goBack()}
                    >
                        <GlassView style={styles.glassButton}>
                            <Ionicons name="chevron-back" size={22} color="#db4a2b" />
                        </GlassView>
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <View style={styles.headerBadge}>
                            <Ionicons name="construct" size={14} color="#FBBF24" />
                            <Text style={styles.headerBadgeText}>TOOLKIT</Text>
                        </View>
                        <Text style={styles.headerTitle}>Your Personal Toolkit</Text>
                        <Text style={styles.headerSubtitle}>
                            Track expenses and plan your move
                        </Text>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        {tabs.map(tab => (
                            <TouchableOpacity
                                key={tab.id}
                                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                                onPress={() => setActiveTab(tab.id)}
                            >
                                <Ionicons
                                    name={tab.icon as any}
                                    size={18}
                                    color={activeTab === tab.id ? COLORS.primary : COLORS.card}
                                />
                                <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </LinearGradient>
            </SafeAreaView>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'checklist' && renderChecklist()}
                {activeTab === 'expenses' && renderExpenses()}
                {activeTab === 'timeline' && renderTimeline()}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        backgroundColor: COLORS.primary,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.sm,
        marginLeft: -SPACING.sm,
    },
    glassButtonWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: SPACING.sm,
        marginLeft: -SPACING.sm,
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
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: SPACING.sm,
    },
    headerBadgeText: {
        color: '#FEF3C7',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.card,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.md,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: SPACING.md,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 16,
    },
    tabActive: {
        backgroundColor: COLORS.card,
    },
    tabText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.card,
    },
    tabTextActive: {
        color: COLORS.primary,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.lg,
    },

    // Progress Card
    progressCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        ...SHADOWS.sm,
    },
    progressTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    progressBar: {
        height: 8,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: SPACING.sm,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.success,
        borderRadius: 4,
    },
    progressText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },

    // Checklist
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.border,
        marginRight: SPACING.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    checklistContent: {
        flex: 1,
    },
    checklistTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: COLORS.text,
    },
    checklistTitleCompleted: {
        textDecorationLine: 'line-through',
        color: COLORS.textMuted,
    },
    checklistCategory: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        marginTop: 2,
    },

    // Expenses
    totalCard: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: FONT_SIZES.sm,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.card,
    },
    addExpenseCard: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    expenseInput: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    expenseInputSmall: {
        flex: 0.4,
    },
    addExpenseBtn: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyExpenses: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textMuted,
        marginTop: SPACING.sm,
    },
    expenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOWS.sm,
    },
    expenseIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    expenseContent: {
        flex: 1,
    },
    expenseTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '500',
        color: COLORS.text,
    },
    expenseDate: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    expenseAmount: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.primary,
    },

    // Timeline
    timelineCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        ...SHADOWS.sm,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    timelineText: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        marginRight: SPACING.md,
    },
    timelineItemContent: {
        flex: 1,
    },
    timelineItemTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    timelineItemDate: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    timelineAddBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Template Choice
    templateChoiceCard: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.xl,
        ...SHADOWS.sm,
    },
    templateChoiceTitle: {
        fontSize: FONT_SIZES.xl,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    templateChoiceSubtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    templateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    templateBtnIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    templateBtnContent: {
        flex: 1,
    },
    templateBtnTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
    },
    templateBtnDesc: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },

    // Add Task
    addTaskCard: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    addTaskInput: {
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    addTaskBtn: {
        width: 44,
        height: 44,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyChecklist: {
        alignItems: 'center',
        paddingVertical: 40,
    },
});

export default ToolkitScreen;
