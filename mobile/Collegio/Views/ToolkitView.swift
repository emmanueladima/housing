import SwiftUI

struct ToolkitView: View {
    @StateObject private var viewModel = ToolkitViewModel()
    @State private var selectedTab: ToolkitTab = .chores
    
    enum ToolkitTab: String, CaseIterable {
        case checklist = "Checklist"
        case chores = "Chores"
        case expenses = "Expenses"
        case rules = "Rules"
        case timeline = "Timeline"
        
        var icon: String {
            switch self {
            case .checklist: return "list.clipboard"
            case .chores: return "checkmark.circle"
            case .expenses: return "dollarsign.circle"
            case .rules: return "book.closed"
            case .timeline: return "clock"
            }
        }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                GradientBackground()
                
                VStack(spacing: 0) {
                    // Tab Selector
                    tabSelector
                    
                    // Content
                    // Content - Always show for testing
                    tabContent
                }
            }
            .navigationTitle("Toolkit")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await viewModel.loadGroup()
            }
            .sheet(isPresented: $viewModel.showAddSheet) {
                addSheetContent
            }
        }
    }
    
    // MARK: - Tab Selector
    private var tabSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(ToolkitTab.allCases, id: \.self) { tab in
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            selectedTab = tab
                        }
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: tab.icon)
                                .font(.subheadline)
                            Text(tab.rawValue)
                                .font(.subheadline.bold())
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(
                            selectedTab == tab
                                ? Color.collegioOrange
                                : Color.white.opacity(0.1)
                        )
                        .foregroundStyle(selectedTab == tab ? .white : .secondary)
                        .clipShape(Capsule())
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 12)
        }
    }
    
    // MARK: - Tab Content
    @ViewBuilder
    private var tabContent: some View {
        ScrollView {
            VStack(spacing: 16) {
                switch selectedTab {
                case .checklist:
                    checklistContent
                case .chores:
                    choresContent
                case .expenses:
                    expensesContent
                case .rules:
                    rulesContent
                case .timeline:
                    timelineContent
                }
            }
            .padding()
            .padding(.bottom, 100)
        }
    }
    
    // MARK: - Chores Content
    private var choresContent: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Chores")
                    .font(.title2.bold())
                Spacer()
                Button {
                    viewModel.showAddSheet = true
                    viewModel.addingType = .chore
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            
            if let chores = viewModel.group?.chores, !chores.isEmpty {
                ForEach(chores) { chore in
                    ChoreRow(chore: chore, onToggle: { completed in
                        Task {
                            await viewModel.toggleChore(choreId: chore.id, completed: completed)
                        }
                    })
                }
            } else {
                emptyStateCard(icon: "checkmark.circle", title: "No chores yet", subtitle: "Add your first chore to get started")
            }
        }
    }
    
    // MARK: - Expenses Content
    private var expensesContent: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Expenses")
                    .font(.title2.bold())
                Spacer()
                Button {
                    viewModel.showAddSheet = true
                    viewModel.addingType = .expense
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            
            if let expenses = viewModel.group?.expenses, !expenses.isEmpty {
                ForEach(expenses) { expense in
                    ExpenseRow(expense: expense, onSettle: {
                        Task {
                            await viewModel.settleExpense(expenseId: expense.id)
                        }
                    })
                }
            } else {
                emptyStateCard(icon: "dollarsign.circle", title: "No expenses yet", subtitle: "Track shared costs with your roommates")
            }
        }
    }
    
    // MARK: - Rules Content
    private var rulesContent: some View {
        VStack(spacing: 12) {
            HStack {
                Text("House Rules")
                    .font(.title2.bold())
                Spacer()
                Button {
                    viewModel.showAddSheet = true
                    viewModel.addingType = .rule
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            
            if let rules = viewModel.group?.houseRules, !rules.isEmpty {
                ForEach(rules) { rule in
                    RuleRow(rule: rule)
                }
            } else {
                emptyStateCard(icon: "book.closed", title: "No rules yet", subtitle: "Define house agreements together")
            }
        }
    }
    
    // MARK: - Timeline Content
    private var timelineContent: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Timeline")
                    .font(.title2.bold())
                Spacer()
                Button {
                    viewModel.showAddSheet = true
                    viewModel.addingType = .event
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundStyle(Color.collegioOrange)
                }
            }
            
            if let events = viewModel.group?.sharedEvents, !events.isEmpty {
                ForEach(events) { event in
                    EventRow(event: event)
                }
            } else {
                emptyStateCard(icon: "clock", title: "No events yet", subtitle: "Track important dates and activities")
            }
        }
    }
    
    // MARK: - Checklist Content
    private var checklistContent: some View {
        ChecklistView()
    }
    
    // MARK: - No Group View
    private var noGroupView: some View {
        VStack(spacing: 20) {
            Image(systemName: "person.3.fill")
                .font(.system(size: 60))
                .foregroundStyle(Color.collegioOrange.opacity(0.5))
            
            Text("Join a Group First")
                .font(.title2.bold())
            
            Text("Create or join a roommate group to access shared tools like chores, expenses, and house rules.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            NavigationLink(destination: RoommatesView()) {
                Text("Find Roommates")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.collegioOrange)
                    .clipShape(Capsule())
            }
        }
        .frame(maxHeight: .infinity)
    }
    
    // MARK: - Add Sheet
    @ViewBuilder
    private var addSheetContent: some View {
        NavigationStack {
            Group {
                switch viewModel.addingType {
                case .chore:
                    AddChoreView(onSave: { title, frequency in
                        Task {
                            await viewModel.addChore(title: title, frequency: frequency)
                        }
                        viewModel.showAddSheet = false
                    })
                case .expense:
                    AddExpenseView(onSave: { title, amount, category in
                        Task {
                            await viewModel.addExpense(title: title, amount: amount, category: category)
                        }
                        viewModel.showAddSheet = false
                    })
                case .rule:
                    AddRuleView(onSave: { text, category in
                        Task {
                            await viewModel.addRule(text: text, category: category)
                        }
                        viewModel.showAddSheet = false
                    })
                case .event:
                    AddEventView(onSave: { title, date, type in
                        Task {
                            await viewModel.addEvent(title: title, date: date, type: type)
                        }
                        viewModel.showAddSheet = false
                    })
                }
            }
        }
        .presentationDetents([.medium])
    }
    
    // MARK: - Empty State Card
    private func emptyStateCard(icon: String, title: String, subtitle: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundStyle(.secondary)
            Text(title)
                .font(.headline)
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .glassCard()
    }
}

