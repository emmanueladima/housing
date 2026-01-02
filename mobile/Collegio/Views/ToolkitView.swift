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
                    if viewModel.isLoading {
                        ProgressView()
                            .frame(maxHeight: .infinity)
                    } else if viewModel.group == nil {
                        noGroupView
                    } else {
                        tabContent
                    }
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
        VStack(spacing: 12) {
            Text("Move-In Checklist")
                .font(.title2.bold())
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Placeholder checklist items
            ForEach(MoveInItem.defaultItems) { item in
                ChecklistRow(item: item)
            }
        }
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

struct ChecklistRow: View {
    let item: MoveInItem
    @State private var isChecked = false
    
    var body: some View {
        HStack {
            Button {
                isChecked.toggle()
            } label: {
                Image(systemName: isChecked ? "checkmark.square.fill" : "square")
                    .font(.title2)
                    .foregroundStyle(isChecked ? .green : .secondary)
            }
            
            Text(item.title)
                .font(.subheadline)
                .strikethrough(isChecked)
            
            Spacer()
        }
        .padding()
        .glassCard()
    }
}

// MARK: - Move-In Item Model
struct MoveInItem: Identifiable {
    let id = UUID()
    let title: String
    
    static let defaultItems: [MoveInItem] = [
        MoveInItem(title: "Sign lease agreement"),
        MoveInItem(title: "Pay security deposit"),
        MoveInItem(title: "Set up utilities (electric, water, gas)"),
        MoveInItem(title: "Set up internet/WiFi"),
        MoveInItem(title: "Change address with post office"),
        MoveInItem(title: "Get renter's insurance"),
        MoveInItem(title: "Document existing damage (photos)"),
        MoveInItem(title: "Get spare keys made"),
        MoveInItem(title: "Deep clean before moving in"),
        MoveInItem(title: "Introduce yourself to neighbors")
    ]
}

#Preview {
    ToolkitView()
}
