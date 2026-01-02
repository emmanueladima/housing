import SwiftUI

// MARK: - Add Chore View
struct AddChoreView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var frequency = "Weekly"
    let onSave: (String, String) -> Void
    
    let frequencies = ["Daily", "Weekly", "Monthly", "One-time"]
    
    var body: some View {
        Form {
            Section("Chore Details") {
                TextField("Chore name", text: $title)
                Picker("Frequency", selection: $frequency) {
                    ForEach(frequencies, id: \.self) { freq in
                        Text(freq).tag(freq)
                    }
                }
            }
        }
        .navigationTitle("Add Chore")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Add") {
                    onSave(title, frequency)
                }
                .disabled(title.isEmpty)
            }
        }
    }
}

// MARK: - Add Expense View
struct AddExpenseView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var amount = ""
    @State private var category = "other"
    let onSave: (String, Double, String) -> Void
    
    let categories = ["rent", "utilities", "groceries", "internet", "household", "entertainment", "other"]
    
    var body: some View {
        Form {
            Section("Expense Details") {
                TextField("Description", text: $title)
                TextField("Amount", text: $amount)
                    .keyboardType(.decimalPad)
                Picker("Category", selection: $category) {
                    ForEach(categories, id: \.self) { cat in
                        Text(cat.capitalized).tag(cat)
                    }
                }
            }
        }
        .navigationTitle("Add Expense")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Add") {
                    if let amountValue = Double(amount) {
                        onSave(title, amountValue, category)
                    }
                }
                .disabled(title.isEmpty || amount.isEmpty)
            }
        }
    }
}

// MARK: - Add Rule View
struct AddRuleView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var text = ""
    @State private var category = "other"
    let onSave: (String, String) -> Void
    
    let categories = ["Quiet Hours", "Guests", "Cleaning", "Shared Items", "other"]
    
    var body: some View {
        Form {
            Section("House Rule") {
                TextField("Rule description", text: $text, axis: .vertical)
                    .lineLimit(3...6)
                Picker("Category", selection: $category) {
                    ForEach(categories, id: \.self) { cat in
                        Text(cat).tag(cat)
                    }
                }
            }
        }
        .navigationTitle("Add Rule")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Add") {
                    onSave(text, category)
                }
                .disabled(text.isEmpty)
            }
        }
    }
}

// MARK: - Add Event View
struct AddEventView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var date = Date()
    @State private var type = "social"
    let onSave: (String, Date, String) -> Void
    
    let types = ["social", "payment", "chore", "admin"]
    
    var body: some View {
        Form {
            Section("Event Details") {
                TextField("Event name", text: $title)
                DatePicker("Date", selection: $date, displayedComponents: [.date, .hourAndMinute])
                Picker("Type", selection: $type) {
                    ForEach(types, id: \.self) { t in
                        Text(t.capitalized).tag(t)
                    }
                }
            }
        }
        .navigationTitle("Add Event")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Add") {
                    onSave(title, date, type)
                }
                .disabled(title.isEmpty)
            }
        }
    }
}