// MARK: - Checklist View (Backend-synced like website)
struct ChecklistView: View {
    @StateObject private var viewModel = ChecklistViewModel()
    @State private var showAddForm = false
    @State private var newItemText = ""
    @State private var selectedCategory = "custom"
    
    let categories = [
        ("planning", "Planning", "clipboard"),
        ("packing", "Packing", "shippingbox"),
        ("logistics", "Logistics", "car"),
        ("admin", "Admin", "doc.text"),
        ("move-day", "Move Day", "box.truck"),
        ("settling", "Settling In", "house"),
        ("custom", "Custom", "star")
    ]
    
    var body: some View {
        VStack(spacing: 16) {
            if viewModel.isLoading {
                ProgressView()
                    .frame(maxHeight: .infinity)
            } else if viewModel.needsSetup {
                setupView
            } else {
                checklistView
            }
        }
        .task {
            await viewModel.loadChecklist()
        }
    }
    
    // MARK: - Setup View (Template vs Custom choice)
    private var setupView: some View {
        VStack(spacing: 24) {
            Text("Move-In Checklist")
                .font(.title2.bold())
            
            Text("How would you like to start your checklist?")
                .foregroundStyle(.secondary)
            
            VStack(spacing: 16) {
                // Use Template Button
                Button {
                    Task { await viewModel.initializeChecklist(useTemplate: true) }
                } label: {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "list.bullet.rectangle")
                                .font(.title2)
                                .foregroundStyle(Color.collegioOrange)
                            Text("Use Template")
                                .font(.headline)
                        }
                        Text("Start with 20+ pre-made tasks organized by category")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        HStack(spacing: 6) {
                            ForEach(["Planning", "Packing", "Move Day"], id: \.self) { tag in
                                Text(tag)
                                    .font(.caption2)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.collegioOrange.opacity(0.2))
                                    .foregroundStyle(Color.collegioOrange)
                                    .clipShape(Capsule())
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
                    .overlay {
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.collegioOrange.opacity(0.3), lineWidth: 1)
                    }
                }
                .buttonStyle(.plain)
                
                // Start Fresh Button
                Button {
                    Task { await viewModel.initializeChecklist(useTemplate: false) }
                } label: {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "pencil")
                                .font(.title2)
                                .foregroundStyle(.secondary)
                            Text("Start Fresh")
                                .font(.headline)
                        }
                        Text("Create your own custom checklist from scratch")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
                    .overlay {
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.vertical, 40)
    }
    
    // MARK: - Checklist View
    private var checklistView: some View {
        VStack(spacing: 16) {
            // Header
            HStack {
                Text("Move-In Checklist")
                    .font(.title2.bold())
                Spacer()
                Menu {
                    Button("Reset to Template") {
                        Task { await viewModel.resetChecklist() }
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                        .font(.title3)
                        .foregroundStyle(.secondary)
                }
            }
            
            // Progress
            if !viewModel.items.isEmpty {
                progressCard
            }
            
            // Items
            if viewModel.items.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "list.clipboard")
                        .font(.system(size: 40))
                        .foregroundStyle(.secondary)
                    Text("No tasks yet")
                        .font(.headline)
                    Text("Add your first task to get started!")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 40)
            } else {
                ForEach(viewModel.items) { item in
                    ChecklistItemRow(
                        item: item,
                        onToggle: { Task { await viewModel.toggleItem(item) } },
                        onDelete: { Task { await viewModel.deleteItem(item.id) } }
                    )
                }
            }
            
            // Add Button
            if showAddForm {
                addItemForm
            } else {
                Button { showAddForm = true } label: {
                    HStack {
                        Image(systemName: "plus")
                        Text("Add Task")
                    }
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .overlay {
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(style: StrokeStyle(lineWidth: 2, dash: [8]))
                            .foregroundStyle(Color.white.opacity(0.3))
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
            }
        }
    }
    
    // MARK: - Progress Card
    private var progressCard: some View {
        VStack(spacing: 8) {
            HStack {
                Text("\(viewModel.progress)% Complete")
                    .font(.headline.bold())
                Spacer()
                Text("\(viewModel.completedCount)/\(viewModel.items.count) tasks")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.white.opacity(0.2))
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.collegioOrange)
                        .frame(width: geo.size.width * CGFloat(viewModel.progress) / 100)
                }
            }
            .frame(height: 12)
            
            if viewModel.progress == 100 {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text("You're ready for your move!")
                        .font(.subheadline.bold())
                        .foregroundStyle(.green)
                }
            }
        }
        .padding()
        .background(Color.collegioOrange.opacity(0.15))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay {
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.collegioOrange.opacity(0.3), lineWidth: 1)
        }
    }
    
    // MARK: - Add Item Form
    private var addItemForm: some View {
        VStack(spacing: 12) {
            TextField("e.g., Buy new curtains", text: $newItemText)
                .padding(14)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
            
            // Category pills
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(categories, id: \.0) { cat in
                        Button {
                            selectedCategory = cat.0
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: cat.2)
                                    .font(.caption2)
                                Text(cat.1)
                                    .font(.caption)
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(selectedCategory == cat.0 ? Color.collegioOrange : Color.white.opacity(0.1))
                            .foregroundStyle(selectedCategory == cat.0 ? .white : .primary)
                            .clipShape(Capsule())
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            
            HStack(spacing: 12) {
                Button {
                    guard !newItemText.isEmpty else { return }
                    Task {
                        await viewModel.addItem(text: newItemText, category: selectedCategory)
                        newItemText = ""
                        showAddForm = false
                    }
                } label: {
                    Text("Add Task")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.collegioOrange)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
                
                Button {
                    showAddForm = false
                    newItemText = ""
                } label: {
                    Text("Cancel")
                        .font(.headline)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(Color.white.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .buttonStyle(.plain)
            }
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Checklist Item Row
struct ChecklistItemRow: View {
    let item: ChecklistItem
    let onToggle: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            Button(action: onToggle) {
                Image(systemName: item.completed ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(item.completed ? .green : .secondary)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(item.text)
                    .font(.subheadline)
                    .strikethrough(item.completed)
                    .foregroundStyle(item.completed ? .secondary : .primary)
                if let category = item.category, category != "custom" {
                    Text(category.capitalized)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            
            Spacer()
            
            Button(action: onDelete) {
                Image(systemName: "trash")
                    .font(.caption)
                    .foregroundStyle(.red.opacity(0.7))
            }
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Checklist ViewModel
@MainActor
class ChecklistViewModel: ObservableObject {
    @Published var items: [ChecklistItem] = []
    @Published var isLoading = false
    @Published var needsSetup = false
    
    private let service = ChecklistService.shared
    
    var completedCount: Int { items.filter { $0.completed }.count }
    var progress: Int {
        guard !items.isEmpty else { return 0 }
        return Int(Double(completedCount) / Double(items.count) * 100)
    }
    
    func loadChecklist() async {
        isLoading = true
        do {
            let checklist = try await service.getPersonalChecklist()
            if checklist.notCreated == true {
                needsSetup = true
            } else {
                items = checklist.items
                needsSetup = false
            }
        } catch {
            needsSetup = true
        }
        isLoading = false
    }
    
    func initializeChecklist(useTemplate: Bool) async {
        isLoading = true
        do {
            let checklist = try await service.initPersonalChecklist(useTemplate: useTemplate)
            items = checklist.items
            needsSetup = false
        } catch {
            print("Failed to init checklist: \(error)")
        }
        isLoading = false
    }
    
    func toggleItem(_ item: ChecklistItem) async {
        // Optimistic update
        if let idx = items.firstIndex(where: { $0.id == item.id }) {
            let updatedItem = ChecklistItem(
                id: item.id,
                text: item.text,
                completed: !item.completed,
                category: item.category,
                order: item.order
            )
            items[idx] = updatedItem
        }
        
        do {
            let checklist = try await service.updatePersonalChecklist(items: items)
            items = checklist.items
        } catch {
            await loadChecklist()
        }
    }
    
    func addItem(text: String, category: String) async {
        do {
            let checklist = try await service.addPersonalItem(text: text, category: category)
            items = checklist.items
        } catch {
            print("Failed to add item: \(error)")
        }
    }
    
    func deleteItem(_ itemId: String) async {
        do {
            let checklist = try await service.deletePersonalItem(itemId: itemId)
            items = checklist.items
        } catch {
            print("Failed to delete item: \(error)")
        }
    }
    
    func resetChecklist() async {
        do {
            let checklist = try await service.resetPersonalChecklist()
            items = checklist.items
        } catch {
            print("Failed to reset checklist: \(error)")
        }
    }
}

// MARK: - Row Components

struct ChoreRow: View {
    let chore: Chore
    let onToggle: (Bool) -> Void
    
    var body: some View {
        HStack {
            Button {
                onToggle(!chore.completed)
            } label: {
                Image(systemName: chore.completed ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(chore.completed ? .green : .secondary)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(chore.title)
                    .font(.headline)
                    .strikethrough(chore.completed)
                if let frequency = chore.frequency {
                    Text(frequency)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            
            Spacer()
        }
        .padding()
        .glassCard()
    }
}

struct ExpenseRow: View {
    let expense: Expense
    let onSettle: () -> Void
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(expense.title)
                    .font(.headline)
                if let category = expense.category {
                    Text(category.capitalized)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            
            Spacer()
            
            Text("$\(expense.amount, specifier: "%.2f")")
                .font(.title3.bold())
                .foregroundStyle(Color.collegioOrange)
            
            if expense.status == "open" {
                Button("Settle") {
                    onSettle()
                }
                .font(.caption.bold())
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.green.opacity(0.2))
                .foregroundStyle(.green)
                .clipShape(Capsule())
            } else {
                Text("Settled")
                    .font(.caption.bold())
                    .foregroundStyle(.green)
            }
        }
        .padding()
        .glassCard()
    }
}

struct RuleRow: View {
    let rule: HouseRule
    
    var body: some View {
        HStack {
            Image(systemName: "book.closed.fill")
                .foregroundStyle(Color.collegioOrange)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(rule.text)
                    .font(.subheadline)
                if let category = rule.category {
                    Text(category)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            
            Spacer()
        }
        .padding()
        .glassCard()
    }
}

struct EventRow: View {
    let event: SharedEvent
    
    var body: some View {
        HStack {
            Circle()
                .fill(Color.collegioOrange)
                .frame(width: 12, height: 12)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(.headline)
                Text(event.date)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            if let type = event.type {
                Text(type.capitalized)
                    .font(.caption.bold())
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.collegioOrange.opacity(0.2))
                    .foregroundStyle(Color.collegioOrange)
                    .clipShape(Capsule())
            }
        }
        .padding()
        .glassCard()
    }
}

#Preview {
    ToolkitView()
}

