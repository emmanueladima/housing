import SwiftUI

/// A dual-handle range slider for selecting min/max values
struct DualHandleSlider: View {
    @Binding var lowValue: Double
    @Binding var highValue: Double
    let range: ClosedRange<Double>
    let step: Double
    var formatLabel: ((Double) -> String)? = nil
    
    private let trackHeight: CGFloat = 6
    private let handleSize: CGFloat = 28
    
    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width - handleSize
            let lowX = CGFloat((lowValue - range.lowerBound) / (range.upperBound - range.lowerBound)) * width
            let highX = CGFloat((highValue - range.lowerBound) / (range.upperBound - range.lowerBound)) * width
            
            ZStack(alignment: .leading) {
                // Background track
                RoundedRectangle(cornerRadius: trackHeight / 2)
                    .fill(Color(white: 0.85))
                    .frame(height: trackHeight)
                
                // Active range track
                RoundedRectangle(cornerRadius: trackHeight / 2)
                    .fill(Color.collegioOrange)
                    .frame(width: max(0, highX - lowX + handleSize / 2), height: trackHeight)
                    .offset(x: lowX + handleSize / 4)
                
                // Low handle
                Circle()
                    .fill(Color.white)
                    .frame(width: handleSize, height: handleSize)
                    .shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2)
                    .overlay(
                        Circle()
                            .stroke(Color.collegioOrange, lineWidth: 3)
                    )
                    .offset(x: lowX)
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                let newValue = Double(value.location.x / width) * (range.upperBound - range.lowerBound) + range.lowerBound
                                let steppedValue = round(newValue / step) * step
                                lowValue = min(max(steppedValue, range.lowerBound), highValue - step)
                            }
                    )
                
                // High handle
                Circle()
                    .fill(Color.white)
                    .frame(width: handleSize, height: handleSize)
                    .shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2)
                    .overlay(
                        Circle()
                            .stroke(Color.collegioOrange, lineWidth: 3)
                    )
                    .offset(x: highX)
                    .gesture(
                        DragGesture()
                            .onChanged { value in
                                let newValue = Double(value.location.x / width) * (range.upperBound - range.lowerBound) + range.lowerBound
                                let steppedValue = round(newValue / step) * step
                                highValue = max(min(steppedValue, range.upperBound), lowValue + step)
                            }
                    )
            }
            .frame(height: handleSize)
        }
        .frame(height: handleSize)
    }
}

/// A card wrapper for the dual-handle slider with labels
struct RangeSliderCard: View {
    let title: String
    let icon: String
    @Binding var lowValue: Double
    @Binding var highValue: Double
    let range: ClosedRange<Double>
    let step: Double
    let prefix: String
    let suffix: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Label(title, systemImage: icon)
                    .font(.subheadline.bold())
                    .foregroundStyle(Color.black)
                Spacer()
                Text("\(prefix)\(Int(lowValue))\(suffix) - \(prefix)\(Int(highValue))\(suffix)")
                    .font(.headline)
                    .foregroundStyle(Color.collegioOrange)
            }
            
            DualHandleSlider(
                lowValue: $lowValue,
                highValue: $highValue,
                range: range,
                step: step
            )
            .padding(.horizontal, 4)
            
            HStack {
                Text("\(prefix)\(Int(range.lowerBound))\(suffix)")
                    .font(.caption)
                    .foregroundStyle(Color(white: 0.5))
                Spacer()
                Text("\(prefix)\(Int(range.upperBound))\(suffix)")
                    .font(.caption)
                    .foregroundStyle(Color(white: 0.5))
            }
        }
        .padding()
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(white: 0.85), lineWidth: 1))
    }
}

#Preview {
    VStack(spacing: 20) {
        RangeSliderCard(
            title: "Budget Range",
            icon: "dollarsign.circle.fill",
            lowValue: .constant(500),
            highValue: .constant(1200),
            range: 200...3000,
            step: 50,
            prefix: "$",
            suffix: ""
        )
    }
    .padding()
    .background(Color(red: 0.894, green: 0.886, blue: 0.867))
}
